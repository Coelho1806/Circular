import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listStatuses = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const statuses = await ctx.db
      .query("statuses")
      .withIndex("by_workspace_and_position", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .collect();

    return statuses;
  },
});

export const createStatus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.string(),
    color: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const statusId = await ctx.db.insert("statuses", {
      workspaceId: args.workspaceId,
      name: args.name,
      type: args.type,
      color: args.color,
      position: args.position,
    });

    return statusId;
  },
});

export const updateStatusOrder = mutation({
  args: {
    statusId: v.id("statuses"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.statusId, { position: args.position });

    return args.statusId;
  },
});

export const deleteStatus = mutation({
  args: { statusId: v.id("statuses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const relatedIssues = await ctx.db
      .query("issues")
      .withIndex("by_status", (q) => q.eq("statusId", args.statusId))
      .collect();

    if (relatedIssues.length > 0) {
      throw new Error("Cannot delete status with active issues");
    }

    await ctx.db.delete(args.statusId);
    return args.statusId;
  },
});
