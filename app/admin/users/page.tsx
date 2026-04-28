"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  charity_percentage: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  return (
    <div>
      <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
          <span className="gradient-text-gold">Users</span>
        </h1>
        <p className="text-gc-text-secondary mt-1">All registered members.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-gc-gold-400/30 border-t-gc-gold-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gc-green-800/20 text-gc-text-muted">
                  <th className="text-left px-6 py-4 font-medium">Name</th>
                  <th className="text-left px-6 py-4 font-medium">Email</th>
                  <th className="text-left px-6 py-4 font-medium">Role</th>
                  <th className="text-left px-6 py-4 font-medium">Charity %</th>
                  <th className="text-left px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gc-green-800/10 hover:bg-gc-bg-card/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gc-green-600/20 border border-gc-green-400/30 flex items-center justify-center text-gc-green-400 text-xs font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-gc-text-primary font-medium">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gc-text-secondary">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-gc-gold-500/10 text-gc-gold-400 border border-gc-gold-500/20" : "bg-gc-green-600/10 text-gc-green-400 border border-gc-green-400/20"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gc-text-secondary">{user.charity_percentage}%</td>
                    <td className="px-6 py-4 text-gc-text-muted text-xs">
                      {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-gc-text-muted text-sm text-center py-10">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}
