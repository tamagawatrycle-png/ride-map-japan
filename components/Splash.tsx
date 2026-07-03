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

  return (
    <div id="sr-splash" className={phase === "out" ? "out" : ""} aria-hidden="true">
      <div className="sp-photo" />

      {/* 走り抜けるロードバイク（ホイール回転付き）＋ロードライン */}
      <div className="sp-road" />
      <div className="sp-rider">
        <svg viewBox="0 0 120 74">
          {/* 後輪・前輪（スポークは .wh で回転） */}
          <g className="wh">
            <circle cx="26" cy="52" r="16" />
            <path d="M26 36v32M10 52h32M14.7 40.7l22.6 22.6M14.7 63.3l22.6-22.6" />
          </g>
          <g className="wh">
            <circle cx="94" cy="52" r="16" />
            <path d="M94 36v32M78 52h32M82.7 40.7l22.6 22.6M82.7 63.3l22.6-22.6" />
          </g>
          {/* フレーム・ハンドル・サドル */}
          <path
            className="fr"
            d="M26 52 L46 26 L80 26 L94 52 M46 26 L58 52 L80 26 M58 52 L26 52 M46 26 L44 19 M38 19 L52 19 M80 26 L84 17 M84 17 L93 17"
          />
        </svg>
      </div>

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
