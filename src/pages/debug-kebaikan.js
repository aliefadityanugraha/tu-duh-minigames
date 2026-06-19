import React, { useState } from 'react';
import Head from 'next/head';
import HubungkanKebaikan from '../components/minigames/HubungkanKebaikan';

export default function DebugKebaikan() {
  const [completed, setCompleted] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleGameComplete = () => {
    setCompleted(true);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] onGameComplete() triggered!`]);
  };

  return (
    <div className="min-h-screen bg-indigo-950 p-6 flex flex-col items-center gap-6">
      <Head>
        <title>Debug HubungkanKebaikan</title>
      </Head>

      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 p-4 rounded-xl text-white font-mono text-sm shadow-md">
        <h2 className="text-lg font-bold border-b border-slate-700 pb-2 mb-2">Debug Console</h2>
        <div className="flex justify-between items-center mb-2">
          <span>Status: {completed ? '✅ COMPLETED' : '⏳ WAITING'}</span>
          <button 
            onClick={() => { setCompleted(false); setLogs([]); }}
            className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-500 font-bold"
          >
            Reset Test State
          </button>
        </div>
        <div className="max-h-24 overflow-y-auto space-y-1 bg-black/50 p-2 rounded">
          {logs.length === 0 && <p className="text-gray-500 italic">No events logged yet.</p>}
          {logs.map((log, i) => (
            <p key={i} className="text-green-400">{log}</p>
          ))}
        </div>
      </div>

      <div className="w-full">
        <HubungkanKebaikan onGameComplete={handleGameComplete} />
      </div>
    </div>
  );
}
