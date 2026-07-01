"use client";

import dynamic from "next/dynamic";
import type { Event } from "@/lib/types";

// Leaflet は SSR 不可（window 依存）→ Client Component 内で ssr:false（既存パターン踏襲）
const TileMap = dynamic(() => import("./TileMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--faint)", background: "var(--sea)" }}
    >
      地図を読み込み中…
    </div>
  ),
});

export function MapSection({ events }: { events: Event[] }) {
  return (
    <div className="lmap">
      <TileMap events={events} />
    </div>
  );
}
