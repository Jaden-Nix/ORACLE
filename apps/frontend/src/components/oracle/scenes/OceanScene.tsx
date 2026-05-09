"use client";

import { useEffect, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

const palettes = {
  calm: { sky: "#06101f", water: "#0a2d50", glow: "#f4a823" },
  tense: { sky: "#080d12", water: "#1a3a2a", glow: "#e05a00" },
  critical: { sky: "#0a0505", water: "#1a0a0a", glow: "#cc0000" },
};

export function OceanScene({ intensity = 0.5, mood = "calm" }: BaseSceneProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let raf = 0;
    const colors = palettes[mood as keyof typeof palettes] ?? palettes.calm;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * ratio);
      canvas.height = Math.max(1, rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      frame += 1;

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, colors.sky);
      sky.addColorStop(1, colors.water);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w / 2, h * 0.44, 0, w / 2, h * 0.44, w * 0.55);
      glow.addColorStop(0, `${colors.glow}55`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = `${colors.glow}88`;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.46);
      ctx.lineTo(w, h * 0.46);
      ctx.stroke();

      for (let layer = 7; layer >= 0; layer -= 1) {
        const yBase = h * (0.52 + layer * 0.045);
        const amp = 16 + intensity * (30 + layer * 7);
        const speed = frame * (0.012 + intensity * 0.012);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 12; x += 12) {
          const y = yBase + Math.sin(x * 0.011 + speed + layer) * amp + Math.sin(x * 0.024 - speed * 1.6) * amp * 0.42;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `${colors.water}${Math.round(78 + layer * 18).toString(16).padStart(2, "0")}`;
        ctx.fill();
      }

      const shipW = Math.min(128, w * 0.18);
      const shipH = Math.min(86, h * 0.15);
      ctx.save();
      ctx.translate(w / 2, h * 0.46 + Math.sin(frame * 0.02) * intensity * 12);
      ctx.rotate(Math.sin(frame * 0.018) * intensity * 0.24);
      ctx.fillStyle = "rgba(5,6,8,.94)";
      ctx.strokeStyle = `${colors.glow}88`;
      ctx.beginPath();
      ctx.moveTo(-shipW * 0.48, 0);
      ctx.lineTo(shipW * 0.44, 0);
      ctx.lineTo(shipW * 0.24, shipH * 0.2);
      ctx.lineTo(-shipW * 0.34, shipH * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(-2, -shipH * 0.7, 4, shipH * 0.66);
      ctx.beginPath();
      ctx.moveTo(3, -shipH * 0.66);
      ctx.lineTo(shipW * 0.26, -shipH * 0.18);
      ctx.lineTo(3, -shipH * 0.18);
      ctx.fill();
      if (intensity > 0.8) {
        ctx.strokeStyle = "rgba(255,76,54,.95)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-shipW * 0.16, shipH * 0.03);
        ctx.lineTo(-shipW * 0.08, shipH * 0.1);
        ctx.lineTo(0, shipH * 0.04);
        ctx.lineTo(shipW * 0.08, shipH * 0.15);
        ctx.stroke();
      }
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [intensity, mood]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
