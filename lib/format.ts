// 日付・表示まわりの共通ユーティリティ（サーバー/クライアント両用）

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// "2026-06-07" → "2026年6月7日(日)"
export function formatDateJP(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const w = WEEKDAYS[date.getUTCDay()];
  return `${y}年${m}月${d}日(${w})`;
}

// 開催日（単日 / 複数日）の表示
export function formatEventDate(date: string, dateEnd?: string): string {
  if (!dateEnd || dateEnd === date) return formatDateJP(date);
  const [, em, ed] = dateEnd.split("-").map(Number);
  return `${formatDateJP(date)} 〜 ${em}月${ed}日`;
}

// 締切までの残り日数（今日基準）。過去なら負。
export function daysUntil(iso: string, today = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const base = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.round((target - base) / 86_400_000);
}

// 締切が近い（14日以内・かつ未経過）か
export function isDeadlineSoon(iso?: string, today = new Date()): boolean {
  if (!iso) return false;
  const left = daysUntil(iso, today);
  return left >= 0 && left <= 14;
}
