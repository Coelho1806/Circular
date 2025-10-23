"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function TeamPage() {
  const workspaces = useQuery(api.workspaces.listWorkspaces, {});
  const workspace = workspaces?.[0];
  const members = useQuery(
    api.workspaces.listMembers,
    workspace ? { workspaceId: workspace._id } : "skip"
  );

  const [email, setEmail] = useState("");

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success("Invitation email sent (simulated). Configure email provider to enable real invites.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Team</h1>
            <p className="text-sm text-slate-400">
              Manage members and roles for the {workspace?.name} workspace.
            </p>
          </div>
          <Users className="h-10 w-10 text-slate-600" />
        </div>

        <div className="mb-10 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Invite teammates</h2>
          <p className="mb-4 text-sm text-slate-400">
            Share access by sending an invite. Actual email delivery requires configuring a provider like SendGrid.
          </p>
          <form onSubmit={handleInvite} className="flex flex-col gap-3 md:flex-row">
            <Input
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" className="gap-2">
              <Mail className="h-4 w-4" />
              Send Invite
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60">
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Member</div>
            <div className="hidden text-xs uppercase tracking-wide text-slate-500 md:block">
              Email
            </div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Role</div>
          </div>

          <div className="divide-y divide-slate-800">
            {members && members.length > 0 ? (
              members.map((member) => (
                <div key={member?._id} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                  <div>
                    <div className="text-sm font-medium text-white">{member?.name}</div>
                    <div className="text-xs text-slate-500 md:hidden">
                      {member?.email}
                    </div>
                  </div>
                  <div className="hidden text-sm text-slate-300 md:block">{member?.email}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Shield className="h-4 w-4" />
                    <span className="capitalize">{member?.role || "member"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-slate-500">No members yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
