import type { OracleSceneName } from "./types";

export const ORACLE_COMPONENT_NAME = "CanvasScene";

export const oracleCatalog = {
  components: [
    {
      name: ORACLE_COMPONENT_NAME,
      description:
        "Full-screen cinematic scene renderer for ORACLE. The agent selects a world and passes normalized metrics.",
      schema: {
        scene: {
          type: "string",
          enum: ["ocean", "storm", "cosmos", "city"] satisfies OracleSceneName[],
        },
        intensity: { type: "number", minimum: 0, maximum: 1 },
        mood: { type: "string" },
        title: { type: "string" },
        metrics: {
          type: "array",
          maxItems: 4,
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              value: { type: "number", minimum: 0, maximum: 1 },
            },
            required: ["label", "value"],
          },
        },
        message: { type: "string", maxLength: 96 },
        cta: { type: "string" },
      },
      required: ["scene", "intensity", "mood", "title", "metrics", "message"],
    },
  ],
} as const;
