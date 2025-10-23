import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { CryptoSubtlePolyfill } from "@/components/providers/crypto-subtle-polyfill";

import "./globals.css";

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
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/app"
      afterSignUpUrl="/onboarding"
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-white antialiased`}
        >
          <CryptoSubtlePolyfill />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
