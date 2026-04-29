"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Winner {
  id: string;
  draw_id: string;
  match_type: string;
  prize_amount: number;
  proof_image_url: string | null;
  verification_status: "pending" | "approved" | "rejected";
  payment_status: "pending" | "paid";
  draws: { draw_month: string };
}

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWinnings();
  }, []);

  async function fetchWinnings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("winners")
      .select("*, draws(draw_month)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWinnings(data as unknown as Winner[]);
    }
    setLoading(false);
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>, winnerId: string) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB");
      return;
    }

    setUploadingId(winnerId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${winnerId}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("proofs")
        .getPublicUrl(fileName);

      // Update winner record
      const { error: updateError } = await supabase
        .from("winners")
        .update({ proof_image_url: publicUrl, verification_status: "pending" })
        .eq("id", winnerId);

      if (updateError) throw updateError;

      await fetchWinnings();
      alert("Proof uploaded successfully! Awaiting admin verification.");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload proof");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          My <span className="gradient-text-green">Winnings</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">
          Track your prizes, upload your score proofs, and check payout status.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="w-8 h-8 border-3 border-gc-green-400/20 border-t-gc-green-400 rounded-full animate-spin" /></div>
      ) : winnings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gc-text-secondary">No winnings yet. Keep submitting your scores!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {winnings.map((win, i) => (
            <motion.div 
              key={win.id} 
              className="glass-card p-6 border-gc-gold-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm text-gc-text-secondary">Draw Month</h3>
                  <p className="font-semibold text-gc-text-primary">
                    {new Date(win.draws?.draw_month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gc-gold-500/20 text-gc-gold-400 border border-gc-gold-500/30">
                    {win.match_type}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gc-text-secondary mb-1">Prize Amount</p>
                <p className="text-3xl font-bold font-[family-name:var(--font-outfit)] text-gc-green-400">
                  {CURRENCY_SYMBOL}{(win.prize_amount || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gc-green-800/20">
                <div>
                  <p className="text-xs text-gc-text-muted mb-1">Verification</p>
                  <p className={`text-sm font-medium ${
                    win.verification_status === "approved" ? "text-gc-green-400" :
                    win.verification_status === "rejected" ? "text-red-400" :
                    "text-gc-gold-400"
                  }`}>
                    {win.verification_status.charAt(0).toUpperCase() + win.verification_status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gc-text-muted mb-1">Payment</p>
                  <p className={`text-sm font-medium ${
                    win.payment_status === "paid" ? "text-gc-green-400" : "text-gc-text-secondary"
                  }`}>
                    {win.payment_status.charAt(0).toUpperCase() + win.payment_status.slice(1)}
                  </p>
                </div>
              </div>

              {/* Upload Proof Area */}
              <div className="bg-gc-bg-secondary/50 rounded-xl p-4 border border-gc-green-800/10">
                <p className="text-sm text-gc-text-primary font-medium mb-3">Proof of Score</p>
                
                {win.proof_image_url ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={win.proof_image_url} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gc-text-muted">Proof uploaded.</p>
                      {win.verification_status === "rejected" && (
                        <p className="text-xs text-red-400 mt-1">Rejected. Please upload a clearer image.</p>
                      )}
                    </div>
                    {win.verification_status !== "approved" && (
                      <label className="btn-gold !py-1.5 !px-3 !text-xs cursor-pointer">
                        {uploadingId === win.id ? "Uploading..." : "Replace"}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleProofUpload(e, win.id)} disabled={uploadingId === win.id} />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gc-text-muted flex-1 pr-4">Please upload a screenshot of your scores from the official golf app to claim your prize.</p>
                    <label className="btn-gold !py-1.5 !px-3 !text-xs cursor-pointer whitespace-nowrap">
                      {uploadingId === win.id ? "Uploading..." : "Upload Proof"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleProofUpload(e, win.id)} disabled={uploadingId === win.id} />
                    </label>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
