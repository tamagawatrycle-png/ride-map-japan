"use client";

import { useMemo, useState } from "react";
import type { Event, EventCategory, Difficulty } from "@/lib/types";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  DIFFICULTY_LABELS,
  AREA_ORDER,
  areaFromLocation,
  type Area,
} from "@/lib/categories";
import { EventCard } from "./EventCard";

type Sort = "date" | "deadline" | "featured";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

const SORT_LABELS: Record<Sort, string> = {
  date: "開催日が近い順",
  deadline: "エントリー締切が近い順",
  featured: "編集部おすすめ順",
};

export function EventsExplorer({ events }: { events: Event[] }) {
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [month, setMonth] = useState<number | "all">("all");
  const [area, setArea] = useState<Area | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [sort, setSort] = useState<Sort>("date");

  const filtered = useMemo(() => {
    const list = events.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (month !== "all" && Number(e.date.slice(5, 7)) !== month) return false;
      if (area !== "all" && areaFromLocation(e.location) !== area) return false;
      if (difficulty !== "all" && e.difficulty !== difficulty) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sort === "deadline") {
        const ad = a.entryDeadline ?? "9999-12-31";
        const bd = b.entryDeadline ?? "9999-12-31";
        return ad.localeCompare(bd);
      }
      if (sort === "featured") {
        const score = (e: Event) => (e.featured ? 0 : e.editorComment ? 1 : 2);
        const diff = score(a) - score(b);
        return diff !== 0 ? diff : a.date.localeCompare(b.date);
      }
      return a.date.localeCompare(b.date);
    });
  }, [events, category, month, area, difficulty, sort]);

  const hasFilter =
    category !== "all" || month !== "all" || area !== "all" || difficulty !== "all";

  const reset = () => {
    setCategory("all");
    setMonth("all");
    setArea("all");
    setDifficulty("all");
  };

  return (
    <div>
      {/* フィルター */}
      <div className="card p-4 sm:p-5" style={{ background: "#fff" }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="カテゴリ">
            <Select
              value={category}
              onChange={(v) => setCategory(v as EventCategory | "all")}
              ariaLabel="カテゴリで絞り込む"
              options={[
                { value: "all", label: "すべて" },
                ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORIES[c].label })),
              ]}
            />
          </Field>
          <Field label="開催月">
            <Select
              value={String(month)}
              onChange={(v) => setMonth(v === "all" ? "all" : Number(v))}
              ariaLabel="開催月で絞り込む"
              options={[
                { value: "all", label: "すべて" },
                ...MONTHS.map((m) => ({ value: String(m), label: `${m}月` })),
              ]}
            />
          </Field>
          <Field label="エリア">
            <Select
              value={area}
              onChange={(v) => setArea(v as Area | "all")}
              ariaLabel="エリアで絞り込む"
              options={[
                { value: "all", label: "すべて" },
                ...AREA_ORDER.map((a) => ({ value: a, label: a })),
              ]}
            />
          </Field>
          <Field label="難易度">
            <Select
              value={difficulty}
              onChange={(v) => setDifficulty(v as Difficulty | "all")}
              ariaLabel="難易度で絞り込む"
              options={[
                { value: "all", label: "すべて" },
                ...DIFFICULTIES.map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] })),
              ]}
            />
          </Field>
        </div>
      </div>

      {/* ソート + 件数 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="tabnum text-sm" style={{ color: "var(--sub)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>
            {filtered.length}
          </span>{" "}
          件
          {hasFilter && (
            <button
              onClick={reset}
              className="ml-3 text-xs hover:underline"
              style={{ color: "var(--accent)" }}
            >
              フィルターをリセット
            </button>
          )}
        </p>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--sub)" }}>
          並び替え
          <Select
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            ariaLabel="並び替え"
            options={(Object.keys(SORT_LABELS) as Sort[]).map((s) => ({
              value: s,
              label: SORT_LABELS[s],
            }))}
          />
        </label>
      </div>

      {/* 一覧 */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div
          className="mt-10 rounded-xl border border-dashed p-10 text-center"
          style={{ borderColor: "var(--line2)" }}
        >
          <p className="text-sm" style={{ color: "var(--sub)" }}>
            条件に合うイベントが見つかりませんでした。
          </p>
          <button
            onClick={reset}
            className="mt-3 text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            フィルターをリセットする
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium" style={{ color: "var(--sub)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="rounded-md border px-3 py-2 text-sm outline-none transition-colors"
      style={{
        borderColor: "var(--line2)",
        background: "#fff",
        color: "var(--ink)",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
