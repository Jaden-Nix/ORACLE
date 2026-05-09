"use client";

import { CityScene } from "./scenes/CityScene";
import { CosmosScene } from "./scenes/CosmosScene";
import { OceanScene } from "./scenes/OceanScene";
import { StormScene } from "./scenes/StormScene";
import type { OracleSceneProps } from "@/lib/oracle/types";

const sceneMap = {
  ocean: OceanScene,
  storm: StormScene,
  cosmos: CosmosScene,
  city: CityScene,
};

function MetricBar({ label, value }: { label: string; value: number }) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="grid grid-cols-[minmax(72px,112px)_1fr_34px] items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[#e8e4d9]/75">
      <span className="truncate font-mono">{label}</span>
      <span className="h-1.5 overflow-hidden bg-[#4a3f28]/60">
        <span className="block h-full bg-[#c9a84c] transition-[width] duration-700 ease-out" style={{ width: `${percent}%` }} />
      </span>
      <span className="text-right font-mono text-[#c9a84c]">{percent}</span>
    </div>
  );
}

export function OracleCanvasScene(props: OracleSceneProps & { onCta?: () => void; isThinking?: boolean }) {
  const { scene, intensity, mood, title, metrics, message, cta, palette, entities, onCta, isThinking = false } = props;
  const SceneComponent = sceneMap[scene] ?? OceanScene;

  return (
    <section className="relative h-full min-h-[100svh] overflow-hidden bg-[#040508]">
      <SceneComponent {...props} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,5,8,0.18)_40%,rgba(4,5,8,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#040508]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#040508] to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center px-5 pb-20 pt-16">
        <div className="w-full max-w-xl border-y px-5 py-7 text-center shadow-[0_0_80px_rgba(201,168,76,0.08)] backdrop-blur-[2px] md:px-10" style={{ borderColor: `${palette.accent}55`, backgroundColor: "rgba(4,5,8,.28)" }}>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: palette.accent }}>
            ORACLE / {mood} / {Math.round(intensity * 100)}
          </p>
          <h1 className="font-serif text-4xl uppercase leading-none text-[#e8e4d9] md:text-6xl">{title}</h1>
          <div className="mx-auto mt-6 grid max-w-md gap-3">
            {metrics.slice(0, 4).map((metric) => (
              <MetricBar key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>
          {entities.length > 0 ? (
            <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
              {entities.slice(0, 4).map((entity) => (
                <span key={entity.id} className="border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e8e4d9]/70" style={{ borderColor: `${palette.secondary}66` }}>
                  {entity.label}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mx-auto mt-6 max-w-sm font-mono text-sm leading-6 text-[#e8e4d9]/82">&quot;{message}&quot;</p>
          {cta ? (
            <button
              onClick={onCta}
              disabled={isThinking}
              className="pointer-events-auto mt-6 border px-5 py-2 font-mono text-[11px] uppercase tracking-[0.24em] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: `${palette.accent}88`, color: palette.accent }}
            >
              {isThinking ? "Reading the signal..." : cta}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
