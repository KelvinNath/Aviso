"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FloatSticker } from "@/components/motion/float-sticker";
import { BellDoodle, TelegramDoodle } from "@/components/motion/doodles";
import { HoverLift } from "@/components/motion/hover-lift";
import { copy } from "@/lib/copy";

type TelegramConnectCardProps = {
  isConnected: boolean;
  telegramHandle: string | null;
};

type TelegramLinkResponse = {
  code: string;
  deepLink: string;
};

export function TelegramConnectCard({
  isConnected,
  telegramHandle,
}: TelegramConnectCardProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (isConnected) {
      return;
    }

    const handleFocus = () => {
      refreshDashboard();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isConnected, refreshDashboard]);

  async function handleConnect() {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/me/telegram-link", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate Telegram link");
      }

      const data = (await response.json()) as TelegramLinkResponse;
      window.open(data.deepLink, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <HoverLift>
      <Card
        variant={isConnected ? "lime" : "yellow"}
        className="relative overflow-hidden"
      >
        {!isConnected && (
          <FloatSticker
            duration={4}
            className="pointer-events-none absolute bottom-4 right-4 opacity-20"
          >
            <TelegramDoodle className="h-10 w-10" />
          </FloatSticker>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Telegram</CardTitle>
              {!isConnected && (
                <BellDoodle className="h-6 w-6 shrink-0" />
              )}
            </div>
            <CardDescription className="text-base opacity-90">
              {isConnected
                ? copy.dashboard.telegramConnected
                : copy.dashboard.telegramNotConnected}
            </CardDescription>
          </div>
          <Badge
            variant={isConnected ? "lime" : "coral"}
            className="shrink-0 self-start"
          >
            {isConnected ? "Connected ✅" : "Not connected"}
          </Badge>
        </div>

        {isConnected ? (
          <div className="mt-4 flex flex-col gap-3 border-t-2 border-aviso-dark/10 pt-4 font-body text-sm dark:border-aviso-light/10">
            {telegramHandle && (
              <p>
                Connected to{" "}
                <span className="font-semibold">{telegramHandle}</span>
              </p>
            )}
            <Button variant="ghost" size="sm" disabled className="self-start">
              Disconnect (coming soon)
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 border-t-2 border-aviso-dark/10 pt-4 dark:border-aviso-light/10">
            {error && (
              <p className="rounded-chunky brutal-border bg-aviso-coral/20 px-4 py-3 font-body text-sm">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="dark"
                size="sm"
                arrow
                disabled={isConnecting}
                onClick={handleConnect}
                className="self-start"
              >
                {isConnecting ? "Opening Telegram..." : "Connect Telegram"}
              </Button>
              <p className="max-w-sm font-body text-xs opacity-60 sm:text-right">
                Opens Telegram in a new tab. Tap Start to finish connecting.
              </p>
            </div>
          </div>
        )}
      </Card>
    </HoverLift>
  );
}
