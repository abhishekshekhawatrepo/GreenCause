"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CHARITY_TIERS } from "@/lib/constants";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: "", email: "", charity_percentage: 10 });
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile({ full_name: data.full_name, email: data.email, charity_percentage: data.charity_percentage });

    const { data: subData } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").single();
    if (subData) setSubscription(subData);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        full_name: profile.full_name,
        charity_percentage: profile.charity_percentage,
      }).eq("id", user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          <span className="gradient-text-green">Settings</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">Manage your profile and preferences.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">Profile</h2>
          {saved && <div className="mb-4 p-3 rounded-lg bg-gc-green-600/10 border border-gc-green-400/20 text-gc-green-400 text-sm">✓ Settings saved!</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gc-text-secondary mb-1.5">Full Name</label>
              <input type="text" value={profile.full_name} onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))} className="gc-input" required />
            </div>
            <div>
              <label className="block text-sm text-gc-text-secondary mb-1.5">Email</label>
              <input type="email" value={profile.email} className="gc-input opacity-50 cursor-not-allowed" disabled />
              <p className="text-gc-text-muted text-xs mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm text-gc-text-secondary mb-2">Charity Contribution</label>
              <div className="grid grid-cols-4 gap-2">
                {CHARITY_TIERS.map((tier) => (
                  <button key={tier} type="button" onClick={() => setProfile(p => ({ ...p, charity_percentage: tier }))} className={`py-2.5 rounded-lg text-sm font-semibold transition-all border ${profile.charity_percentage === tier ? "bg-gc-green-600/20 border-gc-green-400/50 text-gc-green-400" : "bg-gc-bg-card/50 border-gc-green-800/20 text-gc-text-secondary hover:border-gc-green-400/30"}`}>
                    {tier}%
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-green w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>

        {/* Account Actions */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">Account</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gc-bg-card/30 border border-gc-green-800/10">
              <h3 className="text-sm font-semibold mb-2">Subscription</h3>
              {subscription ? (
                <div>
                  <p className="text-gc-green-400 text-sm font-bold mb-1">
                    Active <span className="text-gc-text-muted font-normal">• ₹{subscription.amount_inr} / {subscription.plan_type === "monthly" ? "Month" : "Year"}</span>
                  </p>
                  <p className="text-gc-text-secondary text-xs">Renews: {new Date(subscription.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              ) : (
                <p className="text-gc-text-muted text-xs">No active subscription found.</p>
              )}
            </div>
            <button onClick={handleLogout} className="w-full py-3 rounded-xl text-sm font-semibold border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all" id="logout-btn">
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
