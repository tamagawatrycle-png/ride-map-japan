"use client";

// 「出るかも」トグルボタン。エントリー検討中のイベントを localStorage に保存し、
// 締切が近づくと EntryReminder がポップアップで知らせる。
// カード内（Link の中）でも使うため、クリックはカード遷移に伝播させない。

import { useEffect, useState } from "react";
import { isMaybe, toggleMaybe, MAYBE_CHANGE_EVENT } from "@/lib/maybe";

export function MaybeButton({
  eventId,
  eventName,
  size = "sm",
}: {
  eventId: string;
  eventName: string;
  size?: "sm" | "md";
}) {
  // SSR では常に未登録表示 → マウント後に localStorage と同期（hydration mismatch 回避）
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isMaybe(eventId));
    sync();
    window.addEventListener(MAYBE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(MAYBE_CHANGE_EVENT, sync);
  }, [eventId]);

  const handle = () => setOn(toggleMaybe(eventId));

  return (
    <span
      role="button"
      tabIndex={0}
      className={`maybe${on ? " on" : ""}${size === "md" ? " md" : ""}`}
      aria-pressed={on}
      aria-label={`${eventName} を出るかもリストに${on ? "登録済み（タップで解除）" : "登録"}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handle();
        }
      }}
    >
      {/* ベル（リマインド）アイコン。登録中は塗り */}
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16h15L18 12.5V9a6 6 0 0 0-6-6z" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </svg>
      {on ? "出るかも中" : "出るかも"}
    </span>
  );
}
