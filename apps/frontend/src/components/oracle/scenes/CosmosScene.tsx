"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

export function CosmosScene({ intensity = 0.25, mood = "expanding", metrics = [] }: BaseSceneProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stars = useMemo(
    () =>
      Array.from({ length: 850 }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random(),
        size: 0.4 + Math.random() * 1.8,
      })),
    [],
  );

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const warm = mood === "expanding";
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
      ctx.fillStyle = "#03040b";
      ctx.fillRect(0, 0, w, h);
      const nebula = ctx.createRadialGradient(w * 0.38, h * 0.42, 0, w * 0.38, h * 0.42, w * 0.42);
      nebula.addColorStop(0, warm ? "rgba(211,143,50,.26)" : "rgba(58,95,190,.24)");
      nebula.addColorStop(0.45, warm ? "rgba(128,69,146,.1)" : "rgba(106,54,165,.1)");
      nebula.addColorStop(1, "transparent");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      for (const star of stars) {
        star.z -= 0.0008 + intensity * 0.004;
        if (star.z <= 0.02) star.z = 1;
        const depth = 1 / star.z;
        const x = w * 0.5 + star.x * w * 0.32 * depth;
        const y = h * 0.5 + star.y * h * 0.32 * depth;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        ctx.fillStyle = `rgba(232,228,217,${Math.min(1, 0.12 + depth * 0.08)})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size * Math.min(2.5, depth * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      const nodes = metrics.slice(0, 4).map((metric, index) => {
        const angle = -Math.PI / 2 + index * ((Math.PI * 2) / Math.max(4, metrics.length || 4));
        const radius = Math.min(w, h) * (0.12 + metric.value * 0.12);
        return [w * 0.5 + Math.cos(angle) * radius, h * 0.48 + Math.sin(angle) * radius] as const;
      });
      ctx.strokeStyle = "rgba(201,168,76,.38)";
      ctx.beginPath();
      nodes.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.stroke();
      for (const [x, y] of nodes) {
        ctx.fillStyle = "rgba(201,168,76,.85)";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [intensity, metrics, mood, stars]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
