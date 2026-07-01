// 重複排除（要件書 §6.3）: キー = 正規化した公式URL or （イベント名＋開催日）。
import type { Event } from "../lib/types";
import type { RawEvent, CandidateEvent } from "./types";

/** URLを正規化（プロトコル/ www / 末尾スラッシュ / クエリ・ハッシュ を除去）。 */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    const host = u.host.replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/** 名前を緩く正規化（空白・記号除去）。 */
const normalizeName = (s: string) =>
  s.toLowerCase().replace(/[\s　・,，.。!！?？「」『』()（）\-―—]/g, "");

/** 重複キー: 公式URLがあればURL優先、無ければ 名前+開催日。 */
export function dedupeKey(e: { name: string; date: string; officialUrl?: string }): string {
  if (e.officialUrl && e.officialUrl.trim()) return `url:${normalizeUrl(e.officialUrl)}`;
  return `nd:${normalizeName(e.name)}@${e.date}`;
}

const djb2 = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
};

/** 既存events + 既存pending からキー集合を作る。 */
export function existingKeySet(events: Event[], pending: CandidateEvent[]): Set<string> {
  const set = new Set<string>();
  for (const e of events) set.add(dedupeKey(e));
  for (const p of pending) set.add(p.dedupeKey);
  return set;
}

/** RawEvent → CandidateEvent（出自付与）。 */
export function toCandidate(raw: RawEvent, sourceId: string, fetchedAt: string): CandidateEvent {
  return { ...raw, dedupeKey: dedupeKey(raw), sourceId, fetchedAt, status: "pending" };
}

export const shortHash = djb2;
