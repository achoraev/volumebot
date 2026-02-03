import React, { useState } from 'react';
import { Play, Square, Settings2 } from 'lucide-react';

export const VolumeManager = ({ currentTokenAddress }: { currentTokenAddress: string }) => {
    const [settings, setSettings] = useState({
        buyAmount: 0.01,
        minBuys: 2, 
        maxBuys: 5,
        minDelay: 10,
        maxDelay: 30,
    });

    const [isRunning, setIsRunning] = useState(false);

    const handleToggle = async () => {
        const endpoint = isRunning ? '/api/stop-bot' : '/api/start-bot';
        const payload = isRunning 
            ? { tokenAddress: currentTokenAddress } 
            : { tokenAddress: currentTokenAddress, settings };

        try {
            const response = await fetch(`http://localhost:4000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setIsRunning(!isRunning);
            } else {
                alert("Failed to update bot status");
            }
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6 shadow-xl">
            <h2 className="text-cyan-400 font-bold flex items-center gap-2">
                <Settings2 size={20} /> VOLUME STRATEGY
            </h2>

            {/* Input fields for settings */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold">BUY AMOUNT (SOL)</label>
                    <input 
                        type="number" 
                        value={settings.buyAmount}
                        onChange={(e) => setSettings({...settings, buyAmount: Number(e.target.value)})}
                        className="bg-black border border-slate-700 rounded p-2 text-white outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold">MIN BUYS (SOL)</label>
                    <input 
                        type="number" 
                        value={settings.minBuys}
                        onChange={(e) => setSettings({...settings, minBuys: Number(e.target.value)})}
                        className="bg-black border border-slate-700 rounded p-2 text-white outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold">MAX BUYS (SOL)</label>
                    <input 
                        type="number" 
                        value={settings.maxBuys}
                        onChange={(e) => setSettings({...settings, maxBuys: Number(e.target.value)})}
                        className="bg-black border border-slate-700 rounded p-2 text-white outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold">MIN DELAYS (sec)</label>
                    <input 
                        type="number" 
                        value={settings.minDelay}
                        onChange={(e) => setSettings({...settings, maxBuys: Number(e.target.value)})}
                        className="bg-black border border-slate-700 rounded p-2 text-white outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold">MAX DELAYS (sec)</label>
                    <input 
                        type="number" 
                        value={settings.maxDelay}
                        onChange={(e) => setSettings({...settings, maxBuys: Number(e.target.value)})}
                        className="bg-black border border-slate-700 rounded p-2 text-white outline-none focus:border-cyan-500"
                    />
                </div>
            </div>

            <button 
                onClick={handleToggle}
                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
                    isRunning 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20' 
                        : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                }`}
            >
                {isRunning ? (
                    <><Square size={20} fill="white" /> STOP BOT</>
                ) : (
                    <><Play size={20} fill="white" /> START VOLUME BOT</>
                )}
            </button>
            
            {isRunning && (
                <div className="text-center animate-pulse text-xs text-green-400 font-mono">
                    ● BOT ACTIVE: Randomizing {settings.minBuys}-{settings.maxBuys} buys...
                </div>
            )}
        </div>
    );
};