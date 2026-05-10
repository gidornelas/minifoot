import { CalendarDays, Gauge, Play, Trophy, WalletCards } from "lucide-react";
import { useMemo } from "react";
import { calculateLeagueTable } from "../../../engine";
import { useGameStore } from "../../../store/game.store";
import { formatCurrency, formatInteger } from "../../formatters";

export function HomeView() {
  const game = useGameStore((state) => state.game);
  const advanceRound = useGameStore((state) => state.advanceRound);
  const club = game.clubs[game.playerClubId];
  const league = Object.values(game.leagues)[0];
  const table = useMemo(
    () => (league ? calculateLeagueTable(league, Object.values(game.matches)) : []),
    [game.matches, league],
  );
  const playerRow = table.find((row) => row.clubId === game.playerClubId);
  const position = playerRow ? table.indexOf(playerRow) + 1 : 0;
  const upcomingMatch = Object.values(game.matches)
    .filter(
      (match) =>
        match.status === "scheduled" &&
        match.round >= game.currentSeason.currentWeek &&
        (match.homeId === game.playerClubId || match.awayId === game.playerClubId),
    )
    .sort((a, b) => a.round - b.round)[0];
  const opponentId =
    upcomingMatch?.homeId === game.playerClubId ? upcomingMatch.awayId : upcomingMatch?.homeId;
  const opponent = opponentId ? game.clubs[opponentId] : undefined;

  if (!club || !league) {
    return null;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatusTile
            icon={CalendarDays}
            label="Semana"
            value={`${game.currentSeason.currentWeek}/${game.currentSeason.totalWeeks}`}
          />
          <StatusTile icon={Trophy} label="Liga" value={position ? `${position}o` : "-"} />
          <StatusTile icon={Gauge} label="Reputacao" value={String(club.reputation)} />
          <StatusTile icon={WalletCards} label="Orcamento" value={formatCurrency(club.budget)} />
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-[330px] overflow-hidden rounded-sm border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs uppercase text-muted">Proximo compromisso</p>
              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-xl font-semibold">
                  {opponent ? `${club.shortName} vs ${opponent.shortName}` : league.name}
                </h2>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-accent px-3 text-sm font-semibold text-accent-contrast transition hover:bg-accent-hover"
                  onClick={advanceRound}
                  type="button"
                >
                  <Play aria-hidden="true" size={16} />
                  Avancar rodada
                </button>
              </div>
            </div>
            <div className="grid min-h-[250px] place-items-center bg-[linear-gradient(90deg,rgba(74,222,128,0.08)_1px,transparent_1px),linear-gradient(rgba(74,222,128,0.08)_1px,transparent_1px)] bg-[size:48px_48px] p-5">
              <div className="relative aspect-[16/10] w-full max-w-xl rounded-sm border border-pitch/60 bg-pitch/10">
                <div className="absolute inset-y-0 left-1/2 w-px bg-pitch/50" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-pill border border-pitch/50" />
                <div className="absolute left-4 top-1/2 h-28 w-16 -translate-y-1/2 border border-pitch/50" />
                <div className="absolute right-4 top-1/2 h-28 w-16 -translate-y-1/2 border border-pitch/50" />
                <div
                  className="absolute left-6 top-6 h-12 w-12 rounded-pill border-2"
                  style={{ borderColor: club.primaryColor }}
                />
                <div
                  className="absolute bottom-6 right-6 h-12 w-12 rounded-pill border-2"
                  style={{ borderColor: opponent?.primaryColor ?? "var(--pitch)" }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs uppercase text-muted">Top 5</p>
              <h2 className="mt-1 font-display text-xl font-semibold">Classificacao</h2>
            </div>
            <ol className="divide-y divide-border">
              {table.slice(0, 5).map((row, index) => {
                const rowClub = game.clubs[row.clubId];

                return (
                  <li
                    className="grid grid-cols-[32px_1fr_48px] gap-3 px-5 py-3 text-sm"
                    key={row.clubId}
                  >
                    <span className="font-mono text-muted">{index + 1}</span>
                    <span className="truncate">{rowClub?.shortName ?? row.clubId}</span>
                    <span className="text-right font-mono">{row.points}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </section>

      <aside className="rounded-sm border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs uppercase text-muted">Central</p>
          <h2 className="mt-1 font-display text-xl font-semibold">Noticias</h2>
        </div>
        <div className="divide-y divide-border">
          {game.newsLog.map((item) => (
            <article className="px-5 py-4" key={item.id}>
              <p className="font-mono text-xs text-muted">Semana {formatInteger(item.week)}</p>
              <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
              {item.body ? <p className="mt-2 text-sm text-muted">{item.body}</p> : null}
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

interface StatusTileProps {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}

function StatusTile({ icon: Icon, label, value }: StatusTileProps) {
  return (
    <div className="rounded-sm border border-border bg-surface px-4 py-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-ink-900 text-pitch">
        <Icon aria-hidden="true" size={18} />
      </div>
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
