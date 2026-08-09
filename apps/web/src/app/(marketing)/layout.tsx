import { createMetadata } from "@/lib/seo";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export const metadata = createMetadata({
  title: "Official exam alerts on Telegram",
  description:
    "Track JEE, BITSAT, COMEDK, and state entrances from official sources. Get Telegram alerts when admit cards, dates, and results drop.",
  openGraph: {
    title: "Aviso — Exam alerts without the refresh marathon",
    description:
      "Official updates for engineering entrances, delivered on Telegram when they actually matter.",
  },
});

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteNav />
      <div id="main-content">{children}</div>
      <SiteFooter />
    </>
  );
}
