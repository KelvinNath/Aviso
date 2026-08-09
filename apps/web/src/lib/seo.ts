import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aviso.app";

export const siteConfig = {
  name: "Aviso",
  tagline: "We remember the deadlines. You remember the syllabus.",
  description:
    "Track JEE, BITSAT, COMEDK, and state entrances from official sources. Telegram alerts when admit cards, dates, and results drop.",
  url: siteUrl,
  ogImage: `${siteUrl}/opengraph-image`,
  twitterHandle: "@avisoapp",
} as const;

export function createMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
    },
    robots: {
      index: true,
      follow: true,
    },
    ...overrides,
  };
}
