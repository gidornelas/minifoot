import { Medal, Shield, Star, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useGameStore } from "../../../store/game.store";
import { formatInteger } from "../../formatters";

export function RecordsView() {
  const game = useGameStore((state) => state.game);
  const records = game.records;
  const champions = useMemo(
    () =>
      Object.entries(records?.titleCounts ?? {})
        .map(([clubId, titles]) => ({ club: game.clubs[clubId], clubId, titles }))
        .sort((a, b) => b.titles - a.titles || a.clubId.localeCompare(b.clubId)),
    [game.clubs, records?.titleCounts],
  );
  const topScorer = records?.topScorer?.playerId
    ? game.players[records.topScorer.playerId]
    : undefined;
  const highestPointsClub = records?.highestPoints?.clubId
    ? game.clubs[records.highestPoints.clubId]
    : undefined;
  const mostGoalsClub = records?.mostGoalsFor?.clubId
    ? game.clubs[records.mostGoalsFor.clubId]
    : undefined;
  const bestDefenseClub = records?.bestDefense?.clubId
    ? game.clubs[records.bestDefense.clubId]
    : undefined;

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase text-muted">Memoria</p>
        <h2 className="font-display text-2xl font-semibold">Historico e recordes</h2>
        <p className="mt-1 text-sm text-muted">
          {game.history.length} temporadas arquivadas na carreira.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <RecordCard
          icon={Trophy}
          label="Maior pontuacao"
          meta={records?.highestPoints ? `Temporada ${records.highestPoints.season}` : "Sem marca"}
          title={highestPointsClub?.shortName ?? "--"}
          value={records?.highestPoints ? formatInteger(records.highestPoints.value) : "--"}
        />
        <RecordCard
          icon={Star}
          label="Artilharia"
          meta={records?.topScorer ? `Temporada ${records.topScorer.season}` : "Sem marca"}
          title={topScorer ? `${topScorer.firstName} ${topScorer.lastName}` : "--"}
          value={records?.topScorer ? formatInteger(records.topScorer.value) : "--"}
        />
        <RecordCard
          icon={Medal}
          label="Melhor ataque"
          meta={records?.mostGoalsFor ? `Temporada ${records.mostGoalsFor.season}` : "Sem marca"}
          title={mostGoalsClub?.shortName ?? "--"}
          value={records?.mostGoalsFor ? formatInteger(records.mostGoalsFor.value) : "--"}
        />
        <RecordCard
          icon={Shield}
          label="Melhor defesa"
          meta={records?.bestDefense ? `Temporada ${records.bestDefense.season}` : "Sem marca"}
          title={bestDefenseClub?.shortName ?? "--"}
          value={records?.bestDefense ? formatInteger(records.bestDefense.value) : "--"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-lg font-semibold">Temporadas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead className="bg-ink-900 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Temp.</th>
                  <th className="px-4 py-3 text-left font-medium">Campeao</th>
                  <th className="px-4 py-3 text-right font-medium">Pts</th>
                  <th className="px-4 py-3 text-left font-medium">Artilheiro</th>
                  <th className="px-4 py-3 text-right font-medium">Gols</th>
                  <th className="px-4 py-3 text-right font-medium">Meu clube</th>
                </tr>
              </thead>
              <tbody>
                {game.history.length > 0 ? (
                  [...game.history].reverse().map((record) => {
                    const champion = record.championClubId
                      ? game.clubs[record.championClubId]
                      : undefined;
                    const scorer = record.topScorerPlayerId
                      ? game.players[record.topScorerPlayerId]
                      : undefined;

                    return (
                      <tr className="border-t border-border" key={record.season}>
                        <td className="px-4 py-3 font-mono text-muted">{record.season}</td>
                        <td className="px-4 py-3 font-semibold">
                          {champion?.name ?? record.championClubId ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {record.championPoints ?? "--"}
                        </td>
                        <td className="px-4 py-3">
                          {scorer ? `${scorer.firstName} ${scorer.lastName}` : "--"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {record.topScorerGoals ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {record.playerClubPosition ? `${record.playerClubPosition}o` : "--"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-sm text-muted" colSpan={6}>
                      Nenhuma temporada concluida ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-lg font-semibold">Titulos</h3>
          </div>
          <div className="divide-y divide-border">
            {champions.length > 0 ? (
              champions.map((entry) => (
                <article
                  className="flex items-center justify-between gap-3 px-5 py-4"
                  key={entry.clubId}
                >
                  <span className="font-semibold">{entry.club?.name ?? entry.clubId}</span>
                  <span className="font-mono text-sm text-pitch">{entry.titles}</span>
                </article>
              ))
            ) : (
              <p className="px-5 py-4 text-sm text-muted">A sala de trofeus ainda esta vazia.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

interface RecordCardProps {
  icon: typeof Trophy;
  label: string;
  meta: string;
  title: string;
  value: string;
}

function RecordCard({ icon: Icon, label, meta, title, value }: RecordCardProps) {
  return (
    <article className="rounded-sm border border-border bg-surface px-5 py-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-pitch/15 text-pitch">
        <Icon aria-hidden="true" size={20} />
      </div>
      <p className="font-mono text-xs uppercase text-muted">{label}</p>
      <h3 className="mt-1 truncate font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 font-mono text-xl text-pitch">{value}</p>
      <p className="mt-1 text-sm text-muted">{meta}</p>
    </article>
  );
}
