"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

const palettes = {
  volatile: { sky: "#080713", cloud: "rgba(40,28,70,.72)", rain: "166,188,255", bolt: "188,145,255" },
  building: { sky: "#071017", cloud: "rgba(18,37,52,.78)", rain: "127,176,202", bolt: "158,224,255" },
  crash: { sky: "#030303", cloud: "rgba(40,8,10,.82)", rain: "198,196,206", bolt: "255,46,46" },
};

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
}

export function StormScene({ intensity = 0.7, mood = "volatile" }: BaseSceneProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const bolt = useRef<Array<[number, number]>>([]);
  const ttl = useRef(0);
  const drops = useMemo<Drop[]>(
    () =>
      Array.from({ length: 720 }, () => ({
        x: Math.random(),
        y: Math.random(),
        len: 12 + Math.random() * 24,
        speed: 0.004 + Math.random() * 0.014,
        alpha: 0.18 + Math.random() * 0.42,
      })),
    [],
  );

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let raf = 0;
    const palette = palettes[mood as keyof typeof palettes] ?? palettes.volatile;

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

    const makeBolt = (w: number, h: number) => {
      const points: Array<[number, number]> = [];
      let x = w * (0.18 + Math.random() * 0.64);
      let y = -20;
      points.push([x, y]);
      while (y < h * (0.34 + Math.random() * 0.3)) {
        x += (Math.random() - 0.5) * 54;
        y += 22 + Math.random() * 38;
        points.push([x, y]);
      }
      bolt.current = points;
      ttl.current = 8 + Math.floor(intensity * 12);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      frame += 1;
      ctx.fillStyle = palette.sky;
      ctx.fillRect(0, 0, w, h);

      const horizon = ctx.createLinearGradient(0, h * 0.35, 0, h);
      horizon.addColorStop(0, "transparent");
      horizon.addColorStop(1, mood === "crash" ? "rgba(118,10,10,.4)" : "rgba(18,58,70,.35)");
      ctx.fillStyle = horizon;
      ctx.fillRect(0, 0, w, h);

      for (let layer = 0; layer < 4; layer += 1) {
        ctx.fillStyle = palette.cloud;
        ctx.beginPath();
        const y = h * (0.07 + layer * 0.075);
        ctx.moveTo(0, y + 50);
        for (let x = 0; x <= w + 80; x += 80) {
          const wave = Math.sin(x * 0.01 + frame * 0.006 + layer) * 24;
          ctx.quadraticCurveTo(x + 34, y + wave - 40, x + 80, y + 42 + wave * 0.45);
        }
        ctx.lineTo(w, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }

      if (!ttl.current && Math.random() < 0.006 + intensity * 0.03) makeBolt(w, h);
      if (ttl.current) {
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.shadowBlur = 24;
        ctx.shadowColor = `rgba(${palette.bolt},.9)`;
        ctx.strokeStyle = `rgba(${palette.bolt},${0.26 + ttl.current * 0.05})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        bolt.current.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.92)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
        ttl.current -= 1;
      }

      ctx.lineWidth = 1;
      for (const drop of drops) {
        drop.y += drop.speed * (1.2 + intensity * 5.5);
        drop.x += 0.0008 + intensity * 0.0015;
        if (drop.y > 1.1) {
          drop.y = -0.1;
          drop.x = Math.random();
        }
        const x = drop.x * w;
        const y = drop.y * h;
        ctx.strokeStyle = `rgba(${palette.rain},${drop.alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8 - intensity * 12, y + drop.len);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [drops, intensity, mood]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
