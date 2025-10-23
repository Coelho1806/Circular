"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const workspace = workspaces?.[0];

  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [workspaceDescription, setWorkspaceDescription] = useState(
    workspace?.description || ""
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400">
              Manage your workspace and personal preferences.
            </p>
          </div>
          <SettingsIcon className="h-10 w-10 text-slate-600" />
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Workspace settings</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Workspace name
                </label>
                <Input
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="Workspace name"
                  disabled
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Description
                </label>
                <Textarea
                  value={workspaceDescription}
                  onChange={(event) => setWorkspaceDescription(event.target.value)}
                  placeholder="Describe your workspace"
                  disabled
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Workspace identifier
                </label>
                <Input
                  value={workspace?.identifier || ""}
                  placeholder="Identifier"
                  disabled
                />
                <p className="mt-2 text-xs text-slate-500">
                  This is used in issue keys and cannot be changed.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Keyboard shortcuts</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Open command palette</span>
                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  ⌘K
                </kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Create new issue</span>
                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  C
                </kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Go to issues</span>
                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  G + I
                </kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Go to projects</span>
                <kbd className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  G + P
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
