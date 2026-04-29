"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase/client";
import { CHARITY_TIERS, DEFAULT_CHARITY_TIER } from "@/lib/constants";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    charityTier: DEFAULT_CHARITY_TIER,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const update = (field: string, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            charity_percentage: formData.charityTier,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: formData.fullName,
          email: formData.email,
          charity_percentage: formData.charityTier,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // If we fail to create the profile, we should warn the user, but they are still technically signed up in auth.users
          setError("Account created, but failed to setup profile. Please contact support.");
          setLoading(false);
          return;
        }
      }

      if (data.user && !data.session) {
        setSuccess(true);
      } else {
        router.push("/pricing");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden pt-20">
          <motion.div
            className="relative z-10 w-full max-w-md mx-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card p-8 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gc-green-600/20 border border-gc-green-400/30 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-gc-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                Check Your Email
              </h1>
              <p className="text-gc-text-secondary text-sm mb-6">
                We&apos;ve sent a confirmation link to <strong className="text-gc-text-primary">{formData.email}</strong>. 
                Click the link to activate your account.
              </p>
              <Link href="/login">
                <button className="btn-gold w-full">Back to Login</button>
              </Link>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center gradient-hero relative overflow-hidden pt-24 pb-12">
        {/* Background orbs */}
        <div className="orb orb-green w-[400px] h-[400px] -top-20 -left-20" />
        <div className="orb orb-gold w-[300px] h-[300px] bottom-10 -right-20" />

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
                Join <span className="gradient-text-green">GreenCause</span>
              </h1>
              <p className="text-gc-text-secondary text-sm">
                Create your account and start playing with purpose
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
                <label htmlFor="signup-name" className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="gc-input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="gc-input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="gc-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="gc-input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {/* Charity Tier Selection */}
              <div>
                <label className="block text-sm font-medium text-gc-text-secondary mb-2">
                  Charity Contribution Tier
                </label>
                <p className="text-gc-text-muted text-xs mb-3">
                  Percentage of your subscription that goes to your chosen charity (min 10%)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {CHARITY_TIERS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => update("charityTier", tier)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                        formData.charityTier === tier
                          ? "bg-gc-green-600/20 border-gc-green-400/50 text-gc-green-400"
                          : "bg-gc-bg-card/50 border-gc-green-800/20 text-gc-text-secondary hover:border-gc-green-400/30"
                      }`}
                      id={`charity-tier-${tier}`}
                    >
                      {tier}%
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-gold w-full !py-3.5 text-base"
                disabled={loading}
                id="signup-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gc-bg-primary/30 border-t-gc-bg-primary rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gc-text-muted text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-gc-green-400 hover:text-gc-green-200 font-medium transition-colors"
                  id="signup-login-link"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
