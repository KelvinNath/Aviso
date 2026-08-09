"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";

type DashboardNavProps = {
  hasSubscriptions: boolean;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname.startsWith(href);
}

export function DashboardNav({ hasSubscriptions }: DashboardNavProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: copy.dashboard.navDashboard },
    ...(hasSubscriptions
      ? [
          {
            href: "/dashboard/notifications",
            label: copy.dashboard.navNotifications,
          },
        ]
      : []),
  ] as const;

  return (
    <nav
      aria-label="Dashboard"
      className="flex items-center gap-1 overflow-x-auto"
    >
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-chunky px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wide brutal-border transition-colors sm:text-sm",
              active
                ? "bg-aviso-lime text-aviso-dark brutal-shadow-sm"
                : "bg-transparent hover:bg-aviso-sky/30",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
