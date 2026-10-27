import type { ButtonHTMLAttributes, Ref } from "react";

export const primaryButtonClass =
  "inline-flex h-14 w-full touch-manipulation items-center justify-center rounded-2xl bg-accent text-lg font-semibold tracking-tight text-accent-ink shadow-[0_0_32px_oklch(0.88_0.21_136/0.38)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100";

export const ghostButtonClass =
  "inline-flex h-11 w-full touch-manipulation items-center justify-center rounded-xl border border-line bg-card text-sm font-medium text-foreground transition active:scale-[0.98]";

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
