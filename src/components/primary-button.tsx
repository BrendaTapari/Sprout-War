import type { ButtonHTMLAttributes, Ref } from "react";

export const primaryButtonClass =
  "inline-flex h-14 w-full touch-manipulation items-center justify-center rounded-2xl border-b-4 border-[oklch(0.58_0.15_138)] bg-accent font-display text-[1.35rem] leading-none text-accent-ink transition active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 disabled:active:border-b-4";

export const ghostButtonClass =
  "inline-flex h-14 w-full touch-manipulation items-center justify-center rounded-2xl border-2 border-b-4 border-line bg-card font-display text-lg leading-none text-foreground transition active:translate-y-1 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
};

export function PrimaryButton({
  className = "",
  type = "button",
  ref,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${primaryButtonClass} ${className}`}
      {...props}
    />
  );
}
