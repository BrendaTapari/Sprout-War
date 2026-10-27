import Image from "next/image";

export function AppLogo({
  className = "size-14",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Sprout Wars"
      width={1024}
      height={1024}
      quality={100}
      priority={priority}
      className={`${className} shrink-0 rounded-2xl ring-1 ring-accent/40`}
    />
  );
}
