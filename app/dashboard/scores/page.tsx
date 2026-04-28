"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { SCORE_MIN, SCORE_MAX } from "@/lib/constants";

interface Score {
  id: string;
  score: number;
  played_date: string;
  created_at: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [scoreInput, setScoreInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState("");

  useEffect(() => {
    setDateInput(new Date().toISOString().split("T")[0]);
    fetchScores();
  }, []);

  async function fetchScores() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_date", { ascending: false });

    if (!error && data) setScores(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const score = parseInt(scoreInput);
    if (score < SCORE_MIN || score > SCORE_MAX) {
      setError(`Score must be between ${SCORE_MIN} and ${SCORE_MAX}`);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please log in"); setLoading(false); return; }

    const { error: insertError } = await supabase.from("scores").upsert({
      user_id: user.id,
      score,
      played_date: dateInput,
    }, { onConflict: "user_id,played_date" });

    if (insertError) {
      setError(insertError.message);
    } else {
      setScoreInput("");
      await fetchScores();
    }
    setLoading(false);
  }

  async function handleUpdate(id: string) {
    const score = parseInt(editScore);
    if (score < SCORE_MIN || score > SCORE_MAX) return;

    await supabase.from("scores").update({ score }).eq("id", id);
    setEditingId(null);
    await fetchScores();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this score?")) return;
    await supabase.from("scores").delete().eq("id", id);
    await fetchScores();
  }

  const latest5 = scores.slice(0, 5);

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          My <span className="gradient-text-green">Scores</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">
          Log your Stableford scores and track your rolling 5-score window.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Entry */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">Add Score</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="score-date" className="block text-sm text-gc-text-secondary mb-1.5">Date Played</label>
              <input id="score-date" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="gc-input" required />
            </div>
            <div>
              <label htmlFor="score-value" className="block text-sm text-gc-text-secondary mb-1.5">Score ({SCORE_MIN}–{SCORE_MAX})</label>
              <input id="score-value" type="number" min={SCORE_MIN} max={SCORE_MAX} value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} className="gc-input" placeholder="Enter score" required />
            </div>
            <button type="submit" className="btn-green w-full" disabled={loading} id="score-submit">
              {loading ? "Saving..." : "Submit Score"}
            </button>
          </form>
        </motion.div>

        {/* Rolling 5 */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-2">Draw Numbers</h2>
          <p className="text-gc-text-muted text-sm mb-6">Your latest 5 scores — these are your draw entries!</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {latest5.length > 0 ? latest5.map((s, i) => (
              <motion.div key={s.id} className="score-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: "spring" }}>
                {s.score}
              </motion.div>
            )) : (
              <p className="text-gc-text-muted text-sm">No scores yet — add your first round!</p>
            )}
          </div>
          {latest5.length > 0 && (
            <div className="mt-6 text-center">
              <span className="text-gc-text-muted text-xs">
                Average: <strong className="text-gc-green-400">{(latest5.reduce((a, b) => a + b.score, 0) / latest5.length).toFixed(1)}</strong>
              </span>
            </div>
          )}
        </motion.div>

        {/* Score History */}
        <motion.div className="glass-card p-6 lg:row-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">History</h2>
          {scores.length === 0 ? (
            <p className="text-gc-text-muted text-sm">No scores recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scores.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gc-bg-card/30 border border-gc-green-800/10">
                  <div>
                    <span className="text-gc-green-400 font-bold mr-3">{s.score}</span>
                    <span className="text-gc-text-muted text-xs">{new Date(s.played_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex gap-2">
                    {editingId === s.id ? (
                      <>
                        <input type="number" value={editScore} onChange={(e) => setEditScore(e.target.value)} className="gc-input !w-16 !py-1 text-sm" min={SCORE_MIN} max={SCORE_MAX} />
                        <button onClick={() => handleUpdate(s.id)} className="text-gc-green-400 text-xs hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gc-text-muted text-xs hover:underline">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(s.id); setEditScore(String(s.score)); }} className="text-gc-text-muted text-xs hover:text-gc-green-400">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-gc-text-muted text-xs hover:text-red-400">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
