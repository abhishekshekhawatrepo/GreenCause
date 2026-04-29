"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase/client";

const charities = [
  {
    id: "1",
    name: "Fore The Trees Foundation",
    description: "Planting trees on and around golf courses worldwide. One tree for every birdie scored.",
    category: "Environment",
    image: "🌳",
    impact: "Over 50,000 trees planted across 120 golf courses.",
  },
  {
    id: "2",
    name: "Junior Golf India",
    description: "Providing equipment and coaching for underprivileged junior golfers across India.",
    category: "Youth & Sport",
    image: "🏌️",
    impact: "Supporting 2,000+ junior golfers with scholarships and gear.",
  },
  {
    id: "3",
    name: "Green Fairways Initiative",
    description: "Promoting sustainable golf course management and water conservation.",
    category: "Sustainability",
    image: "💧",
    impact: "Saved 30M litres of water across partner courses.",
  },
  {
    id: "4",
    name: "Caddie Welfare Trust",
    description: "Healthcare, education, and financial support for golf caddies and their families.",
    category: "Social Welfare",
    image: "🤝",
    impact: "Assisted 4,500+ caddies and their dependants.",
  },
  {
    id: "5",
    name: "Swing for Smiles",
    description: "Organising golf charity events to fund cleft palate surgeries for children.",
    category: "Healthcare",
    image: "😊",
    impact: "Funded 800+ life-changing surgeries for children.",
  },
];

const allCategories = ["All", ...Array.from(new Set(charities.map((c) => c.category)))];

export default function CharitiesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  async function handleSelectCharity() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Already logged in — go straight to charity selection in dashboard
      router.push("/dashboard/charities");
    } else {
      // Not logged in — send to pricing first
      router.push("/pricing");
    }
  }

  const filtered = activeCategory === "All"
    ? charities
    : charities.filter((c) => c.category === activeCategory);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              Our <span className="gradient-text-green">Partner Charities</span>
            </h1>
            <p className="text-gc-text-secondary text-lg max-w-xl mx-auto">
              Choose a charity that resonates with you. A portion of every subscription
              goes directly to your chosen cause.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-gc-green-600/20 border-gc-green-400/50 text-gc-green-400"
                    : "border-gc-green-800/20 text-gc-text-secondary hover:text-gc-green-400 hover:border-gc-green-400/30"
                }`}
                id={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Charity Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((charity, i) => (
              <motion.div
                key={charity.id}
                className="glass-card p-6 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <div className="w-16 h-16 rounded-xl bg-gc-green-600/10 border border-gc-green-400/20 flex items-center justify-center text-3xl mb-4">
                  {charity.image}
                </div>
                <span className="text-xs text-gc-gold-400 font-medium mb-2 uppercase tracking-wider">
                  {charity.category}
                </span>
                <h3 className="text-lg font-bold font-[family-name:var(--font-outfit)] mb-2">
                  {charity.name}
                </h3>
                <p className="text-gc-text-secondary text-sm leading-relaxed flex-1">
                  {charity.description}
                </p>
                <div className="mt-4 p-3 rounded-lg bg-gc-green-600/5 border border-gc-green-400/10">
                  <p className="text-gc-green-400 text-xs font-medium">📊 Impact</p>
                  <p className="text-gc-text-secondary text-xs mt-1">{charity.impact}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/charities/${charity.id}`}
                    className="btn-ghost text-sm text-center flex-1"
                    id={`learn-more-charity-${charity.id}`}
                  >
                    Learn More
                  </Link>
                  <button
                    onClick={handleSelectCharity}
                    className="btn-green text-sm flex-1"
                    id={`select-charity-${charity.id}`}
                  >
                    Select →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
