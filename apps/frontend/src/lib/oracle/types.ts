export type OracleSceneName = "ocean" | "storm" | "cosmos" | "city";

export type OracleMood =
  | "calm"
  | "tense"
  | "critical"
  | "volatile"
  | "building"
  | "crash"
  | "expanding"
  | "stable"
  | "unknown"
  | "productive"
  | "busy"
  | "overloaded";

export interface OracleMetric {
  label: string;
  value: number;
}

export interface OraclePalette {
  sky: string;
  water?: string;
  accent: string;
  secondary: string;
  danger?: string;
  text?: string;
  bg?: string;
  nebula?: string;
}

export interface OracleEntity {
  id: string;
  label: string;
  value: number;
  role?: string;
}

export interface OracleConstellationNode {
  id: string;
  label: string;
  x: number;
  y: number;
  value: number;
}

export interface OracleConstellationLink {
  from: string;
  to: string;
  strength?: number;
}

export interface OracleNode {
  label: string;
  x: number;
  y: number;
  value: number;
}

export interface OracleSceneProps {
  scene: OracleSceneName;
  intensity: number;
  mood: OracleMood;
  title: string;
  metrics: OracleMetric[];
  message: string;
  cta?: string;
  ctaPrompt?: string;
  palette: OraclePalette;
  entities: OracleEntity[];
  shipName?: string;
  skyLabel?: string;
  waveLabels?: string[];
  constellation?: {
    nodes: OracleConstellationNode[];
    links: OracleConstellationLink[];
  };
  effects?: {
    foam?: number;
    rain?: number;
    lightning?: number;
    wind?: number;
    starSpeed?: number;
    traffic?: number;
    zoom?: number;
  };
}

export interface BaseSceneProps extends OracleSceneProps {
  nodes?: OracleNode[];
  connections?: [number, number][];
}
