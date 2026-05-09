"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

type P5Module = typeof import("p5");
type P5Instance = InstanceType<P5Module["default"]>;

const moodPalettes = {
  volatile: { sky: "#080713", cloud: [40, 28, 70, 184], rain: [166, 188, 255], bolt: [188, 145, 255] },
  building: { sky: "#071017", cloud: [18, 37, 52, 199], rain: [127, 176, 202], bolt: [158, 224, 255] },
  crash: { sky: "#030303", cloud: [40, 8, 10, 209], rain: [198, 196, 206], bolt: [255, 46, 46] },
} as const;

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3 ? cleaned.split("").map((char) => char + char).join("") : cleaned;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return [188, 145, 255] as const;
  return [((value >> 16) & 255), ((value >> 8) & 255), (value & 255)] as const;
}

export function StormScene(props: BaseSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
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
    const host = hostRef.current;
    if (!host) return;

    let sketch: P5Instance | null = null;
    let disposed = false;

    void import("p5").then(({ default: P5 }) => {
      if (disposed || !hostRef.current) return;

      sketch = new P5((p: P5Instance) => {
        const { intensity = 0.7, mood = "volatile", palette: scenePalette, skyLabel, entities = [], effects } = props;
        const base = moodPalettes[mood as keyof typeof moodPalettes] ?? moodPalettes.volatile;
        const rainPower = effects?.rain ?? intensity;
        const lightningPower = effects?.lightning ?? intensity;
        const windPower = effects?.wind ?? intensity;
        const bolt = scenePalette.danger ? hexToRgb(scenePalette.danger) : base.bolt;
        let frame = 0;
        let ttl = 0;
        let boltPoints: Array<[number, number]> = [];

        const fit = () => {
          const rect = host.getBoundingClientRect();
          p.resizeCanvas(Math.max(1, rect.width), Math.max(1, rect.height));
        };

        const makeBolt = () => {
          const points: Array<[number, number]> = [];
          let x = p.width * (0.18 + Math.random() * 0.64);
          let y = -20;
          points.push([x, y]);
          while (y < p.height * (0.34 + Math.random() * 0.3)) {
            x += (Math.random() - 0.5) * 54;
            y += 22 + Math.random() * 38;
            points.push([x, y]);
          }
          boltPoints = points;
          ttl = 8 + Math.floor(lightningPower * 12);
        };

        p.setup = () => {
          const rect = host.getBoundingClientRect();
          const canvas = p.createCanvas(Math.max(1, rect.width), Math.max(1, rect.height));
          canvas.parent(host);
          p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        };

        p.draw = () => {
          const w = p.width;
          const h = p.height;
          frame += 1;
          const ctx = p.drawingContext as CanvasRenderingContext2D;
          const horizon = ctx.createLinearGradient(0, 0, 0, h);
          horizon.addColorStop(0, scenePalette.sky ?? base.sky);
          horizon.addColorStop(0.54, mood === "crash" ? "#160506" : base.sky);
          horizon.addColorStop(1, mood === "crash" ? "#2a0708" : "#082636");
          ctx.fillStyle = horizon;
          ctx.fillRect(0, 0, w, h);

          p.noStroke();
          for (let layer = 0; layer < 4; layer += 1) {
            p.fill(base.cloud[0], base.cloud[1], base.cloud[2], base.cloud[3]);
            p.beginShape();
            const y = h * (0.07 + layer * 0.075);
            p.vertex(0, y + 50);
            for (let x = 0; x <= w + 80; x += 80) {
              const wave = Math.sin(x * 0.01 + frame * 0.006 + layer) * 24;
              p.quadraticVertex(x + 34, y + wave - 40, x + 80, y + 42 + wave * 0.45);
            }
            p.vertex(w, 0);
            p.vertex(0, 0);
            p.endShape(p.CLOSE);
          }

          if (!ttl && Math.random() < 0.006 + lightningPower * 0.035) makeBolt();
          if (ttl) {
            p.push();
            p.drawingContext.shadowBlur = 24;
            p.drawingContext.shadowColor = `rgba(${bolt[0]},${bolt[1]},${bolt[2]},.9)`;
            p.noFill();
            p.stroke(bolt[0], bolt[1], bolt[2], 66 + ttl * 13);
            p.strokeWeight(7);
            p.beginShape();
            boltPoints.forEach(([x, y]) => p.vertex(x, y));
            p.endShape();
            p.stroke(255, 255, 255, 235);
            p.strokeWeight(1.6);
            p.beginShape();
            boltPoints.forEach(([x, y]) => p.vertex(x, y));
            p.endShape();
            p.pop();
            ttl -= 1;
          }

          p.strokeWeight(1);
          for (const drop of drops) {
            drop.y += drop.speed * (1.2 + rainPower * 5.8);
            drop.x += 0.0008 + windPower * 0.002;
            if (drop.y > 1.1) {
              drop.y = -0.1;
              drop.x = Math.random();
            }
            const x = drop.x * w;
            const y = drop.y * h;
            p.stroke(base.rain[0], base.rain[1], base.rain[2], drop.alpha * 255);
            p.line(x, y, x - 8 - windPower * 16, y + drop.len);
          }

          for (let i = 0; i < Math.floor(18 + windPower * 36); i += 1) {
            const x = (i * 101 + frame * (1.6 + windPower * 4.2)) % (w + 180) - 90;
            const y = h * (0.18 + ((i * 29) % 62) / 100);
            p.stroke(base.rain[0], base.rain[1], base.rain[2], 10 + windPower * 26);
            p.line(x, y, x + 54 + windPower * 56, y + 12 + intensity * 12);
          }

          if (skyLabel) {
            p.noStroke();
            p.fill(bolt[0], bolt[1], bolt[2], 184);
            p.textFont("monospace");
            p.textSize(11);
            p.textAlign(p.LEFT, p.BASELINE);
            p.text(skyLabel, w * 0.07, h * 0.2);
          }

          entities.slice(0, 3).forEach((entity, index) => {
            const x = w * (0.18 + index * 0.25);
            const y = h * (0.58 + Math.sin(frame * 0.018 + index) * 0.035);
            const width = 76 + entity.value * 58;
            p.fill(3, 3, 4, 128);
            p.stroke(entity.role === "pressure" ? p.color(bolt[0], bolt[1], bolt[2], 204) : scenePalette.accent);
            p.rect(x, y, width, 18);
            p.noStroke();
            p.fill(232, 228, 217, 158);
            p.textFont("monospace");
            p.textSize(10);
            p.textAlign(p.LEFT, p.BASELINE);
            p.text(entity.label, x + 6, y + 13);
          });
        };

        p.windowResized = fit;
      }, host);
    });

    const observer = new ResizeObserver(() => sketch?.windowResized?.());
    observer.observe(host);

    return () => {
      disposed = true;
      observer.disconnect();
      sketch?.remove();
    };
  }, [drops, props]);

  return <div ref={hostRef} className="absolute inset-0 h-full w-full" />;
}
