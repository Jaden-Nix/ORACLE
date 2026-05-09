import type { OracleSceneProps } from "./types";

// Scene selection thresholds
const SCENE_THRESHOLDS = {
  INTENSITY_CRITICAL: 0.82,
  INTENSITY_VOLATILE: 0.48,
  INTENSITY_OVERLOADED: 0.72,
  INTENSITY_BUSY: 0.42,
  INTENSITY_UNKNOWN: 0.55,
  INTENSITY_STABLE: 0.3,
  INTENSITY_CRITICAL_OCEAN: 0.78,
  INTENSITY_TENSE_OCEAN: 0.46,
} as const;

// Intensity modifier weights
const INTENSITY_MODIFIERS = {
  CRITICAL_BOOST: 0.22,
  CALM_REDUCE: 0.18,
  CONCERN_BOOST: 0.12,
} as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function inferIntensity(query: string, base: number) {
  let score = base;
  if (/(critical|survive|make it|dying|emergency|crash|urgent|deadline)/i.test(query)) {
    score += INTENSITY_MODIFIERS.CRITICAL_BOOST;
  }
  if (/(great|good|calm|stable|aligned|growth|vision)/i.test(query)) {
    score -= INTENSITY_MODIFIERS.CALM_REDUCE;
  }
  if (/(12|many|all|overwhelmed|bitcoin|crypto|market|burn|runway)/i.test(query)) {
    score += INTENSITY_MODIFIERS.CONCERN_BOOST;
  }
  return clamp01(Number(score.toFixed(2)));
}

export function directOracle(query: string): OracleSceneProps {
  const q = query.trim().toLowerCase();

  if (/bitcoin|crypto|market|volatility|buy|sell|urgent|danger|storm/.test(q)) {
    const intensity = inferIntensity(q, 0.66);
    return {
      scene: "storm",
      intensity,
      mood:
        intensity > SCENE_THRESHOLDS.INTENSITY_CRITICAL
          ? "crash"
          : intensity > SCENE_THRESHOLDS.INTENSITY_VOLATILE
            ? "volatile"
            : "building",
      title: "Market Weather",
      metrics: [
        { label: "Volatility", value: Math.max(intensity, 0.58) },
        { label: "Signal", value: 0.34 },
        { label: "Exposure", value: 0.72 },
      ],
      message: "Lightning is close. Size the risk before the leap.",
      cta: "Map the downside",
    };
  }

  if (/task|due|schedule|plan|productivity|workload|week|deadline|todo/.test(q)) {
    const intensity = inferIntensity(q, 0.48);
    return {
      scene: "city",
      intensity,
      mood:
        intensity > SCENE_THRESHOLDS.INTENSITY_OVERLOADED
          ? "overloaded"
          : intensity > SCENE_THRESHOLDS.INTENSITY_BUSY
            ? "busy"
            : "productive",
      title: "The Week Below",
      metrics: [
        { label: "Load", value: intensity },
        { label: "Focus", value: clamp01(0.82 - intensity * 0.45) },
        { label: "Slack", value: clamp01(0.9 - intensity) },
      ],
      message: "Roads are packed. Sequence the lights.",
      cta: "Prioritize the grid",
    };
  }

  if (/vision|future|strategy|meaning|five|5-year|big picture|north star|why/.test(q)) {
    const intensity = inferIntensity(q, 0.22);
    return {
      scene: "cosmos",
      intensity,
      mood:
        intensity > SCENE_THRESHOLDS.INTENSITY_UNKNOWN
          ? "unknown"
          : intensity < SCENE_THRESHOLDS.INTENSITY_STABLE
            ? "expanding"
            : "stable",
      title: "Five Year Orbit",
      metrics: [
        { label: "Clarity", value: clamp01(0.88 - intensity * 0.25) },
        { label: "Gravity", value: 0.64 },
        { label: "Reach", value: clamp01(0.55 + intensity * 0.2) },
      ],
      message: "Stars are aligned. Build toward the bright one.",
      cta: "Name the next star",
    };
  }

  const intensity = inferIntensity(
    q,
    /make it|startup|runway|burn|money|risk|health|survival/.test(q) ? 0.62 : 0.38,
  );
  return {
    scene: "ocean",
    intensity,
    mood:
      intensity > SCENE_THRESHOLDS.INTENSITY_CRITICAL_OCEAN
        ? "critical"
        : intensity > SCENE_THRESHOLDS.INTENSITY_TENSE_OCEAN
          ? "tense"
          : "calm",
    title: /make it/.test(q) ? "The Crossing" : "Your Runway",
    metrics: [
      { label: "Burn", value: intensity },
      { label: "Momentum", value: clamp01(0.76 - intensity * 0.35) },
      { label: "Morale", value: clamp01(0.82 - intensity * 0.28) },
    ],
    message:
      intensity > SCENE_THRESHOLDS.INTENSITY_CRITICAL_OCEAN
        ? "Hull is cracking. Turn before dawn."
        : intensity > SCENE_THRESHOLDS.INTENSITY_TENSE_OCEAN
          ? "Hull is holding. Storm arrives soon."
          : "Water is calm. Keep the heading.",
    cta:
      intensity > SCENE_THRESHOLDS.INTENSITY_CRITICAL_OCEAN
        ? "Show survival scenarios"
        : "Chart the route",
  };
}

export const initialOracleScene: OracleSceneProps = {
  scene: "ocean",
  intensity: 0.42,
  mood: "calm",
  title: "Ask The Oracle",
  metrics: [
    { label: "Signal", value: 0.68 },
    { label: "Risk", value: 0.32 },
    { label: "Momentum", value: 0.58 },
  ],
  message: "Speak. The world will answer.",
  cta: "Begin",
};
