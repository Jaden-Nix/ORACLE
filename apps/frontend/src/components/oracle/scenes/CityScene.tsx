"use client";

import { useEffect, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

export function CityScene({ intensity = 0.55, mood = "busy", metrics = [] }: BaseSceneProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let raf = 0;
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
      const night = mood === "overloaded";
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, night ? "#050711" : "#151023");
      bg.addColorStop(0.56, night ? "#11141f" : "#3a2432");
      bg.addColorStop(1, "#030405");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const sun = ctx.createRadialGradient(w * 0.42, h * (0.3 + intensity * 0.2), 0, w * 0.42, h * 0.45, w * 0.26);
      sun.addColorStop(0, night ? "rgba(121,72,255,.18)" : "rgba(245,170,60,.32)");
      sun.addColorStop(1, "transparent");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      const tileW = Math.max(34, Math.min(56, w / 15));
      const tileH = tileW * 0.5;
      const originX = w / 2;
      const originY = h * 0.36;
      for (let row = 0; row < 7; row += 1) {
        for (let col = 0; col < 7; col += 1) {
          const isoX = originX + (col - row) * (tileW / 2);
          const isoY = originY + (col + row) * (tileH / 2);
          const metric = metrics[(row + col) % Math.max(1, metrics.length)];
          const priority = metric?.value ?? ((row * 7 + col) % 10) / 10;
          const height = 18 + priority * 88 + intensity * 32;
          ctx.fillStyle = "rgba(14,18,22,.72)";
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2);
          ctx.lineTo(isoX, isoY + tileH);
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = night ? "rgba(28,34,52,.96)" : "rgba(51,49,57,.94)";
          ctx.fillRect(isoX - tileW * 0.22, isoY - height + tileH * 0.5, tileW * 0.44, height);
          ctx.fillStyle = night ? "rgba(95,210,255,.78)" : "rgba(236,181,83,.64)";
          for (let wy = isoY - height + 10; wy < isoY + tileH * 0.4; wy += 14) {
            for (let wx = isoX - tileW * 0.14; wx < isoX + tileW * 0.15; wx += 13) {
              if ((wx + wy + frame) % 4 < 2.6) ctx.fillRect(wx, wy, 4, 4);
            }
          }
        }
      }

      ctx.fillStyle = night ? "rgba(255,55,90,.85)" : "rgba(255,210,80,.8)";
      for (let i = 0; i < Math.floor(8 + intensity * 28); i += 1) {
        const t = ((frame * (0.003 + intensity * 0.006) + i / 30) % 1) * 2 - 1;
        ctx.beginPath();
        ctx.arc(originX + t * w * 0.32, originY + h * 0.34 + Math.sin(i) * 12, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [intensity, metrics, mood]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
