"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/app");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="mb-8 inline-flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-3xl">L</span>
          </div>
        </div>

        <h1 className="mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
          Linear Convex
        </h1>
        
        <p className="mb-12 text-xl text-slate-400 max-w-2xl mx-auto">
          The issue tracking tool teams love. Built with Next.js and Convex for blazing-fast
          real-time collaboration.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-4 h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Real-time Updates</h3>
            <p className="text-sm text-slate-400">
              See changes instantly with Convex&apos;s real-time database. No refresh needed.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-4 h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-2xl">
              🎯
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Keyboard First</h3>
            <p className="text-sm text-slate-400">
              Work at the speed of thought with keyboard shortcuts and command palette.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-4 h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-2xl">
              🚀
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Modern Stack</h3>
            <p className="text-sm text-slate-400">
              Built with Next.js 15, TypeScript, and Convex for a production-ready experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
