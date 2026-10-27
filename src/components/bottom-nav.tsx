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
      <div className="w-full max-w-[430px] rounded-t-[1.6rem] border border-b-0 border-line bg-[oklch(0.2_0.045_150/0.96)] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_oklch(0.1_0.02_150/0.45)]">
        <ul className="grid h-[4.4rem] grid-cols-4">
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
                  className={`mx-1 flex h-[3.4rem] flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-extrabold tracking-wide ${
                    active ? "bg-accent/20 text-accent" : "text-muted"
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
      <svg {...props} strokeWidth={2}>
        <path d="M18.518 17.347A7 7 0 0 1 14 19" />
        <path d="M18.8 4A11 11 0 0 1 20 9" />
        <path d="M9 9h.01" />
        <circle cx="20" cy="16" r="2" />
        <circle cx="9" cy="9" r="7" />
        <rect x="4" y="16" width="10" height="6" rx="2" />
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
