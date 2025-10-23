"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import slugify from "slugify";

export default function OnboardingPage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const createWorkspace = useMutation(api.workspaces.createWorkspace);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (identifier === "" && name) {
      setIdentifier(slugify(name, { lower: true, strict: true }));
    }
  }, [identifier, name]);

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      router.replace("/app");
    }
  }, [workspaces, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim()) {
      toast.error("Please provide a workspace name and identifier");
      return;
    }

    setLoading(true);
    try {
      await createWorkspace({
        name: name.trim(),
        description: "Primary workspace",
        identifier: identifier.trim(),
      });
      toast.success("Workspace created");
      router.replace("/app");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-10 shadow-xl">
        <h1 className="mb-3 text-3xl font-semibold text-white">Create your workspace</h1>
        <p className="mb-8 text-sm text-slate-400">
          Workspaces keep your projects, issues, and team organized.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Workspace name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Inc."
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Workspace identifier
            </label>
            <Input
              value={identifier}
              onChange={(event) =>
                setIdentifier(slugify(event.target.value, { lower: true, strict: true }))
              }
              placeholder="acme"
            />
            <p className="mt-2 text-xs text-slate-500">
              This will be used in issue keys and URLs.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating workspace..." : "Create workspace"}
          </Button>
        </form>
      </div>
    </div>
  );
}
