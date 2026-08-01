import React from 'react';
import { Mic, Headphones, Activity } from 'lucide-react';

interface IntroductionProps {
  onStart: () => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ onStart }) => {
  return (
    <div className="z-20 flex flex-col items-center text-center p-8 max-w-md animate-fade-in">
      <div className="mb-6 relative group cursor-pointer" onClick={onStart}>
        <div className="absolute -inset-1 bg-gradient-to-br from-amber-200/50 to-orange-400/20 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-[2000ms] group-hover:duration-500"></div>
        <button className="relative w-24 h-24 rounded-full bg-slate-900/70 border border-slate-700/60 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-1000 ease-out">
           <Mic className="w-8 h-8 text-amber-100/90" />
        </button>
      </div>

      <h1 className="text-4xl font-light tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-50 via-orange-100 to-amber-200 mb-2">
        AETHER<span className="font-bold">WAVES</span>
      </h1>
      
      <p className="text-slate-400 text-sm tracking-[0.3em] mb-8">
        让声音化作光与涟漪，随节奏呼吸
      </p>

      <div className="text-slate-300/90 font-light mb-8 space-y-4">
        <p>环境声音将点亮环绕的光晕与星尘，</p>
        <p>在静默中缓缓流动。</p>
        <div className="flex flex-col gap-2 items-center text-xs text-slate-500 tracking-wider">
           <div className="flex items-center gap-2">
             <Headphones className="w-4 h-4" /> <span>推荐使用麦克风输入</span>
           </div>
           <div className="flex items-center gap-2 text-slate-600">
             <Activity className="w-4 h-4" /> <span>无麦克风时自动模拟</span>
           </div>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="px-8 py-3 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-700/30 rounded text-amber-100/80 tracking-[0.2em] text-sm transition-all duration-500 uppercase backdrop-blur-sm hover:border-amber-600/50"
      >
        开始
      </button>
    </div>
  );
};
