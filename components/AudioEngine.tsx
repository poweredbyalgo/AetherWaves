import React, { useRef, useEffect } from 'react';

interface AudioEngineProps {
  analyser: AnalyserNode;
}

const createSmoother = (attackHz = 0.4, releaseHz = 0.1) => {
  let value = 0;
  return (target: number, dt: number) => {
    const rate = target > value ? attackHz : releaseHz;
    const k = 1 - Math.exp(-rate * dt);
    value += (target - value) * k;
    return value;
  };
};

export const AudioEngine: React.FC<AudioEngineProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const smoothBass = createSmoother(1.6, 1.1);
    const smoothMids = createSmoother(1.8, 1.2);
    const smoothTreble = createSmoother(2.0, 1.4);
    const smoothEnergy = createSmoother(1.5, 1.2);

    let rotation = 0;
    let lastTime = performance.now();
    let nextRippleAt = performance.now() + 5000;
    let nextBassRippleAt = 0;

    const peaks = { bass: 0.08, mids: 0.08, treble: 0.08 };

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0008,
      bright: 0.05 + Math.random() * 0.12,
    }));

    let motes: { angle: number; r: number; speed: number; phase: number; size: number }[] = [];

    const dust = Array.from({ length: 40 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 1.2 + Math.random() * 0.35,
      orbit: 0.01 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
      size: 0.5 + Math.random() * 1.3,
    }));

    const ripples: { birth: number }[] = [];

    const resize = () => {
      const browserDpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;

      let targetDpr = Math.max(browserDpr, 2);

      if (width * targetDpr > 4000) {
        targetDpr = Math.max(browserDpr, 1.5);
      }

      if (width * targetDpr > 6000) {
        targetDpr = 1;
      }

      canvas.width = width * targetDpr;
      canvas.height = window.innerHeight * targetDpr;

      dprRef.current = targetDpr;

      const count = Math.min(
        280,
        Math.max(110, Math.floor((width * window.innerHeight) / 12000))
      );
      motes = Array.from({ length: count }, () => {
        const r = 0.08 + Math.random() * 0.92;
        return {
          angle: Math.random() * Math.PI * 2,
          r,
          speed: 0.02 + (1 - r) * 0.07,
          phase: Math.random() * Math.PI * 2,
          size: 0.5 + Math.random() * 1.5,
        };
      });
    };

    window.addEventListener('resize', resize);
    resize();

    const render = (now: number) => {
      animationRef.current = requestAnimationFrame(render);

      const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
      lastTime = now;

      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      const dpr = dprRef.current;
      const logicalW = w / dpr;
      const logicalH = h / dpr;
      const cx = logicalW / 2;
      const cy = logicalH / 2;

      const minDim = Math.min(logicalW, logicalH);
      const aspect = minDim / Math.max(logicalW, logicalH);
      const radius = minDim * 0.26 * (1 + (1 - aspect) * 0.35);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Stronger fade so slow-moving outer motes cannot accumulate into
      // persistent trails. destination-out never reaches true zero alpha
      // in finite frames, so periodically force a hard clear on pixels
      // whose alpha is already near-transparent (avoiding visible popping
      // on the bright core which is redrawn each frame anyway).
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.23)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const s of stars) {
        const a = s.bright * (0.6 + 0.4 * Math.sin(now * s.speed + s.phase));
        ctx.fillStyle = `rgba(200, 210, 230, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x * logicalW, s.y * logicalH, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      let bass = 0;
      let mids = 0;
      let treble = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (i < 60) bass += dataArray[i];
        else if (i < 240) mids += dataArray[i];
        else treble += dataArray[i];
      }
      const decay = Math.exp(-dt * 0.35);
      peaks.bass *= decay;
      peaks.mids *= decay;
      peaks.treble *= decay;

      const rawBass = bass / 60 / 255;
      const rawMids = mids / 180 / 255;
      const rawTreble = treble / (bufferLength - 240) / 255;

      if (rawBass > peaks.bass) peaks.bass = rawBass;
      if (rawMids > peaks.mids) peaks.mids = rawMids;
      if (rawTreble > peaks.treble) peaks.treble = rawTreble;

      peaks.bass = Math.max(peaks.bass, 0.03);
      peaks.mids = Math.max(peaks.mids, 0.03);
      peaks.treble = Math.max(peaks.treble, 0.03);

      const norm = (raw: number, peak: number) =>
        raw < 0.015 ? 0 : Math.pow(Math.min(1, raw / peak), 0.55);

      bass = smoothBass(norm(rawBass, peaks.bass), dt);
      mids = smoothMids(norm(rawMids, peaks.mids), dt);
      treble = smoothTreble(norm(rawTreble, peaks.treble), dt);
      const energy = smoothEnergy((bass + mids + treble) / 3, dt);

      const breathe = 1 + bass * 0.12 + Math.sin(now * 0.0006) * 0.004;
      rotation += dt * (0.04 + bass * 0.3);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(breathe, breathe);
      ctx.rotate(rotation);

      ctx.save();
      ctx.rotate(-rotation * 0.55);
      const innerRadius = radius * 0.62 + Math.sin(now * 0.0005) * 4 + mids * 24;
      ctx.strokeStyle = 'rgba(185, 200, 216, 0.09)';
      ctx.lineWidth = Math.max(0.8, Math.min(logicalW, logicalH) / 1000);
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const maxOuter = Math.hypot(logicalW, logicalH) / 2;

      for (const m of motes) {
        m.angle += dt * m.speed;
        const radial = Math.min(
          m.r * (1 + bass * 0.1) + Math.sin(now * 0.0003 + m.phase) * m.r * 0.03,
          0.98
        ) * maxOuter;
        const px = Math.cos(m.angle) * radial;
        const py = Math.sin(m.angle) * radial;
        const twinkle = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(now * 0.001 + m.phase * 1.7));
        const brightness = twinkle * (0.4 + energy * 0.9);
        const size = m.size * (1 + treble * 1.1 + mids * 0.5);

        ctx.fillStyle = `rgba(240, 230, 210, ${brightness})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      const coreRadius = radius * (0.1 + mids * 0.36 + bass * 0.06);
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.2);
      coreGradient.addColorStop(0, `rgba(252, 244, 226, ${0.7 + energy * 0.25})`);
      coreGradient.addColorStop(0.35, 'rgba(240, 214, 168, 0.26)');
      coreGradient.addColorStop(0.7, 'rgba(186, 198, 214, 0.07)');
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      const flameSize = radius * (0.02 + energy * 0.03);
      ctx.fillStyle = `rgba(255, 250, 240, ${0.75 + energy * 0.2})`;
      ctx.beginPath();
      ctx.arc(0, 0, flameSize, 0, Math.PI * 2);
      ctx.fill();

      for (const p of dust) {
        p.angle += dt * p.orbit;
        const drift = p.dist * radius * (1 + bass * 0.1) + Math.sin(now * 0.0004 + p.phase) * 6;
        const px = Math.cos(p.angle) * drift;
        const py = Math.sin(p.angle) * drift;
        const twinkle = (0.2 + 0.3 * (0.5 + 0.5 * Math.sin(now * 0.0008 + p.phase * 2)))
          * (1 + treble * 0.8);
        const pSize = p.size * (1 + treble * 0.9);

        ctx.fillStyle = `rgba(236, 228, 210, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (bass > 0.55 && now > nextBassRippleAt) {
        ripples.push({ birth: now });
        nextBassRippleAt = now + 4000;
      }

      if (now > nextRippleAt) {
        ripples.push({ birth: now });
        nextRippleAt = now + 9000 + Math.random() * 7000;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const t = (now - rp.birth) / 5500;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const rr = radius * (0.15 + t * 1.6);
        const alpha = (1 - t) * 0.1;
        ctx.strokeStyle = `rgba(226, 226, 220, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    render(performance.now());

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
