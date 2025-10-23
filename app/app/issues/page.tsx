"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { IssueCard } from "@/components/issues/issue-card";

export default function IssuesPage() {
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const issues = useQuery(
    api.issues.listIssues,
    workspaces && workspaces.length > 0
      ? { workspaceId: workspaces[0]._id }
      : "skip"
  );
  const statuses = useQuery(
    api.statuses.listStatuses,
    workspaces && workspaces.length > 0
      ? { workspaceId: workspaces[0]._id }
      : "skip"
  );

  const workspace = workspaces?.[0];

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredIssues = selectedStatus
    ? issues?.filter((issue) => issue.status?._id === selectedStatus)
    : issues;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Issues</h1>
            <p className="text-sm text-slate-400">
              {filteredIssues?.length || 0} {filteredIssues?.length === 1 ? "issue" : "issues"}
            </p>
          </div>
          <Link href="/app/issues/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Issue
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <button
            onClick={() => setSelectedStatus(null)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              selectedStatus === null
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {statuses?.map((status) => (
            <button
              key={status._id}
              onClick={() => setSelectedStatus(status._id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                selectedStatus === status._id
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {status.name}
            </button>
          ))}
        </div>

        {!filteredIssues || filteredIssues.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
            <p className="mb-3 text-base font-medium text-slate-300">No issues found</p>
            <p className="mb-6 text-sm text-slate-500">
              Get started by creating your first issue. Use ⌘K to quickly create one.
            </p>
            <Link href="/app/issues/new">
              <Button>Create Issue</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredIssues.map((issue) => (
              <Link key={issue._id} href={`/app/issues/${issue.number}`}>
                <IssueCard issue={issue} workspaceIdentifier={workspace?.identifier || ""} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
