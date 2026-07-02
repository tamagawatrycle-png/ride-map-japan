"use client";

import type { Event } from "@/lib/types";
import { matchesFilter, type FilterKey } from "@/lib/ui";

// 種別タイル（件数付き）。クリックで Explore の絞り込みを設定しスクロール。
type TileDef = { k: FilterKey; label: string; icon: string };

const TILE_DEFS: TileDef[] = [
  { k: "hillclimb", label: "ヒルクライム", icon: '<path d="M3 20l6-11 4 6 2-3 6 8z"/>' },
  { k: "race", label: "レース", icon: '<path d="M4 12h5l2-4 3 8 2-4h4"/>' },
  {
    k: "cycling",
    label: "ロングライド",
    icon: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M9 9h5"/>',
  },
  {
    k: "gravel",
    label: "グラベル",
    icon: '<path d="M3 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3"/><circle cx="7" cy="9" r="1"/><circle cx="14" cy="7" r="1"/>',
  },
  {
    k: "jbcf",
    label: "JBCF",
    icon: '<path d="M6 21V3M6 4h11l-2.5 3.5L17 11H6"/>',
  },
  {
    k: "cyclocross",
    label: "シクロクロス",
    icon: '<path d="M4 19h16"/><circle cx="7.5" cy="15" r="2.3"/><circle cx="16.5" cy="15" r="2.3"/><path d="M7.5 15l3-5.5h4l3 5.5M10 9.5h4"/>',
  },
  {
    k: "fondo",
    label: "グランフォンド",
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  },
  {
    k: "enduro",
    label: "耐久",
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  },
];

export function CategoryTiles({
  events,
  onPick,
}: {
  events: Event[];
  onPick: (k: FilterKey) => void;
}) {
  return (
    <section id="cats" className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">Browse by type</span>
          <h2>種別から探す</h2>
          <p>登りたい・競いたい・のんびり走りたい。今日の気分で選ぶ。</p>
        </div>
        <div className="tiles">
          {TILE_DEFS.map((c) => {
            const n = events.filter((e) => matchesFilter(e, c.k)).length;
            return (
              <button key={c.k} className="tile" onClick={() => onPick(c.k)}>
                <div className="ico">
                  <svg
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: c.icon }}
                  />
                </div>
                <div className="nm">{c.label}</div>
                <div className="ct tabnum">{n}件</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
