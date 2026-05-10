import { Search, Send, Shuffle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Player, Position } from "../../../engine";
import { calculateTransferValue, isTransferWindowOpen } from "../../../engine";
import { type TransferOffer, useGameStore } from "../../../store/game.store";
import { playerFullName } from "../../../store/selectors";
import { formatCurrency } from "../../formatters";
import { useHotkey } from "../../hotkeys/useHotkey";

type PositionFilter = "all" | Position;

const POSITIONS: Array<{ value: PositionFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "GK", label: "GOL" },
  { value: "DF", label: "DEF" },
  { value: "MF", label: "MEI" },
  { value: "FW", label: "ATA" },
];

export function TransferMarketView() {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PositionFilter>("all");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeView = useGameStore((state) => state.activeView);
  const game = useGameStore((state) => state.game);
  const transferOffers = useGameStore((state) => state.transferOffers);
  const cpuTransfersThisWindow = useGameStore((state) => state.cpuTransfersThisWindow);
  const makeTransferOffer = useGameStore((state) => state.makeTransferOffer);
  const acceptCounterOffer = useGameStore((state) => state.acceptCounterOffer);
  const rejectTransferOffer = useGameStore((state) => state.rejectTransferOffer);
  const runCpuTransferWindow = useGameStore((state) => state.runCpuTransferWindow);
  const playerClub = game.clubs[game.playerClubId];
  const windowOpen = isTransferWindowOpen(game.currentSeason.currentWeek);
  const candidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return Object.values(game.players)
      .filter((player) => {
        const club = player.clubId ? game.clubs[player.clubId] : undefined;

        if (!club || club.id === game.playerClubId) {
          return false;
        }

        if (position !== "all" && player.position !== position) {
          return false;
        }

        return (
          normalizedQuery.length === 0 ||
          playerFullName(player).toLowerCase().includes(normalizedQuery) ||
          club.name.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => calculateTransferValue(b) - calculateTransferValue(a))
      .slice(0, 80);
  }, [game.clubs, game.playerClubId, game.players, position, query]);
  const selectedPlayer = selectedPlayerId ? game.players[selectedPlayerId] : undefined;
  const pendingCounters = transferOffers.filter((offer) => offer.status === "counter");

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const openSelectedOffer = useCallback(() => {
    setSelectedPlayerId((current) => current ?? candidates[0]?.id ?? null);
  }, [candidates]);

  useHotkey("/", focusSearch, { enabled: activeView === "market" });
  useHotkey("o", openSelectedOffer, { enabled: activeView === "market" });

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase text-muted">Mercado</p>
            <h2 className="font-display text-2xl font-semibold">
              {windowOpen ? "Janela aberta" : "Janela fechada"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Semana {game.currentSeason.currentWeek} · Orcamento{" "}
              {formatCurrency(playerClub?.budget ?? 0)}
            </p>
          </div>
          <button
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-sm border border-border px-4 text-sm text-muted transition hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!windowOpen}
            onClick={runCpuTransferWindow}
            type="button"
          >
            <Shuffle aria-hidden="true" size={16} />
            Rodar CPU
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface p-4 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Buscar jogador no mercado</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={18}
            />
            <input
              className="h-11 w-full rounded-sm border border-border bg-ink-900 pl-10 pr-3 text-sm text-foreground placeholder:text-faint"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar jogador ou clube"
              ref={searchRef}
              type="search"
              value={query}
            />
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Filtrar por posicao</legend>
            {POSITIONS.map((item) => (
              <button
                aria-pressed={position === item.value}
                className={`min-h-10 rounded-sm border px-3 text-sm transition ${
                  position === item.value
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border text-muted hover:border-border-strong hover:text-foreground"
                }`}
                key={item.value}
                onClick={() => setPosition(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="overflow-hidden rounded-sm border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-ink-900 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Jogador</th>
                  <th className="px-4 py-3 text-left font-medium">Clube</th>
                  <th className="px-4 py-3 text-right font-medium">OVR</th>
                  <th className="px-4 py-3 text-right font-medium">POT</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                  <th className="px-4 py-3 text-right font-medium">Acao</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((player) => {
                  const club = player.clubId ? game.clubs[player.clubId] : undefined;

                  return (
                    <tr
                      className="border-t border-border transition hover:bg-elevated"
                      key={player.id}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold">{playerFullName(player)}</p>
                        <p className="mt-1 font-mono text-xs text-muted">{player.position}</p>
                      </td>
                      <td className="px-4 py-3">{club?.shortName ?? "-"}</td>
                      <td className="px-4 py-3 text-right font-mono">{player.overall}</td>
                      <td className="px-4 py-3 text-right font-mono">{player.potential}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(calculateTransferValue(player))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="inline-flex min-h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm text-muted transition hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!windowOpen}
                          onClick={() => setSelectedPlayerId(player.id)}
                          type="button"
                        >
                          <Send aria-hidden="true" size={14} />
                          Oferta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <section className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs uppercase text-muted">Contrapropostas</p>
            <h3 className="font-display text-xl font-semibold">{pendingCounters.length}</h3>
          </div>
          <div className="divide-y divide-border">
            {pendingCounters.length > 0 ? (
              pendingCounters.map((offer) => (
                <CounterOffer
                  key={offer.id}
                  offer={offer}
                  onAccept={acceptCounterOffer}
                  onReject={rejectTransferOffer}
                  players={game.players}
                />
              ))
            ) : (
              <p className="px-4 py-5 text-sm text-muted">Nenhuma mesa aberta agora.</p>
            )}
          </div>
        </section>

        <section className="rounded-sm border border-border bg-surface p-4">
          <p className="text-xs uppercase text-muted">CPU nesta janela</p>
          <p className="mt-2 font-display text-3xl font-semibold">{cpuTransfersThisWindow}</p>
          <p className="mt-2 text-sm text-muted">
            A meta do MVP e manter 5-15 movimentos por janela.
          </p>
        </section>
      </aside>

      <OfferDialog
        onClose={() => setSelectedPlayerId(null)}
        onSubmit={(playerId, amount) => {
          makeTransferOffer(playerId, amount);
          setSelectedPlayerId(null);
        }}
        player={selectedPlayer}
      />
    </section>
  );
}

interface OfferDialogProps {
  player: Player | undefined;
  onClose: () => void;
  onSubmit: (playerId: string, amount: number) => void;
}

function OfferDialog({ player, onClose, onSubmit }: OfferDialogProps) {
  const [amount, setAmount] = useState(() => (player ? calculateTransferValue(player) : 0));
  const value = player ? calculateTransferValue(player) : 0;

  useEffect(() => {
    if (player) {
      setAmount(calculateTransferValue(player));
    }
  }, [player]);

  if (!player) {
    return null;
  }

  return (
    <div
      aria-labelledby="offer-title"
      aria-modal="true"
      className="fixed inset-0 z-modal flex items-center justify-center bg-ink-950/80 px-4"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-sm border border-border bg-surface shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-xs text-muted">{player.position}</p>
            <h3 className="font-display text-xl font-semibold" id="offer-title">
              {playerFullName(player)}
            </h3>
          </div>
          <button
            aria-label="Fechar oferta"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted transition hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-muted">Valor estimado: {formatCurrency(value)}</p>
          <label className="grid gap-2 text-sm">
            <span>Oferta</span>
            <input
              className="h-11 rounded-sm border border-border bg-ink-900 px-3 font-mono"
              min={0}
              onChange={(event) => setAmount(Number(event.target.value))}
              step={100_000}
              type="number"
              value={amount}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              className="min-h-11 rounded-sm border border-border px-4 text-sm text-muted hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="min-h-11 rounded-sm bg-accent px-4 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
              onClick={() => onSubmit(player.id, amount)}
              type="button"
            >
              Enviar oferta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CounterOfferProps {
  offer: TransferOffer;
  players: Record<string, Player>;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
}

function CounterOffer({ offer, players, onAccept, onReject }: CounterOfferProps) {
  const player = players[offer.playerId];

  return (
    <article className="px-4 py-4">
      <p className="font-semibold">{player ? playerFullName(player) : "Jogador"}</p>
      <p className="mt-1 font-mono text-sm text-muted">
        {formatCurrency(offer.counterAmount ?? offer.amount)}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          className="min-h-9 rounded-sm bg-accent px-3 text-sm font-semibold text-accent-contrast"
          onClick={() => onAccept(offer.id)}
          type="button"
        >
          Aceitar
        </button>
        <button
          className="min-h-9 rounded-sm border border-border px-3 text-sm text-muted hover:text-foreground"
          onClick={() => onReject(offer.id)}
          type="button"
        >
          Recusar
        </button>
      </div>
    </article>
  );
}
