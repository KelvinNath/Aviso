const SITE_URL_FALLBACK = "https://aviso.app";

/**
 * Public AvisoMe website URL for Telegram CTAs.
 * Prefer NEXT_PUBLIC_SITE_URL, then AUTH_URL — never localhost in production CTAs.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    SITE_URL_FALLBACK;

  return raw.replace(/\/+$/, "");
}

export function getSignUpUrl(): string {
  return `${getSiteUrl()}/signin`;
}

export function getDashboardUrl(): string {
  return `${getSiteUrl()}/dashboard`;
}

export function getTrackExamsUrl(): string {
  return `${getSiteUrl()}/dashboard/track`;
}

export function getManageNotificationsUrl(): string {
  return `${getSiteUrl()}/dashboard`;
}
