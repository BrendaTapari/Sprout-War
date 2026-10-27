import { AppLogo } from "@/components/app-logo";

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
    <header className="flex items-center gap-3">
      <AppLogo className="size-14" />
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-[2.15rem] leading-[1.05] text-balance">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
