"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check auth state
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ? { email: u.email ?? undefined } : null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined } : null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3 border-b border-gc-green-800/30" : "py-5"
      }`}
      style={{
        background: scrolled ? "rgba(11, 26, 20, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="logo-link">
          <div className="w-9 h-9 rounded-lg bg-gc-green-600/20 border border-gc-green-400/30 flex items-center justify-center transition-all duration-300 group-hover:border-gc-green-400/60 group-hover:bg-gc-green-600/30">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gc-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c4-3 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 9 8 12z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-outfit)]">
            <span className="text-gc-green-400">Green</span>
            <span className="text-gc-text-primary">Cause</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/dashboard" id="nav-dashboard">
              <button className="btn-gold text-sm !py-2.5 !px-6">Dashboard</button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="nav-link" id="nav-login">Login</Link>
              <Link href="/pricing" id="nav-cta">
                <button className="btn-gold text-sm !py-2.5 !px-6">Get Started</button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" id="mobile-menu-toggle">
          <motion.span className="block w-6 h-0.5 bg-gc-text-primary rounded-full" animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} />
          <motion.span className="block w-6 h-0.5 bg-gc-text-primary rounded-full" animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} />
          <motion.span className="block w-6 h-0.5 bg-gc-text-primary rounded-full" animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 border-b border-gc-green-800/30"
            style={{ background: "rgba(11, 26, 20, 0.95)", backdropFilter: "blur(20px)" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link text-lg" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <button className="btn-gold w-full mt-2">Dashboard</button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="nav-link text-lg" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                    <button className="btn-gold w-full mt-2">Get Started</button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
