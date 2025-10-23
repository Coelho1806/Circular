"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { UserSync } from "@/components/providers/user-sync";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (workspaces !== undefined && workspaces.length === 0) {
      router.replace("/onboarding");
    }
  }, [isSignedIn, isLoaded, workspaces, router]);

  if (!isLoaded || !isSignedIn || !workspaces || workspaces.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="text-sm text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <UserSync />
      <Sidebar workspace={workspaces[0]} />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
