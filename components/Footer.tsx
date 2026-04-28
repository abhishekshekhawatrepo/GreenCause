import Link from "next/link";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-gc-green-800/20 bg-gc-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
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
            </div>
            <p className="text-gc-text-muted text-sm leading-relaxed">
              Track your golf performance, win monthly prizes, and support causes
              that matter. Play with purpose.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gc-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gc-text-muted hover:text-gc-text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gc-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">
              Account
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-gc-text-muted hover:text-gc-text-primary transition-colors text-sm"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-gc-text-muted hover:text-gc-text-primary transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gc-text-muted hover:text-gc-text-primary transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gc-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-gc-text-muted text-sm">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gc-text-muted text-sm">Terms of Service</span>
              </li>
              <li>
                <span className="text-gc-text-muted text-sm">Cookie Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gc-green-800/15 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gc-text-muted text-xs">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-gc-text-muted text-xs">
            Made with 🌿 for golfers who give back
          </p>
        </div>
      </div>
    </footer>
  );
}
