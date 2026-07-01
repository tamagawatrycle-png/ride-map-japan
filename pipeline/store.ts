// キュー/DBの読み書き。MVPは JSONフラットファイル方式（要件書: 将来 Supabase/Notion/Sheets 移行可）。
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CandidateEvent } from "./types";
import type { Event } from "../lib/types";

const PIPELINE_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(PIPELINE_DIR, "..");

export const PATHS = {
  events: join(ROOT, "data", "events.json"),
  queueDir: join(PIPELINE_DIR, "queue"),
  pending: join(PIPELINE_DIR, "queue", "pending.json"),
  processed: join(PIPELINE_DIR, "queue", "processed.json"),
};

async function readJson<T>(path: string, fallback: T): Promise<T> {
  if (!existsSync(path)) return fallback;
  const raw = await readFile(path, "utf8");
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as T;
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export const loadEvents = () => readJson<Event[]>(PATHS.events, []);
export const saveEvents = (events: Event[]) => writeJson(PATHS.events, events);

export const loadPending = () => readJson<CandidateEvent[]>(PATHS.pending, []);
export const savePending = (items: CandidateEvent[]) => writeJson(PATHS.pending, items);

export interface ProcessedRecord {
  dedupeKey: string;
  name: string;
  status: "approved" | "rejected";
  at: string;
  eventId?: string;
}
export const loadProcessed = () => readJson<ProcessedRecord[]>(PATHS.processed, []);
export const saveProcessed = (items: ProcessedRecord[]) => writeJson(PATHS.processed, items);
