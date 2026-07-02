"use client";

import Link from "next/link";
import type { Event } from "@/lib/types";
import { catLabel, shortDate, watchCount, IC } from "@/lib/ui";
import { CATEGORIES, JBCF_COLOR } from "@/lib/categories";
import { daysUntil } from "@/lib/format";
import { MaybeButton } from "./MaybeButton";

// モックの badgeFor 相当：締切/開催状況からバッジを決める。
// 締切情報が無いイベントは「エントリー受付中」と断定せず「開催予定」を出す
// （エントリー開始前の大会をスケジュールとして載せるため）。
function badgeFor(ev: Event): { cls: string; txt: string } {
  const today = new Date();
  const eventPast = daysUntil(ev.dateEnd ?? ev.date, today) < 0;
  if (eventPast) return { cls: "done", txt: "今季終了" };
  if (ev.entryDeadline) {
    const days = daysUntil(ev.entryDeadline, today);
    if (days >= 0 && days <= 45) return { cls: "soon", txt: `締切まで${days}日` };
    if (days > 45) return { cls: "open", txt: "エントリー受付中" };
    return { cls: "done", txt: "エントリー終了" }; // 締切超過だが開催前
  }
  return { cls: "plan", txt: "開催予定" };
}

function Svg({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

// 「走ろ！」共有：ネイティブ共有シート → 非対応時はリンクをコピー。
// （将来のローカル機能「走る企画の共有」へ発展させる想定の入口）
async function shareRide(ev: Event) {
  const url = `${window.location.origin}/events/${ev.id}`;
  const text = `走ろ！「${ev.name}」`;
  if (navigator.share) {
    try {
      await navigator.share({ title: ev.name, text, url });
    } catch {
      /* ユーザーがキャンセル */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    window.alert("共有リンクをコピーしました");
  } catch {
    /* クリップボード不可 */
  }
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
          <i style={{ background: CATEGORIES[event.category].color }} />
          {catLabel(event.category)}
        </span>
        <span className={`badge ${bd.cls}`}>{bd.txt}</span>
      </div>
      <h3>
        {event.name}
        {event.featured && <span className="pick">編集部pick</span>}
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
            <span
              key={t}
              style={
                t === "JBCF"
                  ? {
                      color: "#fff",
                      background: JBCF_COLOR,
                      fontWeight: 700,
                    }
                  : undefined
              }
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="foot">
        <span className="watch">
          <Svg d={IC.eye} />
          <b>{watchCount(event.id)}</b>人が気になっている
        </span>
        <MaybeButton eventId={event.id} eventName={event.name} />
        <span
          role="button"
          tabIndex={0}
          className="share"
          aria-label={`走ろ！ ${event.name} を共有`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void shareRide(event);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              void shareRide(event);
            }
          }}
        >
          <Svg d={IC.share} />
          走ろ！
        </span>
      </div>
    </Link>
  );
}
