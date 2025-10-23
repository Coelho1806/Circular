"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Hash, FileText, Users, Settings } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)}>
      <div className="container flex items-start justify-center pt-[20vh]">
        <Command
          className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b border-slate-700 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search for issues, projects, or commands..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Actions" className="text-xs text-slate-500 px-2 py-1.5">
              <CommandItem
                onSelect={() => {
                  router.push("/new-issue");
                  setOpen(false);
                }}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span>Create new issue</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/projects");
                  setOpen(false);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>View projects</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/team");
                  setOpen(false);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                <span>Team settings</span>
              </CommandItem>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-slate-200 hover:bg-slate-800"
    >
      {children}
    </Command.Item>
  );
}
