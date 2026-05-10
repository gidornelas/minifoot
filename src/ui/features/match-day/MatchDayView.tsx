import { motion } from "framer-motion";
import { FastForward, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Match } from "../../../engine";
import { useGameStore } from "../../../store/game.store";
import { useHotkey } from "../../hotkeys/useHotkey";

const SPEEDS = [
  { key: "1", label: "1x", value: 1, step: 1 },
  { key: "2", label: "2x", value: 2, step: 2 },
  { key: "3", label: "5x", value: 5, step: 3 },
  { key: "4", label: "10x", value: 10, step: 99 },
] as const;

export function MatchDayView() {
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]["value"]>(1);
  const [eventCursor, setEventCursor] = useState(0);
  const activeView = useGameStore((state) => state.activeView);
  const game = useGameStore((state) => state.game);
  const lastRoundMatchIds = useGameStore((state) => state.lastRoundMatchIds);
  const advanceRound = useGameStore((state) => state.advanceRound);
  const setActiveView = useGameStore((state) => state.setActiveView);
  const matches = useMemo(
    () => lastRoundMatchIds.map((matchId) => game.matches[matchId]).filter(isMatch),
    [game.matches, lastRoundMatchIds],
  );
  const playerMatch =
    matches.find(
      (match) => match.homeId === game.playerClubId || match.awayId === game.playerClubId,
    ) ?? matches[0];
  const events = useMemo(
    () => [...(playerMatch?.result?.events ?? [])].sort((a, b) => a.minute - b.minute),
    [playerMatch?.result?.events],
  );
  const visibleEvents = events.slice(0, eventCursor);
  const currentSpeed = SPEEDS.find((item) => item.value === speed) ?? SPEEDS[0];

  const revealNext = useCallback(() => {
    if (events.length === 0) {
      return;
    }

    setEventCursor((cursor) => Math.min(events.length, cursor + currentSpeed.step));
  }, [currentSpeed.step, events.length]);

  const playerMatchId = playerMatch?.id;

  useEffect(() => {
    setEventCursor((cursor) => (playerMatchId ? 0 : cursor));
  }, [playerMatchId]);

  useHotkey("space", revealNext, {
    enableOnFormTags: true,
    enabled: activeView === "match-day",
  });
  useHotkey("1", () => setSpeed(1), { enabled: activeView === "match-day" });
  useHotkey("2", () => setSpeed(2), { enabled: activeView === "match-day" });
  useHotkey("3", () => setSpeed(5), { enabled: activeView === "match-day" });
  useHotkey("4", () => setSpeed(10), { enabled: activeView === "match-day" });

  if (!playerMatch?.result) {
    return (
      <section className="flex min-h-[420px] flex-col justify-center border-l border-border pl-6">
        <p className="font-mono text-xs uppercase text-muted">Match Day</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">Nenhuma rodada jogada</h2>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Avance uma rodada para gerar a narrativa da partida e atualizar a tabela.
        </p>
        <button
          className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-contrast"
          onClick={advanceRound}
          type="button"
        >
          <Play aria-hidden="true" size={16} />
          Avancar rodada
        </button>
      </section>
    );
  }

  const home = game.clubs[playerMatch.homeId];
  const away = game.clubs[playerMatch.awayId];
  const finished = eventCursor >= events.length;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="font-mono text-xs uppercase text-muted">Rodada {playerMatch.round}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              {home?.name ?? playerMatch.homeId} x {away?.name ?? playerMatch.awayId}
            </h2>
          </div>
          <div className="grid min-h-[260px] place-items-center bg-[linear-gradient(90deg,rgba(74,222,128,0.08)_1px,transparent_1px),linear-gradient(rgba(74,222,128,0.08)_1px,transparent_1px)] bg-[size:48px_48px] p-5">
            <motion.div
              animate={{ scale: [1, 1.035, 1] }}
              className="grid w-full max-w-2xl grid-cols-[1fr_120px_1fr] items-center gap-4 rounded-sm border border-border bg-ink-950/80 p-5"
              key={`${playerMatch.result.homeGoals}-${playerMatch.result.awayGoals}-${eventCursor}`}
              transition={{ duration: 0.28 }}
            >
              <TeamScore color={home?.primaryColor} name={home?.shortName ?? playerMatch.homeId} />
              <div className="text-center">
                <div className="font-score text-4xl font-bold">
                  {playerMatch.result.homeGoals} - {playerMatch.result.awayGoals}
                </div>
                <p className="mt-1 font-mono text-xs text-muted">
                  xG {playerMatch.result.xgHome.toFixed(1)} / {playerMatch.result.xgAway.toFixed(1)}
                </p>
              </div>
              <TeamScore color={away?.primaryColor} name={away?.shortName ?? playerMatch.awayId} />
            </motion.div>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase text-muted">Narrativa</p>
              <h3 className="font-display text-xl font-semibold">
                {finished ? "Partida encerrada" : "Eventos da partida"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPEEDS.map((item) => (
                <button
                  aria-pressed={speed === item.value}
                  className={`min-h-10 rounded-sm border px-3 font-mono text-sm transition ${
                    speed === item.value
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-border text-muted hover:border-border-strong hover:text-foreground"
                  }`}
                  key={item.value}
                  onClick={() => setSpeed(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <ol className="min-h-[260px] divide-y divide-border">
            {visibleEvents.length > 0 ? (
              visibleEvents.map((event) => (
                <li className="grid grid-cols-[52px_1fr] gap-4 px-5 py-4" key={event.description}>
                  <span className="font-mono text-sm text-pitch">{event.minute}'</span>
                  <p className="text-sm">{event.description}</p>
                </li>
              ))
            ) : (
              <li className="px-5 py-8 text-sm text-muted">
                Pressione Espaco para revelar a partida.
              </li>
            )}
          </ol>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-4 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
              onClick={() => setActiveView("table")}
              type="button"
            >
              Ver tabela
            </button>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-contrast transition hover:bg-accent-hover"
              onClick={finished ? advanceRound : revealNext}
              type="button"
            >
              {finished ? (
                <Play aria-hidden="true" size={16} />
              ) : (
                <FastForward aria-hidden="true" size={16} />
              )}
              {finished ? "Avancar rodada" : "Proximo evento"}
            </button>
          </div>
        </div>
      </div>

      <aside className="rounded-sm border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs uppercase text-muted">Rodada completa</p>
          <h3 className="font-display text-xl font-semibold">Resultados</h3>
        </div>
        <div className="divide-y divide-border">
          {matches.map((match) => (
            <div className="grid grid-cols-[1fr_72px_1fr] gap-3 px-5 py-3 text-sm" key={match.id}>
              <span className="truncate">
                {game.clubs[match.homeId]?.shortName ?? match.homeId}
              </span>
              <span className="text-center font-score">
                {match.result?.homeGoals ?? 0} - {match.result?.awayGoals ?? 0}
              </span>
              <span className="truncate text-right">
                {game.clubs[match.awayId]?.shortName ?? match.awayId}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

interface TeamScoreProps {
  name: string;
  color: string | undefined;
}

function TeamScore({ name, color }: TeamScoreProps) {
  return (
    <div className="grid justify-items-center gap-3 text-center">
      <div
        className="h-12 w-12 rounded-pill border-2 bg-ink-900"
        style={{ borderColor: color ?? "var(--pitch)" }}
      />
      <p className="font-display text-lg font-semibold">{name}</p>
    </div>
  );
}

function isMatch(match: Match | undefined): match is Match {
  return match !== undefined;
}
