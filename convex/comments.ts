import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createComment = mutation({
  args: {
    issueId: v.id("issues"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
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

    const commentId = await ctx.db.insert("comments", {
      issueId: args.issueId,
      userId: user._id,
      content: args.content,
      parentId: args.parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activities", {
      issueId: args.issueId,
      userId: user._id,
      type: "commented",
      createdAt: Date.now(),
    });

    return commentId;
  },
});

export const listComments = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .order("asc")
      .collect();

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return { ...comment, user };
      })
    );

    return enriched;
  },
});
