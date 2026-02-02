"use client";
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Play, Square, Activity, Database } from 'lucide-react';

export default function Home() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleToggle = () => {
    if (!tokenAddress) return alert("Enter a token address!");
    setIsRunning(!isRunning);
    addLog(isRunning ? "🛑 Bot Stopping..." : `🚀 Starting Volume for ${tokenAddress.slice(0, 6)}...`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-cyan-400">
            <Activity size={28} /> SOLSPREAD CLONE
          </h1>
          <WalletMultiButton />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <section className="md:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4 font-bold">Campaign Config</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Token Mint Address</label>
                <input 
                  type="text" 
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-cyan-500 outline-none"
                  placeholder="Paste address..."
                />
              </div>
              <button 
                onClick={handleToggle}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'
                }`}
              >
                {isRunning ? <><Square size={18}/> STOP BOT</> : <><Play size={18}/> START VOLUME</>}
              </button>
            </div>
          </section>

          {/* Console / Status */}
          <section className="md:col-span-2 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
            <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Database size={16}/> Live Activity
            </h2>
            <div className="font-mono text-xs space-y-2 h-48 overflow-y-auto border-l-2 border-slate-800 pl-4">
              {logs.length === 0 && <p className="text-slate-600 italic">Waiting for input...</p>}
              {logs.map((log, i) => (
                <p key={i} className={log.includes('🚀') ? 'text-cyan-400' : 'text-slate-300'}>{log}</p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}