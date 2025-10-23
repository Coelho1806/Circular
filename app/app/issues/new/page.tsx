"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PRIORITY_OPTIONS } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function NewIssuePage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const workspace = workspaces?.[0];
  const statuses = useQuery(
    api.statuses.listStatuses,
    workspace ? { workspaceId: workspace._id } : "skip"
  );
  const projects = useQuery(
    api.projects.listProjects,
    workspace ? { workspaceId: workspace._id } : "skip"
  );
  const members = useQuery(
    api.workspaces.listMembers,
    workspace ? { workspaceId: workspace._id } : "skip"
  );

  const createIssue = useMutation(api.issues.createIssue);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState<Id<"statuses"> | null>(null);
  const [priority, setPriority] = useState("none");
  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);
  const [assigneeId, setAssigneeId] = useState<Id<"users"> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace || !statuses || statuses.length === 0) {
      toast.error("Workspace or statuses not ready");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const statusToUse = statusId || statuses[0]._id;
      await createIssue({
        title: title.trim(),
        description: description.trim() || undefined,
        workspaceId: workspace._id,
        projectId: projectId ? projectId : undefined,
        statusId: statusToUse,
        priority,
        assigneeId: assigneeId ? assigneeId : undefined,
        dueDate: undefined,
        estimate: undefined,
      });
      toast.success("Issue created");
      router.replace("/app/issues");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Create issue</h1>
        <p className="mb-8 text-sm text-slate-400">
          Create a new task, bug, or feature request for your team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Title
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write a concise issue title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add context, reproduction steps, or requirements"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Status
              </label>
              <select
                value={statusId ?? ""}
                onChange={(event) =>
                  setStatusId(
                    event.target.value
                      ? (event.target.value as Id<"statuses">)
                      : null
                  )
                }
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value="">Select status</option>
                {statuses?.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Priority
              </label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Project
              </label>
              <select
                value={projectId ?? ""}
                onChange={(event) =>
                  setProjectId(
                    event.target.value
                      ? (event.target.value as Id<"projects">)
                      : null
                  )
                }
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value="">No project</option>
                {projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Assignee
              </label>
              <select
                value={assigneeId ?? ""}
                onChange={(event) =>
                  setAssigneeId(
                    event.target.value
                      ? (event.target.value as Id<"users">)
                      : null
                  )
                }
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
              >
                <option value="">Unassigned</option>
                {members?.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create issue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
