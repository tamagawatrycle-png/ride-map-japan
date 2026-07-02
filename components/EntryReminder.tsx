"use client";

// エントリーリマインダー。「出るかも」登録済みイベントのうち、
// エントリー締切（無ければ開催日）が14日以内に迫ったものをポップアップで知らせる。
// 表示は1日1回まで（localStorage の sr_remind_shown で制御）。

import { useEffect, useState } from "react";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";
import { daysUntil } from "@/lib/format";
import { shortDate } from "@/lib/ui";
import {
  getMaybeIds,
  removeMaybe,
  reminderShownToday,
  markReminderShown,
  MAYBE_CHANGE_EVENT,
} from "@/lib/maybe";

const WINDOW_DAYS = 14; // この日数以内に迫ったらリマインド

type Due = {
  ev: Event;
  days: number; // 締切（or 開催日）まで
  kind: "deadline" | "event"; // 何までの日数か
};

function computeDue(): Due[] {
  const events = eventsData as unknown as Event[];
  const ids = new Set(getMaybeIds());
  const today = new Date();
  const due: Due[] = [];
  for (const ev of events) {
    if (!ids.has(ev.id)) continue;
    // 開催が終わったものは対象外
    if (daysUntil(ev.dateEnd ?? ev.date, today) < 0) continue;
    const target = ev.entryDeadline ?? ev.date;
    const days = daysUntil(target, today);
    if (days >= 0 && days <= WINDOW_DAYS) {
      due.push({ ev, days, kind: ev.entryDeadline ? "deadline" : "event" });
    }
  }
  return due.sort((a, b) => a.days - b.days);
}

export function EntryReminder() {
  const [due, setDue] = useState<Due[]>([]);
  const [open, setOpen] = useState(false);

  // 初回マウント時：1日1回だけ判定して表示
  useEffect(() => {
    if (reminderShownToday()) return;
    const d = computeDue();
    if (d.length > 0) {
      setDue(d);
      setOpen(true);
      markReminderShown();
    }
  }, []);

  // 表示中にリスト解除されたら行を消す
  useEffect(() => {
    if (!open) return;
    const sync = () => {
      const d = computeDue();
      setDue(d);
      if (d.length === 0) setOpen(false);
    };
    window.addEventListener(MAYBE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(MAYBE_CHANGE_EVENT, sync);
  }, [open]);

  if (!open || due.length === 0) return null;

  return (
    <div className="remind-overlay" role="dialog" aria-label="エントリーリマインド">
      <div className="remind-card">
        <div className="remind-head">
          <span className="remind-bell" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16h15L18 12.5V9a6 6 0 0 0-6-6z" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
          </span>
          <b>エントリーが近づいています</b>
          <button
            className="remind-close"
            aria-label="閉じる"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ul className="remind-list">
          {due.map(({ ev, days, kind }) => (
            <li key={ev.id}>
              <a href={`/events/${ev.id}`} className="remind-item">
                <span className="remind-days tabnum">
                  {days === 0 ? "本日" : `あと${days}日`}
                </span>
                <span className="remind-body">
                  <b>{ev.name}</b>
                  <small>
                    {kind === "deadline"
                      ? `エントリー締切 ${shortDate(ev.entryDeadline!)}`
                      : `開催日 ${shortDate(ev.date)}`}
                    ・{ev.location}
                  </small>
                </span>
              </a>
              <button
                className="remind-remove"
                aria-label={`${ev.name} のリマインドを解除`}
                onClick={() => removeMaybe(ev.id)}
              >
                解除
              </button>
            </li>
          ))}
        </ul>

        <p className="remind-note">
          「出るかも」に登録したイベントを、締切2週間前からお知らせします（1日1回）。
        </p>
      </div>
    </div>
  );
}
