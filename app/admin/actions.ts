"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function getAdminStats() {
  try {
    const [
      { count: users },
      { count: activeSubs },
      { data: subs },
      { count: charities },
      { count: draws },
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("subscriptions").select("amount_inr, plan_type").eq("status", "active"),
      supabaseAdmin.from("charities").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("draws").select("*", { count: "exact", head: true }),
    ]);

    const monthlyRevenue = (subs || []).reduce((sum, s) => {
      if (s.plan_type === "yearly") return sum + (Number(s.amount_inr) / 12);
      return sum + Number(s.amount_inr);
    }, 0);

    return {
      totalUsers: users || 0,
      activeSubscriptions: activeSubs || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      totalCharities: charities || 0,
      totalDraws: draws || 0,
    };
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      totalCharities: 0,
      totalDraws: 0,
    };
  }
}
