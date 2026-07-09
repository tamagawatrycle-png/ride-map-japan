"use client";

// アプリ起動時のスプラッシュ。React が表示〜消滅まで一貫して管理する
// （以前の「レイアウト直書き div + 素の script」方式は、ハイドレーションで
//  DOM が差し替わると削除対象を見失い、消えないままになる不具合があったため廃止）。
// 表示は1セッション1回・約0.7秒表示 + 0.45秒フェード。

import { useEffect, useState } from "react";

type Phase = "init" | "show" | "out" | "gone";

const SHOW_MS = 2000; // 表示時間（ユーザー要望: 2秒）
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

  // タイポグラフィ主体のミニマル・オープニング。
  // 白背景 → 行ごとのマスクリビール → ルートライン＋走るドット → 白いページへ溶ける。
  return (
    <div id="sr-splash" className={phase === "out" ? "out" : ""} aria-hidden="true">
      <div className="sp2">
        <span className="sp2-brand">
          ハシロ<i>！</i>
        </span>
        <span className="sp2-kicker">HASHIRO STEP &amp; RIDE!</span>
        <div className="sp2-mission">
          <span className="sp2-line">
            <span className="sp2-t sp2-t1">すべてのサイクリストに、</span>
          </span>
          <span className="sp2-line">
            <span className="sp2-t sp2-t2">
              走るきっかけを<i>。</i>
            </span>
          </span>
        </div>
        <div className="sp2-route">
          <i />
        </div>
      </div>
    </div>
  );
}
