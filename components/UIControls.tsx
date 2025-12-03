import React, { useState } from 'react';
import { Volume2, Volume1, Maximize2 } from 'lucide-react';

interface UIControlsProps {
  gainNode: GainNode;
}

export const UIControls: React.FC<UIControlsProps> = ({ gainNode }) => {
  const [sensitivity, setSensitivity] = useState(1.5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSensitivity(val);
    gainNode.gain.value = val;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="absolute bottom-8 z-30 flex items-center gap-6 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg animate-fade-in-up">
      
      {/* Sensitivity Control */}
      <div className="flex items-center gap-3 text-cyan-200/80">
        <Volume1 size={16} />
        <input 
          type="range" 
          min="0.5" 
          max="5" 
          step="0.1" 
          value={sensitivity}
          onChange={handleSensitivityChange}
          className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
        <Volume2 size={16} />
      </div>

      <div className="w-px h-4 bg-white/20"></div>

      {/* Fullscreen Toggle */}
      <button 
        onClick={toggleFullscreen}
        className="text-cyan-200/80 hover:text-white transition-colors p-1"
        title="Toggle Fullscreen"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
};