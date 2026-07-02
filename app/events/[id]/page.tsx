import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllEventIds, getEventById, getRelatedEvents } from "@/lib/events";
import { CATEGORIES, DIFFICULTY_LABELS } from "@/lib/categories";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EventCard } from "@/components/EventCard";
import { formatEventDate, formatDateJP, daysUntil } from "@/lib/format";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return getAllEventIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return { title: "イベントが見つかりません" };
  return {
    title: event.name,
    description: event.description.slice(0, 110),
    openGraph: {
      title: `${event.name} | STEP & RIDE`,
      description: event.description.slice(0, 110),
      type: "article",
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const related = getRelatedEvents(event, 3);
  const left = event.entryDeadline ? daysUntil(event.entryDeadline) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="mb-5 text-sm" style={{ color: "var(--sub)" }} aria-label="パンくず">
        <Link href="/">トップ</Link>
        <span className="px-1.5">/</span>
        <Link href="/events">イベント一覧</Link>
        <span className="px-1.5">/</span>
        <span style={{ color: "var(--ink)" }}>{event.name}</span>
      </nav>

      {/* 基本情報 */}
      <header className="border-l-4 pl-4" style={{ borderColor: "var(--accent)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={event.category} size="md" />
          {event.difficulty && (
            <span
              className="rounded-full border px-3 py-1 text-sm"
              style={{ borderColor: "var(--line2)", background: "#fff", color: "var(--ink)" }}
            >
              {DIFFICULTY_LABELS[event.difficulty]}
            </span>
          )}
          {event.editorAttended && (
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                border: "1px solid var(--accent-mid)",
                background: "var(--accent-weak)",
                color: "var(--accent-strong)",
              }}
            >
              編集部 出走経験あり
            </span>
          )}
        </div>
        <h1
          className="mt-3 text-2xl font-bold leading-tight sm:text-4xl"
          style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
        >
          {event.name}
        </h1>
      </header>

      <dl
        className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3"
        style={{ borderColor: "var(--line)", background: "var(--line)" }}
      >
        <Spec label="開催日" value={formatEventDate(event.date, event.dateEnd)} />
        <Spec label="開催地" value={event.location} />
        <Spec label="距離" value={event.distance} />
        <Spec label="獲得標高" value={event.elevation} />
        <Spec label="定員" value={event.capacity} />
        <Spec label="参加費" value={event.fee} />
      </dl>

      {event.tags && event.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {event.tags.map((t) => (
            <span
              key={t}
              className="rounded-md px-2.5 py-1 text-xs"
              style={{ background: "var(--bg2)", color: "var(--sub)" }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 編集部コメント */}
      {event.editorComment && (
        <section
          className="mt-8 rounded-xl p-5"
          style={{ border: "1px solid var(--accent-mid)", background: "var(--accent-weak)" }}
        >
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
              aria-hidden
            >
              編
            </span>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
                編集部コメント
              </h2>
              <p className="text-xs" style={{ color: "#8a5c48" }}>
                STEP &amp; RIDE 編集部 / TRYCLE
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#3a2317" }}>
            {event.editorComment}
          </p>
          {event.editorAttended && (
            <p className="mt-2 text-xs" style={{ color: "var(--accent-strong)" }}>
              ✓ この大会に出走したことがあります
            </p>
          )}
        </section>
      )}

      {/* イベント概要 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>
          イベント概要
        </h2>
        <p
          className="mt-3 whitespace-pre-line text-sm leading-relaxed"
          style={{ color: "#3a3d42" }}
        >
          {event.description}
        </p>
      </section>

      {/* エントリーCTA */}
      <section
        className="mt-8 rounded-xl p-5 text-center"
        style={{ border: "1px solid var(--line)", background: "var(--bg2)" }}
      >
        {event.entryDeadline && (
          <p className="text-sm" style={{ color: "var(--sub)" }}>
            エントリー締切：
            <span className="tabnum font-semibold" style={{ color: "var(--accent-strong)" }}>
              {formatDateJP(event.entryDeadline)}
            </span>
            {left !== null && left >= 0 && (
              <span className="tabnum" style={{ color: "var(--accent-strong)" }}>
                {" "}
                （あと{left}日）
              </span>
            )}
            {left !== null && left < 0 && (
              <span style={{ color: "var(--faint)" }}>
                （締切を過ぎている可能性があります）
              </span>
            )}
          </p>
        )}
        <a
          href={event.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-3"
          style={{ padding: "12px 26px", fontSize: 15 }}
          aria-label={`${event.name} の公式サイトでエントリーする（新しいタブで開く）`}
        >
          公式サイトでエントリーする →
        </a>
        <p className="mt-3 text-xs" style={{ color: "var(--faint)" }}>
          ※ 外部の公式サイトが新しいタブで開きます。最新情報は必ず公式でご確認ください。
        </p>
      </section>

      {/* 関連イベント */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--ink)" }}>
            関連イベント
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  return (
    <div className="px-4 py-3" style={{ background: "#fff" }}>
      <dt className="text-xs" style={{ color: "var(--sub)" }}>
        {label}
      </dt>
      <dd
        className="tabnum mt-0.5 text-sm font-medium"
        style={{ color: "var(--ink)" }}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
