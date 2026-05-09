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
  const [isThinking, setIsThinking] = useState(false);

  const renderScene = (nextScene: OracleSceneProps, query?: string) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setScene(nextScene);
      if (query) setLastQuery(query);
      setIsTransitioning(false);
      setIsThinking(false);
    }, 280);
  };

  // Primary tool — the agent calls this to render a scene
  useFrontendTool({
    name: "CanvasScene",
    description: "Render ORACLE's cinematic answer. Always call this instead of replying with plain text.",
    parameters: canvasSceneSchema,
    handler: async (args: z.infer<typeof canvasSceneSchema>) => {
      renderScene(args as OracleSceneProps);
      return `rendered ${args.scene}`;
    },
  });

  // Called when the user clicks the CTA inside the scene card.
  // Routes through directOracle locally for the demo — when the real agent is wired,
  // swap this for an agent follow-up call that triggers CanvasScene with the mutation.
  const handleCta = () => {
    if (!scene.cta || isThinking) return;
    setIsThinking(true);

    const followUp = `${scene.cta}. Current scene is ${scene.scene} at intensity ${scene.intensity}, title "${scene.title}". Mutate with higher stakes.`;

    const mutated = directOracle(followUp);
    mutated.intensity = Math.min(1, scene.intensity + 0.15);
    mutated.message = "Diving deeper into the signal…";

    // Short beat so the gold pulse bar is visible before the mutation lands
    window.setTimeout(() => renderScene(mutated, `↳ ${scene.cta}`), 420);
  };

  // Only remount on scene type change. Within-type mutations stay seamless via the ref pattern in each scene.
  const sceneKey = scene.scene;

  return (
    <main className="relative h-screen overflow-hidden bg-[#040508] text-[#e8e4d9]">
      {isThinking && (
        <div className="absolute inset-x-0 top-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent animate-pulse" />
      )}
      <div
        key={sceneKey}
        className={`h-full transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        <OracleCanvasScene {...scene} onCta={handleCta} isThinking={isThinking} />
      </div>
      <div className="absolute left-4 top-4 z-20 max-w-[calc(100vw-2rem)] font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8e4d9]/48 md:left-6 md:top-6">
        {lastQuery}
      </div>
      <OracleInput
        onSubmit={(query) => {
          setIsThinking(true);
          window.setTimeout(() => renderScene(directOracle(query), query), 220);
        }}
      />
    </main>
  );
}
