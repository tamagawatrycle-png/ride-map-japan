"use client";

// Explore：フィルターチップ + ベクター日本地図 + イベントカードリスト。
// 地図ピン ⇔ カードのホバー相互ハイライトを activeId の共有 state で実現。
// （承認済みモックの #explore セクション相当。発見/編集部トグルは公開専用のため撤去）

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { daysUntil } from "@/lib/format";
import { matchesFilter, type FilterKey } from "@/lib/ui";

// 地図は SSR 不可（fetch + getBBox が window/DOM 依存）→ client 内で ssr:false
const JapanMap = dynamic(() => import("./JapanMap"), {
  ssr: false,
  loading: () => (
    <div className="mappanel" style={{ minHeight: 360 }}>
      <div
        style={{
          padding: 24,
          color: "var(--faint)",
          fontSize: 13,
        }}
      >
        地図を読み込み中…
      </div>
    </div>
  ),
});

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => events.filter((e) => matchesFilter(e, filter)),
    [events, filter],
  );

  // 開催前を上・開催日昇順（モックの list ソート相当）
  const sorted = useMemo(() => {
    const today = new Date();
    return [...filtered].sort((a, b) => {
      const ap = daysUntil(a.date, today) < 0 ? 1 : 0;
      const bp = daysUntil(b.date, today) < 0 ? 1 : 0;
      return ap - bp || a.date.localeCompare(b.date);
    });
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

      <div
        className="mapwrap"
        style={{ maxWidth: 600, margin: "2px auto 0", position: "static" }}
      >
        <JapanMap events={filtered} activeId={activeId} onHover={setActiveId} />
      </div>

      <div className="listhead" style={{ marginTop: 36 }}>
        <span className="k">Events</span>
        <span className="k tabnum">{sorted.length}件</span>
      </div>
      <div className="list evgrid">
        {sorted.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            active={activeId === e.id}
            onHover={setActiveId}
          />
        ))}
      </div>
    </section>
  );
}
