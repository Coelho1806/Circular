"use client";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import { getPriorityIcon } from "@/lib/utils";

type IssueWithRelations = Doc<"issues"> & {
  status?: Doc<"statuses"> | null;
  assignee?: Doc<"users"> | null;
  project?: Doc<"projects"> | null;
  creator?: Doc<"users"> | null;
  labels?: Array<Doc<"labels">>;
};

export function IssueCard({
  issue,
  workspaceIdentifier,
}: {
  issue: IssueWithRelations;
  workspaceIdentifier: string;
}) {
  const initials = issue.assignee?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group rounded-xl border border-transparent bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            {workspaceIdentifier.toUpperCase()}-{issue.number}
          </p>
          <h3 className="text-sm font-semibold text-slate-100">{issue.title}</h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
          {initials || "??"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-slate-300">
          {getPriorityIcon(issue.priority)} {issue.priority.toUpperCase()}
        </span>
        {issue.project && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-slate-400">
            {issue.project.icon || "📁"}
            {issue.project.identifier.toUpperCase()}
          </span>
        )}
        {issue.labels?.map((label) => (
          <span
            key={label._id as Id<"labels">}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1"
            style={{ backgroundColor: `${label.color}20`, color: label.color }}
          >
            ● {label.name}
          </span>
        ))}
      </div>
    </div>
  );
}
