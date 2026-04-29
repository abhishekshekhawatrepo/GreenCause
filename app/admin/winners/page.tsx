"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Winner {
  id: string;
  match_type: string;
  prize_amount: number;
  proof_image_url: string | null;
  verification_status: string;
  payment_status: string;
  profiles: { full_name: string; email: string };
  draws: { draw_month: string };
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchWinners();
  }, []);

  async function fetchWinners() {
    setLoading(true);
    const { data, error } = await supabase
      .from("winners")
      .select("*, profiles(full_name, email), draws(draw_month)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWinners(data as unknown as Winner[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, field: "verification_status" | "payment_status", value: string) {
    setActionLoading(id + field);
    
    const updateData: any = { [field]: value };
    if (field === "verification_status") updateData.verified_at = new Date().toISOString();
    if (field === "payment_status" && value === "paid") updateData.paid_at = new Date().toISOString();

    const { error } = await supabase.from("winners").update(updateData).eq("id", id);
    if (!error) {
      await fetchWinners();
    } else {
      alert("Error updating status: " + error.message);
    }
    setActionLoading(null);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gc-gold-400 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <motion.div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
            Prize <span className="text-gc-gold-400">Winners</span>
          </h1>
          <p className="text-gc-text-secondary mt-1">Review proofs and manage prize payouts.</p>
        </div>
      </motion.div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gc-bg-secondary/50 text-gc-text-secondary border-b border-gc-gold-800/20">
              <tr>
                <th className="px-6 py-4 font-medium">Draw</th>
                <th className="px-6 py-4 font-medium">Winner</th>
                <th className="px-6 py-4 font-medium">Match</th>
                <th className="px-6 py-4 font-medium text-right">Prize</th>
                <th className="px-6 py-4 font-medium">Proof & Verification</th>
                <th className="px-6 py-4 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gc-gold-800/10">
              {winners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gc-text-muted">No winners recorded yet.</td>
                </tr>
              ) : (
                winners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-gc-bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-gc-text-primary whitespace-nowrap">
                      {new Date(winner.draws?.draw_month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gc-text-primary">{winner.profiles?.full_name}</div>
                      <div className="text-xs text-gc-text-muted">{winner.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gc-gold-400 font-semibold whitespace-nowrap">
                      {winner.match_type}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gc-text-primary whitespace-nowrap">
                      {CURRENCY_SYMBOL}{Number(winner.prize_amount).toLocaleString("en-IN")}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {winner.proof_image_url ? (
                          <a href={winner.proof_image_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">View Proof Image</a>
                        ) : (
                          <span className="text-xs text-gc-text-muted italic">No proof uploaded</span>
                        )}
                        
                        <div className="flex gap-2 mt-1">
                          {winner.verification_status === "pending" ? (
                            <>
                              <button onClick={() => updateStatus(winner.id, "verification_status", "approved")} disabled={actionLoading === winner.id + "verification_status"} className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50">Approve</button>
                              <button onClick={() => updateStatus(winner.id, "verification_status", "rejected")} disabled={actionLoading === winner.id + "verification_status"} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50">Reject</button>
                            </>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded border inline-block ${winner.verification_status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                              {winner.verification_status.charAt(0).toUpperCase() + winner.verification_status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {winner.payment_status === "pending" ? (
                        <button 
                          onClick={() => updateStatus(winner.id, "payment_status", "paid")}
                          disabled={winner.verification_status !== "approved" || actionLoading === winner.id + "payment_status"}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-gc-gold-500/10 text-gc-gold-400 border border-gc-gold-500/20 hover:bg-gc-gold-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={winner.verification_status !== "approved" ? "Must approve proof first" : ""}
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded border inline-block bg-green-500/10 text-green-400 border-green-500/20 font-medium">
                          ✓ Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
