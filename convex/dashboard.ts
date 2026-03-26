import { query } from "./_generated/server";
import { computeFinancials, enrichActivity, requireUserId } from "./lib";

export const metrics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();
    const activity = await ctx.db
      .query("activity_log")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();

    const dealCounts = {
      Lead: 0,
      "Offer Sent": 0,
      "Under Contract": 0,
      Closed: 0,
      Dead: 0,
    };

    let spreadTotal = 0;
    let spreadCount = 0;

    for (const deal of deals) {
      dealCounts[deal.stage as keyof typeof dealCounts] += 1;
      if (deal.stage !== "Closed" && deal.stage !== "Dead") {
        spreadTotal += computeFinancials(deal).spread;
        spreadCount += 1;
      }
    }

    return {
      dealCounts,
      avgSpread: spreadCount > 0 ? Math.round(spreadTotal / spreadCount) : null,
      recentActivity: activity
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 10)
        .map(enrichActivity),
      totalDeals: deals.length,
    };
  },
});
