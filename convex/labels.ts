import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createLabel = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const labelId = await ctx.db.insert("labels", {
      name: args.name,
      color: args.color,
      workspaceId: args.workspaceId,
      createdAt: Date.now(),
    });

    return labelId;
  },
});

export const listLabels = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const labels = await ctx.db
      .query("labels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return labels;
  },
});

export const addLabelToIssue = mutation({
  args: {
    issueId: v.id("issues"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue_and_label", (q) =>
        q.eq("issueId", args.issueId).eq("labelId", args.labelId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const issueLabelId = await ctx.db.insert("issueLabels", {
      issueId: args.issueId,
      labelId: args.labelId,
    });

    return issueLabelId;
  },
});

export const removeLabelFromIssue = mutation({
  args: {
    issueId: v.id("issues"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const issueLabel = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue_and_label", (q) =>
        q.eq("issueId", args.issueId).eq("labelId", args.labelId)
      )
      .first();

    if (issueLabel) {
      await ctx.db.delete(issueLabel._id);
    }

    return issueLabel?._id;
  },
});
