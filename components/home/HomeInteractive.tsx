"use client";

// Explore ⇔ 種別タイルの絞り込み状態を共有する client ラッパー。
// タイルクリック → filter 設定 + #explore へスクロール（モックの jumpFilter 相当）。
// インタラクティブ地図は ExploreSection のフロントに内包（フィルター連動）。

import { useState } from "react";
import type { Event } from "@/lib/types";
import type { FilterKey } from "@/lib/ui";
import { ExploreSection } from "@/components/ExploreSection";
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

      <CategoryTiles events={events} onPick={jumpFilter} />
    </>
  );
}
