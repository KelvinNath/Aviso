"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { HoverLift } from "@/components/motion/hover-lift";
import { copy } from "@/lib/copy";
import { formatEventTypes } from "@/lib/event-types";
import type { EventType, ExamCyclePhase } from "@prisma/client";
import { ExamCyclePhase as ExamCyclePhaseEnum } from "@prisma/client";

type SubscriptionItem = {
  id: string;
  eventTypes: EventType[];
  exam: {
    id: string;
    name: string;
    slug: string;
    cycles: Array<{
      phase: ExamCyclePhase;
      cycleYear: number;
    }>;
  };
};

type SubscriptionListProps = {
  subscriptions: SubscriptionItem[];
};

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(subscriptionId: string) {
    setRemovingId(subscriptionId);
    setError(null);

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to remove subscription");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRemovingId(null);
    }
  }

  if (subscriptions.length === 0) {
    return (
      <HoverLift>
        <Card variant="sky">
          <CardTitle>Nothing tracked yet</CardTitle>
          <CardDescription className="text-base">
            {copy.dashboard.subscriptionsEmpty}
          </CardDescription>
        </Card>
      </HoverLift>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-chunky brutal-border bg-aviso-coral/20 px-4 py-3 font-body text-sm"
        >
          {error}
        </motion.p>
      )}

      {subscriptions.map((subscription, index) => {
        const currentCycle = subscription.exam.cycles[0];
        const cycleEnded =
          currentCycle?.phase === ExamCyclePhaseEnum.COMPLETE;

        return (
        <motion.div
          key={subscription.id}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
        >
          <HoverLift>
            <Card variant={index % 2 === 0 ? "default" : "sky"}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{subscription.exam.name}</CardTitle>
                    {cycleEnded ? (
                      <Badge variant="coral">
                        {copy.dashboard.cycleEndedBadge(currentCycle.cycleYear)}
                      </Badge>
                    ) : (
                      <Badge variant="lime">Active</Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {formatEventTypes(subscription.eventTypes)}
                  </CardDescription>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={removingId === subscription.id}
                  onClick={() => handleRemove(subscription.id)}
                  className="shrink-0 self-start sm:self-center"
                >
                  {removingId === subscription.id
                    ? "Removing..."
                    : copy.dashboard.removeSubscription}
                </Button>
              </div>
            </Card>
          </HoverLift>
        </motion.div>
        );
      })}
    </div>
  );
}
