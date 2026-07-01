import eventsData from "@/data/events.json";
import type { Event } from "./types";

// JSON を Event[] として型付け。将来 DB / API へ移行する場合はこの関数群の中身だけ差し替える。
const ALL_EVENTS = eventsData as Event[];

// 開催日（昇順）で並べた全イベント
export function getAllEvents(): Event[] {
  return [...ALL_EVENTS].sort((a, b) => a.date.localeCompare(b.date));
}

export function getEventById(id: string): Event | undefined {
  return ALL_EVENTS.find((e) => e.id === id);
}

export function getAllEventIds(): string[] {
  return ALL_EVENTS.map((e) => e.id);
}

// 開催日が「今日以降」かつ近い順の直近イベント
export function getUpcomingEvents(limit = 8, today = todayISO()): Event[] {
  return getAllEvents()
    .filter((e) => e.date >= today)
    .slice(0, limit);
}

// 同カテゴリ or 同エリアの関連イベント（自分を除く）
export function getRelatedEvents(event: Event, limit = 3): Event[] {
  const others = getAllEvents().filter((e) => e.id !== event.id);
  const sameCategory = others.filter((e) => e.category === event.category);
  const rest = others.filter((e) => e.category !== event.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
