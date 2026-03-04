import React, { useRef, useEffect } from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * MoneyFlowBackground.tsx
 * Vault - Animated hero background for dashboard.
 * - Visualizes money flow with animated particles and lines.
 * - Uses canvas for performant, luxe animation.
 * - Fully responsive, accessible, and overlays dashboard hero.
 ************************************************************/

/**
 * Particle - Represents a moving money flow particle.
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

/**
 * MoneyFlowBackground
 * - Animated canvas background for dashboard hero.
 * - Visualizes money flow with particles and connecting lines.
 * - Responsive, overlays hero section, non-interactive.
 */
const MoneyFlowBackground: React.FC<{
  className?: string;
}> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const dprRef = useRef<number>(1);

  // Colors: brand blue, accent pink, savings yellow, neutral
  const COLORS = [
    '#3B82F6', // brand blue
    '#F472B6', // accent pink
    '#FACC15', // savings yellow
    '#A78BFA', // bills purple
    '#22C55E', // health green
    '#64748B', // neutral
  ];

  // Responsive: number of particles based on width
  function getParticleCount(width: number): number {
    if (width < 640) return 24;
    if (width < 1024) return 36;
    return 48;
  }

  // Initialize particles
  function initParticles(width: number, height: number) {
    const count = getParticleCount(width);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 0.5 + Math.random() * 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3.5,
        color: COLORS[i % COLORS.length],
        alpha: 0.4 + Math.random() * 0.6,
      });
    }
    particlesRef.current = particles;
  }

  // Animation loop
  function animate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;

    // Move particles
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges for infinite flow
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }

    // Draw lines between close particles (money flow)
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.save();
          ctx.globalAlpha = Math.min(p1.alpha, p2.alpha) * 0.25;
          ctx.strokeStyle = p1.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Draw particles
    for (let p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    animationRef.current = requestAnimationFrame(animate);
  }

  // Resize canvas to fill parent, handle DPR
  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const width = parent.offsetWidth;
    const height = parent.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles(canvas.width, canvas.height);
  }

  // Setup animation and resize listeners
  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    // Resize on window resize
    function handleResize() {
      resizeCanvas();
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // Re-init particles on dark mode change (for color contrast)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initParticles(canvas.width, canvas.height);
  }, [document.documentElement.className]);

  // Accessibility: aria-hidden, pointer-events-none
  return (
    <div
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none select-none z-base',
        className
      )}
      aria-hidden="true"
      style={{
        // Overlay with glass/gradient for luxe effect
        background:
          'linear-gradient(120deg, rgba(59,130,246,0.08) 0%, rgba(244,114,182,0.06) 100%)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        tabIndex={-1}
        aria-hidden="true"
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default MoneyFlowBackground;