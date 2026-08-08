import Link from "next/link";

import { AvisoLogo } from "@/components/layout/aviso-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/layout/container";

type DashboardHeaderProps = {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
};

export function DashboardHeader({
  displayName,
  email,
  avatarUrl,
}: DashboardHeaderProps) {
  const label = displayName ?? email;

  return (
    <header className="border-b-2 border-aviso-dark bg-aviso-light dark:border-aviso-light dark:bg-aviso-dark">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="inline-flex items-center">
            <AvisoLogo />
          </Link>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
        </div>
      </Container>
    </header>
  );
}
