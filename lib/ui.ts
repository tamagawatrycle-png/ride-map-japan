// UI 共通ユーティリティ — 承認済みモックの inline SVG アイコン / 表示ヘルパー。
// （ロジックは lib/format.ts・lib/categories.ts に寄せ、ここは表示専用の補助のみ）

import type { Event, EventCategory } from "./types";
import { CATEGORIES } from "./categories";

// モックの inline SVG アイコン（viewBox 0 0 24 24 の path 群）
export const IC = {
  cal: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/>',
  route:
    '<circle cx="6" cy="17" r="2.6"/><circle cx="18" cy="17" r="2.6"/><path d="M6 17l4-8h5l3 8M9 9h5"/>',
  mtn: '<path d="M3 20l6-11 4 6 2-3 6 8z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
} as const;

// カテゴリラベル（既存 CATEGORIES から取り出す薄いラッパー）
export function catLabel(cat: EventCategory): string {
  return CATEGORIES[cat].label;
}

// "2026-06-07" → "6/7"（モックの fdate 相当・短縮表示）
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

/**
 * 「○人が気になっている」の watch 数プレースホルダー。
 * 実データに watch/analytics フィールドが無いため、イベント id から
 * 決定論的（安定）な小さいハッシュを生成する。レンダーごとに変わらず、
 * SSR/CSR で同一値になるので hydration mismatch も起きない。
 * TODO: 実アナリティクス（気になる登録数）が入ったら置き換える。
 */
export function watchCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  // 12〜420 のレンジに丸める（モックの watch 値の見た目に合わせる）
  return 12 + (h % 409);
}

// featured 判定（editorComment を持つ注目イベント）。mock の pick 相当。
export function isPick(e: Event): boolean {
  return Boolean(e.featured);
}
