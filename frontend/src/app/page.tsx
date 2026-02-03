"use client";
import { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Play, Square, Activity, Database } from 'lucide-react';
import { VolumeManager } from '../components/VolumeManager';

const handleDistribute = async () => {
  if (!confirm("This will send 0.02 SOL from your Main Wallet to ALL child wallets. Continue?")) return;
  
  try {
      const res = await fetch('http://localhost:4000/api/distribute', { method: 'POST' });
      const data = await res.json();
      if (res.ok) alert(`Success! TX: ${data.signature.slice(0,8)}...`);
  } catch (err) {
      alert("Funding failed.");
  }
};

const handleWithdraw = async () => {
  if (!confirm("Are you sure? This will pull all SOL from worker wallets back to your Main Wallet.")) return;
  
  try {
      const res = await fetch('http://localhost:4000/api/withdraw', { method: 'POST' });
      if (res.ok) alert("Withdrawal sequence complete!");
  } catch (err) {
      alert("Withdrawal failed.");
  }
};

export function ProfitTracker() {
  const [stats, setStats] = useState({ totalFeesPaid: 0, totalTrades: 0, estimatedSolLoss: 0 });

  useEffect(() => {
      const interval = setInterval(async () => {
          const res = await fetch('http://localhost:4000/api/stats');
          const data = await res.json();
          setStats(data);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  return (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mt-6">
          <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">Live Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
              <div>
                  <p className="text-slate-500 text-[10px] uppercase">Total Trades</p>
                  <p className="text-xl font-mono font-bold">{stats.totalTrades}</p>
              </div>
              <div>
                  <p className="text-slate-500 text-[10px] uppercase">Network Fees</p>
                  <p className="text-xl font-mono font-bold text-red-400">-{stats.totalFeesPaid.toFixed(5)}</p>
              </div>
              <div>
                  <p className="text-slate-500 text-[10px] uppercase">Total Campaign Cost</p>
                  <p className="text-xl font-mono font-bold text-orange-400">~{stats.estimatedSolLoss.toFixed(4)} SOL</p>
              </div>
          </div>
      </div>
  );
}

export function WalletTracker() {
    const [wallets, setWallets] = useState<any[]>([]);

    useEffect(() => {
        const fetchBalances = async () => {
            const res = await fetch('http://localhost:4000/api/balances');
            const data = await res.json();
            setWallets(data);
        };

        fetchBalances();
        const interval = setInterval(fetchBalances, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-8 bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">Worker Wallet Status</h3>
            <div className="grid grid-cols-2 gap-2">
                {wallets.map((w, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 text-xs">
                        <span className="text-slate-500 font-mono">{w.address.slice(0,4)}...{w.address.slice(-4)}</span>
                        <span className={w.balance < 0.01 ? "text-red-400 font-bold" : "text-green-400"}>
                            {w.balance.toFixed(4)} SOL
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Home() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleStartBot = async (tokenAddress: string, botSettings: any) => {
    if (!tokenAddress) return alert("Enter a token address!");

    try {
        const response = await fetch('http://localhost:4000/api/start-bot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tokenAddress: tokenAddress,
                settings: botSettings
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("🚀 Bot started with custom settings!");
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (err) {
        console.error("Failed to connect to backend", err);
    }
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
              <button onClick={handleDistribute}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded border border-slate-700 transition-colors">
                  REFILL WORKER WALLETS
              </button>
  
              <button onClick={handleWithdraw}
                  className="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-700 text-xs font-bold rounded border border-amber-500 transition-colors">
                  WITHDRAW TO MAIN WALLET
              </button>
            </div>
          </section>

          <VolumeManager />
          <WalletTracker />
          <ProfitTracker />
          
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