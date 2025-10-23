"use client";

import { useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { user, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const key = useMemo(() => user?.id, [user?.id]);

  useEffect(() => {
    if (!isSignedIn || !user || !key) return;

    syncUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "User",
      imageUrl: user.imageUrl || undefined,
    }).catch((error) => {
      console.error("Failed to sync user", error);
    });
  }, [isSignedIn, key, syncUser, user]);

  return null;
}
