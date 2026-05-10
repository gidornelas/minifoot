import { Award, CalendarPlus, ShieldAlert, Sparkles, Trophy, UserMinus } from "lucide-react";
import { useMemo } from "react";
import { useGameStore } from "../../../store/game.store";
import { formatInteger } from "../../formatters";
import { useHotkey } from "../../hotkeys/useHotkey";

export function SeasonEndView() {
  const activeView = useGameStore((state) => state.activeView);
  const game = useGameStore((state) => state.game);
  const startNextSeason = useGameStore((state) => state.startNextSeason);
  const record = game.history.at(-1);
  const champion = record?.championClubId ? game.clubs[record.championClubId] : undefined;
  const playerClub = game.clubs[game.playerClubId];
  const promotedClubs = useMemo(
    () => record?.promotedClubIds?.map((clubId) => game.clubs[clubId]).filter(Boolean) ?? [],
    [game.clubs, record?.promotedClubIds],
  );
  const relegatedClubs = useMemo(
    () => record?.relegatedClubIds?.map((clubId) => game.clubs[clubId]).filter(Boolean) ?? [],
    [game.clubs, record?.relegatedClubIds],
  );

  useHotkey("enter", startNextSeason, {
    enableOnFormTags: true,
    enabled: activeView === "season-end",
  });

  if (!record) {
    return (
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Fim de temporada</h2>
        <p className="text-sm text-muted">Nenhuma temporada concluida ainda.</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase text-muted">Resumo</p>
          <h2 className="font-display text-2xl font-semibold">Fim da temporada {record.season}</h2>
          <p className="mt-1 text-sm text-muted">
            {playerClub?.name ?? "Seu clube"} terminou em{" "}
            {formatInteger(record.playerClubPosition ?? 0)}o.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-contrast transition hover:bg-accent-hover"
          onClick={startNextSeason}
          type="button"
        >
          <CalendarPlus aria-hidden="true" size={18} />
          Iniciar proxima temporada
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Trophy}
          label="Campeao"
          title={champion?.name ?? "Indefinido"}
          value={champion?.shortName ?? "--"}
        />
        <SummaryCard
          icon={UserMinus}
          label="Aposentadorias"
          title={`${formatInteger(record.retiredPlayerIds?.length ?? 0)} jogadores`}
          value="Veteranos"
        />
        <SummaryCard
          icon={Sparkles}
          label="Regens"
          title={`${formatInteger(record.regenPlayerIds?.length ?? 0)} jovens`}
          value="Base"
        />
        <SummaryCard
          icon={Award}
          label="Conquistas"
          title={`${formatInteger(record.achievementsUnlocked?.length ?? 0)} desbloqueadas`}
          value="Carreira"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ClubList
          clubs={relegatedClubs}
          empty="Nenhum clube rebaixado."
          icon={ShieldAlert}
          title="Rebaixados"
        />
        <ClubList
          clubs={promotedClubs}
          empty="Nenhum clube promovido."
          icon={Sparkles}
          title="Promovidos"
        />
      </div>
    </section>
  );
}

interface SummaryCardProps {
  icon: typeof Trophy;
  label: string;
  title: string;
  value: string;
}

function SummaryCard({ icon: Icon, label, title, value }: SummaryCardProps) {
  return (
    <article className="rounded-sm border border-border bg-surface px-5 py-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-pitch/15 text-pitch">
        <Icon aria-hidden="true" size={20} />
      </div>
      <p className="font-mono text-xs uppercase text-muted">{label}</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{value}</p>
    </article>
  );
}

interface ClubListProps {
  clubs: ClubListItem[];
  empty: string;
  icon: typeof Trophy;
  title: string;
}

interface ClubListItem {
  id: string;
  name: string;
  shortName: string;
}

function ClubList({ clubs, empty, icon: Icon, title }: ClubListProps) {
  return (
    <section className="rounded-sm border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Icon aria-hidden="true" className="text-muted" size={18} />
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <article className="flex items-center justify-between gap-3 px-5 py-4" key={club.id}>
              <span className="font-semibold">{club.name}</span>
              <span className="font-mono text-xs text-muted">{club.shortName}</span>
            </article>
          ))
        ) : (
          <p className="px-5 py-4 text-sm text-muted">{empty}</p>
        )}
      </div>
    </section>
  );
}
