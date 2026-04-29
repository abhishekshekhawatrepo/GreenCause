"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import AuthGuard from "@/components/AuthGuard";

const sidebarLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/scores",
    label: "My Scores",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    href: "/dashboard/draws",
    label: "Draws",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/winnings",
    label: "Winnings",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: "/dashboard/charities",
    label: "Charities",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Golfer");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [needsCharity, setNeedsCharity] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name, selected_charity_id").eq("id", user.id).single();
        if (data?.full_name) setUserName(data.full_name);
        if (!data?.selected_charity_id) setNeedsCharity(true);
      }
    });
  }, []);

  return (
    <AuthGuard requireSubscription>
    <div className="flex min-h-screen bg-gc-bg-primary">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gc-green-800/20 bg-gc-bg-secondary/50 p-6 h-screen sticky top-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gc-green-600/20 border border-gc-green-400/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gc-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4-3 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 9 8 12z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <span className="text-lg font-bold font-[family-name:var(--font-outfit)]">
            <span className="text-gc-green-400">Green</span>
            <span className="text-gc-text-primary">Cause</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="space-y-1 flex-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`sidebar-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "text-gc-green-400 bg-gc-green-600/10"
                    : "text-gc-text-secondary hover:text-gc-text-primary hover:bg-gc-bg-card/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gc-green-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="glass-card p-4 mt-auto relative cursor-pointer hover:border-gc-green-400/30 transition-colors" onClick={() => setShowLogoutPopup(!showLogoutPopup)}>
          {showLogoutPopup && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 w-full bg-gc-bg-card border border-gc-green-800/20 rounded-xl p-2 shadow-xl z-50">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                  router.refresh();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sign Out
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gc-green-600/20 border border-gc-green-400/30 flex items-center justify-center text-gc-green-400 text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gc-text-primary truncate">
                {userName}
              </p>
              <p className="text-xs text-gc-text-muted truncate">
                Subscriber
              </p>
            </div>
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gc-text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gc-green-800/20 bg-gc-bg-secondary/95 backdrop-blur-lg px-2 py-2">
        <div className="flex justify-around">
          {sidebarLinks.slice(0, 5).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? "text-gc-green-400"
                    : "text-gc-text-muted"
                }`}
              >
                {link.icon}
                <span>{link.label.split(" ").pop()}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {needsCharity && pathname !== "/dashboard/charities" && (
          <div className="bg-gc-gold-500/10 border-b border-gc-gold-400/20 text-gc-gold-400 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium">Please select a charity to complete your account setup.</span>
            <Link href="/dashboard/charities" className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-gc-gold-400 text-gc-bg-primary hover:bg-gc-gold-300 transition-colors shrink-0">
              Select Charity
            </Link>
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
