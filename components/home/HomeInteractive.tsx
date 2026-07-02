"use client";

// Explore ⇔ 種別タイルの絞り込み状態を共有する client ラッパー。
// タイルクリック → filter 設定 + #explore へスクロール（モックの jumpFilter 相当）。
// 間に挟まる「マップで探す」(タイル地図) セクションも内包し、モックの並び順を維持。

import { useState } from "react";
import type { Event } from "@/lib/types";
import type { FilterKey } from "@/lib/ui";
import { ExploreSection } from "@/components/ExploreSection";
import { MapSection } from "@/components/MapSection";
import { CategoryTiles } from "./CategoryTiles";

export function HomeInteractive({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const jumpFilter = (k: FilterKey) => {
    setFilter(k);
    document
      .getElementById("explore")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <ExploreSection
        events={events}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* インタラクティブ・タイル地図 */}
      <section className="sec alt" id="tilemap">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">Zoomable map</span>
            <h2>拡大地図で探す</h2>
            <p>
              ズーム・パンで地域を絞り込める本物の地図版。ピンをクリックで大会情報へ。
            </p>
          </div>
          <MapSection events={events} />
        </div>
      </section>

      <CategoryTiles events={events} onPick={jumpFilter} />
    </>
  );
}
