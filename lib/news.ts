// ニュース（お知らせ）— data/news.json の手動エントリに、
// events.json の createdAt から自動生成した「新着イベント」を合成する。
// → イベントDBを更新すると、追加日ごとに News へ自動で1行入る仕組み。

import newsData from "@/data/news.json";
import eventsData from "@/data/events.json";
import type { Event } from "./types";

export interface NewsItem {
  date: string; // YYYY-MM-DD
  tag: string; // 追加 / 機能 / 改善 / お知らせ
  title: string;
  href?: string;
  auto?: boolean;
}

const AUTO_WINDOW_DAYS = 45; // 自動「新着イベント」を出す期間

/** createdAt の日付ごとにイベント追加をまとめ、自動ニュース化する */
function autoEventNews(): NewsItem[] {
  const events = eventsData as unknown as Event[];
  const byDate = new Map<string, Event[]>();
  for (const e of events) {
    const d = (e.createdAt ?? "").slice(0, 10);
    if (!d) continue;
    (byDate.get(d) ?? byDate.set(d, []).get(d)!).push(e);
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - AUTO_WINDOW_DAYS);
  const items: NewsItem[] = [];
  for (const [date, list] of byDate) {
    if (new Date(date) < cutoff) continue;
    const names = list
      .slice(0, 2)
      .map((e) => e.name.replace(/（.*?）/g, ""))
      .join("・");
    items.push({
      date,
      tag: "新着",
      title:
        list.length === 1
          ? `「${list[0].name}」を掲載しました`
          : `大会を${list.length}件追加しました（${names} ほか）`,
      href: "/events",
      auto: true,
    });
  }
  return items;
}

/** 手動＋自動をマージして日付降順に。同日付は手動を先に。 */
export function getNews(limit?: number): NewsItem[] {
  const manual = (newsData as NewsItem[]).map((n) => ({ ...n }));
  // 手動エントリと内容が重複しやすい同日の自動「追加」は、手動に『追加』タグがあれば省く
  const manualAddDates = new Set(
    manual.filter((n) => n.tag === "追加").map((n) => n.date),
  );
  const auto = autoEventNews().filter((a) => !manualAddDates.has(a.date));
  const all = [...manual, ...auto].sort(
    (a, b) => b.date.localeCompare(a.date) || (a.auto ? 1 : -1),
  );
  return limit ? all.slice(0, limit) : all;
}
