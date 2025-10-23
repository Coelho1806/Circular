import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  workspaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    identifier: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_identifier", ["identifier"])
    .index("by_creator", ["createdBy"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.string(),
    joinedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    identifier: v.string(),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    archived: v.boolean(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_identifier", ["workspaceId", "identifier"])
    .index("by_creator", ["createdBy"]),

  statuses: defineTable({
    name: v.string(),
    type: v.string(),
    workspaceId: v.id("workspaces"),
    color: v.string(),
    position: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_position", ["workspaceId", "position"]),

  labels: defineTable({
    name: v.string(),
    color: v.string(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_name", ["workspaceId", "name"]),

  issues: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    number: v.number(),
    statusId: v.id("statuses"),
    priority: v.string(),
    projectId: v.optional(v.id("projects")),
    workspaceId: v.id("workspaces"),
    assigneeId: v.optional(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    dueDate: v.optional(v.number()),
    estimate: v.optional(v.number()),
    archived: v.boolean(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["statusId"])
    .index("by_assignee", ["assigneeId"])
    .index("by_project", ["projectId"])
    .index("by_creator", ["createdBy"])
    .index("by_number", ["workspaceId", "number"])
    .index("by_updated", ["workspaceId", "updatedAt"]),

  issueLabels: defineTable({
    issueId: v.id("issues"),
    labelId: v.id("labels"),
  })
    .index("by_issue", ["issueId"])
    .index("by_label", ["labelId"])
    .index("by_issue_and_label", ["issueId", "labelId"]),

  comments: defineTable({
    issueId: v.id("issues"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    parentId: v.optional(v.id("comments")),
  })
    .index("by_issue", ["issueId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),

  activities: defineTable({
    issueId: v.id("issues"),
    userId: v.id("users"),
    type: v.string(),
    field: v.optional(v.string()),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_issue", ["issueId"])
    .index("by_user", ["userId"])
    .index("by_created", ["issueId", "createdAt"]),

  workspaceSequences: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    value: v.number(),
  })
    .index("by_workspace", ["workspaceId", "name"]),
});
