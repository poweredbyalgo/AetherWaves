import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Volume1, Maximize2 } from 'lucide-react';

interface UIControlsProps {
  gainNode: GainNode;
}

export const UIControls: React.FC<UIControlsProps> = ({ gainNode }) => {
  const [sensitivity, setSensitivity] = useState(2.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const hideTimerRef = useRef<number>(0);

  useEffect(() => {
    const scheduleHide = () => {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 5000);
    };

    const onMove = (e: PointerEvent) => {
      if (e.clientY > window.innerHeight - 140) {
        setVisible(true);
        window.clearTimeout(hideTimerRef.current);
      } else {
        scheduleHide();
      }
    };

    const onDown = () => {
      setVisible(true);
      scheduleHide();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

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
    <div
      className={`absolute bottom-8 z-30 flex items-center gap-6 p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
      onPointerEnter={() => window.clearTimeout(hideTimerRef.current)}
      onPointerLeave={() => {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => setVisible(false), 5000);
      }}
    >
      {/* Sensitivity Control */}
      <div className="flex items-center gap-3 text-amber-100/70">
        <Volume1 size={16} />
        <input 
          type="range" 
          min="0.5" 
          max="5" 
          step="0.1" 
          value={sensitivity}
          onChange={handleSensitivityChange}
          className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-300 focus:outline-none"
        />
        <Volume2 size={16} />
      </div>

      <div className="w-px h-4 bg-white/15"></div>

      {/* Fullscreen Toggle */}
      <button 
        onClick={toggleFullscreen}
        className="text-amber-100/70 hover:text-white transition-colors duration-300 p-1"
        title="Toggle Fullscreen"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
};
