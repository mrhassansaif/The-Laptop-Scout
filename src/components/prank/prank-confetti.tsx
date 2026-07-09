"use client";

import { useEffect, useRef } from "react";

const RAINBOW = [
  "#ff6b6b",
  "#feca57",
  "#48dbfb",
  "#1dd1a1",
  "#5f27cd",
  "#ff9ff3",
  "#54a0ff",
];

type Particle = {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
};

function createParticles(count: number, width: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * heightOffset(),
    size: 6 + Math.random() * 8,
    color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)]!,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    velocityX: (Math.random() - 0.5) * 4,
    velocityY: 2 + Math.random() * 4,
    opacity: 1,
  }));
}

function heightOffset() {
  return 120;
}

type PrankConfettiProps = {
  active: boolean;
};

export function PrankConfetti({ active }: PrankConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    const el = canvasRef.current;
    if (!el) {
      return;
    }

    const context = el.getContext("2d");
    if (!context) {
      return;
    }

    const ctx: CanvasRenderingContext2D = context;

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    let particles = createParticles(140, el.width);
    let elapsed = 0;
    const duration = 3200;

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          rotation: particle.rotation + particle.rotationSpeed,
          velocityY: particle.velocityY + 0.08,
          opacity: Math.max(0, particle.opacity - 0.004),
        }))
        .filter(
          (particle) =>
            particle.opacity > 0 && particle.y < canvas.height + particle.size,
        );

      for (const particle of particles) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 4,
          particle.size,
          particle.size / 2,
        );
        ctx.restore();
      }

      elapsed += 16;

      if (elapsed < duration && particles.length > 0) {
        frameRef.current = requestAnimationFrame(draw);
      }
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden
    />
  );
}
