"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Score { id: string; score: number; played_date: string; }
interface Profile { full_name: string; selected_charity_id: string | null; charity_percentage: number; }

const nextDrawDate = new Date();
nextDrawDate.setMonth(nextDrawDate.getMonth() + 1, 0);

function getTimeUntil(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [charityName, setCharityName] = useState("Not selected");
  const [scoreInput, setScoreInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDateInput(new Date().toISOString().split("T")[0]);
    setCountdown(getTimeUntil(nextDrawDate));
    fetchData();
    const timer = setInterval(() => setCountdown(getTimeUntil(nextDrawDate)), 60000);
    return () => clearInterval(timer);
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (p) {
      setProfile(p);
      if (p.selected_charity_id) {
        const { data: c } = await supabase.from("charities").select("name").eq("id", p.selected_charity_id).single();
        if (c) setCharityName(c.name);
      }
    }

    const { data: s } = await supabase.from("scores").select("*").eq("user_id", user.id).order("played_date", { ascending: false }).order("created_at", { ascending: false }).limit(5);
    if (s) setScores(s);
  }

  async function handleScoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const score = parseInt(scoreInput);
    if (score < 1 || score > 45) return;

    const { error: insertError } = await supabase.from("scores").insert({
      user_id: user.id, score, played_date: dateInput,
    });

    if (!insertError) {
      // Scores are no longer deleted; history is kept indefinitely.
    }

    setScoreInput("");
    fetchData();
  }

  const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1) : "–";
  const displayName = profile?.full_name?.split(" ")[0] || "Golfer";

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          Welcome back, <span className="gradient-text-green">{displayName}</span>!
        </h1>
        <p className="text-gc-text-secondary mt-1">
          Draw Entry: <strong className="text-gc-text-primary">{scores.length} Score{scores.length !== 1 ? "s" : ""}</strong>
          {scores.length < 5 && <span className="text-gc-gold-400"> · Need {5 - scores.length} more for draw</span>}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Entry */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gc-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Quick Score Entry
          </h2>
          <form onSubmit={handleScoreSubmit} className="space-y-4">
            <div>
              <label htmlFor="dash-date" className="block text-sm text-gc-text-secondary mb-1.5">Date</label>
              <input id="dash-date" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="gc-input" required />
            </div>
            <div>
              <label htmlFor="dash-score" className="block text-sm text-gc-text-secondary mb-1.5">Score (1–45)</label>
              <input id="dash-score" type="number" min={1} max={45} value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} className="gc-input" placeholder="Enter score" required />
            </div>
            <button type="submit" className="btn-green w-full" id="dash-score-submit">Submit</button>
          </form>
        </motion.div>

        {/* Rolling 5 */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-2">Draw Numbers</h2>
          <p className="text-gc-text-muted text-sm mb-6">Your latest Stableford scores</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {scores.length > 0 ? scores.map((s, i) => (
              <motion.div key={s.id} className="score-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: "spring" }}>
                {s.score}
              </motion.div>
            )) : (
              <p className="text-gc-text-muted text-sm">Add scores to see your draw numbers</p>
            )}
          </div>
          {scores.length > 0 && <div className="mt-6 text-center"><span className="text-gc-text-muted text-xs">Average: <strong className="text-gc-green-400">{avg}</strong></span></div>}
        </motion.div>

        {/* Countdown */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-2">Next Draw</h2>
          <p className="text-gc-text-muted text-sm mb-6">Time until the monthly draw</p>
          <div className="flex justify-center gap-6">
            {[{ value: countdown.days, label: "DAYS" }, { value: countdown.hours, label: "HOURS" }, { value: countdown.minutes, label: "MINS" }].map((item) => (
              <div key={item.label} className="text-center">
                <div className="countdown-digit">{String(item.value).padStart(2, "0")}</div>
                <div className="text-gc-text-muted text-xs mt-1 tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Charity */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-2">My Charity</h2>
          <p className="text-gc-text-muted text-sm mb-6">Your selected charity</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gc-green-600/10 border border-gc-green-400/20 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-gc-green-400" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4-3 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 9 8 12z" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gc-text-primary">{charityName}</h3>
              <p className="text-gc-text-muted text-xs mt-0.5">{profile?.charity_percentage || 10}% of subscription</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
