// RIDE MAP JAPAN — AI収集パイプライン 型定義
// 既存の lib/types.ts(Event) と整合させつつ、出自(provenance)と承認状態を持たせる。

import type { EventCategory, Difficulty } from "../lib/types";

export type Confidence = "high" | "medium" | "low";

export type CandidateStatus = "pending" | "approved" | "rejected" | "duplicate";

/**
 * Claude が web 検索で発見し、固定JSONスキーマに構造化した1イベント。
 * 公式説明文のコピーは禁止（description は独自要約2〜3文）。
 */
export interface RawEvent {
  name: string;
  date: string; // YYYY-MM-DD
  dateEnd?: string;
  entryDeadline?: string;
  prefecture: string; // 例: "沖縄県"
  location: string; // 会場・市区町村
  category: EventCategory;
  distance?: string;
  elevation?: string;
  fee?: string;
  difficulty?: Difficulty;
  officialUrl: string;
  description: string; // 独自記述の2〜3文要約
  confidence: Confidence;
}

/** 承認待ちキューに積む、出自付きの候補イベント。 */
export interface CandidateEvent extends RawEvent {
  dedupeKey: string;
  sourceId: string;
  fetchedAt: string; // ISO
  status: CandidateStatus;
}
