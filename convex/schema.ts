import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  deals: defineTable({
    user_id: v.string(),
    address: v.string(),
    asking_price: v.number(),
    beds: v.number(),
    baths: v.number(),
    sqft: v.number(),
    repair_estimate: v.number(),
    arv: v.optional(v.number()),
    arv_locked: v.boolean(),
    stage: v.string(),
    notes: v.optional(v.string()),
    seller_first_name: v.optional(v.string()),
    seller_last_name: v.optional(v.string()),
    seller_phone: v.optional(v.string()),
    seller_email: v.optional(v.string()),
    ghl_contact_id: v.optional(v.string()),
    ghl_opportunity_id: v.optional(v.string()),
    ghl_sync_status: v.optional(v.string()),
    ghl_last_synced_at: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_stage", ["stage"])
    .index("by_user_stage", ["user_id", "stage"]),

  comps: defineTable({
    user_id: v.string(),
    deal_id: v.id("deals"),
    address: v.string(),
    sale_price: v.number(),
    sqft: v.number(),
    date_sold: v.string(),
    distance_miles: v.optional(v.number()),
    year_built: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    created_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_deal_id", ["deal_id"]),

  activity_log: defineTable({
    user_id: v.string(),
    deal_id: v.optional(v.id("deals")),
    action: v.string(),
    details: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_deal_id", ["deal_id"]),

  integrations: defineTable({
    user_id: v.string(),
    key: v.string(),
    value: v.string(),
    updated_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_key", ["user_id", "key"]),
});
