import Image from "next/image";

export function FightRing({
  children,
  stage = false,
}: {
  children: React.ReactNode;
  stage?: boolean;
}) {
  return (
    <div
      className={
        stage
          ? "absolute inset-0 overflow-hidden"
          : "relative mt-4 flex aspect-[4/3] w-full shrink-0 items-end justify-center overflow-hidden rounded-[1.75rem] px-3 pb-2"
      }
    >
      <Image
        src="/ring/3926.jpg"
        alt=""
        fill
        priority
        sizes="430px"
        className="pointer-events-none object-cover object-[center_58%]"
      />
      {children}
    </div>
  );
}
