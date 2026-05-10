import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Club, Formation, GameState, Mentality, Player } from "../engine";
import {
  createLeagueSchedule,
  createRng,
  evaluateTransferOffer,
  generateCpuTransferDeals,
  generateLeague,
  generateRoundNews,
  generateTransferNews,
  isTransferWindowOpen,
  simulateRound,
} from "../engine";
import { CURRENT_SAVE_VERSION } from "../persistence";

export type AppView = "home" | "squad" | "tactics" | "match-day" | "table" | "market" | "news";
export type SquadSortKey = "name" | "position" | "overall" | "potential" | "fitness" | "value";
export type SortDirection = "asc" | "desc";

export interface TacticState {
  formation: Formation;
  mentality: Mentality;
  lineup: string[];
  savedAt: number;
}

export type TransferOfferStatus = "accepted" | "counter" | "rejected";

export interface TransferOffer {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  amount: number;
  counterAmount?: number;
  wageDemand: number;
  status: TransferOfferStatus;
  reason: string;
  createdWeek: number;
  counterCount: number;
}

interface GameStoreState {
  activeView: AppView;
  game: GameState;
  squadSort: {
    key: SquadSortKey;
    direction: SortDirection;
  };
  selectedPlayerId: string | null;
  tactic: TacticState;
  pendingBenchPlayerId: string | null;
  transferOffers: TransferOffer[];
  cpuTransfersThisWindow: number;
  lastRoundMatchIds: string[];
  lastAction: string;
}

interface GameStoreActions {
  setActiveView: (view: AppView) => void;
  setSquadSort: (key: SquadSortKey) => void;
  selectPlayer: (playerId: string | null) => void;
  setFormation: (formation: Formation) => void;
  setMentality: (mentality: Mentality) => void;
  autoPickLineup: () => void;
  resetTactic: () => void;
  pickBenchPlayer: (playerId: string | null) => void;
  placePendingPlayer: (lineupIndex: number) => void;
  moveStarter: (fromIndex: number, toIndex: number) => void;
  makeTransferOffer: (playerId: string, amount: number) => void;
  acceptCounterOffer: (offerId: string) => void;
  rejectTransferOffer: (offerId: string) => void;
  runCpuTransferWindow: () => void;
  advanceRound: () => void;
  resetCareer: () => void;
  saveManual: () => void;
  acknowledgeAction: () => void;
}

type GameStore = GameStoreState & GameStoreActions;

