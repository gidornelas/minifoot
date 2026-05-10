const readinessItems = [
  "React + Vite ativos",
  "TypeScript strict configurado",
  "Tauri pronto para abrir a janela",
  "Vitest com smoke test",
];

export function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface font-display text-lg font-bold tracking-[-0.02em] text-bone">
            mf<span className="text-pitch">.</span>
          </div>
          <div>
            <p className="font-mono text-sm text-muted">Sprint 0</p>
            <h1 className="font-display text-3xl tracking-[-0.02em]" aria-label="minifoot.">
              <span className="font-medium">mini</span>
              <span className="font-bold">foot</span>
              <span className="text-pitch">.</span>
            </h1>
          </div>
        </div>

        <div className="max-w-2xl border-l border-border pl-6">
          <p className="text-lg text-muted">
            Base tecnica criada. A proxima etapa e estabilizar dominio, RNG e geracao deterministica
            da liga.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {readinessItems.map((item) => (
            <li
              className="rounded-sm border border-border bg-surface px-4 py-3 text-sm text-foreground"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
