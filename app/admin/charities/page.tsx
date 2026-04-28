"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
}

const CATEGORIES = ["Environment", "Youth & Sport", "Sustainability", "Social Welfare", "Healthcare"];

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: CATEGORIES[0] });

  useEffect(() => { fetchCharities(); }, []);

  async function fetchCharities() {
    const { data } = await supabase.from("charities").select("*").order("created_at", { ascending: false });
    if (data) setCharities(data);
    setLoading(false);
  }

  function resetForm() {
    setForm({ name: "", description: "", category: CATEGORIES[0] });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!form.name.trim()) return;

    if (editingId) {
      await supabase.from("charities").update({
        name: form.name,
        description: form.description,
        category: form.category,
      }).eq("id", editingId);
    } else {
      await supabase.from("charities").insert({
        name: form.name,
        description: form.description,
        category: form.category,
        is_active: true,
      });
    }

    resetForm();
    fetchCharities();
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await supabase.from("charities").update({ is_active: !currentActive }).eq("id", id);
    fetchCharities();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this charity permanently?")) return;
    await supabase.from("charities").delete().eq("id", id);
    fetchCharities();
  }

  function startEdit(charity: Charity) {
    setForm({ name: charity.name, description: charity.description || "", category: charity.category || CATEGORIES[0] });
    setEditingId(charity.id);
    setShowForm(true);
  }

  return (
    <div>
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
            Manage <span className="gradient-text-gold">Charities</span>
          </h1>
          <p className="text-gc-text-secondary mt-1">Add, edit, or deactivate partner charities.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-gold !py-2.5 !px-6 text-sm" id="admin-add-charity">
          + Add Charity
        </button>
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="glass-card p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">
              {editingId ? "Edit Charity" : "New Charity"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gc-text-secondary mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="gc-input" placeholder="Charity name" />
              </div>
              <div>
                <label className="block text-sm text-gc-text-secondary mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="gc-input !h-24 resize-none" placeholder="Brief description" />
              </div>
              <div>
                <label className="block text-sm text-gc-text-secondary mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="gc-input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-gold !py-2.5 !px-6 text-sm">
                  {editingId ? "Update" : "Create"}
                </button>
                <button onClick={resetForm} className="btn-ghost !py-2.5 !px-6 text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-gc-gold-400/30 border-t-gc-gold-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {charities.map((charity, i) => (
            <motion.div
              key={charity.id}
              className={`glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!charity.is_active ? "opacity-50" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gc-text-primary">{charity.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gc-gold-500/10 text-gc-gold-400 border border-gc-gold-500/20">{charity.category}</span>
                  {!charity.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Inactive</span>
                  )}
                </div>
                <p className="text-gc-text-muted text-sm mt-1 truncate">{charity.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(charity)} className="text-xs text-gc-text-muted hover:text-gc-gold-400 transition-colors px-3 py-2 rounded-lg border border-gc-green-800/20 hover:border-gc-gold-400/30">
                  Edit
                </button>
                <button onClick={() => toggleActive(charity.id, charity.is_active)} className="text-xs text-gc-text-muted hover:text-gc-green-400 transition-colors px-3 py-2 rounded-lg border border-gc-green-800/20 hover:border-gc-green-400/30">
                  {charity.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(charity.id)} className="text-xs text-gc-text-muted hover:text-red-400 transition-colors px-3 py-2 rounded-lg border border-gc-green-800/20 hover:border-red-400/30">
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
          {charities.length === 0 && (
            <p className="text-gc-text-muted text-sm text-center py-10">No charities found. Add one above!</p>
          )}
        </div>
      )}
    </div>
  );
}
