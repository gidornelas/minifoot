import { RotateCcw, Save, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import type { Formation, Mentality, Player } from "../../../engine";
import { useGameStore } from "../../../store/game.store";
import { playerFullName } from "../../../store/selectors";
import { useHotkey } from "../../hotkeys/useHotkey";

const FORMATIONS: Record<Formation, string[]> = {
  "3-5-2": ["GK", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW", "FW"],
  "4-3-3": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"],
  "4-4-2": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW", "FW"],
  "4-5-1": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW"],
};

const MENTALITIES: Array<{ value: Mentality; label: string }> = [
  { value: "balanced", label: "Equilibrada" },
  { value: "attack", label: "Ofensiva" },
  { value: "defend", label: "Defensiva" },
];

export function TacticsView() {
  const slotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeView = useGameStore((state) => state.activeView);
  const game = useGameStore((state) => state.game);
  const tactic = useGameStore((state) => state.tactic);
  const pendingBenchPlayerId = useGameStore((state) => state.pendingBenchPlayerId);
  const setFormation = useGameStore((state) => state.setFormation);
  const setMentality = useGameStore((state) => state.setMentality);
  const autoPickLineup = useGameStore((state) => state.autoPickLineup);
  const resetTactic = useGameStore((state) => state.resetTactic);
  const pickBenchPlayer = useGameStore((state) => state.pickBenchPlayer);
  const placePendingPlayer = useGameStore((state) => state.placePendingPlayer);
  const moveStarter = useGameStore((state) => state.moveStarter);
  const saveManual = useGameStore((state) => state.saveManual);
  const club = game.clubs[game.playerClubId];
  const lineupPlayers = useMemo(
    () => tactic.lineup.map((playerId) => game.players[playerId]).filter(isPlayer),
    [game.players, tactic.lineup],
  );
  const benchPlayers = useMemo(() => {
    if (!club) {
      return [];
    }

    const starters = new Set(tactic.lineup);

    return club.squad
      .map((playerId) => game.players[playerId])
      .filter(isPlayer)
      .filter((player) => !starters.has(player.id))
      .sort((a, b) => b.overall - a.overall);
  }, [club, game.players, tactic.lineup]);

  const moveFocus = (index: number) => {
    slotRefs.current[index]?.focus();
  };

  const onAutoPick = useCallback(() => {
    autoPickLineup();
  }, [autoPickLineup]);

  const onReset = useCallback(() => {
    resetTactic();
  }, [resetTactic]);

  useHotkey("a", onAutoPick, { enabled: activeView === "tactics" });
  useHotkey("r", onReset, { enabled: activeView === "tactics" });
  useHotkey("s", saveManual, { enabled: activeView === "tactics" });

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase text-muted">Tatica</p>
            <h2 className="font-display text-2xl font-semibold">{tactic.formation}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FORMATIONS) as Formation[]).map((formation) => (
              <button
                aria-pressed={tactic.formation === formation}
                className={`min-h-10 rounded-sm border px-3 text-sm font-semibold transition ${
                  tactic.formation === formation
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border text-muted hover:border-border-strong hover:text-foreground"
                }`}
                key={formation}
                onClick={() => setFormation(formation)}
                type="button"
              >
                {formation}
              </button>
            ))}
          </div>
          <label className="grid gap-1 text-sm">
            <span className="text-xs uppercase text-muted">Mentalidade</span>
            <select
              className="h-10 rounded-sm border border-border bg-ink-900 px-3 text-sm"
              onChange={(event) => setMentality(event.target.value as Mentality)}
              value={tactic.mentality}
            >
              {MENTALITIES.map((mentality) => (
                <option key={mentality.value} value={mentality.value}>
                  {mentality.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="grid min-h-[520px] gap-3 rounded-sm border border-pitch/50 bg-[linear-gradient(90deg,rgba(74,222,128,0.08)_1px,transparent_1px),linear-gradient(rgba(74,222,128,0.08)_1px,transparent_1px)] bg-[size:42px_42px] p-4">
            {lineupPlayers.map((player, index) => (
              <button
                className="flex min-h-16 items-center justify-between gap-3 rounded-sm border border-border bg-ink-950/80 px-4 text-left transition hover:border-border-strong focus:border-accent"
                draggable
                key={player.id}
                onClick={() => placePendingPlayer(index)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", `starter:${index}`);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const payload = event.dataTransfer.getData("text/plain");

                  if (payload.startsWith("bench:")) {
                    pickBenchPlayer(payload.replace("bench:", ""));
                    placePendingPlayer(index);
                    return;
                  }

                  if (payload.startsWith("starter:")) {
                    moveStarter(Number(payload.replace("starter:", "")), index);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveFocus(Math.min(index + 1, lineupPlayers.length - 1));
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveFocus(Math.max(index - 1, 0));
                  }
                }}
                ref={(node) => {
                  slotRefs.current[index] = node;
                }}
                type="button"
              >
                <span>
                  <span className="block font-mono text-xs text-pitch">
                    {FORMATIONS[tactic.formation][index] ?? "XI"}
                  </span>
                  <span className="block font-semibold">{playerFullName(player)}</span>
                </span>
                <span className="font-mono text-sm text-muted">{player.overall}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border text-sm text-muted transition hover:border-border-strong hover:text-foreground"
            onClick={onAutoPick}
            type="button"
          >
            <Sparkles aria-hidden="true" size={16} />
            Auto
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border text-sm text-muted transition hover:border-border-strong hover:text-foreground"
            onClick={onReset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
            Reset
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border text-sm text-muted transition hover:border-border-strong hover:text-foreground"
            onClick={saveManual}
            type="button"
          >
            <Save aria-hidden="true" size={16} />
            Salvar
          </button>
        </div>

        <section className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs uppercase text-muted">Banco</p>
            {pendingBenchPlayerId ? (
              <p className="mt-1 text-sm text-pitch">
                {playerFullName(game.players[pendingBenchPlayerId] as Player)}
              </p>
            ) : null}
          </div>
          <div className="max-h-[620px] divide-y divide-border overflow-auto">
            {benchPlayers.map((player) => (
              <button
                aria-pressed={pendingBenchPlayerId === player.id}
                className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition ${
                  pendingBenchPlayerId === player.id
                    ? "bg-accent text-accent-contrast"
                    : "hover:bg-elevated"
                }`}
                draggable
                key={player.id}
                onClick={() => pickBenchPlayer(player.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", `bench:${player.id}`);
                }}
                type="button"
              >
                <span>
                  <span className="block font-semibold">{playerFullName(player)}</span>
                  <span className="font-mono text-xs opacity-75">{player.position}</span>
                </span>
                <span className="font-mono">{player.overall}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </section>
  );
}

function isPlayer(player: Player | undefined): player is Player {
  return player !== undefined;
}
