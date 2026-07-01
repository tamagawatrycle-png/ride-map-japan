"use client";

import Link from "next/link";
import type { Event } from "@/lib/types";
import { catLabel, shortDate, watchCount, IC } from "@/lib/ui";
import { daysUntil } from "@/lib/format";

// モックの badgeFor 相当：締切/開催状況からバッジを決める
function badgeFor(ev: Event): { cls: string; txt: string } {
  const today = new Date();
  const eventPast = daysUntil(ev.date, today) < 0;
  if (eventPast) return { cls: "done", txt: "今季終了" };
  if (ev.entryDeadline) {
    const days = daysUntil(ev.entryDeadline, today);
    if (days >= 0 && days <= 45) return { cls: "soon", txt: `締切まで${days}日` };
  }
  return { cls: "open", txt: "エントリー受付中" };
}

function Svg({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

export function EventCard({
  event,
  active = false,
  onHover,
}: {
  event: Event;
  active?: boolean;
  onHover?: (id: string | null) => void;
}) {
  const bd = badgeFor(event);
  return (
    <Link
      href={`/events/${event.id}`}
      className={`ev${active ? " active" : ""}`}
      onMouseEnter={onHover ? () => onHover(event.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      <div className="row1">
        <span className="cat">
          <i />
          {catLabel(event.category)}
        </span>
        <span className={`badge ${bd.cls}`}>{bd.txt}</span>
      </div>
      <h3>
        {event.name}
        {event.featured && <span className="pick">★ pick</span>}
      </h3>
      <div className="meta">
        <span>
          <Svg d={IC.cal} />
          <b>{shortDate(event.date)}</b>
        </span>
        <span>
          <Svg d={IC.pin} />
          {event.location}
        </span>
        {event.distance && (
          <span>
            <Svg d={IC.route} />
            {event.distance}
          </span>
        )}
        {event.elevation && (
          <span>
            <Svg d={IC.mtn} />
            {event.elevation}
          </span>
        )}
      </div>
      {event.tags && event.tags.length > 0 && (
        <div className="tags">
          {event.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      <div className="foot">
        <span className="watch">
          <Svg d={IC.eye} />
          <b>{watchCount(event.id)}</b>人が気になっている
        </span>
        <span className="go">
          エントリー
          <Svg d={IC.arr} />
        </span>
      </div>
    </Link>
  );
}
