“use client”;

import { useMemo, useState } from “react”;
import { z } from “zod”;
import {
useFrontendTool,
useCopilotAction,
useCopilotChat,
} from “@copilotkit/react-core/v2”;
import { OracleCanvasScene } from “./OracleCanvasScene”;
import { OracleInput } from “./OracleInput”;
import { directOracle, initialOracleScene } from “@/lib/oracle/director”;
import type { OracleSceneProps } from “@/lib/oracle/types”;

const canvasSceneSchema = z.object({
scene: z.enum([“ocean”, “storm”, “cosmos”, “city”]),
intensity: z.number().min(0).max(1),
mood: z.string(),
title: z.string(),
metrics: z.array(
z.object({ label: z.string(), value: z.number().min(0).max(1) }),
).max(4),
message: z.string(),
cta: z.string().optional(),
});

export function OracleLayout() {
const [scene, setScene] = useState<OracleSceneProps>(initialOracleScene);
const [isTransitioning, setIsTransitioning] = useState(false);
const [lastQuery, setLastQuery] = useState(“Awaiting first signal”);
const [isThinking, setIsThinking] = useState(false);

const { appendMessage } = useCopilotChat();

const renderScene = (nextScene: OracleSceneProps, query?: string) => {
setIsTransitioning(true);
window.setTimeout(() => {
setScene(nextScene);
if (query) setLastQuery(query);
setIsTransitioning(false);
setIsThinking(false);
}, 280);
};

// Primary tool — agent calls this to render a scene
useFrontendTool({
name: “CanvasScene”,
description:
“Render ORACLE’s cinematic answer. Always call this instead of replying with plain text.”,
parameters: canvasSceneSchema,
handler: async (args) => {
renderScene(args as OracleSceneProps);
return `rendered ${args.scene}`;
},
});

// CTA tool — agent calls this when user digs deeper into current scene
useCopilotAction({
name: “MutateScene”,
description:
“Mutate the current scene with deeper analysis when the user clicks the CTA.”,
parameters: canvasSceneSchema,
handler: async (args) => {
renderScene(args as OracleSceneProps);
return `mutated to ${args.scene}`;
},
});

// Called when user clicks the CTA button inside the scene card
const handleCta = async () => {
if (!scene.cta || isThinking) return;
setIsThinking(true);

```
// Build the follow-up query
const followUp = `Go deeper: ${scene.cta}. Current scene is ${scene.scene} at intensity ${scene.intensity}. Title: "${scene.title}". Mutate the scene with more detail, higher stakes, and new metrics.`;

// Render fallback instantly — no dead air while agent responds
const fallback = directOracle(followUp);
fallback.intensity = Math.min(1, scene.intensity + 0.15);
fallback.message = "Diving deeper into the signal…";
renderScene(fallback, `↳ ${scene.cta}`);

// Send to real agent — will fire MutateScene and override fallback
appendMessage({ role: "user", content: followUp });
```

};

const sceneKey = useMemo(
() => `${scene.scene}-${scene.mood}-${scene.intensity}-${scene.title}`,
[scene],
);

return (
<main className="relative h-screen overflow-hidden bg-[#040508] text-[#e8e4d9]">
{/* Thinking indicator — gold pulse bar at top */}
{isThinking && (
<div className="absolute inset-x-0 top-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent animate-pulse" />
)}

```
  <div
    key={sceneKey}
    className={`h-full transition-opacity duration-500 ${
      isTransitioning ? "opacity-0" : "opacity-100"
    }`}
  >
    <OracleCanvasScene {...scene} onCta={handleCta} isThinking={isThinking} />
  </div>

  <div className="absolute left-4 top-4 z-20 max-w-[calc(100vw-2rem)] font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8e4d9]/48 md:left-6 md:top-6">
    {lastQuery}
  </div>

  <OracleInput
    onSubmit={(query) => {
      setIsThinking(true);
      renderScene(directOracle(query), query);
      appendMessage({ role: "user", content: query });
    }}
  />
</main>
```

);
}
