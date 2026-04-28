"use client";

import { motion } from "framer-motion";
import { CURRENCY_SYMBOL } from "@/lib/constants";

const mockDraws = [
  { id: "1", month: "April 2026", date: "2026-04-30", status: "upcoming", pool: 25000, winning: null, myScores: [38, 41, 36, 40, 39] },
  { id: "2", month: "March 2026", date: "2026-03-31", status: "published", pool: 22000, winning: [35, 42, 38, 29, 41], myScores: [38, 41, 36, 40, 39] },
  { id: "3", month: "February 2026", date: "2026-02-28", status: "published", pool: 19500, winning: [40, 33, 45, 28, 37], myScores: [34, 39, 41, 37, 42] },
];

function countMatches(my: number[], winning: number[] | null): number {
  if (!winning) return 0;
  return my.filter((s) => winning.includes(s)).length;
}

export default function DrawsPage() {
  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          Monthly <span className="gradient-text-gold">Draws</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">Your draw entries and results.</p>
      </motion.div>

      <div className="space-y-6">
        {mockDraws.map((draw, i) => {
          const matches = countMatches(draw.myScores, draw.winning);
          return (
            <motion.div key={draw.id} className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)]">{draw.month}</h3>
                  <p className="text-gc-text-muted text-xs mt-0.5">Draw date: {new Date(draw.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${draw.status === "upcoming" ? "bg-gc-gold-500/10 text-gc-gold-400 border border-gc-gold-500/20" : "bg-gc-green-600/10 text-gc-green-400 border border-gc-green-400/20"}`}>
                    {draw.status === "upcoming" ? "⏳ Upcoming" : "✅ Published"}
                  </span>
                  <span className="text-gc-text-secondary text-sm">Pool: <strong className="gradient-text-gold">{CURRENCY_SYMBOL}{draw.pool.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* My Scores */}
                <div>
                  <p className="text-gc-text-muted text-xs mb-2 uppercase tracking-wider">My Entry</p>
                  <div className="flex gap-2">
                    {draw.myScores.map((s, j) => (
                      <div key={j} className={`score-badge !w-10 !h-10 !text-sm ${draw.winning?.includes(s) ? "!border-gc-gold-400 !text-gc-gold-400 !bg-gc-gold-500/10" : ""}`}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Winning Numbers */}
                {draw.winning && (
                  <div>
                    <p className="text-gc-text-muted text-xs mb-2 uppercase tracking-wider">Winning Numbers</p>
                    <div className="flex gap-2">
                      {draw.winning.map((s, j) => (
                        <div key={j} className="score-badge !w-10 !h-10 !text-sm !border-gc-gold-400/50 !text-gc-gold-400">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {draw.winning && (
                <div className="mt-4 pt-4 border-t border-gc-green-800/10">
                  <span className={`text-sm font-semibold ${matches >= 3 ? "text-gc-gold-400" : "text-gc-text-muted"}`}>
                    {matches >= 5 ? "🏆 JACKPOT — 5 matches!" : matches >= 4 ? "🥈 4 matches — prize winner!" : matches >= 3 ? "🥉 3 matches — prize winner!" : `${matches} match${matches !== 1 ? "es" : ""} — no prize this time`}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
