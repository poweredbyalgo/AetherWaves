import React, { useRef, useEffect } from 'react';

export const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = 1;
    let w = 0;
    let h = 0;
    let parts: { x: number; y: number; size: number; speedX: number; speedY: number; phase: number; alpha: number }[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const count = Math.min(120, Math.max(24, Math.floor((w * h) / 9000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.5 + Math.random() * 1.4,
        speedX: (Math.random() - 0.5) * 0.14,
        speedY: (Math.random() - 0.5) * 0.14 + 0.06,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.08 + Math.random() * 0.3,
      }));
    };

    window.addEventListener('resize', resize);
    resize();

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        p.x += p.speedX * dt * 60;
        p.y += p.speedY * dt * 60;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const twinkle = 0.6 + 0.4 * Math.sin(now * 0.0007 + p.phase);
        ctx.fillStyle = `rgba(232, 224, 205, ${p.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    tick(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};
