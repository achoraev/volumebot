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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const looper_1 = require("./logic/looper");
const wallet_1 = require("./engine/wallet");
const distributor_1 = require("./logic/distributor");
const tracker_1 = require("./logic/tracker");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/balances', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balances = yield (0, wallet_1.getAllBalances)();
        res.json(balances);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch balances" });
    }
}));
app.get('/api/stats', (req, res) => {
    const stats = (0, tracker_1.getStats)();
    res.json(stats);
});
app.post('/api/withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, distributor_1.withdrawAll)();
        res.json({ message: "All child wallets swept to Main Wallet!" });
    }
    catch (err) {
        res.status(500).json({ error: "Withdrawal failed." });
    }
}));
app.post('/api/distribute', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sig = yield (0, distributor_1.distributeFunds)(0.02);
        res.json({ message: "Funds distributed!", signature: sig });
    }
    catch (err) {
        res.status(500).json({ error: "Funding failed. Check Main Wallet balance." });
    }
}));
app.post('/api/start-bot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenAddress, settings } = req.body;
    if (!tokenAddress) {
        return res.status(400).json({ error: "Token address is required" });
    }
    try {
        (0, looper_1.startVolumeLoop)(tokenAddress, settings);
        console.log(`[API] Bot started for ${tokenAddress} with settings:`, settings);
        res.json({ message: "Volume campaign initialized successfully!" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to start bot" });
    }
}));
app.post('/api/stop-bot', (req, res) => {
    const { tokenAddress } = req.body;
    (0, looper_1.stopVolumeLoop)(tokenAddress);
    res.json({ message: "Stopping bot... the current trade will be the last." });
});
app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
