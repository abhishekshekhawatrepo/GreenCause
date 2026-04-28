"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  requireAdmin?: boolean;
}

/**
 * Client-side auth guard — replaces heavy middleware DB queries.
 * Checks auth, subscription, and admin role on the client side.
 */
export default function AuthGuard({ children, requireSubscription = true, requireAdmin = false }: AuthGuardProps) {
  const [status, setStatus] = useState<"loading" | "authorized" | "redirect" | "error">("loading");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?redirect=" + window.location.pathname);
      setStatus("redirect");
      return;
    }

    if (requireSubscription) {
      const { data: subs, error } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error("AuthGuard Sub check error:", error?.message || JSON.stringify(error));
        setStatus("error");
        return;
      }

      if (!subs || subs.length === 0) {
        console.warn("AuthGuard: No active subscription found for user", user.id);
        router.replace("/pricing");
        setStatus("redirect");
        return;
      }
    }

    if (requireAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.replace("/dashboard");
        setStatus("redirect");
        return;
      }
    }

    setStatus("authorized");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gc-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-3 border-gc-green-400/20 border-t-gc-green-400 rounded-full animate-spin" />
          <p className="text-gc-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gc-bg-primary text-center px-6">
        <h2 className="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
        <p className="text-gc-text-secondary mb-6 max-w-md">
          We could not verify your subscription status. This usually happens if your browser is blocking the request or if you have a stale login session.
        </p>
        <button 
          onClick={() => {
            supabase.auth.signOut().then(() => {
              window.location.href = "/login";
            });
          }}
          className="btn-gold !py-2 !px-6"
        >
          Sign Out & Re-login
        </button>
      </div>
    );
  }

  if (status === "redirect") return null;

  return <>{children}</>;
}
