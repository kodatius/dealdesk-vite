import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { enrichComp, nowIso, requireUserId } from "./lib";

async function logActivity(
  ctx: MutationCtx,
  userId: string,
  dealId: Id<"deals">,
  action: string,
) {
  await ctx.db.insert("activity_log", {
    user_id: userId,
    deal_id: dealId,
    action,
    created_at: nowIso(),
  });
}

export const getByDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.dealId);
    if (!deal || deal.user_id !== userId) {
      return [];
    }

    const comps = await ctx.db
      .query("comps")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.dealId))
      .collect();
    return comps
      .sort((a, b) => b.date_sold.localeCompare(a.date_sold))
      .map(enrichComp);
  },
});

export const getById = query({
  args: { id: v.id("comps") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const comp = await ctx.db.get(args.id);
    if (!comp || comp.user_id !== userId) {
      return null;
    }
    return enrichComp(comp);
  },
});

export const create = mutation({
  args: {
    dealId: v.id("deals"),
    address: v.string(),
    sale_price: v.number(),
    sqft: v.number(),
    date_sold: v.string(),
    distance_miles: v.optional(v.number()),
    year_built: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.dealId);
    if (!deal || deal.user_id !== userId) {
      throw new Error("Not found");
    }

    const id = await ctx.db.insert("comps", {
      user_id: userId,
      deal_id: args.dealId,
      address: args.address,
      sale_price: args.sale_price,
      sqft: args.sqft,
      date_sold: args.date_sold,
      distance_miles: args.distance_miles,
      year_built: args.year_built,
      beds: args.beds,
      baths: args.baths,
      created_at: nowIso(),
    });
    const comp = await ctx.db.get(id);
    if (!comp) {
      throw new Error("Failed to create comp");
    }

    await logActivity(ctx, userId, args.dealId, `Comp added: ${comp.address}`);
    return enrichComp(comp);
  },
});

export const remove = mutation({
  args: { id: v.id("comps") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const comp = await ctx.db.get(args.id);
    if (!comp || comp.user_id !== userId) {
      return null;
    }

    await ctx.db.delete(args.id);
    await logActivity(ctx, userId, comp.deal_id, `Comp removed: ${comp.address}`);
    return { success: true, dealId: comp.deal_id };
  },
});
