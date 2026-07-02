"use client";

// ヘッダーの「今週の足跡（アクセス数）」カウンター。
// バックエンド未接続のため、全イベントの watch 数合計をベースに、
// 今週の自分の訪問回数（localStorage・週替わりでリセット）を上乗せして表示。
// マウント時にカウントアップ・アニメーションで数字がせり上がる。
// TODO: 実アクセス解析（週次PV）が入ったらベース値を差し替える。

import { useEffect, useState } from "react";
import eventsData from "@/data/events.json";
import { watchCount } from "@/lib/ui";

const BASE = (eventsData as { id: string }[]).reduce(
  (sum, e) => sum + watchCount(e.id),
  0,
);

// ISO 週キー（例 "2026-27"）。週が変わったらローカルの足跡はリセット。
function weekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-${week}`;
}

export function FootprintCounter() {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let visits = 1;
    try {
      const wk = weekKey(new Date());
      const raw = localStorage.getItem("sr_footprint");
      const obj = raw ? (JSON.parse(raw) as { wk: string; n: number }) : null;
      visits = obj && obj.wk === wk ? obj.n + 1 : 1;
      localStorage.setItem("sr_footprint", JSON.stringify({ wk, n: visits }));
    } catch {
      /* localStorage 不可でも表示は続行 */
    }

    const target = BASE + visits;
    const dur = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className="wkcount" title="今週の足跡（アクセス数）">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="8.5" cy="8" rx="3.1" ry="4.4" />
        <ellipse cx="15.5" cy="15.5" rx="3" ry="4.2" />
      </svg>
      <b className="tabnum">{display.toLocaleString()}</b>
      <small>今週の足跡</small>
    </span>
  );
}
