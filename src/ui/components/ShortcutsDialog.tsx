import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { HOTKEYS } from "../hotkeys/registry";

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SCOPE_LABELS = {
  global: "Global",
  market: "Mercado",
  "match-day": "Partida",
  news: "Noticias",
  "season-end": "Fim de temporada",
  squad: "Elenco",
  tactics: "Tatica",
};

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby="shortcuts-title"
      aria-modal="true"
      className="fixed inset-0 z-modal flex items-center justify-center bg-ink-950/80 px-4"
      role="dialog"
    >
      <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-md border border-border bg-surface shadow-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <h2 className="font-display text-lg font-semibold" id="shortcuts-title">
            Atalhos
          </h2>
          <button
            aria-label="Fechar atalhos"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted transition hover:border-border-strong hover:text-foreground"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {(
            ["global", "squad", "tactics", "match-day", "market", "news", "season-end"] as const
          ).map((scope) => {
            const hotkeys = HOTKEYS.filter((hotkey) => hotkey.scope === scope);

            if (hotkeys.length === 0) {
              return null;
            }

            return (
              <section key={scope}>
                <h3 className="mb-3 font-display text-sm font-semibold text-muted">
                  {SCOPE_LABELS[scope]}
                </h3>
                <dl className="space-y-2">
                  {hotkeys.map((hotkey) => (
                    <div
                      className="flex items-center justify-between gap-4 text-sm"
                      key={hotkey.id}
                    >
                      <dt className="text-foreground">{hotkey.label}</dt>
                      <dd className="flex gap-1">
                        {hotkey.keys.map((key) => (
                          <kbd
                            className="rounded-xs border border-border bg-ink-900 px-2 py-1 font-mono text-2xs text-muted"
                            key={`${hotkey.id}-${key}`}
                          >
                            {key}
                          </kbd>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
