import type { GameState } from "../engine";
import { GameStateSchema } from "./schemas";

export const CURRENT_SAVE_VERSION = 1;

export type SaveMigration = (save: Record<string, unknown>) => Record<string, unknown>;

export const migrations: Record<number, SaveMigration> = {};

export function migrateSave(raw: unknown): GameState {
  if (!isRecord(raw)) {
    throw new Error("Save payload must be an object.");
  }

  let save = { ...raw };
  const version = save.version;

  if (!Number.isInteger(version)) {
    throw new Error("Save payload is missing a valid version.");
  }

  while ((save.version as number) < CURRENT_SAVE_VERSION) {
    const migration = migrations[save.version as number];

    if (!migration) {
      throw new Error(`Missing migration for save version ${String(save.version)}.`);
    }

    save = migration(save);
  }

  if (save.version !== CURRENT_SAVE_VERSION) {
    throw new Error(`Unsupported save version ${String(save.version)}.`);
  }

  return GameStateSchema.parse(save);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
