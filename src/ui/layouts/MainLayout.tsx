import {
  BarChart3,
  CircleHelp,
  ClipboardList,
  Home,
  Newspaper,
  Play,
  Save,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import type { AppView } from "../../store/game.store";
import { useGameStore } from "../../store/game.store";
import { ShortcutsDialog } from "../components/ShortcutsDialog";
import { useHotkey } from "../hotkeys/useHotkey";

interface MainLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS: Array<{
  view: AppView;
  label: string;
  shortcut: string;
  icon: typeof Home;
}> = [
  { view: "home", label: "Home", shortcut: "1", icon: Home },
  { view: "squad", label: "Elenco", shortcut: "2", icon: Users },
  { view: "tactics", label: "Tatica", shortcut: "3", icon: ClipboardList },
  { view: "table", label: "Tabela", shortcut: "4", icon: BarChart3 },
  { view: "market", label: "Mercado", shortcut: "5", icon: ShoppingBag },
  { view: "news", label: "Noticias", shortcut: "6", icon: Newspaper },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const activeView = useGameStore((state) => state.activeView);
  const game = useGameStore((state) => state.game);
  const lastAction = useGameStore((state) => state.lastAction);
  const setActiveView = useGameStore((state) => state.setActiveView);
  const saveManual = useGameStore((state) => state.saveManual);
  const advanceRound = useGameStore((state) => state.advanceRound);
  const acknowledgeAction = useGameStore((state) => state.acknowledgeAction);
  const club = game.clubs[game.playerClubId];
  const title =
    activeView === "match-day"
      ? "Match Day"
      : (NAV_ITEMS.find((item) => item.view === activeView)?.label ?? "minifoot.");

  const closeShortcuts = useCallback(() => {
    setShortcutsOpen(false);
  }, []);

  const openShortcuts = useCallback(() => {
    setShortcutsOpen(true);
  }, []);

  const goHomeOrClose = useCallback(() => {
    if (shortcutsOpen) {
      closeShortcuts();
      return;
    }

    setActiveView("home");
  }, [closeShortcuts, setActiveView, shortcutsOpen]);

  useEffect(() => {
    if (!lastAction) {
      return undefined;
    }

    const timer = window.setTimeout(acknowledgeAction, 1_800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [acknowledgeAction, lastAction]);

  useHotkey("1", () => setActiveView("home"), { enabled: activeView !== "match-day" });
  useHotkey("2", () => setActiveView("squad"), { enabled: activeView !== "match-day" });
  useHotkey("3", () => setActiveView("tactics"), { enabled: activeView !== "match-day" });
  useHotkey("4", () => setActiveView("table"), { enabled: activeView !== "match-day" });
  useHotkey("5", () => setActiveView("market"), { enabled: activeView !== "match-day" });
  useHotkey("6", () => setActiveView("news"), { enabled: activeView !== "match-day" });
  useHotkey("?", openShortcuts);
  useHotkey("escape", goHomeOrClose, { enableOnFormTags: true });
  useHotkey("space", advanceRound, {
    enableOnFormTags: true,
    enabled: activeView !== "match-day",
  });
  useHotkey("mod+s", saveManual, { enableOnFormTags: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        className="fixed left-4 top-4 z-toast -translate-y-24 rounded-sm bg-accent px-3 py-2 text-sm font-semibold text-accent-contrast transition focus:translate-y-0"
        href="#main-content"
      >
        Pular para conteudo
      </a>
      <div className="grid min-h-screen lg:grid-cols-[232px_1fr]">
        <aside className="border-b border-border bg-ink-950/70 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface font-display text-base font-bold text-bone">
              mf<span className="text-pitch">.</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold">minifoot.</p>
              <p className="text-xs text-muted">{club?.shortName ?? "MFT"}</p>
            </div>
          </div>
          <nav
            aria-label="Principal"
            className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:px-3"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.view === activeView;

              return (
                <button
                  aria-current={active ? "page" : undefined}
                  className={`mb-1 flex min-h-11 shrink-0 items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-accent text-accent-contrast"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  title={`${item.label} (${item.shortcut})`}
                  type="button"
                >
                  <Icon aria-hidden="true" size={18} />
                  <span className="min-w-16 flex-1">{item.label}</span>
                  <kbd className="hidden rounded-xs border border-current/25 px-1.5 py-0.5 font-mono text-3xs lg:inline">
                    {item.shortcut}
                  </kbd>
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-sticky flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm text-muted">{club?.name ?? "Clube"}</p>
              <h1 className="truncate font-display text-xl font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Avancar rodada"
                className="hidden h-10 items-center gap-2 rounded-sm border border-border px-3 text-sm text-muted transition hover:border-border-strong hover:text-foreground sm:flex"
                onClick={advanceRound}
                title="Avancar rodada"
                type="button"
              >
                <Play aria-hidden="true" size={16} />
                Rodada
              </button>
              <button
                aria-label="Salvar carreira"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted transition hover:border-border-strong hover:text-foreground"
                onClick={saveManual}
                title="Salvar"
                type="button"
              >
                <Save aria-hidden="true" size={18} />
              </button>
              <button
                aria-label="Abrir atalhos"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-muted transition hover:border-border-strong hover:text-foreground"
                onClick={openShortcuts}
                title="Atalhos"
                type="button"
              >
                <CircleHelp aria-hidden="true" size={18} />
              </button>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-5 lg:px-6" id="main-content">
            {children}
          </main>
        </div>
      </div>
      {lastAction ? (
        <div className="fixed bottom-4 right-4 z-toast rounded-sm border border-border bg-surface px-4 py-3 text-sm shadow-md">
          {lastAction}
        </div>
      ) : null}
      <ShortcutsDialog onClose={closeShortcuts} open={shortcutsOpen} />
    </div>
  );
}