const INITIAL_SEED = 2_026;
const INITIAL_GAME = createInitialGameState(INITIAL_SEED);
const INITIAL_LINEUP = pickBestLineup(INITIAL_GAME);

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      activeView: "home",
      game: INITIAL_GAME,
      squadSort: {
        key: "overall",
        direction: "desc",
      },
      selectedPlayerId: null,
      tactic: {
        formation: "4-4-2",
        mentality: "balanced",
        lineup: INITIAL_LINEUP,
        savedAt: 0,
      },
      pendingBenchPlayerId: null,
      transferOffers: [],
      cpuTransfersThisWindow: 0,
      lastRoundMatchIds: [],
      lastAction: "",
      setActiveView: (view) => {
        set({ activeView: view, pendingBenchPlayerId: null, selectedPlayerId: null });
      },
      setSquadSort: (key) => {
        set((state) => ({
          squadSort: {
            key,
            direction:
              state.squadSort.key === key && state.squadSort.direction === "desc" ? "asc" : "desc",
          },
        }));
      },
      selectPlayer: (playerId) => {
        set({ selectedPlayerId: playerId });
      },
      setFormation: (formation) => {
        set((state) => ({
          tactic: { ...state.tactic, formation, savedAt: Date.now() },
          lastAction: "Tatica salva",
        }));
      },
      setMentality: (mentality) => {
        set((state) => ({
          tactic: { ...state.tactic, mentality, savedAt: Date.now() },
          lastAction: "Tatica salva",
        }));
      },
      autoPickLineup: () => {
        set((state) => ({
          tactic: {
            ...state.tactic,
            lineup: pickBestLineup(state.game),
            savedAt: Date.now(),
          },
          pendingBenchPlayerId: null,
          lastAction: "XI atualizado",
        }));
      },
      resetTactic: () => {
        set((state) => ({
          tactic: {
            formation: "4-4-2",
            mentality: "balanced",
            lineup: pickBestLineup(state.game),
            savedAt: Date.now(),
          },
          pendingBenchPlayerId: null,
          lastAction: "Tatica resetada",
        }));
      },
      pickBenchPlayer: (playerId) => {
        set({ pendingBenchPlayerId: playerId });
      },
      placePendingPlayer: (lineupIndex) => {
        const pendingBenchPlayerId = get().pendingBenchPlayerId;

        if (!pendingBenchPlayerId) {
          return;
        }

        set((state) => {
          if (state.tactic.lineup.includes(pendingBenchPlayerId)) {
            return { pendingBenchPlayerId: null };
          }

          const lineup = [...state.tactic.lineup];
          lineup[lineupIndex] = pendingBenchPlayerId;

          return {
            tactic: { ...state.tactic, lineup, savedAt: Date.now() },
            pendingBenchPlayerId: null,
            lastAction: "XI atualizado",
          };
        });
      },
      moveStarter: (fromIndex, toIndex) => {
        set((state) => {
          const lineup = [...state.tactic.lineup];
          const fromPlayer = lineup[fromIndex];
          const toPlayer = lineup[toIndex];

          if (!fromPlayer || !toPlayer || fromIndex === toIndex) {
            return {};
          }

          lineup[fromIndex] = toPlayer;
          lineup[toIndex] = fromPlayer;

          return {
            tactic: { ...state.tactic, lineup, savedAt: Date.now() },
            lastAction: "XI reorganizado",
          };
        });
      },
      makeTransferOffer: (playerId, amount) => {
        set((state) => {
          if (!isTransferWindowOpen(state.game.currentSeason.currentWeek)) {
            return { lastAction: "Janela fechada" };
          }

          const player = state.game.players[playerId];
          const fromClub = player?.clubId ? state.game.clubs[player.clubId] : undefined;
          const toClub = state.game.clubs[state.game.playerClubId];

          if (!player || !fromClub || !toClub || fromClub.id === toClub.id) {
            return { lastAction: "Oferta invalida" };
          }

          const decision = evaluateTransferOffer({
            buyingClub: toClub,
            counterCount: 0,
            offerAmount: amount,
            player,
            sellingClub: fromClub,
          });
          const offer: TransferOffer = {
            amount,
            counterAmount: decision.status === "counter" ? decision.askingPrice : undefined,
            counterCount: decision.status === "counter" ? 1 : 0,
            createdWeek: state.game.currentSeason.currentWeek,
            fromClubId: fromClub.id,
            id: `offer-${player.id}-${state.game.currentSeason.currentWeek}-${state.transferOffers.length + 1}`,
            playerId,
            reason: decision.reason,
            status: decision.status,
            toClubId: toClub.id,
            wageDemand: decision.wageDemand,
          };

          if (decision.status !== "accepted") {
            return {
              game: {
                ...state.game,
                newsLog: [createTransferNews(state.game, offer), ...state.game.newsLog].slice(
                  0,
                  200,
                ),
              },
              lastAction:
                decision.status === "counter" ? "Contraproposta recebida" : "Oferta recusada",
              transferOffers: [offer, ...state.transferOffers],
            };
          }

          const game = applyTransfer(state.game, {
            fee: amount,
            fromClubId: fromClub.id,
            playerId,
            toClubId: toClub.id,
          });

          return {
            game: {
              ...game,
              newsLog: [createTransferNews(game, offer), ...game.newsLog].slice(0, 200),
            },
            lastAction: `${player.firstName} ${player.lastName} contratado`,
            tactic: {
              ...state.tactic,
              lineup: state.tactic.lineup.filter(
                (starterId) => game.players[starterId]?.clubId === toClub.id,
              ),
              savedAt: Date.now(),
            },
            transferOffers: [offer, ...state.transferOffers],
          };
        });
      },
      acceptCounterOffer: (offerId) => {
        set((state) => {
          const offer = state.transferOffers.find((entry) => entry.id === offerId);

          if (!offer?.counterAmount) {
            return { lastAction: "Contraproposta indisponivel" };
          }

          const player = state.game.players[offer.playerId];
          const buyer = state.game.clubs[offer.toClubId];

          if (!player || !buyer || buyer.budget < offer.counterAmount) {
            return { lastAction: "Orcamento insuficiente" };
          }

          const acceptedOffer: TransferOffer = {
            ...offer,
            amount: offer.counterAmount,
            status: "accepted",
          };
          const game = applyTransfer(state.game, {
            fee: offer.counterAmount,
            fromClubId: offer.fromClubId,
            playerId: offer.playerId,
            toClubId: offer.toClubId,
          });

          return {
            game: {
              ...game,
              newsLog: [createTransferNews(game, acceptedOffer), ...game.newsLog].slice(0, 200),
            },
            lastAction: `${player.firstName} ${player.lastName} contratado`,
            transferOffers: state.transferOffers.map((entry) =>
              entry.id === offerId ? acceptedOffer : entry,
            ),
          };
        });
      },
      rejectTransferOffer: (offerId) => {
        set((state) => ({
          lastAction: "Negociacao encerrada",
          transferOffers: state.transferOffers.map((offer) =>
            offer.id === offerId ? { ...offer, status: "rejected" } : offer,
          ),
        }));
      },
      runCpuTransferWindow: () => {
        set((state) => {
          if (!isTransferWindowOpen(state.game.currentSeason.currentWeek)) {
            return { lastAction: "Janela fechada" };
          }

          const rng = createRng(state.game.rngState);
          const deals = generateCpuTransferDeals({
            clubs: state.game.clubs,
            maxDeals: 8,
            players: state.game.players,
            rng,
          });
          const game = deals.reduce(
            (currentGame, deal) => applyTransfer(currentGame, deal),
            state.game,
          );
          const newsLog = deals.map((deal) => createCpuTransferNews(game, deal));

          return {
            cpuTransfersThisWindow: state.cpuTransfersThisWindow + deals.length,
            game: {
              ...game,
              rngState: rng.getState(),
              newsLog: [...newsLog, ...game.newsLog].slice(0, 200),
            },
            lastAction: `${deals.length} transferencias CPU`,
          };
        });
      },
      advanceRound: () => {
        set((state) => {
          const league = Object.values(state.game.leagues)[0];

          if (!league) {
            return { lastAction: "Liga indisponivel" };
          }

          const round = state.game.currentSeason.currentWeek;
          const maxRound = league.clubIds.length * 2 - 2;

          if (round > maxRound) {
            return {
              game: {
                ...state.game,
                currentSeason: {
                  ...state.game.currentSeason,
                  finished: true,
                },
              },
              lastAction: "Temporada encerrada",
            };
          }

          const rng = createRng(state.game.rngState);
          const playedMatches = simulateRound({
            league,
            clubs: state.game.clubs,
            players: state.game.players,
            matches: Object.values(state.game.matches),
            round,
            rng,
          });
          const matches = { ...state.game.matches };

          for (const match of playedMatches) {
            matches[match.id] = match;
          }

          const roundNews = generateRoundNews({
            clubs: state.game.clubs,
            matches: playedMatches,
            playerClubId: state.game.playerClubId,
            players: state.game.players,
            week: round,
          });
          const newsLog =
            roundNews.length > 0
              ? [...roundNews, ...state.game.newsLog].slice(0, 200)
              : state.game.newsLog;

          return {
            activeView: "match-day",
            game: {
              ...state.game,
              rngState: rng.getState(),
              currentSeason: {
                ...state.game.currentSeason,
                currentWeek: round + 1,
                finished: round + 1 > maxRound,
              },
              matches,
              newsLog,
            },
            lastAction: `Rodada ${round} jogada`,
            lastRoundMatchIds: playedMatches.map((match) => match.id),
          };
        });
      },
      resetCareer: () => {
        set({
          activeView: "home",
          game: INITIAL_GAME,
          lastAction: "",
          lastRoundMatchIds: [],
          pendingBenchPlayerId: null,
          selectedPlayerId: null,
          transferOffers: [],
          cpuTransfersThisWindow: 0,
          squadSort: {
            key: "overall",
            direction: "desc",
          },
          tactic: {
            formation: "4-4-2",
            mentality: "balanced",
            lineup: INITIAL_LINEUP,
            savedAt: 0,
          },
        });
      },
      saveManual: () => {
        set({ lastAction: "Carreira salva" });
      },
      acknowledgeAction: () => {
        set({ lastAction: "" });
      },
    }),
    {
      name: "minifoot-career-ui",
      partialize: (state) => ({
        activeView: state.activeView,
        cpuTransfersThisWindow: state.cpuTransfersThisWindow,
        game: state.game,
        lastRoundMatchIds: state.lastRoundMatchIds,
        squadSort: state.squadSort,
        tactic: state.tactic,
        transferOffers: state.transferOffers,
      }),
    },
  ),
);

