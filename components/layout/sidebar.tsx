"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Hash,
  Folder,
  Users,
  Settings,
  Keyboard,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

const navigation = [
  { name: "Overview", href: "/app", icon: Home },
  { name: "Issues", href: "/app/issues", icon: Hash },
  { name: "Projects", href: "/app/projects", icon: Folder },
  { name: "Team", href: "/app/team", icon: Users },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar({ workspace }: { workspace: Doc<"workspaces"> }) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-slate-800 px-4">
          <Link href="/app" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-purple-500">
              <span className="text-white font-bold text-sm">{workspace.identifier.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="text-lg font-semibold text-white truncate">
              {workspace.name}
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 scrollbar-thin">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center space-x-3 rounded-md bg-slate-900 px-3 py-2">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || user.username || "User"}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Keyboard className="h-3 w-3" />
                <span>Press ⌘K for commands</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
