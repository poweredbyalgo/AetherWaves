import React, { useState } from 'react';
import { AudioEngine } from './components/AudioEngine';
import { Introduction } from './components/Introduction';
import { UIControls } from './components/UIControls';
import { Particles } from './components/Particles';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);

  const setupAudioGraph = (ctx: AudioContext, source: AudioNode, isSim: boolean) => {
    const ana = ctx.createAnalyser();
    const gain = ctx.createGain();

    // Settings for smooth, healing visuals
    ana.fftSize = 2048; 
    ana.smoothingTimeConstant = 0.92; // High smoothing for "liquid" feel
    
    // Gain allows us to control sensitivity
    gain.gain.value = 2.2; 

    source.connect(gain);
    gain.connect(ana);

    setAudioContext(ctx);
    setAnalyser(ana);
    setGainNode(gain);
    setStarted(true);
    setSimulationMode(isSim);
  };

  const handleStart = async () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = ctx.createMediaStreamSource(stream);
      setupAudioGraph(ctx, source, false);
    } catch (err) {
      console.warn("Microphone access failed, switching to simulation mode:", err);
      
      // Create internal oscillators to generate visual data without sound output
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      osc1.type = 'sine';
      osc1.frequency.value = 60; // Base drone

      osc2.type = 'sine';
      osc2.frequency.value = 120; // Harmonic

      // LFO for movement
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 30;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Connect to a merger to create a rich source
      const merger = ctx.createChannelMerger(1);
      osc1.connect(merger);
      osc2.connect(merger);

      osc1.start();
      osc2.start();
      lfo.start();

      setupAudioGraph(ctx, merger, true);
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#101a2c] via-[#050810] to-black opacity-90 z-0 pointer-events-none" />

      {/* Main Visualizer Layer */}
      {started && analyser ? (
        <AudioEngine analyser={analyser} />
      ) : (
        <>
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Particles />
          </div>
          <Introduction onStart={handleStart} />
        </>
      )}

      {/* Foreground UI */}
      {started && gainNode && (
        <>
          <UIControls gainNode={gainNode} />
          {simulationMode && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-900/20 border border-amber-800/30 text-amber-500/50 text-xs tracking-widest uppercase pointer-events-none animate-pulse">
              Simulation Mode
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;