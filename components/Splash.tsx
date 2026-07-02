"use client";

// アプリ起動時のスプラッシュ。React が表示〜消滅まで一貫して管理する
// （以前の「レイアウト直書き div + 素の script」方式は、ハイドレーションで
//  DOM が差し替わると削除対象を見失い、消えないままになる不具合があったため廃止）。
// 表示は1セッション1回・約0.7秒表示 + 0.45秒フェード。

import { useEffect, useState } from "react";

type Phase = "init" | "show" | "out" | "gone";

const SHOW_MS = 700; // 表示時間（ユーザー要望: 0.5〜1秒）
const FADE_MS = 450; // フェードアウト

export function Splash() {
  // SSR/初回クライアント描画は null（hydration mismatch 回避）
  const [phase, setPhase] = useState<Phase>("init");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sr_splash") === "1") {
        setPhase("gone");
        return;
      }
      sessionStorage.setItem("sr_splash", "1");
    } catch {
      /* sessionStorage 不可でも1回は見せる */
    }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = reduce ? 400 : SHOW_MS;
    setPhase("show");
    const t1 = setTimeout(() => setPhase("out"), show);
    const t2 = setTimeout(() => setPhase("gone"), show + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "init" || phase === "gone") return null;

  return (
    <div id="sr-splash" className={phase === "out" ? "out" : ""} aria-hidden="true">
      <div className="sp-photo" />
      <div className="sp-inner">
        <span className="sp-mk">
          <svg viewBox="0 0 24 24">
            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
        </span>
        <b>STEP &amp; RIDE</b>
        <p>すべてのサイクリストに、走るきっかけを。</p>
      </div>
    </div>
  );
}
