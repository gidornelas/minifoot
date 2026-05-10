import { ArrowDownUp, Search, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Player, Position } from "../../../engine";
import { type SquadSortKey, useGameStore } from "../../../store/game.store";
import { playerFullName, sortPlayers } from "../../../store/selectors";
import { formatCurrency } from "../../formatters";
import { useHotkey } from "../../hotkeys/useHotkey";

const POSITION_LABELS: Record<Position, string> = {
  DF: "DEF",
  FW: "ATA",
  GK: "GOL",
  MF: "MEI",
};

export function SquadView() {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const game = useGameStore((state) => state.game);
  const sort = useGameStore((state) => state.squadSort);
  const selectedPlayerId = useGameStore((state) => state.selectedPlayerId);
  const setSquadSort = useGameStore((state) => state.setSquadSort);
  const selectPlayer = useGameStore((state) => state.selectPlayer);
  const club = game.clubs[game.playerClubId];
  const players = useMemo(() => {
    if (!club) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const squadPlayers = club.squad
      .map((playerId) => game.players[playerId])
      .filter((player): player is Player => player !== undefined);
    const filteredPlayers = normalizedQuery
      ? squadPlayers.filter((player) =>
          playerFullName(player).toLowerCase().includes(normalizedQuery),
        )
      : squadPlayers;

    return sortPlayers(filteredPlayers, sort.key, sort.direction);
  }, [club, game.players, query, sort.direction, sort.key]);
  const selectedPlayer = selectedPlayerId ? game.players[selectedPlayerId] : undefined;

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  useHotkey("/", focusSearch, { enabled: true });

  const focusRow = (index: number) => {
    rowRefs.current[index]?.focus();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase text-muted">Elenco</p>
          <h2 className="font-display text-2xl font-semibold">{club?.name ?? "Clube"}</h2>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Buscar jogador</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={18}
          />
          <input
            className="h-11 w-full rounded-sm border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-faint"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar jogador"
            ref={searchRef}
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-muted">
              <tr>
                <SortHeader label="Jogador" sortKey="name" onSort={setSquadSort} />
                <SortHeader label="Pos" sortKey="position" onSort={setSquadSort} />
                <SortHeader label="OVR" sortKey="overall" onSort={setSquadSort} />
                <SortHeader label="POT" sortKey="potential" onSort={setSquadSort} />
                <SortHeader label="Fisico" sortKey="fitness" onSort={setSquadSort} />
                <SortHeader label="Valor" sortKey="value" onSort={setSquadSort} />
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  aria-selected={selectedPlayerId === player.id}
                  className="border-t border-border transition hover:bg-elevated focus:bg-elevated"
                  key={player.id}
                  onDoubleClick={() => selectPlayer(player.id)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      focusRow(Math.min(index + 1, players.length - 1));
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      focusRow(Math.max(index - 1, 0));
                    }

                    if (event.key === "Enter") {
                      event.preventDefault();
                      selectPlayer(player.id);
                    }
                  }}
                  ref={(node) => {
                    rowRefs.current[index] = node;
                  }}
                  tabIndex={index === 0 ? 0 : -1}
                >
                  <td className="px-4 py-3">
                    <button
                      className="text-left font-semibold text-foreground underline-offset-4 hover:underline"
                      onClick={() => selectPlayer(player.id)}
                      type="button"
                    >
                      {playerFullName(player)}
                    </button>
                    <p className="mt-1 text-xs text-muted">
                      {player.traits.join(" / ") || "regular"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono">{POSITION_LABELS[player.position]}</td>
                  <td className="px-4 py-3 font-mono">{player.overall}</td>
                  <td className="px-4 py-3 font-mono">{player.potential}</td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-24 overflow-hidden rounded-pill bg-ink-900">
                      <div
                        className="h-full rounded-pill bg-pitch"
                        style={{ width: `${player.fitness}%` }}
                      />
                    </div>
                    <span className="mt-1 block font-mono text-xs text-muted">
                      {player.fitness}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(player.marketValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PlayerDialog onClose={() => selectPlayer(null)} player={selectedPlayer} />
    </section>
  );
}

interface SortHeaderProps {
  label: string;
  sortKey: SquadSortKey;
  onSort: (key: SquadSortKey) => void;
}

function SortHeader({ label, sortKey, onSort }: SortHeaderProps) {
  return (
    <th className="px-4 py-3 text-left font-medium">
      <button
        className="inline-flex min-h-8 items-center gap-2 rounded-xs px-1 text-left hover:text-foreground"
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        <ArrowDownUp aria-hidden="true" size={14} />
      </button>
    </th>
  );
}

interface PlayerDialogProps {
  player: Player | undefined;
  onClose: () => void;
}

function PlayerDialog({ player, onClose }: PlayerDialogProps) {
  if (!player) {
    return null;
  }

  return (
    <div
      aria-labelledby="player-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-modal flex items-center justify-center bg-ink-950/80 px-4"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-sm border border-border bg-surface shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-xs text-muted">{POSITION_LABELS[player.position]}</p>
            <h3 className="font-display text-xl font-semibold" id="player-detail-title">
              {playerFullName(player)}
            </h3>
          </div>
          <button
            aria-label="Fechar detalhe do jogador"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted transition hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
          <PlayerMetric label="OVR" value={player.overall} />
          <PlayerMetric label="POT" value={player.potential} />
          <PlayerMetric label="Idade" value={player.age} />
          <PlayerMetric label="Ataque" value={player.attributes.attack} />
          <PlayerMetric label="Passe" value={player.attributes.passing} />
          <PlayerMetric label="Defesa" value={player.attributes.defense} />
        </dl>
      </div>
    </div>
  );
}

interface PlayerMetricProps {
  label: string;
  value: number;
}

function PlayerMetric({ label, value }: PlayerMetricProps) {
  return (
    <div className="rounded-sm border border-border bg-ink-900 px-3 py-3">
      <dt className="text-xs uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-lg">{value}</dd>
    </div>
  );
}
