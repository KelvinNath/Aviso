"use client";

import Link from "next/link";
import { useState } from "react";

import { AvisoLogo } from "@/components/layout/aviso-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  DashboardMenuButton,
  DashboardMobileMenu,
} from "@/components/dashboard/dashboard-mobile-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/layout/container";

type DashboardHeaderProps = {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  hasSubscriptions: boolean;
};

export function DashboardHeader({
  displayName,
  email,
  avatarUrl,
  hasSubscriptions,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const label = displayName ?? email;

  return (
    <header className="border-b-2 border-aviso-dark bg-aviso-light dark:border-aviso-light dark:bg-aviso-dark">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 lg:gap-6">
            <Link href="/dashboard" className="inline-flex shrink-0 items-center">
              <AvisoLogo />
            </Link>
            <DashboardNav hasSubscriptions={hasSubscriptions} />
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
              <ThemeToggle />

              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate font-body text-sm font-medium">{label}</p>
                <p className="truncate font-body text-xs opacity-60">{email}</p>
              </div>

              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-9 w-9 shrink-0 rounded-full brutal-border object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aviso-lime brutal-border font-heading text-sm font-bold text-aviso-dark">
                  {label.charAt(0).toUpperCase()}
                </div>
              )}

              <SignOutButton />
            </div>

            <DashboardMenuButton
              open={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            />
          </div>
        </div>
      </Container>

      <DashboardMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        hasSubscriptions={hasSubscriptions}
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
      />
    </header>
  );
}
