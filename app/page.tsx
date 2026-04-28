"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  APP_TAGLINE,
  APP_DESCRIPTION,
  CURRENCY_SYMBOL,
  PLAN_MONTHLY_PRICE,
} from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Score Tracking",
    description:
      "Log your Stableford scores after every round. Track your rolling 5-score average and watch your game evolve.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8l-4 4-4-4" />
        <path d="M12 12v6" />
      </svg>
    ),
    title: "Monthly Draws",
    description:
      "Your scores become your lottery numbers. Match them against the monthly draw to win prizes from the communal pool.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Give Back",
    description:
      "Choose a charity and set your contribution tier. Every subscription fuels causes that matter — play with purpose.",
  },
];

const steps = [
  {
    num: "01",
    title: "Subscribe",
    desc: `Join from just ${CURRENCY_SYMBOL}${PLAN_MONTHLY_PRICE}/month. Choose your charity and contribution tier.`,
  },
  {
    num: "02",
    title: "Track Scores",
    desc: "Log your Stableford scores after each round. Your latest 5 scores become your draw numbers.",
  },
  {
    num: "03",
    title: "Enter Draws",
    desc: "Automatically enter the monthly draw. Match your scores to the winning numbers to win prizes.",
  },
  {
    num: "04",
    title: "Make Impact",
    desc: "A portion of every subscription goes to your chosen charity. Track your collective impact.",
  },
];

const stats = [
  { value: "10K+", label: "Active Golfers" },
  { value: `${CURRENCY_SYMBOL}2.5L+`, label: "Donated to Charity" },
  { value: "850+", label: "Monthly Winners" },
  { value: "50+", label: "Partner Charities" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-20">
        {/* Background orbs */}
        <div className="orb orb-green w-[500px] h-[500px] -top-40 -right-40" />
        <div className="orb orb-gold w-[400px] h-[400px] bottom-20 -left-40" />
        <div className="orb orb-green w-[300px] h-[300px] top-1/2 right-1/4" style={{ animationDelay: "-4s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gc-green-400/20 bg-gc-green-400/5 text-gc-green-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-gc-green-400 animate-pulse" />
                Now open for golfers across India
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-outfit)] tracking-tight leading-[1.1]"
            >
              <span className="gradient-text-green">{APP_TAGLINE.split(" · ")[0]}</span>
              <span className="text-gc-text-primary"> · </span>
              <span className="gradient-text-gold">{APP_TAGLINE.split(" · ")[1]}</span>
              <span className="text-gc-text-primary"> · </span>
              <span className="gradient-text-green">{APP_TAGLINE.split(" · ")[2]}</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="max-w-2xl mx-auto text-gc-text-secondary text-lg sm:text-xl leading-relaxed"
            >
              {APP_DESCRIPTION}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link href="/pricing" id="hero-cta-primary">
                <button className="btn-gold text-base px-10 py-4">
                  Start Your Journey — {CURRENCY_SYMBOL}{PLAN_MONTHLY_PRICE}/mo
                </button>
              </Link>
              <Link href="/#how-it-works" id="hero-cta-secondary">
                <button className="btn-ghost text-base px-8 py-4">
                  How It Works ↓
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gc-bg-primary to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 -mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] gradient-text-gold">
                  {stat.value}
                </div>
                <div className="text-gc-text-muted text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 sm:py-32 relative" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              One Platform, <span className="gradient-text-green">Three Pillars</span>
            </h2>
            <p className="text-gc-text-secondary max-w-xl mx-auto">
              GreenCause brings together everything you need to elevate your game while making a difference.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-8 flex flex-col items-start gap-5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gc-green-600/10 border border-gc-green-400/20 flex items-center justify-center text-gc-green-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)]">
                  {feature.title}
                </h3>
                <p className="text-gc-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 sm:py-32 bg-gc-bg-secondary/30 relative" id="how-it-works">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              How <span className="gradient-text-gold">It Works</span>
            </h2>
            <p className="text-gc-text-secondary max-w-lg mx-auto">
              Four simple steps to start playing with purpose.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex gap-6 items-start"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div className="shrink-0 w-14 h-14 rounded-xl border border-gc-gold-500/30 bg-gc-gold-500/5 flex items-center justify-center">
                  <span className="text-gc-gold-400 font-bold font-[family-name:var(--font-outfit)] text-lg">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gc-text-secondary text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="orb orb-green w-[400px] h-[400px] top-0 right-0" />
        <div className="orb orb-gold w-[350px] h-[350px] bottom-0 left-0" />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-6 leading-tight">
            Ready to Play <span className="gradient-text-green">With Purpose</span>?
          </h2>
          <p className="text-gc-text-secondary text-lg mb-10 max-w-xl mx-auto">
            Join thousands of golfers who track their scores, win prizes, and support
            charities they care about — all from one platform.
          </p>
          <Link href="/pricing" id="bottom-cta">
            <button className="btn-gold text-lg px-12 py-5">
              Get Started Today
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}
