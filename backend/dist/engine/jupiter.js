"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSwap = executeSwap;
const web3_js_1 = require("@solana/web3.js");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const PUMP_API_URL = "https://public.jupiterapi.com";
const SOL_MINT = "So11111111111111111111111111111111111111112";
function getTokenBalance(connection, wallet, mint) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accounts = yield connection.getTokenAccountsByOwner(wallet, {
                mint: new web3_js_1.PublicKey(mint)
            });
            if (accounts.value.length === 0)
                return "0";
            const balance = yield connection.getTokenAccountBalance(accounts.value[0].pubkey);
            return balance.value.amount; // Returns raw amount with decimals (e.g., "1000000")
        }
        catch (e) {
            return "0";
        }
    });
}
function executeSwap(connection, wallet, tokenAddr, action, amount // Only needed for BUY. For SELL, we'll sell 100% of balance.
) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let inputMint = action === "BUY" ? SOL_MINT : tokenAddr;
            let outputMint = action === "BUY" ? tokenAddr : SOL_MINT;
            let swapAmount;
            if (action === "SELL") {
                swapAmount = yield getTokenBalance(connection, wallet.publicKey, tokenAddr);
                if (swapAmount === "0")
                    throw new Error("No tokens found to sell.");
                console.log(`[SELL] Selling all tokens (${swapAmount} units)...`);
            }
            else {
                swapAmount = amount.toString();
                console.log(`[BUY] Buying tokens for ${amount} lamports...`);
            }
            // 1. Try Jupiter Path
            const jupQuoteUrl = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${swapAmount}&slippageBps=100`;
            const jupRes = yield (0, cross_fetch_1.default)(jupQuoteUrl);
            const jupData = yield jupRes.json();
            let swapTransaction;
            if (jupData.error && jupData.errorCode === "TOKEN_NOT_TRADABLE") {
                // 2. Pump.fun Curve Path
                console.log("📍 Using Pump.fun curve route...");
                const pumpSwapRes = yield (0, cross_fetch_1.default)(`${PUMP_API_URL}/pump-fun/swap`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        wallet: wallet.publicKey.toBase58(),
                        type: action,
                        mint: tokenAddr,
                        inAmount: swapAmount,
                        priorityFeeLevel: "high",
                        slippageBps: 300 // Slightly higher slippage for sells on the curve
                    })
                });
                const pumpData = yield pumpSwapRes.json();
                swapTransaction = pumpData.swapTransaction;
            }
            else {
                // 3. Jupiter/Raydium Path
                console.log("🚀 Using Jupiter Raydium path...");
                const jupSwapRes = yield (0, cross_fetch_1.default)('https://lite-api.jup.ag/swap/v1/swap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quoteResponse: jupData,
                        userPublicKey: wallet.publicKey.toBase58(),
                        wrapAndUnwrapSol: true
                    })
                });
                const jupSwapData = yield jupSwapRes.json();
                swapTransaction = jupSwapData.swapTransaction;
            }
            // 4. Execution
            const transaction = web3_js_1.VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
            transaction.sign([wallet]);
            const signature = yield connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
            console.log(`✅ ${action} Successful: https://solscan.io/tx/${signature}`);
            return signature;
        }
        catch (error) {
            console.error(`[ERROR] ${action} Failed:`, error);
        }
    });
}
