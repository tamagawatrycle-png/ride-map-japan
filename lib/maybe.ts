// 「出るかも」（エントリー検討中）リスト — localStorage 保存。
// バックエンド未接続のため端末ローカル。将来はアカウント同期に置き換え可能な薄い層にしておく。
// 変更時は "sr-maybe-change" イベントを飛ばし、全カードのボタン表示を同期する。

const KEY = "sr_maybe";
const SHOWN_KEY = "sr_remind_shown"; // リマインドを最後に表示した日（1日1回制御）

export const MAYBE_CHANGE_EVENT = "sr-maybe-change";

function safeRead(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function safeWrite(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* localStorage 不可（プライベートモード等）でも落とさない */
  }
  window.dispatchEvent(new CustomEvent(MAYBE_CHANGE_EVENT));
}

export function getMaybeIds(): string[] {
  if (typeof window === "undefined") return [];
  return safeRead();
}

export function isMaybe(id: string): boolean {
  return getMaybeIds().includes(id);
}

/** トグルして新しい状態（true=出るかも登録中）を返す。 */
export function toggleMaybe(id: string): boolean {
  const ids = safeRead();
  const i = ids.indexOf(id);
  if (i >= 0) {
    ids.splice(i, 1);
    safeWrite(ids);
    return false;
  }
  ids.push(id);
  safeWrite(ids);
  return true;
}

export function removeMaybe(id: string): void {
  safeWrite(safeRead().filter((x) => x !== id));
}

/** アカウント同期用：リスト全体を置き換える（重複除去して保存）。 */
export function setMaybeIds(ids: string[]): void {
  safeWrite([...new Set(ids)]);
}

/** リマインドポップアップの1日1回制御。 */
export function reminderShownToday(): boolean {
  try {
    return localStorage.getItem(SHOWN_KEY) === todayKey();
  } catch {
    return true; // 読めない環境ではポップアップを出さない
  }
}

export function markReminderShown(): void {
  try {
    localStorage.setItem(SHOWN_KEY, todayKey());
  } catch {
    /* noop */
  }
}

function todayKey(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
