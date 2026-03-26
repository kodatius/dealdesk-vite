import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nowIso, requireUserId } from "./lib";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_key", (q) => q.eq("user_id", userId).eq("key", args.key))
      .unique();

    return integration?.value ?? null;
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_key", (q) => q.eq("user_id", userId).eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updated_at: nowIso(),
      });
      return args.value;
    }

    await ctx.db.insert("integrations", {
      user_id: userId,
      key: args.key,
      value: args.value,
      updated_at: nowIso(),
    });
    return args.value;
  },
});
