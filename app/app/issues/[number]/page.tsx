"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, User, Calendar, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { formatDate, getPriorityLabel } from "@/lib/utils";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function IssueDetailPage({
  params,
}: {
  params: { number: string };
}) {
  const { number } = params;
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const workspace = workspaces?.[0];

  const issue = useQuery(
    api.issues.getIssueByNumber,
    workspace
      ? { workspaceId: workspace._id, number: parseInt(number) }
      : "skip"
  );

  if (issue === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-white">Issue not found</h1>
          <p className="text-sm text-slate-400">
            The requested issue does not exist or has been archived.
          </p>
        </div>
      </div>
    );
  }

  const comments = useQuery(
    api.comments.listComments,
    issue ? { issueId: issue._id } : "skip"
  );

  const activities = useQuery(
    api.activities.listActivities,
    issue ? { issueId: issue._id } : "skip"
  );

  const statuses = useQuery(
    api.statuses.listStatuses,
    workspace ? { workspaceId: workspace._id } : "skip"
  );

  const updateIssue = useMutation(api.issues.updateIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);
  const createComment = useMutation(api.comments.createComment);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!issue || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
          <p className="text-sm text-slate-400">Loading issue...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateIssue({
        issueId: issue._id,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success("Issue updated");
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update issue");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this issue?")) return;
    try {
      await deleteIssue({ issueId: issue._id });
      toast.success("Issue deleted");
      router.push("/app/issues");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to delete issue");
    }
  };

  const handleStatusChange = async (statusId: Id<"statuses">) => {
    try {
      await updateIssue({
        issueId: issue._id,
        statusId,
      });
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update status");
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      await createComment({
        issueId: issue._id,
        content: comment.trim(),
      });
      setComment("");
      toast.success("Comment added");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/app/issues"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to issues
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">
                  {workspace.identifier.toUpperCase()}-{issue.number}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-slate-200"
                  style={{ backgroundColor: issue.status?.color }}
                >
                  {issue.status?.name}
                </span>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Issue title"
                  />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="mb-4 text-2xl font-bold text-white">{issue.title}</h1>
                  {issue.description && (
                    <p className="mb-4 text-sm text-slate-300 whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setTitle(issue.title);
                        setDescription(issue.description || "");
                        setEditing(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Comments</h2>

              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="mb-2"
                />
                <Button type="submit" disabled={submittingComment || !comment.trim()}>
                  {submittingComment ? "Adding..." : "Add comment"}
                </Button>
              </form>

              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="rounded-md border border-slate-700 bg-slate-900 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No comments yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Status</label>
                  <select
                    value={issue.statusId}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as Id<"statuses">)
                    }
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-100"
                  >
                    {statuses?.map((status) => (
                      <option key={status._id} value={status._id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">Priority</label>
                  <div className="text-sm text-slate-300">{getPriorityLabel(issue.priority)}</div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">Assignee</label>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    {issue.assignee ? (
                      <>
                        <User className="h-4 w-4" />
                        {issue.assignee.name}
                      </>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </div>
                </div>

                {issue.project && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">Project</label>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Folder className="h-4 w-4" />
                      {issue.project.name}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs text-slate-500">Created</label>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Calendar className="h-4 w-4" />
                    {formatDate(issue.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {activities && activities.length > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">Activity</h3>
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div key={activity._id} className="text-xs text-slate-400">
                      <span className="font-medium text-slate-300">{activity.user?.name}</span>{" "}
                      {activity.type} {activity.field && `${activity.field}`}{" "}
                      <span className="text-slate-500">{formatDate(activity.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
