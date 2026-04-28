"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const charities = [
  {
    id: "1",
    name: "Fore The Trees Foundation",
    description: "Planting trees on and around golf courses worldwide. One tree for every birdie scored.",
    category: "Environment",
    image: "🌳",
  },
  {
    id: "2",
    name: "Junior Golf India",
    description: "Providing equipment and coaching for underprivileged junior golfers across India.",
    category: "Youth & Sport",
    image: "🏌️",
  },
  {
    id: "3",
    name: "Green Fairways Initiative",
    description: "Promoting sustainable golf course management and water conservation.",
    category: "Sustainability",
    image: "💧",
  },
  {
    id: "4",
    name: "Caddie Welfare Trust",
    description: "Healthcare, education, and financial support for golf caddies and their families.",
    category: "Social Welfare",
    image: "🤝",
  },
  {
    id: "5",
    name: "Swing for Smiles",
    description: "Organising golf charity events to fund cleft palate surgeries for children.",
    category: "Healthcare",
    image: "😊",
  },
];

const categories = ["All", ...new Set(charities.map((c) => c.category))];

export default function CharitiesPage() {
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
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full text-sm font-medium border border-gc-green-800/20 text-gc-text-secondary hover:text-gc-green-400 hover:border-gc-green-400/30 transition-all"
                id={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Charity Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity, i) => (
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
                <button className="btn-ghost mt-5 text-sm" id={`select-charity-${charity.id}`}>
                  Select This Charity
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
