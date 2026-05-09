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

export interface OracleSceneProps {
  scene: OracleSceneName;
  intensity: number;
  mood: OracleMood;
  title: string;
  metrics: OracleMetric[];
  message: string;
  cta?: string;
}

export interface BaseSceneProps {
  intensity?: number;
  mood?: OracleMood;
  metrics?: OracleMetric[];
}
