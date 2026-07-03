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
import { getProfile, scoreEvent } from "@/lib/profile";
import { MaybeButton } from "./MaybeButton";

const WINDOW_DAYS = 14; // この日数以内に迫ったらリマインド
const SUGGEST_DAYS = 7; // あなた向け提案は締切7日以内のみ
const SUGGEST_MAX = 2;

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

// あなた向け提案：プロフィールの興味に合い（カテゴリ一致）、未登録で、
// エントリー締切が SUGGEST_DAYS 日以内の大会。
function computeSuggested(): Due[] {
  const p = getProfile();
  if (!p) return [];
  const events = eventsData as unknown as Event[];
  const ids = new Set(getMaybeIds());
  const today = new Date();
  const out: Due[] = [];
  for (const ev of events) {
    if (ids.has(ev.id) || !ev.entryDeadline) continue;
    if (daysUntil(ev.dateEnd ?? ev.date, today) < 0) continue;
    if (scoreEvent(p, ev, today) < 3) continue; // カテゴリ一致（+3）以上のみ
    const days = daysUntil(ev.entryDeadline, today);
    if (days >= 0 && days <= SUGGEST_DAYS) {
      out.push({ ev, days, kind: "deadline" });
    }
  }
  return out.sort((a, b) => a.days - b.days).slice(0, SUGGEST_MAX);
}

export function EntryReminder() {
  const [due, setDue] = useState<Due[]>([]);
  const [suggested, setSuggested] = useState<Due[]>([]);
  const [open, setOpen] = useState(false);

  // 初回マウント時：1日1回だけ判定して表示（登録分 or あなた向け提案があれば）
  useEffect(() => {
    if (reminderShownToday()) return;
    const d = computeDue();
    const s = computeSuggested();
    if (d.length > 0 || s.length > 0) {
      setDue(d);
      setSuggested(s);
      setOpen(true);
      markReminderShown();
    }
  }, []);

  // 表示中にリスト操作されたら同期（解除で行が消える / 提案の登録で due へ移動）
  useEffect(() => {
    if (!open) return;
    const sync = () => {
      const d = computeDue();
      const s = suggested.filter(
        (x) => !getMaybeIds().includes(x.ev.id) || d.some((y) => y.ev.id === x.ev.id),
      );
      setDue(d);
      if (d.length === 0 && s.length === 0) setOpen(false);
    };
    window.addEventListener(MAYBE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(MAYBE_CHANGE_EVENT, sync);
  }, [open, suggested]);

  if (!open || (due.length === 0 && suggested.length === 0)) return null;

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

        {due.length > 0 && (
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
        )}

        {suggested.length > 0 && (
          <>
            <div className="remind-subhead">あなた向けで締切が近い大会</div>
            <ul className="remind-list">
              {suggested.map(({ ev, days }) => (
                <li key={ev.id}>
                  <a href={`/events/${ev.id}`} className="remind-item">
                    <span className="remind-days tabnum">
                      {days === 0 ? "本日" : `あと${days}日`}
                    </span>
                    <span className="remind-body">
                      <b>{ev.name}</b>
                      <small>
                        エントリー締切 {shortDate(ev.entryDeadline!)}・{ev.location}
                      </small>
                    </span>
                  </a>
                  <MaybeButton eventId={ev.id} eventName={ev.name} />
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="remind-note">
          「出るかも」に登録したイベントを、締切2週間前からお知らせします（1日1回）。
        </p>
      </div>
    </div>
  );
}
