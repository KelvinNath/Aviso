"use client";

import Link from "next/link";
import { useState } from "react";

import { AvisoLogo } from "@/components/layout/aviso-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "#exams", label: "Exams" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
] as const;

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-aviso-dark bg-aviso-light/95 backdrop-blur-sm dark:border-aviso-light dark:bg-aviso-dark/95">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center">
            <AvisoLogo />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-heading text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-70"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <ButtonLink href="/signin" size="sm" arrow>
              Get started
            </ButtonLink>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 brutal-border rounded-chunky"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span
                className={cn(
                  "block h-0.5 w-5 bg-aviso-dark transition-transform dark:bg-aviso-light",
                  menuOpen && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-aviso-dark transition-opacity dark:bg-aviso-light",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-aviso-dark transition-transform dark:bg-aviso-light",
                  menuOpen && "-translate-y-2 -rotate-45",
                )}
              />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t-2 border-aviso-dark pb-4 md:hidden dark:border-aviso-light">
            <ul className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-chunky px-4 py-3 font-heading text-sm font-bold uppercase tracking-wide hover:bg-aviso-lime/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="px-4 pt-2">
                <ButtonLink href="/signin" size="sm" arrow className="w-full">
                  Get started
                </ButtonLink>
              </li>
            </ul>
          </div>
        )}
      </Container>
    </header>
  );
}
