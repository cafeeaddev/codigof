import React, { useEffect, useRef } from 'react';

interface ShootingStarsOverlayProps {
  starDensity?: number; // stars per 10k pixels
  maxStars?: number;
  shootingStarRate?: number; // per second
  maxShooting?: number;
  horizonRatio?: number; // 0..1 of viewport height; below is ground
  horizonFade?: number; // px fade above horizon
}

type Star = {
  x: number;
  y: number;
  r: number;
  baseA: number;
  phase: number;
  speed: number;
};

type Shooting = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
};

export const ShootingStarsOverlay: React.FC<ShootingStarsOverlayProps> = ({
  starDensity = 2.0, // denser stars across sky
  maxStars = 1000,
  shootingStarRate = 1.2, // ~1.2 per second
  maxShooting = 6,
  horizonRatio = 0.65,
  horizonFade = 120,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingsRef = useRef<Shooting[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const spawnAccumRef = useRef<number>(0);

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  };

  const initStars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const horizonY = canvas.height * horizonRatio;
    const area = (canvas.width * horizonY) / 10000; // only sky area
    const target = Math.min(maxStars, Math.floor(area * starDensity));
    const stars: Star[] = [];
    for (let i = 0; i < target; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * horizonY,
        r: Math.random() * 1.6 + 0.4,
        baseA: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.2,
      });
    }
    starsRef.current = stars;
  };

  const spawnShooting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (shootingsRef.current.length >= maxShooting) return;
    const horizonY = canvas.height * horizonRatio;
    // Spawn across wide area near top half of sky
    const startX = -80 + Math.random() * (canvas.width + 160);
    const startY = Math.random() * (Math.max(1, horizonY) * 0.95);
    const speed = 700 + Math.random() * 900; // px/s
    const angle = (-15 - Math.random() * 30) * (Math.PI / 180); // shallow to steeper downward
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    shootingsRef.current.push({
      x: startX,
      y: startY,
      vx,
      vy,
      life: 0,
      maxLife: 0.8 + Math.random() * 0.6, // seconds
      length: 120 + Math.random() * 140,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      resize();
      initStars();
    };

    resize();
    initStars();
    window.addEventListener('resize', handleResize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (t: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
      lastTimeRef.current = t;

      // Spawn shootings
      spawnAccumRef.current += dt * shootingStarRate;
      while (spawnAccumRef.current >= 1) {
        spawnShooting();
        spawnAccumRef.current -= 1;
      }

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Horizon mask values
      const horizonY = canvas.height * horizonRatio;
      const fadeStart = Math.max(0, horizonY - horizonFade);
      const fadeLen = Math.max(1, horizonFade);

      // Draw stars (twinkle) with horizon fade-out
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (s.y > horizonY) continue; // safety
        const twinkle = 0.6 + 0.4 * Math.sin(t * 0.0015 * s.speed + s.phase);
        let alpha = s.baseA * twinkle;
        if (s.y > fadeStart) {
          const m = (horizonY - s.y) / fadeLen; // 1..0
          alpha *= Math.max(0, Math.min(1, m));
        }
        if (alpha <= 0.001) continue;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shootings with horizon clipping
      const shootings = shootingsRef.current;
      for (let i = shootings.length - 1; i >= 0; i--) {
        const sh = shootings[i];
        sh.life += dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;

        const lifeT = 1.0 - sh.life / sh.maxLife;
        const len = sh.length * Math.max(0, lifeT);
        const hv = Math.hypot(sh.vx, sh.vy);
        const dirX = sh.vx / hv;
        const dirY = sh.vy / hv;
        let tailX = sh.x - dirX * len;
        let tailY = sh.y - dirY * len;

        // Remove if head passes below horizon or life expires/out of view
        if (sh.life >= sh.maxLife || sh.x > canvas.width + 120 || sh.y > horizonY + 2) {
          shootings.splice(i, 1);
          continue;
        }

        // Clip tail to horizon line
        if (tailY > horizonY) {
          const r = (horizonY - sh.y) / (tailY - sh.y);
          tailX = sh.x + (tailX - sh.x) * Math.max(0, Math.min(1, r));
          tailY = horizonY;
        }

        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${Math.max(0, 0.95 * lifeT)})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.lineWidth = 2.5 * dpr;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright head glow (ensure above horizon)
        const headR = 4 * dpr;
        const headGrad = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, headR * 2.5);
        headGrad.addColorStop(0, `rgba(255,255,255,${0.9 * lifeT})`);
        headGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, headR * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [maxStars, shootingStarRate, starDensity, maxShooting]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    />
  );
};
