import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { enrichActivity, nowIso, optionalString, requireUserId } from "./lib";

export const log = mutation({
  args: {
    dealId: v.optional(v.id("deals")),
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const id = await ctx.db.insert("activity_log", {
      user_id: userId,
      deal_id: args.dealId,
      action: args.action,
      details: optionalString(args.details),
      created_at: nowIso(),
    });
    const activity = await ctx.db.get(id);
    return activity ? enrichActivity(activity) : null;
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const activity = await ctx.db
      .query("activity_log")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();

    return activity
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, args.limit ?? 10)
      .map(enrichActivity);
  },
});
