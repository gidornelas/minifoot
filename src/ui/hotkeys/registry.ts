export type HotkeyScope = "global" | "squad" | "tactics" | "match-day";

export interface HotkeyEntry {
  id: string;
  keys: string[];
  label: string;
  scope: HotkeyScope;
}

export const HOTKEYS: HotkeyEntry[] = [
  { id: "nav.home", keys: ["1"], label: "Home", scope: "global" },
  { id: "nav.squad", keys: ["2"], label: "Elenco", scope: "global" },
  { id: "nav.tactics", keys: ["3"], label: "Tatica", scope: "global" },
  { id: "nav.table", keys: ["4"], label: "Tabela", scope: "global" },
  { id: "nav.market", keys: ["5"], label: "Mercado", scope: "global" },
  { id: "nav.news", keys: ["6"], label: "Noticias", scope: "global" },
  { id: "action.continue", keys: ["Espaco"], label: "Avancar", scope: "global" },
  { id: "action.back", keys: ["Esc"], label: "Voltar", scope: "global" },
  { id: "modal.shortcuts", keys: ["?"], label: "Atalhos", scope: "global" },
  { id: "save.manual", keys: ["Ctrl/Command", "S"], label: "Salvar", scope: "global" },
  { id: "squad.search", keys: ["/"], label: "Buscar elenco", scope: "squad" },
  { id: "tactics.reset", keys: ["R"], label: "Resetar tatica", scope: "tactics" },
  { id: "tactics.auto", keys: ["A"], label: "Auto-escalacao", scope: "tactics" },
  { id: "tactics.save", keys: ["S"], label: "Salvar preset", scope: "tactics" },
];

export function hotkeysByScope(scope: HotkeyScope): HotkeyEntry[] {
  return HOTKEYS.filter((hotkey) => hotkey.scope === scope);
}
