import Link from "next/link";

import { AvisoLogo } from "@/components/layout/aviso-logo";
import { Container } from "@/components/layout/container";

const footerLinks = [
  { href: "/design-system", label: "Design System" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-aviso-dark bg-aviso-light py-8 dark:border-aviso-light dark:bg-aviso-dark">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <AvisoLogo textClassName="text-lg" imageClassName="h-8" />
            <p className="mt-1 font-body text-sm opacity-70">
              We remember the deadlines. You remember the syllabus.
            </p>
          </div>

          <ul className="flex flex-wrap gap-4">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-body text-sm underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 font-body text-xs opacity-50">
          © {new Date().getFullYear()} Aviso. Nothing exploded today.
        </p>
      </Container>
    </footer>
  );
}
