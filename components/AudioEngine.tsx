import React, { useRef, useEffect } from 'react';

interface AudioEngineProps {
  analyser: AnalyserNode;
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Aesthetic Parameters
    let rotation = 0;
    
    // Resize handler with Smart Supersampling
    const resize = () => {
      const browserDpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      
      // On standard monitors (dpr=1), we force higher resolution (supersampling)
      // to reduce aliasing and make lines crisp.
      // We aim for at least 2x density, but cap the max texture width to ~4000px
      // to ensure performance on 4K screens doesn't tank.
      let targetDpr = Math.max(browserDpr, 2);

      if (width * targetDpr > 4000) {
        // If screen is very wide (e.g. 4k), 2x might be too heavy.
        // We settle for 1.5x or native if native is already high.
        targetDpr = Math.max(browserDpr, 1.5);
      }
      
      // Hard cap to avoid browser canvas limits
      if (width * targetDpr > 6000) {
        targetDpr = 1; 
      }

      canvas.width = width * targetDpr;
      canvas.height = window.innerHeight * targetDpr;
      
      dprRef.current = targetDpr;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      
      // Calculate logical dimensions (CSS pixels)
      // We derive this from physical size / our calculated DPR to keep things synced
      const dpr = dprRef.current;
      const logicalW = w / dpr;
      const logicalH = h / dpr;
      const cx = logicalW / 2;
      const cy = logicalH / 2;

      // 1. Clear / Trail Effect
      // Reset transform to identity to clear the full physical buffer
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      ctx.fillStyle = 'rgba(5, 5, 10, 0.2)'; // Determines trail length
      ctx.fillRect(0, 0, w, h);

      // 2. Apply Scale for Drawing
      // This ensures 1 drawing unit = 1 CSS pixel, but rendered with high density
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Set drawing styles for crispness
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Analyze Bass/Mid/Treble
      let bass = 0;
      let mids = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (i < 50) bass += dataArray[i];
        else if (i < 200) mids += dataArray[i];
      }
      bass = bass / 50;
      mids = mids / 150;
      
      const scale = 1 + (bass / 255) * 0.3; // Breathing effect
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.rotate(rotation);
      
      // Rotate slowly + burst on bass
      rotation += 0.002 + (bass * 0.00005); 

      // 3. Draw The Core (A Glowing Orb)
      const coreRadius = 50 + (mids * 0.4);
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2);
      coreGradient.addColorStop(0, 'rgba(200, 255, 255, 0.9)'); // Slightly brighter center
      coreGradient.addColorStop(0.4, 'rgba(6, 182, 212, 0.3)');
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw The Frequency Ring (Symmetrical flowing line)
      const radius = Math.min(logicalW, logicalH) * 0.28; // Slightly larger ring
      const bars = 200; // Increased resolution of the circle
      const step = (Math.PI * 2) / bars;

      ctx.beginPath();
      // Use dynamic line width based on screen size, but keep it elegant
      // On small screens: ~1.5px, Large screens: ~2.5px
      ctx.lineWidth = Math.max(1.5, Math.min(logicalW, logicalH) / 600); 
      
      ctx.strokeStyle = `hsl(${180 + (bass * 0.5)}, 80%, 60%)`;
      ctx.shadowBlur = 20; // Increase glow
      ctx.shadowColor = 'cyan';

      for (let i = 0; i <= bars; i++) {
        const dataIndex = Math.floor(Math.abs((i % bars) - (bars / 2)) * (bufferLength / bars));
        const value = dataArray[dataIndex] || 0;
        
        // Smooth sine modulation
        const distortion = (value / 255) * 120; // More dramatic movement
        
        const angle = i * step;
        const r = radius + distortion;
        
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // 5. Draw Outer Particles (Starfield)
      const particleCount = 48; // More particles
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + (rotation * -2);
        const dataIndex = i * 3;
        const value = dataArray[dataIndex] || 0;
        const particleDist = radius * 1.6 + (value * 1.0);
        
        const px = Math.cos(angle) * particleDist;
        const py = Math.sin(angle) * particleDist;
        
        // Dynamic particle size
        const pSize = Math.max(2, (value / 255) * 4);

        ctx.beginPath();
        ctx.fillStyle = `rgba(220, 255, 255, ${Math.min(1, value / 400)})`;
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-10"
    />
  );
};