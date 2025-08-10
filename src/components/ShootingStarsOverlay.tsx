import React, { useEffect, useRef } from 'react';

interface ShootingStarsOverlayProps {
  starDensity?: number; // stars per 10k pixels
  maxStars?: number;
  shootingStarRate?: number; // per second
  maxShooting?: number;
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
  starDensity = 1.2, // reasonable default visually
  maxStars = 600,
  shootingStarRate = 0.2, // 0.2 per second
  maxShooting = 3,
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
    const area = (canvas.width * canvas.height) / (10000); // scale by 10k px
    const target = Math.min(maxStars, Math.floor(area * starDensity));
    const stars: Star[] = [];
    for (let i = 0; i < target; i++) {
      const yBias = Math.random(); // slight bias to top
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.pow(yBias, 1.2) * canvas.height,
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
    // Spawn near top-left area
    const startY = Math.random() * (canvas.height * 0.4);
    const startX = Math.random() * (canvas.width * 0.6);
    const speed = 700 + Math.random() * 900; // px/s
    const angle = (-25 - Math.random() * 20) * (Math.PI / 180); // slight downward
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    shootingsRef.current.push({
      x: startX,
      y: startY,
      vx,
      vy,
      life: 0,
      maxLife: 0.8 + Math.random() * 0.6, // seconds
      length: 90 + Math.random() * 120,
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

      // Draw stars (twinkle)
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const alpha = s.baseA * (0.6 + 0.4 * Math.sin(t * 0.0015 * s.speed + s.phase));
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shootings
      const shootings = shootingsRef.current;
      for (let i = shootings.length - 1; i >= 0; i--) {
        const sh = shootings[i];
        sh.life += dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;

        const lifeT = 1.0 - sh.life / sh.maxLife;
        const len = sh.length * Math.max(0, lifeT);
        const tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * len;
        const tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * len;

        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${0.9 * lifeT})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (sh.life >= sh.maxLife || sh.x > canvas.width + 100 || sh.y > canvas.height + 100) {
          shootings.splice(i, 1);
        }
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
