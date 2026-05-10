export type HotkeyScope =
  | "global"
  | "squad"
  | "tactics"
  | "match-day"
  | "market"
  | "news"
  | "season-end";

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
  { id: "sound.toggle", keys: ["M"], label: "Som on/off", scope: "global" },
  { id: "squad.search", keys: ["/"], label: "Buscar elenco", scope: "squad" },
  { id: "tactics.reset", keys: ["R"], label: "Resetar tatica", scope: "tactics" },
  { id: "tactics.auto", keys: ["A"], label: "Auto-escalacao", scope: "tactics" },
  { id: "tactics.save", keys: ["S"], label: "Salvar preset", scope: "tactics" },
  { id: "match.next", keys: ["Espaco"], label: "Proximo evento", scope: "match-day" },
  { id: "match.speed.1", keys: ["1"], label: "Velocidade 1x", scope: "match-day" },
  { id: "match.speed.2", keys: ["2"], label: "Velocidade 2x", scope: "match-day" },
  { id: "match.speed.5", keys: ["3"], label: "Velocidade 5x", scope: "match-day" },
  { id: "match.speed.10", keys: ["4"], label: "Velocidade 10x", scope: "match-day" },
  { id: "market.search", keys: ["/"], label: "Buscar jogador", scope: "market" },
  { id: "market.offer", keys: ["O"], label: "Fazer oferta", scope: "market" },
  { id: "news.search", keys: ["/"], label: "Buscar noticia", scope: "news" },
  { id: "season.next", keys: ["Enter"], label: "Proxima temporada", scope: "season-end" },
];

export function hotkeysByScope(scope: HotkeyScope): HotkeyEntry[] {
  return HOTKEYS.filter((hotkey) => hotkey.scope === scope);
}
