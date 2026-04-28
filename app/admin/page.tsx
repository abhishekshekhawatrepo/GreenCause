"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalCharities: number;
  totalDraws: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalCharities: 0,
    totalDraws: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const [
      { count: users },
      { count: activeSubs },
      { data: subs },
      { count: charities },
      { count: draws },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("subscriptions").select("amount_inr, plan_type").eq("status", "active"),
      supabase.from("charities").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("draws").select("*", { count: "exact", head: true }),
    ]);

    const monthlyRevenue = (subs || []).reduce((sum, s) => {
      if (s.plan_type === "yearly") return sum + (Number(s.amount_inr) / 12);
      return sum + Number(s.amount_inr);
    }, 0);

    setStats({
      totalUsers: users || 0,
      activeSubscriptions: activeSubs || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      totalCharities: charities || 0,
      totalDraws: draws || 0,
    });
    setLoading(false);
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "gc-green-400" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: "💳", color: "gc-green-400" },
    { label: "Monthly Revenue (est.)", value: `${CURRENCY_SYMBOL}${stats.monthlyRevenue.toLocaleString("en-IN")}`, icon: "💰", color: "gc-gold-400" },
    { label: "Active Charities", value: stats.totalCharities, icon: "💚", color: "gc-green-400" },
    { label: "Draws Conducted", value: stats.totalDraws, icon: "🎯", color: "gc-gold-400" },
  ];

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          Admin <span className="gradient-text-gold">Overview</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">Platform health at a glance.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-gc-gold-400/30 border-t-gc-gold-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-${card.color} text-xs font-semibold uppercase tracking-wider`}>
                  {card.label}
                </span>
              </div>
              <p className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-gc-text-primary">
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
