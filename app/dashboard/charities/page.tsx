"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Charity { id: string; name: string; description: string; category: string; }
interface Donation { id: string; amount: number; created_at: string; charities: { name: string } }

export default function DashboardCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from("charities").select("*").eq("is_active", true);
    if (data) setCharities(data);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("selected_charity_id").eq("id", user.id).single();
      if (profile?.selected_charity_id) setSelected(profile.selected_charity_id);

      const { data: d } = await supabase.from("donations").select("*, charities(name)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (d) setDonations(d as unknown as Donation[]);
    }
  }

  async function handleSelect(charityId: string) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ selected_charity_id: charityId }).eq("id", user.id);
      setSelected(charityId);
    }
    setSaving(false);
  }

  const emojis: Record<string, string> = { Environment: "🌳", "Youth & Sport": "🏌️", Sustainability: "💧", "Social Welfare": "🤝", Healthcare: "😊" };

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          My <span className="gradient-text-green">Charity</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">Choose where your contribution goes, or view your independent donations.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {charities.map((charity, i) => (
          <motion.div key={charity.id} className={`glass-card p-6 flex flex-col ${selected === charity.id ? "!border-gc-green-400/50 ring-1 ring-gc-green-400/20" : ""}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="w-12 h-12 rounded-xl bg-gc-green-600/10 border border-gc-green-400/20 flex items-center justify-center text-2xl mb-3">
              {emojis[charity.category] || "💚"}
            </div>
            <span className="text-xs text-gc-gold-400 font-medium uppercase tracking-wider">{charity.category}</span>
            <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] mt-1 mb-2">{charity.name}</h3>
            <p className="text-gc-text-secondary text-sm leading-relaxed flex-1 line-clamp-3">{charity.description}</p>
            <button onClick={() => handleSelect(charity.id)} disabled={saving} className={`mt-4 text-sm py-2.5 rounded-xl font-semibold transition-all ${selected === charity.id ? "bg-gc-green-600/20 text-gc-green-400 border border-gc-green-400/30 cursor-default" : "btn-ghost"}`}>
              {selected === charity.id ? "✓ Selected" : "Select"}
            </button>
          </motion.div>
        ))}
        {charities.length === 0 && <p className="text-gc-text-muted text-sm col-span-full">No charities available yet. Run the schema SQL to seed data.</p>}
      </div>

      {/* Independent Donations History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-4">Donation History</h2>
        {donations.length === 0 ? (
          <div className="glass-card p-6 text-center text-gc-text-muted text-sm">
            You haven&apos;t made any independent donations yet.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gc-bg-secondary/50 text-gc-text-secondary border-b border-gc-green-800/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Charity</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gc-green-800/10">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-gc-bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-gc-text-primary whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-gc-text-primary">
                        {d.charities?.name}
                      </td>
                      <td className="px-6 py-4 text-gc-green-400 font-semibold text-right whitespace-nowrap">
                        {CURRENCY_SYMBOL}{Number(d.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
