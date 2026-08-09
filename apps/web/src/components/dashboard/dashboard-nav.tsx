"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";

type DashboardNavLinksProps = {
  hasSubscriptions: boolean;
  onNavigate?: () => void;
  className?: string;
  linkClassName?: string;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname.startsWith(href);
}

export function DashboardNavLinks({
  hasSubscriptions,
  onNavigate,
  className,
  linkClassName,
}: DashboardNavLinksProps) {
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
    <ul className={cn("flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-1", className)}>
      {navLinks.map((link) => {
        const active = isActivePath(pathname, link.href);

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-chunky px-3 py-2 font-heading text-xs font-bold uppercase tracking-wide brutal-border transition-colors sm:text-sm lg:py-1.5",
                active
                  ? "bg-aviso-lime text-aviso-dark brutal-shadow-sm"
                  : "bg-transparent hover:bg-aviso-sky/30",
                linkClassName,
              )}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type DashboardNavProps = {
  hasSubscriptions: boolean;
};

export function DashboardNav({ hasSubscriptions }: DashboardNavProps) {
  return (
    <nav
      aria-label="Dashboard"
      className="hidden items-center lg:flex"
    >
      <DashboardNavLinks hasSubscriptions={hasSubscriptions} />
    </nav>
  );
}
