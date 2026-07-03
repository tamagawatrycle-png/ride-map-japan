// パーソナライズ用プロフィール — localStorage 保存。
// 将来のログイン（Supabase予定）実装時は、この層をアカウント同期に差し替える。
// 保存構造は users テーブル1行に対応させやすいフラットな形にしておく。

import type { Event, EventCategory, Difficulty } from "./types";
import { areaFromLocation, type Area, AREA_ORDER } from "./categories";
import { daysUntil } from "./format";
import { watchCount } from "./ui";

const KEY = "sr_profile";
const SEEN_KEY = "sr_onboard_seen";

export const PROFILE_CHANGE_EVENT = "sr-profile-change";
export const ONBOARD_OPEN_EVENT = "sr-onboard-open";

/** オンボーディングで選ぶ興味カテゴリ（表示用に集約したキー） */
export type ProfileCat =
  | "hillclimb"
  | "race"
  | "cycling"
  | "gravel"
  | "cyclocross"
  | "mtb";

export const PROFILE_CATS: { k: ProfileCat; label: string }[] = [
  { k: "hillclimb", label: "ヒルクライム" },
  { k: "race", label: "ロードレース" },
  { k: "cycling", label: "ロングライド" },
  { k: "gravel", label: "グラベル" },
  { k: "cyclocross", label: "シクロクロス" },
  { k: "mtb", label: "MTB" },
];

/** 集約キー → 実カテゴリ（fondo はロングライド系、enduro はレース系に含める） */
const CAT_EXPAND: Record<ProfileCat, EventCategory[]> = {
  hillclimb: ["hillclimb"],
  race: ["race", "enduro"],
  cycling: ["cycling", "fondo"],
  gravel: ["gravel"],
  cyclocross: ["cyclocross"],
  mtb: ["mtb_xc", "mtb_dh"],
};

export const PROFILE_AREAS: Area[] = [...AREA_ORDER];

export interface Profile {
  cats: ProfileCat[];
  areas: Area[];
  level: Difficulty | null; // null = どれでも
  updatedAt: string;
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    if (!Array.isArray(p.cats) || !Array.isArray(p.areas)) return null;
    return p;
  } catch {
    return null;
  }
}

export function saveProfile(p: Omit<Profile, "updatedAt">): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...p, updatedAt: new Date().toISOString() }),
    );
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(PROFILE_CHANGE_EVENT));
}

export function onboardSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* noop */
  }
}

/** プロフィールの興味カテゴリに実カテゴリが含まれるか */
export function catMatches(p: Profile, cat: EventCategory): boolean {
  return p.cats.some((c) => CAT_EXPAND[c].includes(cat));
}

/**
 * ピックアップのスコアリング（ルールベース）。
 *   興味カテゴリ一致 +3 / エリア一致 +2 / レベル一致 +1
 * カテゴリもエリアも合わないものは対象外。開催済みも対象外。
 */
export function scoreEvent(p: Profile, e: Event, today = new Date()): number {
  if (daysUntil(e.dateEnd ?? e.date, today) < 0) return -1;
  const cat = catMatches(p, e.category);
  const area = (() => {
    const a = areaFromLocation(e.location);
    return a !== null && p.areas.includes(a);
  })();
  if (!cat && !area) return -1;
  let s = 0;
  if (cat) s += 3;
  if (area) s += 2;
  if (p.level && e.difficulty === p.level) s += 1;
  return s;
}

/** プロフィールに合うイベント上位 n 件（スコア降順 → 開催日昇順 → 注目数） */
export function pickupEvents(events: Event[], p: Profile, n = 4): Event[] {
  const today = new Date();
  return events
    .map((e) => ({ e, s: scoreEvent(p, e, today) }))
    .filter((x) => x.s > 0)
    .sort(
      (a, b) =>
        b.s - a.s ||
        a.e.date.localeCompare(b.e.date) ||
        watchCount(b.e.id) - watchCount(a.e.id),
    )
    .slice(0, n)
    .map((x) => x.e);
}
