"use client";

// Explore：見出し + フィルターチップ + インタラクティブ・タイル地図 + イベントカードグリッド。
// 地図はズーム/パン可能な Leaflet 版（MapSection）をフロントに配置。フィルターでマーカーも同期。

import { useMemo } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { MapSection } from "./MapSection";
import { matchesFilter, watchCount, type FilterKey } from "@/lib/ui";

const CHIPS: { k: FilterKey; label: string }[] = [
  { k: "all", label: "すべて" },
  { k: "hillclimb", label: "ヒルクライム" },
  { k: "race", label: "レース" },
  { k: "cycling", label: "ロングライド" },
  { k: "gravel", label: "グラベル" },
  { k: "jbcf", label: "JBCF" },
  { k: "cyclocross", label: "シクロクロス" },
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
            fontSize: "clamp(24px,4.2vw,34px)",
            fontWeight: 800,
            letterSpacing: "-.02em",
            margin: "10px 0 0",
          }}
        >
          すべてのサイクリストに、走るきっかけを。
        </h1>
      </div>

      <div className="filters" style={{ justifyContent: "center" }}>
        {CHIPS.map((c) => (
          <button
            key={c.k}
            className={`chip${filter === c.k ? " on" : ""}`}
            onClick={() => onFilterChange(c.k)}
          >
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
      <div className="list evgrid">
        {sorted.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}
