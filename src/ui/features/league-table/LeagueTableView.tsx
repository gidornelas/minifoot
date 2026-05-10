import { Search } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { calculateLeagueTable } from "../../../engine";
import { useGameStore } from "../../../store/game.store";
import { useHotkey } from "../../hotkeys/useHotkey";

type TableFilter = "all" | "top" | "continental" | "relegation" | "mine";

const FILTERS: Array<{ value: TableFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "top", label: "G-4" },
  { value: "continental", label: "G-6" },
  { value: "relegation", label: "Z-4" },
  { value: "mine", label: "Meu clube" },
];

export function LeagueTableView() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TableFilter>("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const activeView = useGameStore((state) => state.activeView);
  const game = useGameStore((state) => state.game);
  const advanceRound = useGameStore((state) => state.advanceRound);
  const league = Object.values(game.leagues)[0];
  const rows = useMemo(() => {
    if (!league) {
      return [];
    }

    const baseRows = calculateLeagueTable(league, Object.values(game.matches)).map(
      (row, index) => ({
        ...row,
        position: index + 1,
      }),
    );
    const normalizedQuery = query.trim().toLowerCase();

    return baseRows.filter((row) => {
      const club = game.clubs[row.clubId];
      const matchesQuery =
        normalizedQuery.length === 0 ||
        club?.name.toLowerCase().includes(normalizedQuery) ||
        club?.shortName.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) {
        return false;
      }

      if (filter === "top") {
        return row.position <= 4;
      }

      if (filter === "continental") {
        return row.position <= 6;
      }

      if (filter === "relegation") {
        return row.position > baseRows.length - 4;
      }

      if (filter === "mine") {
        return row.clubId === game.playerClubId;
      }

      return true;
    });
  }, [filter, game.clubs, game.matches, game.playerClubId, league, query]);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const cycleFilter = useCallback(() => {
    setFilter((current) => {
      const index = FILTERS.findIndex((item) => item.value === current);
      const next = FILTERS[(index + 1) % FILTERS.length];

      return next?.value ?? "all";
    });
  }, []);

  useHotkey("/", focusSearch, { enabled: activeView === "table" });
  useHotkey("f", cycleFilter, { enabled: activeView === "table" });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase text-muted">Classificacao</p>
          <h2 className="font-display text-2xl font-semibold">{league?.name ?? "Liga"}</h2>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block w-full min-w-64">
            <span className="sr-only">Buscar clube</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={18}
            />
            <input
              className="h-11 w-full rounded-sm border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-faint"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar clube"
              ref={searchRef}
              type="search"
              value={query}
            />
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Filtros da tabela</legend>
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
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Clube</th>
                <th className="px-4 py-3 text-right font-medium">J</th>
                <th className="px-4 py-3 text-right font-medium">V</th>
                <th className="px-4 py-3 text-right font-medium">E</th>
                <th className="px-4 py-3 text-right font-medium">D</th>
                <th className="px-4 py-3 text-right font-medium">GP</th>
                <th className="px-4 py-3 text-right font-medium">GC</th>
                <th className="px-4 py-3 text-right font-medium">SG</th>
                <th className="px-4 py-3 text-right font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const club = game.clubs[row.clubId];
                const isPlayerClub = row.clubId === game.playerClubId;

                return (
                  <tr
                    className={`border-t border-border ${
                      isPlayerClub ? "bg-pitch/10 text-foreground" : ""
                    }`}
                    key={row.clubId}
                  >
                    <td className="px-4 py-3 font-mono text-muted">{row.position}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{club?.name ?? row.clubId}</span>
                      <span className="ml-2 font-mono text-xs text-muted">{club?.shortName}</span>
                    </td>
                    <StatCell value={row.played} />
                    <StatCell value={row.wins} />
                    <StatCell value={row.draws} />
                    <StatCell value={row.losses} />
                    <StatCell value={row.goalsFor} />
                    <StatCell value={row.goalsAgainst} />
                    <StatCell value={row.goalDifference} />
                    <StatCell strong value={row.points} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-border px-4 py-4">
          <button
            className="min-h-11 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-contrast transition hover:bg-accent-hover"
            onClick={advanceRound}
            type="button"
          >
            Avancar rodada
          </button>
        </div>
      </div>
    </section>
  );
}

interface StatCellProps {
  value: number;
  strong?: boolean;
}

function StatCell({ value, strong = false }: StatCellProps) {
  return (
    <td className={`px-4 py-3 text-right font-mono ${strong ? "font-bold text-pitch" : ""}`}>
      {value}
    </td>
  );
}
