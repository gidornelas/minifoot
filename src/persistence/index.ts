export { CURRENT_SAVE_VERSION } from "./migrations";
export type { SaveAdapter, SaveSlotId } from "./save";
export {
  createAutosave,
  createMemorySaveAdapter,
  deleteSaveSlot,
  loadGameState,
  loadSaveSlot,
  saveGameState,
  saveSlot,
  slotPath,
} from "./save";
export { createTauriSaveAdapter } from "./tauri-adapter";
