import Link from "next/link";
import type { Event } from "@/lib/types";
import { shortDate } from "@/lib/ui";
import { daysUntil } from "@/lib/format";

// 締切が近いイベント：締切・開催がともに未来 → 締切昇順で最大6件。
export function DeadlineRow({ events }: { events: Event[] }) {
  const today = new Date();
  const rows = events
    .filter(
      (e) =>
        e.entryDeadline != null &&
        daysUntil(e.entryDeadline, today) >= 0 &&
        daysUntil(e.date, today) >= 0,
    )
    .sort((a, b) => (a.entryDeadline as string).localeCompare(b.entryDeadline as string))
    .slice(0, 6);

  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">Closing soon</span>
          <h2>締切が近いイベント</h2>
          <p>気になったら早めに。エントリーは先着・抽選さまざま。</p>
        </div>
        <div className="drow">
          {rows.map((e) => {
            const days = daysUntil(e.entryDeadline as string, today);
            return (
              <Link key={e.id} href={`/events/${e.id}`} className="dcard">
                <span className="cd">締切まで{days}日</span>
                <h4>{e.name}</h4>
                <div className="m">
                  {shortDate(e.date)} ・ {e.location}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
