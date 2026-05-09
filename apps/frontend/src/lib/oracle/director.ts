import type { OracleMetric, OracleSceneProps } from "./types";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function inferIntensity(query: string, base: number) {
  let score = base;
  if (/(critical|survive|make it|dying|emergency|crash|urgent|deadline)/i.test(query)) score += 0.22;
  if (/(great|good|calm|stable|aligned|growth|vision)/i.test(query)) score -= 0.18;
  if (/(12|many|all|overwhelmed|bitcoin|crypto|market|burn|runway)/i.test(query)) score += 0.12;
  return clamp01(Number(score.toFixed(2)));
}

function entitiesFrom(metrics: OracleMetric[]) {
  return metrics.map((metric, index) => ({
    id: `entity-${index + 1}`,
    label: metric.label,
    value: metric.value,
    role: metric.value > 0.7 ? "pressure" : metric.value < 0.35 ? "weak-signal" : "signal",
  }));
}

function constellation(metrics: OracleMetric[]) {
  const nodes = metrics.slice(0, 4).map((metric, index) => {
    const angle = -Math.PI / 2 + index * ((Math.PI * 2) / Math.max(4, metrics.length || 4));
    const radius = 0.22 + metric.value * 0.18;
    return {
      id: `star-${index + 1}`,
      label: metric.label,
      x: Number((0.5 + Math.cos(angle) * radius).toFixed(2)),
      y: Number((0.48 + Math.sin(angle) * radius).toFixed(2)),
      value: metric.value,
    };
  });
  return {
    nodes,
    links: nodes.map((node, index) => ({
      from: node.id,
      to: nodes[(index + 1) % nodes.length]?.id ?? node.id,
      strength: Number((0.35 + node.value * 0.65).toFixed(2)),
    })),
  };
}

export function evolveOracleScene(current: OracleSceneProps, prompt = current.ctaPrompt ?? current.cta ?? "go deeper"): OracleSceneProps {
  const drift = /downside|survival|risk|storm|deeper/i.test(prompt) ? 0.16 : -0.08;
  const intensity = clamp01(current.intensity + drift);
  const metrics = current.metrics.map((metric, index) => ({
    ...metric,
    value: clamp01(metric.value + (index === 0 ? drift : -drift * 0.45)),
  }));
  return {
    ...current,
    intensity,
    metrics,
    entities: current.entities.map((entity, index) => ({
      ...entity,
      label: index === 0 && intensity > current.intensity ? `${entity.label} Surge` : entity.label,
      value: metrics[index]?.value ?? entity.value,
      role: index === 0 && intensity > current.intensity ? "new-pressure" : entity.role,
    })),
    constellation: current.constellation ? constellation(metrics) : current.constellation,
    title: prompt.includes("downside") ? "Downside Map" : current.title,
    message: intensity > current.intensity ? "The world sharpens. Hidden pressure surfaces." : "The signal clears. A safer route opens.",
    skyLabel: intensity > current.intensity ? "agent redraw: pressure rising" : "agent redraw: route clearing",
    waveLabels: current.scene === "ocean" ? metrics.map((metric) => metric.label) : current.waveLabels,
    effects: {
      ...current.effects,
      foam: clamp01((current.effects?.foam ?? current.intensity) + 0.18),
      rain: clamp01((current.effects?.rain ?? current.intensity) + 0.2),
      lightning: clamp01((current.effects?.lightning ?? current.intensity) + 0.22),
      wind: clamp01((current.effects?.wind ?? current.intensity) + 0.2),
      zoom: clamp01((current.effects?.zoom ?? 0.35) + 0.18),
    },
  };
}

