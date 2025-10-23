"use client";

import { ReactNode } from "react";
import { AppProvider } from "@/components/providers/app-provider";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
