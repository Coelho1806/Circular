import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getNextIssueNumber(ctx: any, workspaceId: any) {
  const sequence = await ctx.db
    .query("workspaceSequences")
    .withIndex("by_workspace", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("name", "issueNumber")
    )
    .first();

  if (sequence) {
    const newValue = sequence.value + 1;
    await ctx.db.patch(sequence._id, { value: newValue });
    return newValue;
  } else {
    await ctx.db.insert("workspaceSequences", {
      workspaceId,
      name: "issueNumber",
      value: 1,
    });
    return 1;
  }
}

export const createIssue = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    statusId: v.id("statuses"),
    priority: v.string(),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    estimate: v.optional(v.number()),
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

    const number = await getNextIssueNumber(ctx, args.workspaceId);

    const issueId = await ctx.db.insert("issues", {
      title: args.title,
      description: args.description,
      number,
      statusId: args.statusId,
      priority: args.priority,
      projectId: args.projectId,
      workspaceId: args.workspaceId,
      assigneeId: args.assigneeId,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: args.dueDate,
      estimate: args.estimate,
      archived: false,
    });

    await ctx.db.insert("activities", {
      issueId,
      userId: user._id,
      type: "created",
      createdAt: Date.now(),
    });

    return issueId;
  },
});

export const listIssues = query({
  args: {
    workspaceId: v.id("workspaces"),
    statusId: v.optional(v.id("statuses")),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let issuesQuery = ctx.db
      .query("issues")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("archived"), false));

    if (args.statusId) {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) =>
          q.and(
            q.eq(q.field("archived"), false),
            q.eq(q.field("statusId"), args.statusId)
          )
        );
    } else if (args.projectId) {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) =>
          q.and(
            q.eq(q.field("archived"), false),
            q.eq(q.field("projectId"), args.projectId)
          )
        );
    } else if (args.assigneeId) {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) =>
          q.and(
            q.eq(q.field("archived"), false),
            q.eq(q.field("assigneeId"), args.assigneeId)
          )
        );
    }

    const issues = await issuesQuery.collect();

    const enrichedIssues = await Promise.all(
      issues.map(async (issue) => {
        const status = issue.statusId ? await ctx.db.get(issue.statusId) : null;
        const assignee = issue.assigneeId
          ? await ctx.db.get(issue.assigneeId)
          : null;
        const project = issue.projectId ? await ctx.db.get(issue.projectId) : null;
        const creator = await ctx.db.get(issue.createdBy);

        const labels = await ctx.db
          .query("issueLabels")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();

        const labelDetails = await Promise.all(
          labels.map((l) => ctx.db.get(l.labelId))
        );

        return {
          ...issue,
          status,
          assignee,
          project,
          creator,
          labels: labelDetails.filter((l) => l !== null),
        };
      })
    );

    return enrichedIssues.sort((a, b) => b.number - a.number);
  },
});

export const getIssueByNumber = query({
  args: {
    workspaceId: v.id("workspaces"),
    number: v.number(),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db
      .query("issues")
      .withIndex("by_number", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("number", args.number)
      )
      .first();

    if (!issue) {
      return null;
    }

    const status = issue.statusId ? await ctx.db.get(issue.statusId) : null;
    const assignee = issue.assigneeId ? await ctx.db.get(issue.assigneeId) : null;
    const project = issue.projectId ? await ctx.db.get(issue.projectId) : null;
    const creator = await ctx.db.get(issue.createdBy);

    const labels = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
      .collect();

    const labelDetails = await Promise.all(
      labels.map((l) => ctx.db.get(l.labelId))
    );

    return {
      ...issue,
      status,
      assignee,
      project,
      creator,
      labels: labelDetails.filter((l) => l !== null),
    };
  },
});

export const updateIssue = mutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    statusId: v.optional(v.id("statuses")),
    priority: v.optional(v.string()),
    assigneeId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    dueDate: v.optional(v.number()),
    estimate: v.optional(v.number()),
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

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    const { issueId, ...updates } = args;

    Object.keys(updates).forEach((key) => {
      const updateKey = key as keyof typeof updates;
      if (updates[updateKey] !== undefined) {
        const oldValue = issue[updateKey as keyof typeof issue];
        const newValue = updates[updateKey];
        if (oldValue !== newValue) {
          ctx.db.insert("activities", {
            issueId,
            userId: user._id,
            type: "updated",
            field: key,
            oldValue: oldValue ? String(oldValue) : undefined,
            newValue: newValue ? String(newValue) : undefined,
            createdAt: Date.now(),
          });
        }
      }
    });

    await ctx.db.patch(issueId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return issueId;
  },
});

export const deleteIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.issueId, { archived: true });
    return args.issueId;
  },
});

export const searchIssues = query({
  args: {
    workspaceId: v.id("workspaces"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("archived"), false))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();
    const filteredIssues = allIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description?.toLowerCase().includes(searchLower) ||
        issue.number.toString().includes(args.searchTerm)
    );

    const enrichedIssues = await Promise.all(
      filteredIssues.map(async (issue) => {
        const status = issue.statusId ? await ctx.db.get(issue.statusId) : null;
        const assignee = issue.assigneeId
          ? await ctx.db.get(issue.assigneeId)
          : null;
        const project = issue.projectId ? await ctx.db.get(issue.projectId) : null;

        return {
          ...issue,
          status,
          assignee,
          project,
        };
      })
    );

    return enrichedIssues.slice(0, 50);
  },
});
