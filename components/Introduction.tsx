import React from 'react';
import { Mic, Headphones, Activity } from 'lucide-react';

interface IntroductionProps {
  onStart: () => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ onStart }) => {
  return (
    <div className="z-20 flex flex-col items-center text-center p-8 max-w-md animate-fade-in">
      <div className="mb-6 relative group cursor-pointer" onClick={onStart}>
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <button className="relative w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300">
           <Mic className="w-8 h-8 text-cyan-300" />
        </button>
      </div>

      <h1 className="text-4xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400 mb-2">
        AETHER<span className="font-bold">WAVES</span>
      </h1>
      
      <p className="text-slate-400 text-sm tracking-widest uppercase mb-8">
        Audio Visualization System // V-1.0
      </p>

      <div className="text-slate-300 font-light mb-8 space-y-4">
        <p>Synchronize the visual core with your environment's audio.</p>
        <div className="flex flex-col gap-2 items-center text-xs text-slate-500 uppercase tracking-wider">
           <div className="flex items-center gap-2">
             <Headphones className="w-4 h-4" /> <span>Microphone input recommended</span>
           </div>
           <div className="flex items-center gap-2 text-slate-600">
             <Activity className="w-4 h-4" /> <span>Simulation available if mic absent</span>
           </div>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="px-8 py-3 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/50 rounded text-cyan-200 tracking-[0.15em] text-sm transition-all duration-300 uppercase backdrop-blur-sm"
      >
        Initialize System
      </button>
    </div>
  );
};