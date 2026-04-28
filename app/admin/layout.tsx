"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import AuthGuard from "@/components/AuthGuard";

const adminLinks = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/admin/draws",
    label: "Draws",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
  },
  {
    href: "/admin/charities",
    label: "Charities",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard requireSubscription requireAdmin>
    <div className="flex min-h-screen bg-gc-bg-primary">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gc-gold-500/10 bg-gc-bg-secondary/50 p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gc-gold-500/10 border border-gc-gold-400/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gc-gold-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4-3 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 9 8 12z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <span className="text-lg font-bold font-[family-name:var(--font-outfit)]">
            <span className="text-gc-gold-400">Admin</span>
            <span className="text-gc-text-primary">Panel</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="space-y-1 flex-1">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`admin-sidebar-${link.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "text-gc-gold-400 bg-gc-gold-500/10"
                    : "text-gc-text-secondary hover:text-gc-text-primary hover:bg-gc-bg-card/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gc-gold-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to Dashboard */}
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gc-text-muted hover:text-gc-text-primary hover:bg-gc-bg-card/50 transition-all">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Dashboard
        </Link>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gc-gold-500/10 bg-gc-bg-secondary/95 backdrop-blur-lg px-2 py-2">
        <div className="flex justify-around">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isActive ? "text-gc-gold-400" : "text-gc-text-muted"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
