export function ActionDock({
  children,
  aboveNav = true,
}: {
  children: React.ReactNode;
  aboveNav?: boolean;
}) {
  const position = aboveNav
    ? "bottom-[calc(5.15rem+env(safe-area-inset-bottom))]"
    : "bottom-[max(0.85rem,env(safe-area-inset-bottom))]";

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-30 flex justify-center px-5 ${position}`}
    >
      <div className="pointer-events-auto w-full max-w-[390px]">{children}</div>
    </div>
  );
}
