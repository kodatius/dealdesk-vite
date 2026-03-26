import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  dealInput,
  dealStageValues,
  enrichDeal,
  nowIso,
  optionalString,
  requireUserId,
} from "./lib";

async function logActivity(
  ctx: MutationCtx,
  userId: string,
  dealId: Id<"deals"> | undefined,
  action: string,
  details?: string,
) {
  await ctx.db.insert("activity_log", {
    user_id: userId,
    deal_id: dealId,
    action,
    details: optionalString(details),
    created_at: nowIso(),
  });
}

export const getAll = query({
  args: {
    stage: v.optional(v.union(...dealStageValues.map((stage) => v.literal(stage)))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deals = args.stage
      ? await ctx.db
          .query("deals")
          .withIndex("by_user_stage", (q) =>
            q.eq("user_id", userId).eq("stage", args.stage!),
          )
          .collect()
      : await ctx.db
          .query("deals")
          .withIndex("by_user_id", (q) => q.eq("user_id", userId))
          .collect();

    return deals
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(enrichDeal);
  },
});

export const getById = query({
  args: { id: v.id("deals") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.id);
    if (!deal || deal.user_id !== userId) {
      return null;
    }

    const comps = await ctx.db
      .query("comps")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.id))
      .collect();

    return {
      ...enrichDeal(deal),
      comps: comps
        .sort((a, b) => b.date_sold.localeCompare(a.date_sold))
        .map((comp) => ({
          id: comp._id,
          deal_id: comp.deal_id,
          address: comp.address,
          sale_price: comp.sale_price,
          sqft: comp.sqft,
          date_sold: comp.date_sold,
          distance_miles: comp.distance_miles ?? null,
          year_built: comp.year_built ?? null,
          beds: comp.beds ?? null,
          baths: comp.baths ?? null,
          created_at: comp.created_at,
        })),
    };
  },
});

export const create = mutation({
  args: dealInput,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const timestamp = nowIso();
    const id = await ctx.db.insert("deals", {
      user_id: userId,
      address: args.address,
      asking_price: args.asking_price,
      beds: args.beds,
      baths: args.baths,
      sqft: args.sqft,
      repair_estimate: args.repair_estimate,
      arv: args.arv,
      arv_locked: args.arv_locked ?? false,
      stage: args.stage ?? "Lead",
      notes: optionalString(args.notes),
      seller_first_name: optionalString(args.seller_first_name),
      seller_last_name: optionalString(args.seller_last_name),
      seller_phone: optionalString(args.seller_phone),
      seller_email: optionalString(args.seller_email),
      created_at: timestamp,
      updated_at: timestamp,
    });

    const deal = await ctx.db.get(id);
    if (!deal) {
      throw new Error("Failed to create deal");
    }

    await logActivity(ctx, userId, id, `Deal created: ${deal.address}`);
    return enrichDeal(deal);
  },
});

export const update = mutation({
  args: {
    id: v.id("deals"),
    ...dealInput,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.id);
    if (!deal || deal.user_id !== userId) {
      return null;
    }

    const patch = {
      address: args.address,
      asking_price: args.asking_price,
      beds: args.beds,
      baths: args.baths,
      sqft: args.sqft,
      repair_estimate: args.repair_estimate,
      arv: args.arv,
      arv_locked: args.arv_locked ?? deal.arv_locked,
      stage: args.stage ?? deal.stage,
      notes: optionalString(args.notes),
      seller_first_name: optionalString(args.seller_first_name),
      seller_last_name: optionalString(args.seller_last_name),
      seller_phone: optionalString(args.seller_phone),
      seller_email: optionalString(args.seller_email),
      updated_at: nowIso(),
    };

    await ctx.db.patch(args.id, patch);
    const updated = await ctx.db.get(args.id);
    if (!updated) {
      return null;
    }

    const changedFields = Object.keys(args).filter((key) => key !== "id").join(", ");
    await logActivity(
      ctx,
      userId,
      args.id,
      `Deal updated: ${updated.address}`,
      changedFields,
    );
    return enrichDeal(updated);
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("deals"),
    stage: v.union(...dealStageValues.map((stage) => v.literal(stage))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.id);
    if (!deal || deal.user_id !== userId) {
      return null;
    }

    await ctx.db.patch(args.id, {
      stage: args.stage,
      updated_at: nowIso(),
    });
    const updated = await ctx.db.get(args.id);
    if (!updated) {
      return null;
    }

    await logActivity(
      ctx,
      userId,
      args.id,
      `Stage changed: ${deal.stage} -> ${args.stage}`,
    );
    return enrichDeal(updated);
  },
});

export const setArvState = mutation({
  args: {
    id: v.id("deals"),
    arv: v.optional(v.number()),
    arv_locked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.id);
    if (!deal || deal.user_id !== userId) {
      return null;
    }

    await ctx.db.patch(args.id, {
      arv: args.arv,
      arv_locked: args.arv_locked ?? deal.arv_locked,
      updated_at: nowIso(),
    });

    const updated = await ctx.db.get(args.id);
    return updated ? enrichDeal(updated) : null;
  },
});

export const updateGhlSync = mutation({
  args: {
    id: v.id("deals"),
    ghl_contact_id: v.optional(v.string()),
    ghl_opportunity_id: v.optional(v.string()),
    ghl_sync_status: v.optional(v.string()),
    ghl_last_synced_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.id);
    if (!deal || deal.user_id !== userId) {
      return null;
    }

    await ctx.db.patch(args.id, {
      ghl_contact_id: args.ghl_contact_id ?? deal.ghl_contact_id,
      ghl_opportunity_id: args.ghl_opportunity_id ?? deal.ghl_opportunity_id,
      ghl_sync_status: args.ghl_sync_status,
      ghl_last_synced_at: args.ghl_last_synced_at,
      updated_at: nowIso(),
    });

    const updated = await ctx.db.get(args.id);
    return updated ? enrichDeal(updated) : null;
  },
});

export const getGhlSyncStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();

    const synced = deals.filter((deal) => deal.ghl_sync_status === "synced").length;
    const failed = deals.filter((deal) => deal.ghl_sync_status === "failed").length;
    const lastSyncedAt = deals
      .map((deal) => deal.ghl_last_synced_at)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => b.localeCompare(a))[0] ?? null;

    return { synced, failed, lastSyncedAt };
  },
});

export const remove = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const deal = await ctx.db.get(args.id);
    if (!deal || deal.user_id !== userId) {
      return false;
    }

    const comps = await ctx.db
      .query("comps")
      .withIndex("by_deal_id", (q) => q.eq("deal_id", args.id))
      .collect();
    for (const comp of comps) {
      await ctx.db.delete(comp._id);
    }

    await ctx.db.delete(args.id);
    return true;
  },
});
