"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Draw {
  id: string;
  draw_month: string;
  scheduled_date: string;
  winning_numbers: number[];
  status: string;
  total_pool_amount_inr: number;
  published_at: string | null;
}

interface DrawResult {
  success: boolean;
  draw?: {
    id: string;
    winningNumbers: number[];
    totalEntries: number;
    totalWinners: number;
    prizePool: number;
  };
  error?: string;
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastResult, setLastResult] = useState<DrawResult | null>(null);

  useEffect(() => { fetchDraws(); }, []);

  async function fetchDraws() {
    const res = await fetch("/api/admin/draws");
    if (res.ok) {
      const data = await res.json();
      setDraws(data);
    }
    setLoading(false);
  }

  async function triggerDraw() {
    if (!confirm("Run the monthly draw now? This will generate winning numbers and process all entries.")) return;
    setTriggering(true);
    setLastResult(null);

    try {
      const res = await fetch("/api/admin/draw", { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        setLastResult({ success: true, draw: result.draw });
      } else {
        setLastResult({ success: false, error: result.error });
      }
      fetchDraws();
    } catch {
      setLastResult({ success: false, error: "Network error" });
    } finally {
      setTriggering(false);
    }
  }

  async function publishDraw(drawId: string) {
    await fetch("/api/admin/draws", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawId, status: "published" }),
    });
    fetchDraws();
  }

  return (
    <div>
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
            Monthly <span className="gradient-text-gold">Draws</span>
          </h1>
          <p className="text-gc-text-secondary mt-1">Execute and manage lottery draws.</p>
        </div>
        <button onClick={triggerDraw} disabled={triggering} className="btn-gold !py-2.5 !px-6 text-sm" id="admin-trigger-draw">
          {triggering ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-gc-bg-primary/30 border-t-gc-bg-primary rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            "🎯 Trigger Draw"
          )}
        </button>
      </motion.div>

      {lastResult && (
        <motion.div
          className={`mb-6 p-5 rounded-xl border ${lastResult.success ? "bg-gc-green-600/10 border-gc-green-400/20" : "bg-red-500/10 border-red-500/20"}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lastResult.success && lastResult.draw ? (
            <div>
              <h3 className="font-semibold text-gc-green-400 mb-2">✅ Draw Completed!</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gc-text-secondary">
                <span>Winning: <strong className="text-gc-gold-400">{lastResult.draw.winningNumbers.join(", ")}</strong></span>
                <span>Entries: <strong>{lastResult.draw.totalEntries}</strong></span>
                <span>Winners: <strong className="text-gc-gold-400">{lastResult.draw.totalWinners}</strong></span>
                <span>Pool: <strong>{CURRENCY_SYMBOL}{lastResult.draw.prizePool.toLocaleString("en-IN")}</strong></span>
              </div>
            </div>
          ) : (
            <p className="text-red-400 text-sm">❌ {lastResult.error}</p>
          )}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-gc-gold-400/30 border-t-gc-gold-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw, i) => (
            <motion.div
              key={draw.id}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold font-[family-name:var(--font-outfit)]">
                      {new Date(draw.draw_month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      draw.status === "published" ? "bg-gc-green-600/10 text-gc-green-400 border border-gc-green-400/20" :
                      draw.status === "admin_review" ? "bg-gc-gold-500/10 text-gc-gold-400 border border-gc-gold-500/20" :
                      "bg-gc-bg-card/50 text-gc-text-muted border border-gc-green-800/20"
                    }`}>
                      {draw.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(draw.winning_numbers || []).map((n, j) => (
                      <span key={j} className="score-badge !w-9 !h-9 !text-sm !border-gc-gold-400/50 !text-gc-gold-400">{n}</span>
                    ))}
                  </div>
                  <p className="text-gc-text-muted text-xs">
                    Pool: {CURRENCY_SYMBOL}{Number(draw.total_pool_amount_inr).toLocaleString("en-IN")}
                    {draw.published_at && ` · Published ${new Date(draw.published_at).toLocaleDateString("en-IN")}`}
                  </p>
                </div>

                {draw.status === "admin_review" && (
                  <button onClick={() => publishDraw(draw.id)} className="btn-green !py-2 !px-5 text-sm shrink-0">
                    Publish
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {draws.length === 0 && (
            <p className="text-gc-text-muted text-sm text-center py-10">No draws yet. Click &quot;Trigger Draw&quot; to run one!</p>
          )}
        </div>
      )}
    </div>
  );
}
