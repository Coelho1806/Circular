import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    identifier: v.string(),
    workspaceId: v.id("workspaces"),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
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

    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_identifier", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("identifier", args.identifier)
      )
      .first();

    if (existingProject) {
      throw new Error("Project identifier already in use");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      identifier: args.identifier,
      workspaceId: args.workspaceId,
      createdBy: user._id,
      createdAt: Date.now(),
      color: args.color || "#5E81AC",
      icon: args.icon || "📦",
      archived: false,
    });

    return projectId;
  },
});

export const listProjects = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("archived"), false))
      .collect();

    return projects;
  },
});

export const getProjectByIdentifier = query({
  args: {
    workspaceId: v.id("workspaces"),
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_identifier", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("identifier", args.identifier)
      )
      .first();

    return project;
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { projectId, ...updates } = args;
    await ctx.db.patch(projectId, updates);
    return projectId;
  },
});

export const archiveProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.projectId, { archived: true });
    return args.projectId;
  },
});
