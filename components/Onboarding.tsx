"use client";

// ABEMA型オンボーディング：3問（乗り方 / エリア / レベル）→ プロフィール保存。
// 初回訪問時に自動表示（スプラッシュ後）。スキップ可。
// マイページ等から ONBOARD_OPEN_EVENT で再表示できる（回答の編集）。

import { useEffect, useState } from "react";
import type { Difficulty } from "@/lib/types";
import { DIFFICULTY_LABELS, type Area } from "@/lib/categories";
import {
  PROFILE_CATS,
  PROFILE_AREAS,
  type ProfileCat,
  getProfile,
  saveProfile,
  onboardSeen,
  markOnboardSeen,
  ONBOARD_OPEN_EVENT,
} from "@/lib/profile";

const LEVELS: { k: Difficulty | null; label: string }[] = [
  { k: "beginner", label: DIFFICULTY_LABELS.beginner },
  { k: "intermediate", label: DIFFICULTY_LABELS.intermediate },
  { k: "advanced", label: DIFFICULTY_LABELS.advanced },
  { k: null, label: "どれでも" },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [cats, setCats] = useState<ProfileCat[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [level, setLevel] = useState<Difficulty | null>(null);

  // 初回訪問時に自動表示（スプラッシュが消えた頃合いで）
  useEffect(() => {
    if (onboardSeen()) return;
    const t = setTimeout(() => setOpen(true), 1600);
    return () => clearTimeout(t);
  }, []);

  // 再表示イベント（マイページの「回答を編集」等）
  useEffect(() => {
    const reopen = () => {
      const p = getProfile();
      if (p) {
        setCats(p.cats);
        setAreas(p.areas);
        setLevel(p.level);
      }
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(ONBOARD_OPEN_EVENT, reopen);
    return () => window.removeEventListener(ONBOARD_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  // 関数型更新：連続クリックでも選択が失われないように
  const toggle = <T,>(v: T, set: React.Dispatch<React.SetStateAction<T[]>>) =>
    set((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );

  const skip = () => {
    markOnboardSeen();
    setOpen(false);
  };
  const finish = () => {
    saveProfile({ cats, areas, level });
    setOpen(false);
  };

  const steps = [
    {
      q: "どんな走り方が好きですか？",
      hint: "複数選択できます",
      body: (
        <div className="ob-chips">
          {PROFILE_CATS.map((c) => (
            <button
              key={c.k}
              className={`chip${cats.includes(c.k) ? " on" : ""}`}
              onClick={() => toggle(c.k, setCats)}
            >
              {c.label}
            </button>
          ))}
        </div>
      ),
      ok: cats.length > 0,
    },
    {
      q: "走りに行けるエリアは？",
      hint: "複数選択できます",
      body: (
        <div className="ob-chips">
          {PROFILE_AREAS.map((a) => (
            <button
              key={a}
              className={`chip${areas.includes(a) ? " on" : ""}`}
              onClick={() => toggle(a, setAreas)}
            >
              {a}
            </button>
          ))}
        </div>
      ),
      ok: areas.length > 0,
    },
    {
      q: "レベル感は？",
      hint: "あとからマイページで変更できます",
      body: (
        <div className="ob-chips">
          {LEVELS.map((l) => (
            <button
              key={String(l.k)}
              className={`chip${level === l.k ? " on" : ""}`}
              onClick={() => setLevel(l.k)}
            >
              {l.label}
            </button>
          ))}
        </div>
      ),
      ok: true,
    },
  ];

  const cur = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="ob-overlay" role="dialog" aria-label="はじめての設定">
      <div className="ob-card">
        <div className="ob-head">
          <span className="kicker">Personalize</span>
          <h2>{cur.q}</h2>
          <p>{cur.hint}</p>
        </div>

        {cur.body}

        <div className="ob-dots" aria-hidden>
          {steps.map((_, i) => (
            <i key={i} className={i === step ? "on" : ""} />
          ))}
        </div>

        <div className="ob-foot">
          <button className="ob-skip" onClick={skip}>
            スキップ
          </button>
          <div className="ob-nav">
            {step > 0 && (
              <button className="ob-back" onClick={() => setStep(step - 1)}>
                戻る
              </button>
            )}
            <button
              className="btn"
              disabled={!cur.ok}
              onClick={() => (last ? finish() : setStep(step + 1))}
            >
              {last ? "この内容ではじめる" : "次へ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
