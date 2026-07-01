import { CATEGORIES } from "@/lib/categories";
import type { EventCategory } from "@/lib/types";

export function CategoryBadge({
  category,
  size = "sm",
}: {
  category: EventCategory;
  size?: "sm" | "md";
}) {
  const meta = CATEGORIES[category];
  const pad = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${pad}`}
      style={{
        color: meta.color,
        backgroundColor: `${meta.color}1f`, // ~12% alpha
        border: `1px solid ${meta.color}55`,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}
