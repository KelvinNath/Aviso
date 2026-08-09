"use client";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => void signOut({ redirectTo: "/" })}
    >
      Sign out
    </Button>
  );
}
