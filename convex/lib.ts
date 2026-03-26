import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export const dealStageValues = [
  "Lead",
  "Offer Sent",
  "Under Contract",
  "Closed",
  "Dead",
] as const;

export type DealStage = (typeof dealStageValues)[number];

export async function requireUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
}

export function optionalString(value: string | null | undefined) {
  return value == null || value === "" ? undefined : value;
}

export function nowIso() {
  return new Date().toISOString();
}

export function computeFinancials(deal: {
  asking_price: number;
  repair_estimate: number;
  arv?: number;
}) {
  const mao = Math.round((deal.arv ?? 0) * 0.7 - deal.repair_estimate);
  const spread = Math.round(mao - deal.asking_price);
  return { mao, spread };
}

export function scoreDeal(spread: number) {
  if (spread > 15000) return "green" as const;
  if (spread >= 5000) return "yellow" as const;
  return "red" as const;
}

export function enrichDeal(deal: Doc<"deals">) {
  const { mao, spread } = computeFinancials(deal);
  return {
    id: deal._id,
    address: deal.address,
    asking_price: deal.asking_price,
    beds: deal.beds,
    baths: deal.baths,
    sqft: deal.sqft,
    repair_estimate: deal.repair_estimate,
    arv: deal.arv ?? null,
    arv_locked: deal.arv_locked,
    mao,
    spread,
    score: scoreDeal(spread),
    stage: deal.stage as DealStage,
    notes: deal.notes ?? null,
    created_at: deal.created_at,
    updated_at: deal.updated_at,
    seller_first_name: deal.seller_first_name ?? null,
    seller_last_name: deal.seller_last_name ?? null,
    seller_phone: deal.seller_phone ?? null,
    seller_email: deal.seller_email ?? null,
    ghl_contact_id: deal.ghl_contact_id ?? null,
    ghl_opportunity_id: deal.ghl_opportunity_id ?? null,
    ghl_sync_status: deal.ghl_sync_status ?? null,
    ghl_last_synced_at: deal.ghl_last_synced_at ?? null,
  };
}

export function enrichComp(comp: Doc<"comps">) {
  return {
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
  };
}

export function enrichActivity(activity: Doc<"activity_log">) {
  return {
    id: activity._id,
    deal_id: activity.deal_id ?? null,
    action: activity.action,
    details: activity.details ?? null,
    created_at: activity.created_at,
  };
}

export const dealInput = {
  address: v.string(),
  asking_price: v.number(),
  beds: v.number(),
  baths: v.number(),
  sqft: v.number(),
  repair_estimate: v.number(),
  arv: v.optional(v.number()),
  arv_locked: v.optional(v.boolean()),
  stage: v.optional(v.union(...dealStageValues.map((stage) => v.literal(stage)))),
  notes: v.optional(v.string()),
  seller_first_name: v.optional(v.string()),
  seller_last_name: v.optional(v.string()),
  seller_phone: v.optional(v.string()),
  seller_email: v.optional(v.string()),
};
