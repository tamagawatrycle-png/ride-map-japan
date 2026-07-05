"use client";

// マイページ本体。プロフィール確認/編集・出るかも一覧・アカウント（近日公開）。
// すべて localStorage ベース。ログイン実装時はこのページがアカウント画面に発展する。

import { useEffect, useState } from "react";
import Link from "next/link";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";
import { DIFFICULTY_LABELS, areaFromLocation } from "@/lib/categories";
import { daysUntil } from "@/lib/format";
import { shortDate } from "@/lib/ui";
import {
  getProfile,
  PROFILE_CATS,
  PROFILE_CHANGE_EVENT,
  ONBOARD_OPEN_EVENT,
  type Profile,
} from "@/lib/profile";
import { getMaybeIds, removeMaybe, MAYBE_CHANGE_EVENT } from "@/lib/maybe";
import { AuthSection } from "./AuthSection";

const EVENTS = eventsData as unknown as Event[];

export function MePage() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [maybeIds, setMaybeIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setProfile(getProfile());
      setMaybeIds(getMaybeIds());
    };
    sync();
    setMounted(true);
    window.addEventListener(PROFILE_CHANGE_EVENT, sync);
    window.addEventListener(MAYBE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(PROFILE_CHANGE_EVENT, sync);
      window.removeEventListener(MAYBE_CHANGE_EVENT, sync);
    };
  }, []);

  if (!mounted) return null;

  const today = new Date();
  const maybeEvents = EVENTS.filter(
    (e) => maybeIds.includes(e.id) && daysUntil(e.dateEnd ?? e.date, today) >= 0,
  ).sort((a, b) =>
    (a.entryDeadline ?? a.date).localeCompare(b.entryDeadline ?? b.date),
  );

  const catLabels = profile
    ? PROFILE_CATS.filter((c) => profile.cats.includes(c.k)).map((c) => c.label)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="me-title">マイページ</h1>

      {/* プロフィール */}
      <section className="me-sec">
        <div className="me-sechead">
          <h2>あなたの回答</h2>
          <button
            className="me-editbtn"
            onClick={() => window.dispatchEvent(new CustomEvent(ONBOARD_OPEN_EVENT))}
          >
            回答を編集
          </button>
        </div>
        {profile ? (
          <div className="me-profile">
            <div className="me-row">
              <span className="me-label">走り方</span>
              <span className="me-chips">
                {catLabels.map((l) => (
                  <i key={l}>{l}</i>
                ))}
              </span>
            </div>
            <div className="me-row">
              <span className="me-label">エリア</span>
              <span className="me-chips">
                {profile.areas.map((a) => (
                  <i key={a}>{a}</i>
                ))}
              </span>
            </div>
            <div className="me-row">
              <span className="me-label">レベル</span>
              <span className="me-chips">
                <i>{profile.level ? DIFFICULTY_LABELS[profile.level] : "どれでも"}</i>
              </span>
            </div>
          </div>
        ) : (
          <p className="me-empty">
            まだ回答がありません。「回答を編集」から3つの質問に答えると、ホームにあなた向けのピックアップが表示されます。
          </p>
        )}
      </section>

      {/* 出るかも一覧 */}
      <section className="me-sec">
        <div className="me-sechead">
          <h2>出るかもリスト</h2>
          <span className="me-count tabnum">{maybeEvents.length}件</span>
        </div>
        {maybeEvents.length > 0 ? (
          <ul className="me-list">
            {maybeEvents.map((e) => {
              const target = e.entryDeadline ?? e.date;
              const days = daysUntil(target, today);
              return (
                <li key={e.id}>
                  <Link href={`/events/${e.id}`} className="me-item">
                    <span
                      className={`me-days tabnum${days >= 0 && days <= 14 ? " soon" : ""}`}
                    >
                      {days < 0 ? "終了" : days === 0 ? "本日" : `あと${days}日`}
                    </span>
                    <span className="me-body">
                      <b>{e.name}</b>
                      <small>
                        {e.entryDeadline
                          ? `エントリー締切 ${shortDate(e.entryDeadline)}`
                          : `開催日 ${shortDate(e.date)}`}
                        ・{areaFromLocation(e.location) ?? ""}・{e.location}
                      </small>
                    </span>
                  </Link>
                  <button
                    className="remind-remove"
                    onClick={() => removeMaybe(e.id)}
                    aria-label={`${e.name} を出るかもから外す`}
                  >
                    解除
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="me-empty">
            まだ登録がありません。イベントカードの「出るかも」を押すと、締切前にリマインドします。
          </p>
        )}
      </section>

      {/* アカウント（Googleログイン／未設定時は近日公開表示） */}
      <section className="me-sec">
        <div className="me-sechead">
          <h2>アカウント</h2>
        </div>
        <AuthSection />
      </section>
    </div>
  );
}
