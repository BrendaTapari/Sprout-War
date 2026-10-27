export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-[2.7rem] leading-[1.05] tracking-tight text-balance">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-muted">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
