"use client";

// Explore：見出し + フィルターチップ + インタラクティブ・タイル地図 + イベントカードグリッド。
// 地図はズーム/パン可能な Leaflet 版（MapSection）をフロントに配置。フィルターでマーカーも同期。

import { useMemo } from "react";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { MapSection } from "./MapSection";
import { Pickup } from "./Pickup";
import { matchesFilter, watchCount, type FilterKey } from "@/lib/ui";
import { CATEGORIES, JBCF_COLOR } from "@/lib/categories";

// color: チップ先頭の色ドット（カテゴリ色分け。すべて＝ドット無し）
const CHIPS: { k: FilterKey; label: string; color?: string }[] = [
  { k: "all", label: "すべて" },
  { k: "hillclimb", label: "ヒルクライム", color: CATEGORIES.hillclimb.color },
  { k: "race", label: "レース", color: CATEGORIES.race.color },
  { k: "cycling", label: "ロングライド", color: CATEGORIES.cycling.color },
  { k: "gravel", label: "グラベル", color: CATEGORIES.gravel.color },
  { k: "jbcf", label: "JBCF", color: JBCF_COLOR },
  { k: "cyclocross", label: "シクロクロス", color: CATEGORIES.cyclocross.color },
  { k: "mtb", label: "MTB", color: CATEGORIES.mtb_xc.color },
];

export function ExploreSection({
  events,
  filter,
  onFilterChange,
}: {
  events: Event[];
  filter: FilterKey;
  onFilterChange: (k: FilterKey) => void;
}) {
  const filtered = useMemo(
    () => events.filter((e) => matchesFilter(e, filter)),
    [events, filter],
  );

  // アクセス数（気になっている数）の多い順。同数は開催日昇順で安定化。
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        watchCount(b.id) - watchCount(a.id) || a.date.localeCompare(b.date),
    );
  }, [filtered]);

  return (
    <section
      id="explore"
      className="wrap"
      style={{ paddingTop: 20, paddingBottom: 48 }}
    >
      <div style={{ padding: "4px 0 14px", textAlign: "center" }}>
        <span className="kicker" style={{ justifyContent: "center" }}>
          全国のサイクリングイベント発見マップ
        </span>
        <h1
          style={{
            // 常に1行で収める（20文字×画面幅から算出。改行させない）
            fontSize: "clamp(14px, 4.3vw, 34px)",
            whiteSpace: "nowrap",
            fontWeight: 800,
            letterSpacing: "-.02em",
            margin: "10px 0 0",
          }}
        >
          すべてのサイクリストに、走るきっかけを。
        </h1>
      </div>

      {/* あなたへのピックアップ（プロフィール回答済みの時だけ表示） */}
      <Pickup events={events} />

      <div className="filters" style={{ justifyContent: "center" }}>
        {CHIPS.map((c) => (
          <button
            key={c.k}
            className={`chip${filter === c.k ? " on" : ""}`}
            onClick={() => onFilterChange(c.k)}
          >
            {c.color && <i className="cdot" style={{ background: c.color }} />}
            {c.label}
          </button>
        ))}
      </div>

      {/* ズーム/パン可能なインタラクティブ地図（フィルター連動） */}
      <MapSection events={filtered} />

      <div className="listhead" style={{ marginTop: 32 }}>
        <span className="k">Events</span>
        <span className="k tabnum">{sorted.length}件</span>
      </div>
      {/* ホームは 2列×5行（10件）まで。全件はイベント一覧ページへ */}
      <div className="list evgrid">
        {sorted.slice(0, 10).map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
      {sorted.length > 10 && (
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Link
            className="btn"
            href="/events"
            style={{ padding: "12px 28px", fontSize: 14 }}
          >
            すべてのイベントを見る（{sorted.length}件）
          </Link>
        </div>
      )}
    </section>
  );
}
