import { BaseDirectory, mkdir, readTextFile, remove, writeTextFile } from "@tauri-apps/plugin-fs";
import type { SaveAdapter } from "./save";

const SAVE_DIR = "saves";

export function createTauriSaveAdapter(): SaveAdapter {
  return {
    readText: async (path) => {
      try {
        return await readTextFile(path, { baseDir: BaseDirectory.AppData });
      } catch {
        return null;
      }
    },
    writeText: async (path, contents) => {
      await mkdir(SAVE_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
      await writeTextFile(path, contents, { baseDir: BaseDirectory.AppData });
    },
    delete: async (path) => {
      try {
        await remove(path, { baseDir: BaseDirectory.AppData });
      } catch {
        // Deleting an empty slot is idempotent from the game's point of view.
      }
    },
  };
}
