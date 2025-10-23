import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_STATUSES = [
  { name: "Backlog", type: "triage", position: 0, color: "#8891A4" },
  { name: "Todo", type: "todo", position: 1, color: "#8FBCBB" },
  { name: "In Progress", type: "doing", position: 2, color: "#5E81AC" },
  { name: "Review", type: "review", position: 3, color: "#B48EAD" },
  { name: "Done", type: "done", position: 4, color: "#A3BE8C" },
];

const DEFAULT_PRIORITIES = ["No priority", "Urgent", "High", "Medium", "Low"];

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const existingIdentifier = await ctx.db
      .query("workspaces")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (existingIdentifier) {
      throw new Error("Workspace identifier already in use");
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      identifier: args.identifier,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: user._id,
      role: "admin",
      joinedAt: Date.now(),
    });

    await Promise.all(
      DEFAULT_STATUSES.map((status, index) =>
        ctx.db.insert("statuses", {
          name: status.name,
          type: status.type,
          workspaceId,
          color: status.color,
          position: index,
        })
      )
    );

    await Promise.all(
      DEFAULT_PRIORITIES.map((priority, index) =>
        ctx.db.insert("labels", {
          name: priority,
          color: ["#1F2937", "#DC2626", "#EA580C", "#2563EB", "#0EA5E9"][index],
          workspaceId,
          createdAt: Date.now(),
        })
      )
    );

    return workspaceId;
  },
});

export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (!memberships.length) {
      return [];
    }

    const workspaceIds = memberships.map((membership) => membership.workspaceId);

    const workspaces = await Promise.all(
      workspaceIds.map((workspaceId) => ctx.db.get(workspaceId))
    );

    return workspaces.filter((workspace) => workspace !== null);
  },
});

export const getWorkspaceByIdentifier = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (!workspace) {
      return null;
    }

    return workspace;
  },
});

export const getWorkspaceMembership = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .first();

    return membership;
  },
});

export const listMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const users = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return user && { ...user, role: membership.role };
      })
    );

    return users.filter((user) => user !== null);
  },
});
