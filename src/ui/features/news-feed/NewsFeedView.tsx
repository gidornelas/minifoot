import { Search, Star } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { NewsItem } from "../../../engine";
import { useGameStore } from "../../../store/game.store";
import { useHotkey } from "../../hotkeys/useHotkey";

type NewsFilter = "all" | "special" | NewsItem["type"];

const FILTERS: Array<{ value: NewsFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "special", label: "Especiais" },
  { value: "match", label: "Jogos" },
  { value: "transfer", label: "Mercado" },
  { value: "performance", label: "Performance" },
  { value: "injury", label: "Medico" },
  { value: "system", label: "Clube" },
];

export function NewsFeedView() {
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const activeView = useGameStore((state) => state.activeView);
  const newsLog = useGameStore((state) => state.game.newsLog);
  const filteredNews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return newsLog.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "special" ? item.importance === "special" : item.type === filter);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.body?.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, newsLog, query]);

  useHotkey("/", () => searchRef.current?.focus(), { enabled: activeView === "news" });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase text-muted">Central</p>
          <h2 className="font-display text-2xl font-semibold">Noticias</h2>
          <p className="mt-1 text-sm text-muted">
            {filteredNews.length} manchetes filtradas de {newsLog.length}
          </p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Buscar noticia</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={18}
          />
          <input
            className="h-11 w-full rounded-sm border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-faint"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar noticia"
            ref={searchRef}
            type="search"
            value={query}
          />
        </label>
      </div>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filtrar noticias</legend>
        {FILTERS.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={`min-h-10 rounded-sm border px-3 text-sm transition ${
              filter === item.value
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border text-muted hover:border-border-strong hover:text-foreground"
            }`}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </fieldset>

      <div className="grid gap-3 xl:grid-cols-2">
        {filteredNews.map((item) => (
          <NewsCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

interface NewsCardProps {
  item: NewsItem;
}

function NewsCard({ item }: NewsCardProps) {
  const special = item.importance === "special";

  return (
    <article
      className={`rounded-sm border bg-surface px-5 py-4 ${
        special ? "border-whistle shadow-[inset_3px_0_0_var(--whistle)]" : "border-border"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase text-muted">Semana {item.week}</p>
        {special ? (
          <span className="inline-flex items-center gap-1 rounded-xs bg-whistle px-2 py-1 text-2xs font-semibold uppercase text-warn-contrast">
            <Star aria-hidden="true" size={12} />
            Destaque
          </span>
        ) : null}
      </div>
      <h3 className="font-display text-lg font-semibold">{item.title}</h3>
      {item.body ? <p className="mt-2 text-sm text-muted">{item.body}</p> : null}
      {item.tags && item.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              className="rounded-xs border border-border px-2 py-1 font-mono text-3xs text-muted"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
