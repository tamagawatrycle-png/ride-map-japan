"use client";

// ABEMA風の固定ボトムナビ（モバイルのみ表示）。
// ホーム / チップス / YouTube / ショップ / マイページ の5タブ。
// YouTube・ショップは外部リンク（TRYCLE公式チャンネル・BASEショップ）。

import Link from "next/link";
import { usePathname } from "next/navigation";

const YT_URL = "https://www.youtube.com/@trycle";
const SHOP_URL = "https://trycle.thebase.in/";

type Tab = {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  /** アクティブ判定（外部リンクは常に false） */
  match?: (path: string) => boolean;
};

const stroke = {
  fill: "none",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/",
    match: (p) => p === "/" || p.startsWith("/events"),
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M3.5 10.5 12 3.5l8.5 7" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.8 20v-6h4.4v6" />
      </svg>
    ),
  },
  {
    key: "tips",
    label: "チップス",
    href: "/tips",
    match: (p) => p.startsWith("/tips"),
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3a6.5 6.5 0 0 0-3.6 11.9c.7.5 1.1 1.2 1.1 2V18h5v-1.1c0-.8.4-1.5 1.1-2A6.5 6.5 0 0 0 12 3z" />
        <path d="M9.8 21h4.4" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    href: YT_URL,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <rect x="2.8" y="6" width="18.4" height="13" rx="3.4" />
        <path d="M10.2 9.6v5.8l5-2.9z" />
      </svg>
    ),
  },
  {
    key: "shop",
    label: "ショップ",
    href: SHOP_URL,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M5.5 8h13l-1 12h-11z" />
        <path d="M9 10.5V6.8a3 3 0 0 1 6 0v3.7" />
      </svg>
    ),
  },
  {
    key: "me",
    label: "マイページ",
    href: "/me",
    match: (p) => p.startsWith("/me"),
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="8.2" r="3.4" />
        <path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomnav" aria-label="メインメニュー">
      {TABS.map((t) => {
        const active = !t.external && (t.match?.(pathname) ?? false);
        const cls = `bn-item${active ? " on" : ""}`;
        return t.external ? (
          <a
            key={t.key}
            className={cls}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.icon}
            <span>{t.label}</span>
          </a>
        ) : (
          <Link
            key={t.key}
            className={cls}
            href={t.href}
            aria-current={active ? "page" : undefined}
          >
            {t.icon}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
