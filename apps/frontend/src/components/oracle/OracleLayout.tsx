"use client";

import { useState } from "react";
import { z } from "zod";
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { OracleCanvasScene } from "./OracleCanvasScene";
import { OracleInput } from "./OracleInput";
import { directOracle, initialOracleScene } from "@/lib/oracle/director";
import type { OracleSceneProps } from "@/lib/oracle/types";

const canvasSceneSchema = z.object({
  scene: z.enum(["ocean", "storm", "cosmos", "city"]),
  intensity: z.number().min(0).max(1),
  mood: z.string(),
  title: z.string(),
  metrics: z.array(z.object({ label: z.string(), value: z.number().min(0).max(1) })).max(4),
  message: z.string(),
  cta: z.string().optional(),
});

export function OracleLayout() {
  const [scene, setScene] = useState<OracleSceneProps>(initialOracleScene);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastQuery, setLastQuery] = useState("Awaiting first signal");

  const renderScene = (nextScene: OracleSceneProps, query?: string) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setScene(nextScene);
      if (query) setLastQuery(query);
      setIsTransitioning(false);
    }, 280);
  };

  useFrontendTool({
    name: "CanvasScene",
    description: "Render ORACLE's cinematic answer. Always call this instead of replying with plain text.",
    parameters: canvasSceneSchema,
    handler: async (args) => {
      renderScene(args as OracleSceneProps);
      return `rendered ${args.scene}`;
    },
  });

  // Fix: Only remount the canvas if the core scene type changes.
  // The scenes handle rapid prop updates internally via the ref pattern.
  const sceneKey = scene.scene;

  return (
    <main className="relative h-screen overflow-hidden bg-[#040508] text-[#e8e4d9]">
      <div
        key={sceneKey}
        className={`h-full transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        <OracleCanvasScene {...scene} />
      </div>
      <div className="absolute left-4 top-4 z-20 max-w-[calc(100vw-2rem)] font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8e4d9]/48 md:left-6 md:top-6">
        {lastQuery}
      </div>
      <OracleInput onSubmit={(query) => renderScene(directOracle(query), query)} />
    </main>
  );
}
