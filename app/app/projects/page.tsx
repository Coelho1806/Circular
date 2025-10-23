"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Folder } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ProjectsPage() {
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const workspace = workspaces?.[0];
  const projects = useQuery(
    api.projects.listProjects,
    workspace ? { workspaceId: workspace._id } : "skip"
  );
  const createProject = useMutation(api.projects.createProject);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace) return;

    if (!name.trim() || !identifier.trim()) {
      toast.error("Name and identifier are required");
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        identifier: identifier.trim().toUpperCase(),
        workspaceId: workspace._id,
      });
      toast.success("Project created");
      setName("");
      setDescription("");
      setIdentifier("");
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Projects</h1>
            <p className="text-sm text-slate-400">
              {projects?.length || 0} {projects?.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Create project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Project name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Website Redesign"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Identifier
                </label>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                  placeholder="WEB"
                  maxLength={5}
                />
                <p className="mt-2 text-xs text-slate-500">
                  A short identifier (2-5 characters) used in issue keys.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the project goals and scope"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create project"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {!projects || projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
            <Folder className="mx-auto mb-3 h-12 w-12 text-slate-600" />
            <p className="mb-3 text-base font-medium text-slate-300">No projects yet</p>
            <p className="mb-6 text-sm text-slate-500">
              Projects help you organize issues by initiative or area.
            </p>
            <Button onClick={() => setShowForm(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project._id} href={`/app/projects/${project.identifier}`}>
                <div className="group rounded-lg border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700 hover:bg-slate-900">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    >
                      {project.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="text-xs text-slate-500">{project.identifier}</p>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
