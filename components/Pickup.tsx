"use client";

// 「あなたへのピックアップ」— プロフィール（localStorage）に合うイベント上位4件。
// プロフィール未設定時は、オンボーディングへ誘導する細いティーザーを出す。

import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import {
  getProfile,
  pickupEvents,
  PROFILE_CHANGE_EVENT,
  ONBOARD_OPEN_EVENT,
  type Profile,
} from "@/lib/profile";

export function Pickup({ events }: { events: Event[] }) {
  // SSR は null（hydration mismatch 回避）→ マウント後に読み込み
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setProfile(getProfile());
    sync();
    setMounted(true);
    window.addEventListener(PROFILE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(PROFILE_CHANGE_EVENT, sync);
  }, []);

  if (!mounted) return null;

  // 未設定：ティーザー（1行）
  if (!profile) {
    return (
      <div className="pickup-teaser">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
        </svg>
        <span>3つの質問に答えると、あなた向けの大会をここに表示します</span>
        <button
          className="btn sm"
          onClick={() => window.dispatchEvent(new CustomEvent(ONBOARD_OPEN_EVENT))}
        >
          はじめる
        </button>
      </div>
    );
  }

  const picks = pickupEvents(events, profile, 4);
  if (picks.length === 0) return null;

  return (
    <section className="pickup">
      <div className="listhead">
        <span className="k">
          あなたへのピックアップ
          <small className="pickup-why">
            {profile.cats.length > 0 && "興味・エリアの回答から"}
          </small>
        </span>
        <a href="/me" className="pickup-edit">
          回答を編集
        </a>
      </div>
      <div className="list evgrid">
        {picks.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}
