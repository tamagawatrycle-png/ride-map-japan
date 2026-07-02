// sources.json（唯一の正のレジストリ）を読むローダー。
// DB_SPEC.md §3 の週次バッチ（Phase 2・ライブ取得）はこの registry を消費する。
// robots_disallow / html_detail_only / rate_limit_seconds を必ず尊重すること。

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES_JSON = join(ROOT, "sources.json");

export type SourceMode = "main" | "local" | "enrichment";
export type SourceKind = "official" | "federation" | "aggregator" | "media";
export type TosRisk = "low" | "medium" | "high";
export type LinkPolicy = "official" | "source";

export interface RegistrySource {
  id: string;
  name: string;
  mode: SourceMode;
  kind: SourceKind;
  base_url: string;
  enabled: boolean;
  html_detail_only: boolean;
  robots_disallow: string[];
  tos_risk: TosRisk;
  link_policy: LinkPolicy;
  rate_limit_seconds: number;
  notes?: string;
}

export interface Registry {
  version: string;
  updated: string;
  note?: string;
  user_agent_default: string;
  sources: RegistrySource[];
}

let cache: Registry | null = null;

export function loadRegistry(): Registry {
  if (cache) return cache;
  cache = JSON.parse(readFileSync(SOURCES_JSON, "utf8")) as Registry;
  return cache;
}

export const enabledSources = (mode?: SourceMode): RegistrySource[] =>
  loadRegistry().sources.filter((s) => s.enabled && (!mode || s.mode === mode));

export const userAgent = (): string => loadRegistry().user_agent_default;

/**
 * robots / html_detail_only ガード（DB_SPEC.md §2）。
 * バッチが URL を叩く前に必ず通す。disallow パス配下・検索/一覧ページは false。
 */
export function isPathAllowed(src: RegistrySource, path: string): boolean {
  if (src.robots_disallow.some((p) => path.startsWith(p))) return false;
  if (src.html_detail_only && /\/(search|list|calendar)(\/|$|\?)/.test(path)) {
    return false;
  }
  return true;
}