function createInitialGameState(seed: number): GameState {
  const generated = generateLeague(seed);
  const playerClubId = generated.league.clubIds[0];

  if (!playerClubId) {
    throw new Error("Generated league has no clubs.");
  }

  const clubs = Object.fromEntries(
    Object.entries(generated.clubs).map(([clubId, club]) => [
      clubId,
      {
        ...club,
        isPlayerControlled: club.id === playerClubId,
      },
    ]),
  );

  const schedule = createLeagueSchedule(generated.league);

  return {
    version: CURRENT_SAVE_VERSION,
    seed,
    rngState: generated.rngState,
    createdAt: 0,
    playerName: "Tecnico",
    playerClubId,
    currentSeason: {
      number: 1,
      currentWeek: 1,
      totalWeeks: 41,
      competitions: [{ id: generated.league.id, type: "league" }],
      finished: false,
    },
    history: [],
    clubs,
    players: generated.players,
    leagues: {
      [generated.league.id]: generated.league,
    },
    matches: Object.fromEntries(schedule.map((match) => [match.id, match])),
    newsLog: [
      {
        id: "news-welcome",
        week: 1,
        type: "system",
        title: "Temporada aberta",
        body: "A diretoria quer um time competitivo sem perder a calma no caixa.",
        createdAt: 0,
        relatedClubId: playerClubId,
      },
    ],
    achievements: [],
  };
}

