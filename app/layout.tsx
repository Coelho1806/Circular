import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { AppProvider } from "@/components/providers/app-provider";
import { CommandMenu } from "@/components/system/command-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linear Convex",
  description:
    "A modern, high-performance project management platform built with Next.js and Convex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-white antialiased`}
        >
          <AppProvider>
            {children}
            <Suspense>
              <CommandMenu />
            </Suspense>
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
