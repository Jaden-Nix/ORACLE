"use client";

import { useEffect, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

type P5Module = typeof import("p5");
type P5Instance = InstanceType<P5Module["default"]>;

function alphaHex(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 255)
    .toString(16)
    .padStart(2, "0");
}

function withAlpha(hex: string, alpha: number) {
  return `${hex}${alphaHex(alpha)}`;
}

export function OceanScene(props: BaseSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let sketch: P5Instance | null = null;
    let disposed = false;

    void import("p5").then(({ default: P5 }) => {
      if (disposed || !hostRef.current) return;

      sketch = new P5((p: P5Instance) => {
        const {
          intensity = 0.5,
          mood = "calm",
          palette,
          shipName,
          skyLabel,
          waveLabels = [],
          entities = [],
          effects,
        } = props;
        const colors = {
          sky: palette.sky,
          water: palette.water ?? "#0a2d50",
          glow: palette.accent,
          foam: palette.secondary,
          danger: palette.danger ?? "#ff4c36",
        };
        const foamPower = effects?.foam ?? intensity;
        const windPower = effects?.wind ?? intensity;
        let frame = 0;

        const fit = () => {
          const rect = host.getBoundingClientRect();
          p.resizeCanvas(Math.max(1, rect.width), Math.max(1, rect.height));
        };

        p.setup = () => {
          const rect = host.getBoundingClientRect();
          const canvas = p.createCanvas(Math.max(1, rect.width), Math.max(1, rect.height));
          canvas.parent(host);
          p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
          p.noStroke();
        };

        p.draw = () => {
          const w = p.width;
          const h = p.height;
          frame += 1;
          const zoom = 1 + (effects?.zoom ?? 0.3) * 0.08;
          const ctx = p.drawingContext as CanvasRenderingContext2D;

          const sky = ctx.createLinearGradient(0, 0, 0, h);
          sky.addColorStop(0, colors.sky);
          sky.addColorStop(0.52, mood === "critical" ? "#1d0808" : colors.sky);
          sky.addColorStop(1, colors.water);
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, w, h);

          p.noStroke();
          for (let i = 0; i < 44; i += 1) {
            const x = (i * 97 + frame * (0.08 + windPower * 0.34)) % (w + 140) - 70;
            const y = h * (0.08 + ((i * 19) % 28) / 100);
            p.fill(232, 228, 217, 8 + (i % 5) * 4);
            p.rect(x, y, 90 + (i % 4) * 28, 1);
          }

          const glow = ctx.createRadialGradient(w / 2, h * 0.44, 0, w / 2, h * 0.44, w * 0.58);
          glow.addColorStop(0, withAlpha(colors.glow, 0.42));
          glow.addColorStop(0.35, withAlpha(colors.glow, 0.14));
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, w, h);

          p.stroke(withAlpha(colors.glow, 0.6));
          p.strokeWeight(1);
          p.line(0, h * 0.46, w, h * 0.46);
          if (skyLabel) {
            p.noStroke();
            p.fill(withAlpha(colors.glow, 0.68));
            p.textFont("monospace");
            p.textSize(11);
            p.textAlign(p.LEFT, p.BASELINE);
            p.text(skyLabel, w * 0.06, h * 0.43);
          }

          p.push();
          p.drawingContext.setLineDash([10, 12]);
          p.stroke(withAlpha(colors.glow, 0.54));
          p.strokeWeight(1.2);
          p.noFill();
          p.beginShape();
          p.vertex(w * 0.16, h * 0.62);
          p.quadraticVertex(w * 0.45, h * (0.48 - intensity * 0.04), w * 0.82, h * 0.57);
          p.endShape();
          p.drawingContext.setLineDash([]);
          p.pop();

          const markerPoints = [
            [w * 0.18, h * 0.62],
            [w * 0.48, h * (0.49 - intensity * 0.03)],
            [w * 0.78, h * 0.57],
          ];
          entities.slice(0, 3).forEach((entity, index) => {
            const [x, y] = markerPoints[index];
            const pulse = 2 + Math.sin(frame * 0.045 + index) * 1.4;
            p.stroke(entity.role === "hazard" ? colors.danger : colors.glow);
            p.noFill();
            p.circle(x, y, (5 + entity.value * 8 + pulse) * 2);
            p.noStroke();
            p.fill(4, 5, 8, 184);
            p.circle(x, y, (2.4 + entity.value * 2) * 2);
            p.fill(232, 228, 217, 142);
            p.textFont("monospace");
            p.textSize(10);
            p.textAlign(p.CENTER, p.BASELINE);
            p.text(entity.label, x, y + 24);
          });

          for (let layer = 8; layer >= 0; layer -= 1) {
            const yBase = h * (0.5 + layer * 0.044) * zoom;
            const amp = 14 + intensity * (34 + layer * 8);
            const speed = frame * (0.012 + intensity * 0.014);
            p.noStroke();
            p.fill(withAlpha(colors.water, (66 + layer * 17) / 255));
            p.beginShape();
            p.vertex(0, h);
            for (let x = 0; x <= w + 14; x += 10) {
              const y =
                yBase +
                Math.sin(x * 0.011 + speed + layer) * amp +
                Math.sin(x * 0.028 - speed * 1.8) * amp * 0.35;
              p.vertex(x, y);
            }
            p.vertex(w, h);
            p.endShape(p.CLOSE);

            if (layer % 2 === 0) {
              p.noFill();
              p.stroke(232, 228, 217, 13 + foamPower * 28);
              p.strokeWeight(1);
              p.beginShape();
              for (let x = 0; x <= w; x += 18) {
                const y = yBase + Math.sin(x * 0.011 + speed + layer) * amp;
                p.vertex(x, y);
              }
              p.endShape();
            }
          }

          p.noStroke();
          for (let i = 0; i < 80 * foamPower; i += 1) {
            const x = (i * 71 + frame * (0.45 + intensity + windPower * 0.5)) % w;
            const y = h * (0.55 + ((i * 17) % 43) / 100);
            p.fill(232, 228, 217, 10 + foamPower * 26);
            p.circle(x, y + Math.sin(frame * 0.02 + i) * 8, 1.4 + (i % 3) * 0.8);
          }

          p.noFill();
          p.strokeWeight(1);
          for (let i = 0; i < 22 * windPower; i += 1) {
            const x = (i * 137 + frame * (1.2 + windPower * 2.4)) % (w + 160) - 80;
            const y = h * (0.5 + ((i * 23) % 42) / 100);
            p.stroke(232, 228, 217, 8 + windPower * 20);
            p.line(x, y, x + 46 + windPower * 42, y - 4 - intensity * 8);
          }

          const shipW = Math.min(148, w * 0.2);
          const shipH = Math.min(96, h * 0.16);
          p.push();
          p.translate(w / 2, h * 0.46 + Math.sin(frame * 0.02) * intensity * 14);
          p.rotate(Math.sin(frame * 0.018) * intensity * 0.26);
          p.fill(5, 6, 8, 242);
          p.stroke(withAlpha(colors.glow, 0.67));
          p.beginShape();
          p.vertex(-shipW * 0.52, 0);
          p.vertex(shipW * 0.48, 0);
          p.vertex(shipW * 0.26, shipH * 0.22);
          p.vertex(-shipW * 0.36, shipH * 0.22);
          p.endShape(p.CLOSE);
          p.noStroke();
          p.rect(-2, -shipH * 0.76, 4, shipH * 0.72);
          p.triangle(4, -shipH * 0.7, shipW * 0.3, -shipH * 0.18, 4, -shipH * 0.18);
          p.fill(withAlpha(colors.glow, 0.8));
          p.textFont("monospace");
          p.textSize(10);
          p.textAlign(p.CENTER, p.BASELINE);
          p.text(shipName ?? "Oracle Vessel", 0, shipH * 0.39);
          if (intensity > 0.8) {
            p.noFill();
            p.stroke(colors.danger);
            p.strokeWeight(1.5);
            p.beginShape();
            p.vertex(-shipW * 0.16, shipH * 0.03);
            p.vertex(-shipW * 0.08, shipH * 0.1);
            p.vertex(0, shipH * 0.04);
            p.vertex(shipW * 0.08, shipH * 0.15);
            p.endShape();
          }
          p.pop();

          p.noStroke();
          p.fill(232, 228, 217, 86);
          p.textFont("monospace");
          p.textSize(10);
          p.textAlign(p.LEFT, p.BASELINE);
          waveLabels.slice(0, 3).forEach((label, index) => p.text(label, 24, h * (0.62 + index * 0.08)));
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
  }, [props]);

  return <div ref={hostRef} className="absolute inset-0 h-full w-full" />;
}
