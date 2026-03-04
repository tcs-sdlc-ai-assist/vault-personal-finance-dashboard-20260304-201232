import React, { useEffect, useRef } from 'react';

/************************************************************
 * ConfettiCelebration.tsx
 * Vault - Canvas confetti burst animation for goal completion.
 * - Renders a canvas overlay with animated confetti particles.
 * - Used in savings goals page when a goal is completed.
 * - Fully client-side, no dependencies.
 ************************************************************/

/**
 * ConfettiParticle - Single confetti piece properties.
 */
interface ConfettiParticle {
  x: number;
  y: number;
  r: number; // radius (for circle), or width/height for rectangle
  w: number; // width (for rectangle)
  h: number; // height (for rectangle)
  color: string;
  tilt: number;
  tiltAngle: number;
  tiltAngleIncrement: number;
  dx: number; // horizontal velocity
  dy: number; // vertical velocity
  opacity: number;
  shape: 'rect' | 'circle';
}

/**
 * ConfettiCelebration Props
 * @param show Whether to show the confetti animation
 * @param onComplete Callback when animation finishes (optional)
 * @param duration Animation duration in ms (default: 2000)
 * @param particleCount Number of confetti pieces (default: 80)
 */
interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
  className?: string;
}

/**
 * ConfettiCelebration
 * - Canvas overlay confetti burst animation.
 * - Covers parent with absolute/fixed positioning.
 */
const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  show,
  onComplete,
  duration = 2000,
  particleCount = 80,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Confetti color palette (matches Vault theme)
  const COLORS = [
    '#3B82F6', // brand blue
    '#F472B6', // accent pink
    '#A78BFA', // bills purple
    '#F59E42', // groceries orange
    '#22C55E', // health green
    '#FACC15', // savings yellow
    '#38BDF8', // travel sky
    '#64748B', // other neutral
    '#EF4444', // error red
  ];

  // Helper: random float in range
  const random = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  // Helper: random int in range
  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper: pick random color
  const randomColor = () => COLORS[randomInt(0, COLORS.length - 1)];

  // Helper: pick random shape
  const randomShape = () => (Math.random() < 0.5 ? 'rect' : 'circle') as 'rect' | 'circle';

  // Generate confetti particles
  const createParticles = (width: number, height: number): ConfettiParticle[] => {
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = random(-Math.PI / 4, Math.PI / 4); // spread left/right
      const speed = random(4, 8);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - random(6, 12); // upward burst
      const shape = randomShape();
      const r = random(6, 12);
      const w = shape === 'rect' ? random(8, 16) : r;
      const h = shape === 'rect' ? random(4, 10) : r;
      particles.push({
        x: width / 2 + random(-40, 40), // burst from center
        y: height * 0.6 + random(-20, 20),
        r,
        w,
        h,
        color: randomColor(),
        tilt: random(-10, 10),
        tiltAngle: random(0, Math.PI * 2),
        tiltAngleIncrement: random(0.05, 0.12),
        dx,
        dy,
        opacity: 1,
        shape,
      });
    }
    return particles;
  };

  // Animation logic
  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to parent or window
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let particles = createParticles(width, height);
    let startTime = performance.now();

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Update position
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.25; // gravity
        p.dx *= 0.98; // air resistance
        p.dy *= 0.98;
        p.tiltAngle += p.tiltAngleIncrement;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        // Fade out as they fall
        if (p.y > height * 0.8) {
          p.opacity -= 0.02;
        }

        ctx.globalAlpha = Math.max(0, p.opacity);

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tiltAngle);
        if (p.shape === 'rect') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2 + p.tilt, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, p.tilt, p.r / 2, 0, 2 * Math.PI);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.globalAlpha = 1;

      // Remove faded particles
      particles = particles.filter((p) => p.opacity > 0);

      // Continue animation if particles remain and duration not exceeded
      const now = performance.now();
      if (particles.length > 0 && now - startTime < duration) {
        animationRef.current = requestAnimationFrame(draw);
      } else {
        // Fade out canvas
        if (onComplete) onComplete();
      }
    }

    animationRef.current = requestAnimationFrame(draw);

    // Cleanup on unmount or hide
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      ctx.clearRect(0, 0, width, height);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, duration, particleCount]);

  // Hide canvas when not showing
  return (
    <canvas
      ref={canvasRef}
      className={
        [
          'pointer-events-none fixed inset-0 z-toast transition-opacity duration-500',
          show ? 'opacity-100' : 'opacity-0',
          className,
        ].join(' ')
      }
      aria-hidden="true"
      tabIndex={-1}
      style={{
        display: show ? 'block' : 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default ConfettiCelebration;