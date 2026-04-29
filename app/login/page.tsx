"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase/client";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(redirect);
        }
      } else {
        router.push(redirect);
      }
      
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden pt-20">
        {/* Background orbs */}
        <div className="orb orb-green w-[400px] h-[400px] -top-20 -right-20" />
        <div className="orb orb-gold w-[300px] h-[300px] bottom-20 -left-20" />

        <motion.div
          className="relative z-10 w-full max-w-md mx-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-card p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                Welcome Back
              </h1>
              <p className="text-gc-text-secondary text-sm">
                Sign in to your GreenCause account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gc-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="gc-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn-gold w-full !py-3.5 text-base"
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gc-bg-primary/30 border-t-gc-bg-primary rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gc-text-muted text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-gc-green-400 hover:text-gc-green-200 font-medium transition-colors"
                  id="login-signup-link"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