export function directOracle(query: string): OracleSceneProps {
  const q = query.trim().toLowerCase();

  if (/bitcoin|crypto|market|volatility|buy|sell|urgent|danger|storm/.test(q)) {
    const intensity = inferIntensity(q, 0.66);
    const metrics = [
      { label: "Volatility", value: Math.max(intensity, 0.58) },
      { label: "Signal", value: 0.34 },
      { label: "Exposure", value: 0.72 },
    ];
    return {
      scene: "storm",
      intensity,
      mood: intensity > 0.82 ? "crash" : intensity > 0.48 ? "volatile" : "building",
      title: "Market Weather",
      metrics,
      message: "Lightning is close. Size the risk before the leap.",
      cta: "Map the downside",
      ctaPrompt: "Map the downside and show the first risk to cut.",
      palette: { sky: "#080713", accent: "#bc91ff", secondary: "#7fb0ca", danger: "#ff2e2e" },
      entities: [
        { id: "front-volatility", label: "Volatility Front", value: metrics[0].value, role: "storm-wall" },
        { id: "signal-gap", label: "Signal Gap", value: metrics[1].value, role: "blind-spot" },
        { id: "exposure-ridge", label: "Exposure Ridge", value: metrics[2].value, role: "pressure" },
      ],
      skyLabel: "volatility front",
      effects: { rain: intensity, lightning: intensity, wind: clamp01(0.45 + intensity * 0.45), zoom: 0.48 },
    };
  }

  if (/task|due|schedule|plan|productivity|workload|week|deadline|todo/.test(q)) {
    const intensity = inferIntensity(q, 0.48);
    const metrics = [
      { label: "Load", value: intensity },
      { label: "Focus", value: clamp01(0.82 - intensity * 0.45) },
      { label: "Slack", value: clamp01(0.9 - intensity) },
    ];
    return {
      scene: "city",
      intensity,
      mood: intensity > 0.72 ? "overloaded" : intensity > 0.42 ? "busy" : "productive",
      title: "The Week Below",
      metrics,
      message: "Roads are packed. Sequence the lights.",
      cta: "Prioritize the grid",
      ctaPrompt: "Resequence the week and highlight the highest leverage task.",
      palette: { sky: "#151023", accent: "#f5aa3c", secondary: "#5fd2ff", danger: "#ff375a" },
      entities: entitiesFrom(metrics),
      skyLabel: "deadline sunset",
      effects: { traffic: intensity, zoom: 0.32 },
    };
  }

  if (/vision|future|strategy|meaning|five|5-year|big picture|north star|why/.test(q)) {
    const intensity = inferIntensity(q, 0.22);
    const metrics = [
      { label: "Clarity", value: clamp01(0.88 - intensity * 0.25) },
      { label: "Gravity", value: 0.64 },
      { label: "Reach", value: clamp01(0.55 + intensity * 0.2) },
      { label: "Timing", value: 0.7 },
    ];
    return {
      scene: "cosmos",
      intensity,
      mood: intensity > 0.55 ? "unknown" : intensity < 0.3 ? "expanding" : "stable",
      title: "Five Year Orbit",
      metrics,
      message: "Stars are aligned. Build toward the bright one.",
      cta: "Name the next star",
      ctaPrompt: "Zoom into the next strategic star and rename the constellation.",
      palette: { sky: "#03040b", accent: "#d38f32", secondary: "#6a36a5", danger: "#ff6767" },
      entities: entitiesFrom(metrics),
      skyLabel: "founder north star",
      constellation: constellation(metrics),
      effects: { starSpeed: intensity, zoom: 0.42 },
    };
  }

  const intensity = inferIntensity(q, /make it|startup|runway|burn|money|risk|health|survival/.test(q) ? 0.62 : 0.38);
  const metrics = [
    { label: "Burn", value: intensity },
    { label: "Momentum", value: clamp01(0.76 - intensity * 0.35) },
    { label: "Morale", value: clamp01(0.82 - intensity * 0.28) },
  ];
  return {
    scene: "ocean",
    intensity,
    mood: intensity > 0.78 ? "critical" : intensity > 0.46 ? "tense" : "calm",
    title: /make it/.test(q) ? "The Crossing" : "Your Runway",
    metrics,
    message: intensity > 0.78 ? "Hull is cracking. Turn before dawn." : intensity > 0.46 ? "Hull is holding. Storm arrives soon." : "Water is calm. Keep the heading.",
    cta: intensity > 0.78 ? "Show survival scenarios" : "Chart the route",
    ctaPrompt: "Run a survival scenario and mutate the ocean with the safest route.",
    palette: { sky: intensity > 0.78 ? "#0a0505" : "#06101f", water: intensity > 0.46 ? "#1a3a2a" : "#0a2d50", accent: intensity > 0.78 ? "#cc0000" : "#f4a823", secondary: "#6ea6c8", danger: "#ff4c36" },
    entities: [
      { id: "runway-cliff", label: "Runway Cliff", value: metrics[0].value, role: "hazard" },
      { id: "momentum-current", label: "Momentum Current", value: metrics[1].value, role: "tailwind" },
      { id: "morale-beacon", label: "Morale Beacon", value: metrics[2].value, role: "signal" },
    ],
    shipName: intensity > 0.78 ? "Last Runway" : "Founder Vessel",
    skyLabel: "runway horizon",
    waveLabels: metrics.map((metric) => metric.label),
    effects: { foam: intensity, wind: clamp01(0.22 + intensity * 0.46), zoom: 0.35 },
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
  ctaPrompt: "Open the first route and generate a sharper world.",
  palette: { sky: "#06101f", water: "#0a2d50", accent: "#c9a84c", secondary: "#6ea6c8", danger: "#ff4c36" },
  entities: [
    { id: "entity-1", label: "Signal", value: 0.68, role: "signal" },
    { id: "entity-2", label: "Risk", value: 0.32, role: "weak-signal" },
    { id: "entity-3", label: "Momentum", value: 0.58, role: "signal" },
  ],
  shipName: "Oracle I",
  skyLabel: "first signal",
  waveLabels: ["Signal", "Risk", "Momentum"],
  effects: { foam: 0.42, zoom: 0.25 },
};
