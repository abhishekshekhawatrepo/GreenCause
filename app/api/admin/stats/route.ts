import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [
      { count: users },
      { data: subs },
      { count: charities },
      { count: draws },
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("subscriptions").select("amount_inr, plan_type, status"),
      supabaseAdmin.from("charities").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("draws").select("*", { count: "exact", head: true }),
    ]);

    const activeSubs = (subs || []).filter((s) => s.status === "active");
    const monthlyRevenue = activeSubs.reduce((sum, s) => {
      if (s.plan_type === "yearly") return sum + Number(s.amount_inr) / 12;
      return sum + Number(s.amount_inr);
    }, 0);

    return NextResponse.json({
      totalUsers: users || 0,
      activeSubscriptions: activeSubs.length,
      monthlyRevenue: Math.round(monthlyRevenue),
      totalCharities: charities || 0,
      totalDraws: draws || 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
