import { ChevronRight, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useGameStore } from "../../../store/game.store";
import { formatCurrency } from "../../formatters";

export function OnboardingView() {
  const game = useGameStore((state) => state.game);
  const completeOnboarding = useGameStore((state) => state.completeOnboarding);
  const clubs = useMemo(
    () =>
      Object.values(game.clubs)
        .filter((club) => game.leagues[club.leagueId]?.clubIds.includes(club.id))
        .sort((a, b) => b.reputation - a.reputation),
    [game.clubs, game.leagues],
  );
  const [managerName, setManagerName] = useState(game.playerName);
  const [selectedClubId, setSelectedClubId] = useState(game.playerClubId);
  const selectedClub = game.clubs[selectedClubId];

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl gap-5 lg:grid-cols-[360px_1fr]">
        <section className="flex flex-col justify-between rounded-sm border border-border bg-surface px-5 py-5">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-ink-900 font-display text-lg font-bold">
              mf<span className="text-pitch">.</span>
            </div>
            <p className="text-xs uppercase text-muted">Nova carreira</p>
            <h1 className="mt-2 font-display text-3xl font-semibold">minifoot.</h1>
            <p className="mt-3 text-sm text-muted">
              Escolha um tecnico e um clube. A temporada comeca direto no calendario jogavel.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Nome do tecnico</span>
              <span className="relative block">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  size={18}
                />
                <input
                  className="h-11 w-full rounded-sm border border-border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-faint"
                  onChange={(event) => setManagerName(event.target.value)}
                  placeholder="Tecnico"
                  value={managerName}
                />
              </span>
            </label>

            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-contrast transition hover:bg-accent-hover"
              onClick={() => completeOnboarding({ clubId: selectedClubId, managerName })}
              type="button"
            >
              Comecar carreira
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs uppercase text-muted">Clubes disponiveis</p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {selectedClub?.name ?? "Escolha o clube"}
            </h2>
          </div>
          <div className="grid max-h-[calc(100vh-170px)] gap-2 overflow-auto p-3 sm:grid-cols-2 xl:grid-cols-3">
            {clubs.map((club) => (
              <button
                aria-pressed={club.id === selectedClubId}
                className={`rounded-sm border px-4 py-4 text-left transition ${
                  club.id === selectedClubId
                    ? "border-accent bg-pitch/10"
                    : "border-border hover:border-border-strong"
                }`}
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="mb-4 block h-2 w-16 rounded-pill"
                  style={{ background: club.primaryColor }}
                />
                <span className="block font-display text-lg font-semibold">{club.name}</span>
                <span className="mt-1 block text-sm text-muted">
                  {club.shortName} - Rep {club.reputation}
                </span>
                <span className="mt-3 block font-mono text-xs text-muted">
                  Orcamento {formatCurrency(club.budget)}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
