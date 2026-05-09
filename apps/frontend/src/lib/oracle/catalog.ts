import type { OracleSceneName } from "./types";

export const ORACLE_COMPONENT_NAME = "CanvasScene";

const metricSchema = {
  type: "object",
  properties: {
    label: { type: "string" },
    value: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["label", "value"],
} as const;

const entitySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    value: { type: "number", minimum: 0, maximum: 1 },
    role: { type: "string" },
  },
  required: ["id", "label", "value"],
} as const;

export const oracleCatalog = {
  components: [
    {
      name: ORACLE_COMPONENT_NAME,
      description:
        "Fullscreen p5/canvas scene renderer for ORACLE. The agent must generate rich runtime props, not choose a static template.",
      schema: {
        scene: {
          type: "string",
          enum: ["ocean", "storm", "cosmos", "city"] satisfies OracleSceneName[],
        },
        intensity: { type: "number", minimum: 0, maximum: 1 },
        mood: {
          type: "string",
          enum: [
            "calm",
            "tense",
            "critical",
            "volatile",
            "building",
            "crash",
            "expanding",
            "stable",
            "unknown",
            "productive",
            "busy",
            "overloaded",
          ],
        },
        title: { type: "string", maxLength: 40 },
        metrics: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          items: metricSchema,
        },
        message: { type: "string", maxLength: 96 },
        cta: { type: "string", maxLength: 32 },
        ctaPrompt: { type: "string", maxLength: 160 },
        palette: {
          type: "object",
          properties: {
            sky: { type: "string" },
            water: { type: "string" },
            accent: { type: "string" },
            secondary: { type: "string" },
            danger: { type: "string" },
            text: { type: "string" },
          },
          required: ["sky", "accent", "secondary"],
        },
        entities: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          items: entitySchema,
        },
        shipName: { type: "string", maxLength: 32 },
        skyLabel: { type: "string", maxLength: 48 },
        waveLabels: {
          type: "array",
          maxItems: 4,
          items: { type: "string", maxLength: 24 },
        },
        constellation: {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              maxItems: 8,
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  x: { type: "number", minimum: 0, maximum: 1 },
                  y: { type: "number", minimum: 0, maximum: 1 },
                  value: { type: "number", minimum: 0, maximum: 1 },
                },
                required: ["id", "label", "x", "y", "value"],
              },
            },
            links: {
              type: "array",
              maxItems: 12,
              items: {
                type: "object",
                properties: {
                  from: { type: "string" },
                  to: { type: "string" },
                  strength: { type: "number", minimum: 0, maximum: 1 },
                },
                required: ["from", "to"],
              },
            },
          },
          required: ["nodes", "links"],
        },
        effects: {
          type: "object",
          properties: {
            foam: { type: "number", minimum: 0, maximum: 1 },
            rain: { type: "number", minimum: 0, maximum: 1 },
            lightning: { type: "number", minimum: 0, maximum: 1 },
            wind: { type: "number", minimum: 0, maximum: 1 },
            starSpeed: { type: "number", minimum: 0, maximum: 1 },
            traffic: { type: "number", minimum: 0, maximum: 1 },
            zoom: { type: "number", minimum: 0, maximum: 1 },
          },
        },
      },
      required: [
        "scene",
        "intensity",
        "mood",
        "title",
        "metrics",
        "message",
        "palette",
        "entities",
      ],
    },
  ],
} as const;
