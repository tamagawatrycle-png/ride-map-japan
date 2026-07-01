"use client";

// ベクター日本地図（都道府県境 GeoJSON × 緯度経度ピン）
// 承認済みモック /tmp/ridemap-mock/index.html の <svg id="map"> レンダラーを React 化。
// - fetch('/japan.min.json') → cos(37°) で経度圧縮して矩形フィット投影
// - 本土は主エリア、沖縄は右下インセットへ振り分け
// - 都道府県は「location に県名を含むイベント数」でコロプレス着色
// - イベント lat/lng に橙ピン（featured はリング付き）
// - pref / pin ホバーで tooltip、pin ホバーで activeId を通じてカードと相互ハイライト

import { useEffect, useMemo, useRef, useState } from "react";
import type { Event } from "@/lib/types";
import { catLabel, shortDate } from "@/lib/ui";

type Feature = {
  properties: { name: string };
  geometry: { coordinates: number[][][][] }; // MultiPolygon
};

const K = Math.cos((37 * Math.PI) / 180); // 経度圧縮（緯度37°基準）で横伸び補正
const W = 600;
const H = 680;
const INS = { x: 14, y: H - 120, w: 120, h: 106 };

const REGIONS = [
  { n: "北海道", lat: 43.5, lng: 142.9 },
  { n: "東北", lat: 39.6, lng: 140.7 },
  { n: "関東", lat: 36.1, lng: 140.4 },
  { n: "中部", lat: 36.6, lng: 137.3 },
  { n: "近畿", lat: 34.3, lng: 135.9 },
  { n: "中国", lat: 35.1, lng: 132.3 },
  { n: "四国", lat: 33.55, lng: 133.4 },
  { n: "九州", lat: 32.2, lng: 130.6 },
];

type Proj = (ln: number, la: number) => [number, number];

