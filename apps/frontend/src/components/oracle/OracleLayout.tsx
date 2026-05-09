"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useAgent, useCopilotKit, useFrontendTool } from "@copilotkit/react-core/v2";
import { OracleCanvasScene } from "./OracleCanvasScene";
import { OracleInput } from "./OracleInput";
import { oracleCatalog } from "@/lib/oracle/catalog";
import { directOracle, evolveOracleScene, initialOracleScene } from "@/lib/oracle/director";
import type { OracleSceneProps } from "@/lib/oracle/types";

const metricSchema = z.object({ label: z.string(), value: z.number().min(0).max(1) });
const paletteSchema = z.object({
  sky: z.string(),
  water: z.string().optional(),
  accent: z.string(),
  secondary: z.string(),
  danger: z.string().optional(),
  text: z.string().optional(),
});
const entitySchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().min(0).max(1),
  role: z.string().optional(),
});
const canvasSceneSchema = z.object({
  scene: z.enum(["ocean", "storm", "cosmos", "city"]),
  intensity: z.number().min(0).max(1),
  mood: z.enum(["calm", "tense", "critical", "volatile", "building", "crash", "expanding", "stable", "unknown", "productive", "busy", "overloaded"]),
  title: z.string(),
  metrics: z.array(metricSchema).max(4),
  message: z.string(),
  cta: z.string().optional(),
  ctaPrompt: z.string().optional(),
  palette: paletteSchema,
  entities: z.array(entitySchema).default([]),
  shipName: z.string().optional(),
  skyLabel: z.string().optional(),
  waveLabels: z.array(z.string()).optional(),
  constellation: z
    .object({
      nodes: z.array(z.object({ id: z.string(), label: z.string(), x: z.number().min(0).max(1), y: z.number().min(0).max(1), value: z.number().min(0).max(1) })),
      links: z.array(z.object({ from: z.string(), to: z.string(), strength: z.number().min(0).max(1).optional() })),
    })
    .optional(),
  effects: z
    .object({
      foam: z.number().optional(),
      rain: z.number().optional(),
      lightning: z.number().optional(),
      wind: z.number().optional(),
      starSpeed: z.number().optional(),
      traffic: z.number().optional(),
      zoom: z.number().optional(),
    })
    .optional(),
});

function CanvasSceneRenderBridge({ args, onRender }: { args: unknown; onRender: (scene: OracleSceneProps, query?: string, complete?: boolean) => void }) {
  const parsed = useMemo(() => canvasSceneSchema.safeParse(args), [args]);

  useEffect(() => {
    if (parsed.success) onRender(parsed.data as OracleSceneProps);
  }, [onRender, parsed]);

  return null;
}

export function OracleLayout() {
  const [scene, setScene] = useState<OracleSceneProps>(initialOracleScene);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [lastQuery, setLastQuery] = useState("Awaiting first signal");
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  const renderScene = useCallback((nextScene: OracleSceneProps, query?: string, complete = true) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setScene(nextScene);
      if (query) setLastQuery(query);
      setIsTransitioning(false);
      if (complete) setIsThinking(false);
    }, 280);
  }, []);

  const askAgent = (prompt: string, fallback: OracleSceneProps) => {
    setIsThinking(true);
    renderScene(fallback, prompt, false);
    if (!agent) {
      window.setTimeout(() => setIsThinking(false), 400);
      return;
    }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `oracle-${Date.now()}`;
    agent.addMessage({ id, role: "user", content: prompt });
    void copilotkit.runAgent({ agent }).catch(() => {
      renderScene(fallback, prompt, true);
    });
  };

  useFrontendTool({
    name: "CanvasScene",
    description: oracleCatalog.components[0].description,
    parameters: canvasSceneSchema,
    render: ({ args }) => <CanvasSceneRenderBridge args={args} onRender={renderScene} />,
    handler: async (args) => {
      renderScene(args as OracleSceneProps, undefined, true);
      return `rendered ${args.scene}`;
    },
  });

  const sceneKey = scene.scene;

  return (
    <main className="relative h-screen overflow-hidden bg-[#040508] text-[#e8e4d9]">
      {isThinking ? <div className="absolute inset-x-0 top-0 z-30 h-px animate-pulse bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" /> : null}
      <div key={sceneKey} className={`h-full transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <OracleCanvasScene {...scene} isThinking={isThinking} onCta={() => askAgent(scene.ctaPrompt ?? "Go deeper", evolveOracleScene(scene))} />
      </div>
      <div className="absolute left-4 top-4 z-20 max-w-[calc(100vw-2rem)] font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8e4d9]/48 md:left-6 md:top-6">
        {lastQuery}
      </div>
      <OracleInput isLoading={isThinking} onSubmit={(query) => askAgent(query, directOracle(query))} />
    </main>
  );
}
