"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface Charity { id: string; name: string; description: string; category: string; }

export default function DashboardCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
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
        <p className="text-gc-text-secondary mt-1">Choose where your contribution goes.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity, i) => (
          <motion.div key={charity.id} className={`glass-card p-6 flex flex-col ${selected === charity.id ? "!border-gc-green-400/50 ring-1 ring-gc-green-400/20" : ""}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="w-12 h-12 rounded-xl bg-gc-green-600/10 border border-gc-green-400/20 flex items-center justify-center text-2xl mb-3">
              {emojis[charity.category] || "💚"}
            </div>
            <span className="text-xs text-gc-gold-400 font-medium uppercase tracking-wider">{charity.category}</span>
            <h3 className="text-base font-bold font-[family-name:var(--font-outfit)] mt-1 mb-2">{charity.name}</h3>
            <p className="text-gc-text-secondary text-sm leading-relaxed flex-1">{charity.description}</p>
            <button onClick={() => handleSelect(charity.id)} disabled={saving} className={`mt-4 text-sm py-2.5 rounded-xl font-semibold transition-all ${selected === charity.id ? "bg-gc-green-600/20 text-gc-green-400 border border-gc-green-400/30 cursor-default" : "btn-ghost"}`}>
              {selected === charity.id ? "✓ Selected" : "Select"}
            </button>
          </motion.div>
        ))}
        {charities.length === 0 && <p className="text-gc-text-muted text-sm col-span-full">No charities available yet. Run the schema SQL to seed data.</p>}
      </div>
    </div>
  );
}
