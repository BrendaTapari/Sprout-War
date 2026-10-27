"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountNavLink } from "@/components/account-menu";

const ITEMS = [
  { href: "/", label: "Ring" },
  { href: "/fighter", label: "Luchador" },
  { href: "/ranking", label: "Ranking" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center"
    >
      <div className="w-full max-w-[430px] border-t border-line bg-[oklch(0.16_0.028_155/0.94)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <ul className="grid h-16 grid-cols-4">
          {ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-wide ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <NavIcon href={item.href} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <AccountNavLink />
          </li>
        </ul>
      </div>
    </nav>
  );
}

function NavIcon({ href }: { href: string }) {
  const props = {
    viewBox: "0 0 24 24",
    className: "size-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (href === "/") {
    return (
      <svg {...props}>
        <path d="M12 3 21 12 12 21 3 12Z" />
        <path d="M8.5 12h7" />
      </svg>
    );
  }

  if (href === "/fighter") {
    return (
      <svg {...props}>
        <path d="M12 21V10" />
        <path d="M12 13c-4-.6-5.2-4.6-4-8 4.2.2 6 3.2 4 8Z" />
        <path d="M12 15c3.2-.4 6.2-3 6-6.2-4 .4-6 3.2-6 6.2Z" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M8 4h8v6a4 4 0 0 1-8 0Z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 9.5" />
      <path d="M16 6h2.5A2.5 2.5 0 0 1 16 9.5" />
      <path d="M12 14v3" />
      <path d="M9 20h6" />
    </svg>
  );
}