function createTransferNews(game: GameState, offer: TransferOffer): GameState["newsLog"][number] {
  const player = game.players[offer.playerId];
  const fromClub = game.clubs[offer.fromClubId];
  const toClub = game.clubs[offer.toClubId];

  return generateTransferNews({
    fee: offer.counterAmount ?? offer.amount,
    fromClub,
    id: `news-transfer-${offer.id}-${offer.status}`,
    player,
    reason: offer.status === "counter" ? `Pedida atual: ${offer.counterAmount}.` : offer.reason,
    status: offer.status,
    toClub,
    week: game.currentSeason.currentWeek,
  });
}

function createCpuTransferNews(
  game: GameState,
  deal: { playerId: string; fromClubId: string; toClubId: string; fee: number },
): GameState["newsLog"][number] {
  const player = game.players[deal.playerId];
  const fromClub = game.clubs[deal.fromClubId];
  const toClub = game.clubs[deal.toClubId];

  return generateTransferNews({
    fee: deal.fee,
    fromClub,
    id: `news-cpu-transfer-${deal.playerId}-${deal.toClubId}-${game.currentSeason.currentWeek}`,
    player,
    reason: `${fromClub?.shortName ?? "CPU"} recebeu ${deal.fee} pela negociacao.`,
    status: "accepted",
    toClub,
    week: game.currentSeason.currentWeek,
  });
}

function applyTransfer(
  game: GameState,
  deal: { playerId: string; fromClubId: string; toClubId: string; fee: number },
): GameState {
  const player = game.players[deal.playerId];
  const fromClub = game.clubs[deal.fromClubId];
  const toClub = game.clubs[deal.toClubId];

  if (!player || !fromClub || !toClub || fromClub.id === toClub.id) {
    return game;
  }

  const updatedFromClub: Club = {
    ...fromClub,
    budget: fromClub.budget + deal.fee,
    squad: fromClub.squad.filter((playerId) => playerId !== deal.playerId),
  };
  const updatedToClub: Club = {
    ...toClub,
    budget: Math.max(0, toClub.budget - deal.fee),
    squad: [...toClub.squad, deal.playerId],
  };
  const updatedPlayer: Player = {
    ...player,
    clubId: deal.toClubId,
    salary: Math.round(player.salary * 1.12),
  };

  return {
    ...game,
    clubs: {
      ...game.clubs,
      [deal.fromClubId]: updatedFromClub,
      [deal.toClubId]: updatedToClub,
    },
    players: {
      ...game.players,
      [deal.playerId]: updatedPlayer,
    },
  };
}

function pickBestLineup(game: GameState): string[] {
  const club = game.clubs[game.playerClubId];

  if (!club) {
    return [];
  }

  return club.squad
    .map((playerId) => game.players[playerId])
    .filter((player) => player !== undefined && player.injuryWeeksLeft === 0)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 11)
    .map((player) => player.id);
}
