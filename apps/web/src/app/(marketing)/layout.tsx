import { createMetadata } from "@/lib/seo";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export const metadata = createMetadata({
  title: "Stop refreshing NTA",
  description:
    "Official exam updates with unofficial personality. Stop refreshing NTA every 15 minutes.",
  openGraph: {
    title: "Aviso — Stop refreshing NTA",
    description:
      "Get official JEE and entrance exam updates on Telegram. No more F5.",
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
