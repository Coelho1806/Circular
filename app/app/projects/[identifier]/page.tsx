"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IssueCard } from "@/components/issues/issue-card";

export default function ProjectDetailPage({
  params,
}: {
  params: { identifier: string };
}) {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const workspace = workspaces?.[0];

  const project = useQuery(
    api.projects.getProjectByIdentifier,
    workspace
      ? { workspaceId: workspace._id, identifier: params.identifier }
      : "skip"
  );

  const issues = useQuery(
    api.issues.listIssues,
    workspace && project
      ? { workspaceId: workspace._id, projectId: project._id }
      : "skip"
  );

  if (!workspace) {
    return null;
  }

  if (project === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="mb-4 text-sm text-slate-400">Project not found.</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!project || !issues) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="text-sm text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/app/projects"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                {project.description}
              </p>
            )}
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${project.color}20`, color: project.color }}
          >
            {project.icon}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Issues</h2>
          {issues.length === 0 ? (
            <p className="text-sm text-slate-400">No issues in this project yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {issues.map((issue) => (
                <Link key={issue._id} href={`/app/issues/${issue.number}`}>
                  <IssueCard issue={issue} workspaceIdentifier={workspace.identifier} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
