"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export function CosmosScene({
  intensity = 0.25,
  mood = "expanding",
  metrics = [],
  nodes = [],
  connections = [],
  palette,
}: BaseSceneProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const normalizedMood = ["expanding", "stable", "unknown"].includes(mood as string) ? mood : "unknown";

  const intensityRef = useRef(intensity);
  const moodRef = useRef(normalizedMood);
  const metricsRef = useRef(metrics);
  const nodesRef = useRef(nodes);
  const connectionsRef = useRef(connections);
  const paletteRef = useRef(palette);

  useEffect(() => {
    intensityRef.current = intensity;
    moodRef.current = normalizedMood;
    metricsRef.current = metrics;
    nodesRef.current = nodes;
    connectionsRef.current = connections;
    paletteRef.current = palette;
  }, [intensity, normalizedMood, metrics, nodes, connections, palette]);

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 900 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
      size: 0.2 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const dust = useMemo<Dust[]>(() => {
    return Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0005,
      size: Math.random() * 1.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    const startTime = performance.now();

    const neb1Canvas = document.createElement("canvas");
    const neb2Canvas = document.createElement("canvas");
    const neb3Canvas = document.createElement("canvas");
    let lastNebulaState = "";

    const renderNebulaCanvas = (canv: HTMLCanvasElement, r: number, colors: [string, string, string]) => {
      const scaledR = r * 0.5;
      canv.width = scaledR * 2;
      canv.height = scaledR * 2;
      const oCtx = canv.getContext("2d");
      if (!oCtx) return;
      const grad = oCtx.createRadialGradient(scaledR, scaledR, 0, scaledR, scaledR, scaledR);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(0.5, colors[1]);
      grad.addColorStop(1, colors[2]);
      oCtx.fillStyle = grad;
      oCtx.fillRect(0, 0, scaledR * 2, scaledR * 2);
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * ratio);
      canvas.height = Math.max(1, rect.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      lastNebulaState = "";
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const now = performance.now();
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const elapsed = isReducedMotion ? 15000 : now - startTime;

      const currentIntensity = intensityRef.current;
      const currentMood = moodRef.current;
      const currentMetrics = metricsRef.current;
      const currentNodes = nodesRef.current || [];
      const currentConnections = connectionsRef.current || [];
      const currentPalette = paletteRef.current;

      let bgMain = "#03040b";
      let neb1Colors: [string, string, string];
      let neb2Colors: [string, string, string];
      let neb3Colors: [string, string, string];
      let constLineColor: string;
      let constNodeColor: string;
      let starDimmer = 1;

      switch (currentMood) {
        case "stable":
          bgMain = "#03040b";
          neb1Colors = ["rgba(201,168,76, 0.08)", "rgba(232,228,217, 0.03)", "transparent"];
          neb2Colors = ["rgba(232,228,217, 0.05)", "rgba(201,168,76, 0.02)", "transparent"];
          neb3Colors = ["rgba(201,168,76, 0.04)", "transparent", "transparent"];
          constLineColor = "rgba(201,168,76, 0.3)";
          constNodeColor = "rgba(201,168,76, 0.9)";
          break;
        case "unknown":
          bgMain = "#03050b";
          neb1Colors = ["rgba(58,95,190, 0.12)", "rgba(106,54,165, 0.04)", "transparent"];
          neb2Colors = ["rgba(106,54,165, 0.08)", "rgba(58,95,190, 0.02)", "transparent"];
          neb3Colors = ["rgba(40,60,120, 0.06)", "transparent", "transparent"];
          constLineColor = "rgba(150,150,200, 0.2)";
          constNodeColor = "rgba(150,150,200, 0.7)";
          starDimmer = 0.5;
          break;
        case "expanding":
        default:
          bgMain = "#0b0503";
          neb1Colors = ["rgba(211,143,50, 0.12)", "rgba(128,69,146, 0.04)", "transparent"];
          neb2Colors = ["rgba(220,100,50, 0.08)", "rgba(150,50,100, 0.02)", "transparent"];
          neb3Colors = ["rgba(211,143,50, 0.05)", "transparent", "transparent"];
          constLineColor = "rgba(201,168,76, 0.38)";
          constNodeColor = "rgba(201,168,76, 0.85)";
          break;
      }

      if (currentPalette) {
        bgMain = currentPalette.bg;
        const nebula = currentPalette.nebula;
        // Different alphas + a hint of accent tint per layer for depth
        neb1Colors = [nebula, currentPalette.accent.replace(/[\d.]+\)$/, "0.04)"), "transparent"];
        neb2Colors = [nebula.replace(/[\d.]+\)$/, "0.08)"), "transparent", "transparent"];
        neb3Colors = [nebula.replace(/[\d.]+\)$/, "0.05)"), "transparent", "transparent"];
        constLineColor = currentPalette.accent;
        constNodeColor = currentPalette.accent;
      }

      ctx.fillStyle = bgMain;
      ctx.fillRect(0, 0, w, h);

      const r1 = Math.max(w, h) * 0.6;
      const r2 = Math.max(w, h) * 0.5;
      const r3 = Math.max(w, h) * 0.7;

      const nebulaStateKey = `${currentMood}-${currentPalette?.bg || "default"}`;
      if (nebulaStateKey !== lastNebulaState) {
         renderNebulaCanvas(neb1Canvas, r1, neb1Colors);
         renderNebulaCanvas(neb2Canvas, r2, neb2Colors);
         renderNebulaCanvas(neb3Canvas, r3, neb3Colors);
         lastNebulaState = nebulaStateKey;
      }

      const drift1 = Math.sin(elapsed * 0.0001) * w * 0.1;
      const drift2 = Math.cos(elapsed * 0.00015) * h * 0.1;
      const drift3 = Math.sin(elapsed * 0.00005) * w * 0.15;

      ctx.drawImage(neb1Canvas, w * 0.4 + drift1 - r1, h * 0.4 + drift2 - r1, r1 * 2, r1 * 2);
      ctx.drawImage(neb2Canvas, w * 0.6 - drift2 - r2, h * 0.6 + drift1 - r2, r2 * 2, r2 * 2);
      ctx.drawImage(neb3Canvas, w * 0.5 + drift3 - r3, h * 0.3 - drift3 - r3, r3 * 2, r3 * 2);

      ctx.fillStyle = `rgba(232,228,217,${0.3 * starDimmer})`;
      for (const d of dust) {
        d.x = (d.x + d.vx) % 1;
        d.y = (d.y + d.vy) % 1;
        if (d.x < 0) d.x += 1;
        if (d.y < 0) d.y += 1;
        
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      const dz = 0.001 + currentIntensity * 0.008;
      const streakLength = 1 + currentIntensity * 15;

      ctx.lineCap = "round";
      for (const star of stars) {
        star.z -= dz;
        if (star.z <= 0.01) {
          star.z = 1;
          star.x = Math.random() * 2 - 1;
          star.y = Math.random() * 2 - 1;
        }

        const depth = 1 / star.z;
        const x = w * 0.5 + star.x * w * 0.4 * depth;
        const y = h * 0.5 + star.y * h * 0.4 * depth;

        const prevZ = Math.min(1, star.z + dz * streakLength);
        const prevDepth = 1 / prevZ;
        const prevX = w * 0.5 + star.x * w * 0.4 * prevDepth;
        const prevY = h * 0.5 + star.y * h * 0.4 * prevDepth;

        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;

        const twinkle = 0.5 + 0.5 * Math.sin(elapsed * 0.001 + star.phase);
        const opacity = Math.min(1, (0.1 + depth * 0.1)) * starDimmer * twinkle;
        
        let baseR = 232, baseG = 228, baseB = 217;
        if (currentPalette) {
          const match = currentPalette.accent.match(/\d+/g);
          if (match && match.length >= 3) {
            baseR = parseInt(match[0], 10);
            baseG = parseInt(match[1], 10);
            baseB = parseInt(match[2], 10);
          }
        }
        // Blend towards white in the distance
        const finalR = Math.floor(baseR + (255 - baseR) * Math.min(1, depth * 0.3));
        const finalG = Math.floor(baseG + (255 - baseG) * Math.min(1, depth * 0.3));
        const finalB = Math.floor(baseB + (255 - baseB) * Math.min(1, depth * 0.3));
        
        ctx.strokeStyle = `rgba(${finalR},${finalG},${finalB},${opacity})`;
        ctx.lineWidth = star.size * Math.min(2, depth * 0.3);

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      if (currentNodes.length > 0) {
        if (currentConnections.length > 0) {
          for (const [i, j] of currentConnections) {
            if (i >= 0 && i < currentNodes.length && j >= 0 && j < currentNodes.length) {
              const n1 = currentNodes[i];
              const n2 = currentNodes[j];
              const avgVal = (n1.value + n2.value) / 2;
              
              ctx.beginPath();
              ctx.lineWidth = 0.5 + avgVal * 2;
              const alpha = 0.2 + avgVal * 0.6;
              let lineStyle = constLineColor;
              const match = constLineColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (match) {
                 lineStyle = `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
              }
              ctx.strokeStyle = lineStyle;
              
              ctx.moveTo(w * 0.5 + n1.x * w * 0.4, h * 0.5 + n1.y * h * 0.4);
              ctx.lineTo(w * 0.5 + n2.x * w * 0.4, h * 0.5 + n2.y * h * 0.4);
              ctx.stroke();
            }
          }
        } else {
          ctx.strokeStyle = constLineColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          currentNodes.forEach((node, index) => {
            const nx = w * 0.5 + node.x * w * 0.4;
            const ny = h * 0.5 + node.y * h * 0.4;
            if (index === 0) ctx.moveTo(nx, ny);
            else ctx.lineTo(nx, ny);
          });
          ctx.stroke();
        }

        ctx.font = '12px "Space Mono", monospace';
        ctx.textAlign = "center";

        for (const node of currentNodes) {
          const nx = w * 0.5 + node.x * w * 0.4;
          const ny = h * 0.5 + node.y * h * 0.4;
          const nodeRadius = 3 + node.value * 4;

          ctx.fillStyle = constLineColor;
          ctx.beginPath();
          ctx.arc(nx, ny, nodeRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = constNodeColor;
          ctx.beginPath();
          ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(232,228,217,${0.8 * starDimmer})`;
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(node.label, nx, ny - nodeRadius - 10);
          ctx.shadowBlur = 0;
        }
      } else if (currentMetrics.length > 0) {
        const nodes = currentMetrics.slice(0, 4).map((metric, index) => {
          const angle = -Math.PI / 2 + index * ((Math.PI * 2) / Math.max(4, currentMetrics.length));
          const distance = Math.min(w, h) * (0.15 + metric.value * 0.15);
          return {
            x: w * 0.5 + Math.cos(angle) * distance,
            y: h * 0.5 + Math.sin(angle) * distance,
            metric,
          };
        });

        ctx.strokeStyle = constLineColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        nodes.forEach((node, index) => {
          if (index === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        });
        ctx.stroke();

        ctx.font = '12px "Space Mono", monospace';
        ctx.textAlign = "center";

        for (const node of nodes) {
          const nodeRadius = 3 + node.metric.value * 4;

          ctx.fillStyle = constLineColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = constNodeColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(232,228,217,${0.8 * starDimmer})`;
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(node.metric.label, node.x, node.y - nodeRadius - 10);
          ctx.shadowBlur = 0;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [stars, dust]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full bg-[#03040b]" />;
}

