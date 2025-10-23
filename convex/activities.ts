import { v } from "convex/values";
import { query } from "./_generated/server";

export const listActivities = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_created", (q) => q.eq("issueId", args.issueId))
      .order("asc")
      .collect();

    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return { ...activity, user };
      })
    );

    return enriched;
  },
});
