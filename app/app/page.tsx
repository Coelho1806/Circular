"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { IssueCard } from "@/components/issues/issue-card";

export default function AppHomePage() {
  const { user } = useUser();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id || "",
  });
  const issues = useQuery(
    api.issues.listIssues,
    workspaces && workspaces.length > 0
      ? { workspaceId: workspaces[0]._id, assigneeId: currentUser?._id }
      : "skip"
  );

  const recentIssues = useQuery(
    api.issues.listIssues,
    workspaces && workspaces.length > 0
      ? { workspaceId: workspaces[0]._id }
      : "skip"
  );

  const workspace = workspaces?.[0];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Good evening{user?.firstName && `, ${user.firstName}`}!</h1>
            <p className="text-sm text-slate-400">Here&apos;s what&apos;s happening across your workspace.</p>
          </div>
          <Link href="/app/issues/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Issue
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Assigned to you</h2>
              <Link
                href={`/app/issues?assignee=${currentUser?._id}`}
                className="text-sm text-slate-400 hover:text-white"
              >
                View all <ArrowRight className="inline h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {!issues || issues.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
                  <p className="mb-2 text-sm font-medium text-slate-400">
                    No issues assigned to you
                  </p>
                  <p className="text-xs text-slate-500">
                    Create a new issue or ask a team member to assign one to you.
                  </p>
                </div>
              ) : (
                issues
                  .slice(0, 5)
                  .map((issue) => (
                    <Link key={issue._id} href={`/app/issues/${issue.number}`}>
                      <IssueCard issue={issue} workspaceIdentifier={workspace?.identifier || ""} />
                    </Link>
                  ))
              )}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <Link href="/app/issues" className="text-sm text-slate-400 hover:text-white">
                View all <ArrowRight className="inline h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {!recentIssues || recentIssues.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
                  <p className="mb-2 text-sm font-medium text-slate-400">No recent issues</p>
                  <p className="text-xs text-slate-500">
                    Get started by creating your first issue.
                  </p>
                </div>
              ) : (
                recentIssues
                  .slice(0, 5)
                  .map((issue) => (
                    <Link key={issue._id} href={`/app/issues/${issue.number}`}>
                      <IssueCard issue={issue} workspaceIdentifier={workspace?.identifier || ""} />
                    </Link>
                  ))
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-2 text-3xl font-bold text-white">
              {recentIssues?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Total Issues</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-2 text-3xl font-bold text-white">
              {issues?.length || 0}
            </div>
            <div className="text-sm text-slate-400">Assigned to You</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-2 text-3xl font-bold text-green-500">
              {recentIssues?.filter((i) => i.status?.type === "done").length || 0}
            </div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