// [lng,lat] 群を矩形にフィットする投影関数を返す
function fitLL(
  pts: number[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  pad: number,
): Proj {
  let mnx = 1e9,
    mny = 1e9,
    mxx = -1e9,
    mxy = -1e9;
  for (const [ln, la] of pts) {
    const x = ln * K,
      y = -la;
    if (x < mnx) mnx = x;
    if (x > mxx) mxx = x;
    if (y < mny) mny = y;
    if (y > mxy) mxy = y;
  }
  const bw = x1 - x0 - 2 * pad,
    bh = y1 - y0 - 2 * pad,
    s = Math.min(bw / (mxx - mnx), bh / (mxy - mny));
  const ox = x0 + pad + (bw - (mxx - mnx) * s) / 2,
    oy = y0 + pad + (bh - (mxy - mny) * s) / 2;
  return (ln, la) => [ox + (ln * K - mnx) * s, oy + (-la - mny) * s];
}

function ringPath(ring: number[][], proj: Proj): string {
  return (
    "M" +
    ring
      .map(([ln, la]) => {
        const [x, y] = proj(ln, la);
        return `${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join("L") +
    "Z"
  );
}

// イベント数 → 橙のコロプレス濃度
function tintFor(c: number): string {
  return c
    ? `rgba(233,98,46,${Math.min(0.1 + c * 0.085, 0.42).toFixed(3)})`
    : "var(--land)";
}

type Tip = { x: number; y: number; html: string } | null;

export default function JapanMap({
  events,
  activeId,
  onHover,
}: {
  events: Event[];
  activeId: string | null;
  onHover: (id: string | null) => void;
}) {
  const [feats, setFeats] = useState<Feature[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tip, setTip] = useState<Tip>(null);
  const [hotPref, setHotPref] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/japan.min.json")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setFeats(d.features as Feature[]);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 投影関数（本土 / 沖縄）は GeoJSON 読み込み後に一度だけ構築
  const proj = useMemo(() => {
    if (!feats) return null;
    const mainPts: number[][] = [];
    const okiPts: number[][] = [];
    for (const f of feats) {
      const oki = f.properties.name === "沖縄県";
      for (const pg of f.geometry.coordinates)
        for (const pt of pg[0]) (oki ? okiPts : mainPts).push(pt);
    }
    const pMain = fitLL(mainPts, 0, 0, W, INS.y - 8, 18);
    const pOki = fitLL(okiPts, INS.x, INS.y, INS.x + INS.w, INS.y + INS.h, 12);
    // 緯度で本土/沖縄インセットへ振り分け（ピン用）
    const projLL: Proj = (ln, la) => (la < 30 ? pOki(ln, la) : pMain(ln, la));
    return { pMain, pOki, projLL };
  }, [feats]);

  // 都道府県ごとのイベント数
  const prefCount = useMemo(() => {
    const m = new Map<string, number>();
    if (!feats) return m;
    for (const f of feats) {
      const name = f.properties.name;
      m.set(name, events.filter((e) => e.location.includes(name)).length);
    }
    return m;
  }, [feats, events]);

  function showTipAt(x: number, y: number, html: string) {
    setTip({ x, y, html });
  }

  if (failed) {
    return (
      <div className="mappanel" style={{ padding: 24 }}>
        <p style={{ color: "var(--faint)", fontSize: 13, margin: 0 }}>
          地図データ（japan.min.json）を読み込めませんでした。
        </p>
      </div>
    );
  }

  return (
    <div className="mappanel">
      <svg
        ref={svgRef}
        className="jp"
        viewBox={`0 0 ${W} ${H}`}
        aria-label="日本地図"
      >
        {proj &&
          feats!.map((f) => {
            const name = f.properties.name;
            const p = name === "沖縄県" ? proj.pOki : proj.pMain;
            const c = prefCount.get(name) ?? 0;
            const hot = hotPref === name;
            return f.geometry.coordinates.map((pg, i) => (
              <path
                key={`${name}-${i}`}
                className={`pref${hot ? " hot" : ""}`}
                style={{ fill: hot ? undefined : tintFor(c) }}
                d={ringPath(pg[0], p)}
                onMouseEnter={(e) => {
                  setHotPref(name);
                  const box = (
                    e.currentTarget as SVGPathElement
                  ).getBBox();
                  showTipAt(
                    box.x + box.width / 2,
                    box.y + box.height / 2,
                    `${name}${c ? ` ・ <span style="color:#f4b79a">${c}件</span>` : ""}`,
                  );
                }}
                onMouseLeave={() => {
                  setHotPref(null);
                  setTip(null);
                }}
              />
            ));
          })}

        {/* 地方ラベル */}
        {proj &&
          REGIONS.map((r) => {
            const [x, y] = proj.pMain(r.lng, r.lat);
            return (
              <text
                key={r.n}
                className="rlabel"
                x={x.toFixed(0)}
                y={y.toFixed(0)}
              >
                {r.n}
              </text>
            );
          })}

        {/* 沖縄インセット枠 */}
        {proj && (
          <>
            <rect
              className="inset-box"
              x={INS.x}
              y={INS.y}
              width={INS.w}
              height={INS.h}
              rx={8}
            />
            <text
              className="inset-label"
              x={INS.x + 8}
              y={INS.y + 16}
            >
              沖縄
            </text>
          </>
        )}

        {/* イベントピン */}
        {proj &&
          events.map((ev) => {
            const [x, y] = proj.projLL(ev.lng, ev.lat);
            const active = activeId === ev.id;
            return (
              <g
                key={ev.id}
                className={`pin${active ? " active" : ""}`}
                transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
                onMouseEnter={() => {
                  onHover(ev.id);
                  showTipAt(
                    x,
                    y,
                    `<span class="c">${catLabel(ev.category)}</span><br/>${ev.name}<br/><span style="color:#c9c9c9">${shortDate(ev.date)} ・ ${ev.location}</span>`,
                  );
                }}
                onMouseLeave={() => {
                  onHover(null);
                  setTip(null);
                }}
              >
                {ev.featured && <circle className="ring" r={8.5} />}
                <circle className="dot" r={ev.featured ? 5.4 : 4.4} />
              </g>
            );
          })}
      </svg>

      <div className="maplegend">
        <b className="tabnum">{events.length}</b> 件のイベント
      </div>

      {tip && (
        <div
          className="maptip"
          style={{
            left: `${(tip.x / W) * 100}%`,
            top: `${(tip.y / H) * 100}%`,
            opacity: 1,
          }}
          dangerouslySetInnerHTML={{ __html: tip.html }}
        />
      )}
    </div>
  );
}
