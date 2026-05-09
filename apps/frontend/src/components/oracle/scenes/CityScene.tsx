"use client";

import { useEffect, useRef } from "react";
import type { BaseSceneProps } from "@/lib/oracle/types";

function prng(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function CityScene({ intensity = 0.55, mood = "busy", metrics = [] }: BaseSceneProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const normalizedMood = ["productive", "busy", "overloaded"].includes(mood as string) ? mood : "busy";

  const intensityRef = useRef(intensity);
  const moodRef = useRef(normalizedMood);
  const metricsRef = useRef(metrics);

  useEffect(() => {
    intensityRef.current = intensity;
    moodRef.current = normalizedMood;
    metricsRef.current = metrics;
  }, [intensity, normalizedMood, metrics]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    const startTime = performance.now();

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
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const elapsed = isReducedMotion ? 15000 : performance.now() - startTime;
      const frame = elapsed * 0.06;

      const currentIntensity = intensityRef.current;
      const currentMood = moodRef.current;
      const currentMetrics = metricsRef.current;

      let skyTop, skyMid, skyBot;
      let sunColor;
      let windowBase: string;
      let trafficSpeed: number;
      let trafficDensity: number;
      let windowPulseSpeed: number;
      let smogColor: string;
      let night = false;

      switch (currentMood) {
        case "productive":
          skyTop = "#2a3b5c";
          skyMid = "#c48b6b";
          skyBot = "#e6b981";
          sunColor = "rgba(255,200,100,0.4)";
          windowBase = "255, 210, 120";
          trafficSpeed = 0.5;
          trafficDensity = 0.3;
          windowPulseSpeed = 0.02;
          smogColor = "rgba(230, 185, 129, 0.1)";
          break;
        case "overloaded":
          skyTop = "#050711";
          skyMid = "#2b0a1a";
          skyBot = "#50121b";
          sunColor = "rgba(255,50,50,0.3)";
          windowBase = "255, 100, 100";
          trafficSpeed = 0.2;
          trafficDensity = 2.5;
          windowPulseSpeed = 0.15;
          smogColor = "rgba(80, 18, 27, 0.4)";
          night = true;
          break;
        case "busy":
        default:
          skyTop = "#151023";
          skyMid = "#3a2432";
          skyBot = "#030405";
          sunColor = "rgba(245,170,60,0.32)";
          windowBase = "95, 210, 255";
          trafficSpeed = 1.0;
          trafficDensity = 1.0;
          windowPulseSpeed = 0.08;
          smogColor = "rgba(3, 4, 5, 0.2)";
          night = true;
          break;
      }

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, skyTop);
      bg.addColorStop(0.56, skyMid);
      bg.addColorStop(1, skyBot);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const sun = ctx.createRadialGradient(w * 0.42, h * 0.4, 0, w * 0.42, h * 0.45, w * 0.4);
      sun.addColorStop(0, sunColor);
      sun.addColorStop(1, "transparent");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      const baseBgFill = night ? "rgba(10, 15, 30, 0.6)" : "rgba(80, 60, 70, 0.4)";
      ctx.fillStyle = baseBgFill;
      const numBgBuildings = Math.floor(w / 30);
      for (let i = 0; i < numBgBuildings; i++) {
        const bgSeed = prng(i * 99.1);
        const bw = 20 + prng(i * 12.3) * 40;
        const bh = 50 + bgSeed * 150 + currentIntensity * 50;
        const bx = i * 35 - 20;
        ctx.fillRect(bx, h * 0.45 - bh, bw, bh);

        if (night) {
          ctx.fillStyle = `rgba(255, 255, 200, ${0.1 + bgSeed * 0.4})`;
          const numWindows = Math.floor(bgSeed * 5);
          for (let w = 0; w < numWindows; w++) {
            const wx = bx + prng(bgSeed + w * 2.1) * bw;
            const wy = h * 0.45 - bh + prng(bgSeed + w * 3.4) * bh;
            if (wx > bx + 2 && wx < bx + bw - 2 && wy > h * 0.45 - bh + 2 && wy < h * 0.45 - 2) {
              ctx.fillRect(wx, wy, 1.5, 1.5);
            }
          }
          ctx.fillStyle = baseBgFill;
        }
      }

      const isMobile = w < 600;
      const gridSize = 8;
      const tileW = Math.max(isMobile ? 20 : 30, Math.min(60, w / 16));
      const tileH = tileW * 0.5;
      const originX = w / 2;
      const originY = h * (isMobile ? 0.25 : 0.4);

      const metricInfos: { x: number; y: number; label: string }[] = [];

      for (let k = 0; k <= 2 * (gridSize - 1); k++) {
        for (let row = 0; row <= k; row++) {
          const col = k - row;
          if (row >= gridSize || col >= gridSize) continue;
          const tileIndex = row * gridSize + col;
          const isoX = originX + (col - row) * (tileW / 2);
          const isoY = originY + (col + row) * (tileH / 2);
          
          let priority = 0;
          let isMetric = false;
          let metricLabel = "";

          const metricTiles = [[3, 3], [4, 4], [3, 5], [5, 3]];
          const metricIndex = metricTiles.findIndex(t => t[0] === row && t[1] === col);

          if (metricIndex !== -1 && metricIndex < currentMetrics.length) {
            priority = currentMetrics[metricIndex].value;
            isMetric = true;
            metricLabel = currentMetrics[metricIndex].label;
          } else {
            priority = prng(row * 12.9898 + col * 78.233);
            priority *= 0.5; 
          }

          const heightScale = 120;
          const heightBoost = 60;
          const height = 15 + priority * heightScale + currentIntensity * heightBoost;

          if (isMetric) {
            metricInfos.push({ x: isoX, y: isoY - height, label: metricLabel });
          }

          ctx.fillStyle = night ? "rgba(10, 14, 20, 0.9)" : "rgba(120, 110, 100, 0.9)";
          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2);
          ctx.lineTo(isoX, isoY + tileH);
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2);
          ctx.closePath();
          ctx.fill();

          const facadeColor = night ? "rgba(22, 28, 42, 0.95)" : "rgba(100, 95, 105, 0.95)";
          const sideColor = night ? "rgba(15, 20, 30, 0.95)" : "rgba(80, 75, 85, 0.95)";
          
          ctx.fillStyle = facadeColor;
          ctx.beginPath();
          ctx.moveTo(isoX, isoY + tileH);
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2);
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2 - height);
          ctx.lineTo(isoX, isoY + tileH - height);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = sideColor;
          ctx.beginPath();
          ctx.moveTo(isoX, isoY + tileH);
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2);
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2 - height);
          ctx.lineTo(isoX, isoY + tileH - height);
          ctx.closePath();
          ctx.fill();

          const roofColor = night ? "rgba(30, 36, 52, 1)" : "rgba(110, 105, 115, 1)";
          ctx.fillStyle = roofColor;
          ctx.beginPath();
          ctx.moveTo(isoX, isoY - height);
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2 - height);
          ctx.lineTo(isoX, isoY + tileH - height);
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2 - height);
          ctx.closePath();
          ctx.fill();

          const bSeed = prng(row * 3.14 + col * 2.71);
          if (height > 25) {
            const numFloors = Math.floor(height / 15);
            
            for (let f = 1; f < numFloors; f++) {
              const v = f * 15;
              for (let wcol = 1; wcol <= 2; wcol++) {
                const u = wcol / 3;
                const wx = isoX - u * (tileW / 2);
                const wy = isoY + tileH - u * (tileH / 2) - v;
                
                const wSeed = prng(bSeed + f * 1.1 + wcol * 0.3);
                const flicker = Math.sin(frame * windowPulseSpeed + wSeed * 100);
                const activeThresh = isMetric ? -0.5 : 0.2;

                if (flicker > activeThresh) {
                  const alpha = 0.3 + ((flicker + 1) / 2) * 0.6 * priority;
                  ctx.fillStyle = `rgba(${windowBase}, ${alpha})`;
                  ctx.beginPath();
                  ctx.moveTo(wx, wy);
                  ctx.lineTo(wx - tileW * 0.1, wy - tileH * 0.1);
                  ctx.lineTo(wx - tileW * 0.1, wy - tileH * 0.1 - 6);
                  ctx.lineTo(wx, wy - 6);
                  ctx.fill();
                }
              }
            }

            for (let f = 1; f < numFloors; f++) {
              const v = f * 15;
              for (let wcol = 1; wcol <= 2; wcol++) {
                const u = wcol / 3;
                const wx = isoX + u * (tileW / 2);
                const wy = isoY + tileH - u * (tileH / 2) - v;
                
                const wSeed = prng(bSeed + f * 1.3 + wcol * 0.7);
                const flicker = Math.sin(frame * windowPulseSpeed + wSeed * 100);
                const activeThresh = isMetric ? -0.5 : 0.2;

                if (flicker > activeThresh) {
                  const alpha = 0.3 + ((flicker + 1) / 2) * 0.6 * priority;
                  ctx.fillStyle = `rgba(${windowBase}, ${alpha})`;
                  ctx.beginPath();
                  ctx.moveTo(wx, wy);
                  ctx.lineTo(wx + tileW * 0.1, wy - tileH * 0.1);
                  ctx.lineTo(wx + tileW * 0.1, wy - tileH * 0.1 - 6);
                  ctx.lineTo(wx, wy - 6);
                  ctx.fill();
                }
              }
            }
          }
        }
      }

      ctx.fillStyle = smogColor;
      ctx.fillRect(0, 0, w, h);

      const numTraffic = Math.floor((10 + currentIntensity * 50) * trafficDensity);
      const headLight = night ? "rgba(255, 255, 200, 0.9)" : "rgba(255, 255, 255, 0.8)";
      const tailLight = night ? "rgba(255, 50, 50, 0.9)" : "rgba(200, 30, 30, 0.8)";

      for (let i = 0; i < numTraffic; i++) {
        const pathSeed = prng(i * 12.34);
        const isRowPath = pathSeed > 0.5;
        const fixedLine = Math.floor(prng(i * 56.78) * gridSize);
        
        const speed = (trafficSpeed + currentIntensity) * 0.0003;
        const clumpPhase = currentIntensity > 0.7 ? Math.floor(prng(i * 1.1) * 3) * 0.15 : prng(i * 9.99);
        const dir = prng(i * 2.22) > 0.5 ? 1 : -1;
        
        let progress = (elapsed * speed * dir + clumpPhase + prng(i) * 10) % 1;
        if (progress < 0) progress += 1;
        
        let r, c;
        if (isRowPath) {
          r = fixedLine + (prng(i * 3.3) - 0.5) * 0.2;
          c = progress * gridSize;
        } else {
          r = progress * gridSize;
          c = fixedLine + (prng(i * 3.3) - 0.5) * 0.2;
        }

        const tx = originX + (c - r) * (tileW / 2);
        const ty = originY + (c + r) * (tileH / 2);

        let prevC = c - dir * 0.15;
        let prevR = r;
        if (!isRowPath) {
          prevC = c;
          prevR = r - dir * 0.15;
        }
        const ptx = originX + (prevC - prevR) * (tileW / 2);
        const pty = originY + (prevC + prevR) * (tileH / 2);

        ctx.strokeStyle = (dir > 0) ? headLight : tailLight;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ptx, pty + tileH / 2);
        ctx.lineTo(tx, ty + tileH / 2);
        ctx.stroke();
      }

      if (metricInfos.length > 0) {
        ctx.fillStyle = "rgba(201, 168, 76, 1)";
        ctx.font = '14px "Space Mono", monospace';
        ctx.textAlign = "center";
        
        const floatY = Math.sin(elapsed * 0.002) * 5;
        for (const info of metricInfos) {
          ctx.fillText(info.label, info.x, info.y - 15 + floatY);
          
          ctx.strokeStyle = "rgba(201, 168, 76, 0.5)";
          ctx.beginPath();
          ctx.moveTo(info.x, info.y);
          ctx.lineTo(info.x, info.y - 10 + floatY);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full bg-[#030405]" />;
}
