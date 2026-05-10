interface PlaceholderViewProps {
  title: string;
  eyebrow: string;
}

export function PlaceholderView({ title, eyebrow }: PlaceholderViewProps) {
  return (
    <section className="flex min-h-[360px] flex-col justify-center border-l border-border pl-6">
      <p className="font-mono text-xs uppercase text-muted">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Este modulo entra quando o plano chegar ao sprint correspondente.
      </p>
    </section>
  );
}
