import { Lightbulb, X } from "lucide-react";
import type { AppView } from "../../store/game.store";
import { useGameStore } from "../../store/game.store";

interface TutorialTip {
  id: string;
  view: AppView;
  title: string;
  body: string;
}

const TIPS: TutorialTip[] = [
  {
    body: "A Home mostra semana, tabela curta, caixa e o proximo compromisso.",
    id: "home",
    title: "Painel principal",
    view: "home",
  },
  {
    body: "No elenco, Enter abre detalhes e a busca filtra jogadores rapidamente.",
    id: "squad",
    title: "Elenco no teclado",
    view: "squad",
  },
  {
    body: "A tatica salva formacao, mentalidade e XI automaticamente na carreira.",
    id: "tactics",
    title: "Tatica persistente",
    view: "tactics",
  },
  {
    body: "Espaco avanca a rodada fora do Match Day; na partida, revela eventos.",
    id: "advance",
    title: "Ritmo da temporada",
    view: "match-day",
  },
];

export function TutorialCoachMarks() {
  const activeView = useGameStore((state) => state.activeView);
  const dismissedIds = useGameStore((state) => state.tutorialDismissedIds);
  const dismissTutorial = useGameStore((state) => state.dismissTutorial);
  const skipTutorial = useGameStore((state) => state.skipTutorial);
  const tip = TIPS.find((item) => item.view === activeView && !dismissedIds.includes(item.id));

  if (!tip) {
    return null;
  }

  return (
    <aside
      aria-label="Tutorial"
      className="fixed bottom-4 left-4 z-popover w-[min(360px,calc(100vw-32px))] animate-panel-in rounded-sm border border-whistle bg-surface px-4 py-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-whistle text-warn-contrast">
          <Lightbulb aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase text-muted">Dica</p>
          <h2 className="mt-1 font-display text-base font-semibold">{tip.title}</h2>
          <p className="mt-2 text-sm text-muted">{tip.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="min-h-10 rounded-sm bg-accent px-3 text-sm font-semibold text-accent-contrast"
              onClick={() => dismissTutorial(tip.id)}
              type="button"
            >
              Entendi
            </button>
            <button
              className="min-h-10 rounded-sm border border-border px-3 text-sm text-muted hover:border-border-strong hover:text-foreground"
              onClick={skipTutorial}
              type="button"
            >
              Pular tutorial
            </button>
          </div>
        </div>
        <button
          aria-label="Fechar dica"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted hover:border-border-strong hover:text-foreground"
          onClick={() => dismissTutorial(tip.id)}
          type="button"
        >
          <X aria-hidden="true" size={16} />
        </button>
      </div>
    </aside>
  );
}
