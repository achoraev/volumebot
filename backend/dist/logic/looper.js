"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopVolumeLoop = exports.startVolumeLoop = exports.activeBots = void 0;
const web3_js_1 = require("@solana/web3.js");
const loop_1 = require("../engine/loop");
const bs58_1 = __importDefault(require("bs58"));
exports.activeBots = new Map();
const startVolumeLoop = (tokenAddress, settings) => {
    const workerKey = process.env.MAIN_PRIVATE_KEY;
    const wallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(workerKey));
    const botId = tokenAddress;
    exports.activeBots.set(botId, true);
    (0, loop_1.runVolumeLoop)(wallet, tokenAddress, settings).catch(console.error);
};
exports.startVolumeLoop = startVolumeLoop;
const stopVolumeLoop = (tokenAddress) => {
    exports.activeBots.set(tokenAddress, false);
};
exports.stopVolumeLoop = stopVolumeLoop;
