import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Formation, GameState, Mentality } from "../engine";
import { createLeagueSchedule, createRng, generateLeague, simulateRound } from "../engine";
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

          const playerMatch = playedMatches.find(
            (match) =>
              match.homeId === state.game.playerClubId || match.awayId === state.game.playerClubId,
          );
          const newsLog = playerMatch
            ? [
                createMatchNews(state.game, playerMatch.id, round, matches),
                ...state.game.newsLog,
              ].slice(0, 200)
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
        game: state.game,
        lastRoundMatchIds: state.lastRoundMatchIds,
        squadSort: state.squadSort,
        tactic: state.tactic,
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

function createMatchNews(
  game: GameState,
  matchId: string,
  round: number,
  matches: GameState["matches"],
): GameState["newsLog"][number] {
  const match = matches[matchId];

  if (!match?.result) {
    return {
      id: `news-round-${round}`,
      week: round,
      type: "match",
      title: `Rodada ${round} concluida`,
      createdAt: round,
    };
  }

  const home = game.clubs[match.homeId];
  const away = game.clubs[match.awayId];

  return {
    id: `news-${match.id}`,
    week: round,
    type: "match",
    title: `${home?.shortName ?? match.homeId} ${match.result.homeGoals} x ${
      match.result.awayGoals
    } ${away?.shortName ?? match.awayId}`,
    body: match.result.events[0]?.description ?? "Partida sem grandes rupturas no roteiro.",
    createdAt: round,
    relatedClubId: game.playerClubId,
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
