import type { GameState } from "../engine";
import { CURRENT_SAVE_VERSION, migrateSave } from "./migrations";
import { GameStateSchema } from "./schemas";

export { CURRENT_SAVE_VERSION } from "./migrations";

export type SaveSlotId = 1 | 2 | 3 | "autosave";

export interface SaveAdapter {
  readText: (path: string) => Promise<string | null>;
  writeText: (path: string, contents: string) => Promise<void>;
  delete: (path: string) => Promise<void>;
}

export function saveGameState(state: GameState): string {
  const parsed = GameStateSchema.parse({
    ...state,
    version: CURRENT_SAVE_VERSION,
  });

  return JSON.stringify(parsed, null, 2);
}

export function loadGameState(raw: unknown): GameState {
  const payload = typeof raw === "string" ? parseJson(raw) : raw;

  return migrateSave(payload);
}

export async function saveSlot(
  adapter: SaveAdapter,
  slotId: SaveSlotId,
  state: GameState,
): Promise<void> {
  await adapter.writeText(slotPath(slotId), saveGameState(state));
}

export async function loadSaveSlot(adapter: SaveAdapter, slotId: SaveSlotId): Promise<GameState> {
  const raw = await adapter.readText(slotPath(slotId));

  if (raw === null) {
    throw new Error(`Save slot ${slotId} not found.`);
  }

  return loadGameState(raw);
}

export async function deleteSaveSlot(adapter: SaveAdapter, slotId: SaveSlotId): Promise<void> {
  await adapter.delete(slotPath(slotId));
}

export function createAutosave(adapter: SaveAdapter, delayMs = 600) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingState: GameState | null = null;
  let inFlight: Promise<void> | null = null;

  const run = () => {
    if (!pendingState) {
      return Promise.resolve();
    }

    const state = pendingState;
    pendingState = null;
    inFlight = saveSlot(adapter, "autosave", state).finally(() => {
      inFlight = null;
    });

    return inFlight;
  };

  return {
    schedule: (state: GameState) => {
      pendingState = state;

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        timer = null;
        void run();
      }, delayMs);
    },
    flush: async () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      await run();

      if (inFlight) {
        await inFlight;
      }
    },
    cancel: () => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = null;
      pendingState = null;
    },
  };
}

export function createMemorySaveAdapter(initialFiles?: Record<string, string>): SaveAdapter {
  const files = new Map(Object.entries(initialFiles ?? {}));

  return {
    readText: async (path) => files.get(path) ?? null,
    writeText: async (path, contents) => {
      files.set(path, contents);
    },
    delete: async (path) => {
      files.delete(path);
    },
  };
}

export function slotPath(slotId: SaveSlotId): string {
  return slotId === "autosave" ? "saves/autosave.json" : `saves/slot-${slotId}.json`;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid save JSON: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}
