"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase/client";

const charities: Record<string, {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  image: string;
  impact: string;
  founded: string;
  website: string;
}> = {
  "1": {
    id: "1",
    name: "Fore The Trees Foundation",
    description: "Planting trees on and around golf courses worldwide. One tree for every birdie scored.",
    longDescription: "The Fore The Trees Foundation is a pioneering environmental organisation that works in partnership with golf clubs and governing bodies worldwide. For every birdie scored at a partner course, one tree is planted in an ecologically significant area. Since our founding, we have transformed barren hillsides, restored degraded ecosystems, and created wildlife corridors across four continents. Our work helps offset the carbon footprint of golf while returning land to nature.",
    category: "Environment",
    image: "🌳",
    impact: "Over 50,000 trees planted across 120 golf courses.",
    founded: "2015",
    website: "www.forethetrees.org",
  },
  "2": {
    id: "2",
    name: "Junior Golf India",
    description: "Providing equipment and coaching for underprivileged junior golfers across India.",
    longDescription: "Junior Golf India believes that talent is evenly distributed but opportunity is not. We identify and nurture young golfers from economically disadvantaged backgrounds across India, providing them with professional coaching, equipment, tournament entry fees, and academic scholarships. Our alumni have gone on to represent India at international tournaments, proving that with the right support, every child can reach their potential.",
    category: "Youth & Sport",
    image: "🏌️",
    impact: "Supporting 2,000+ junior golfers with scholarships and gear.",
    founded: "2018",
    website: "www.juniorgolfindia.in",
  },
  "3": {
    id: "3",
    name: "Green Fairways Initiative",
    description: "Promoting sustainable golf course management and water conservation.",
    longDescription: "The Green Fairways Initiative works alongside golf course superintendents and management teams to implement environmentally responsible practices. From transitioning to drought-resistant turf varieties, to installing solar-powered irrigation systems and creating pollinator-friendly rough areas, we are redefining what sustainable golf looks like. Our certified courses serve as models for the industry worldwide.",
    category: "Sustainability",
    image: "💧",
    impact: "Saved 30M litres of water across partner courses.",
    founded: "2017",
    website: "www.greenfairways.eco",
  },
  "4": {
    id: "4",
    name: "Caddie Welfare Trust",
    description: "Healthcare, education, and financial support for golf caddies and their families.",
    longDescription: "Caddies are the backbone of the game, yet they often work without the security of health insurance, steady income, or retirement savings. The Caddie Welfare Trust provides emergency medical assistance, educational grants for caddies' children, and financial literacy programmes. We also advocate for fair pay and working conditions at clubs across India, ensuring the people who make the game possible are treated with dignity and respect.",
    category: "Social Welfare",
    image: "🤝",
    impact: "Assisted 4,500+ caddies and their dependants.",
    founded: "2016",
    website: "www.caddiewelfare.org",
  },
  "5": {
    id: "5",
    name: "Swing for Smiles",
    description: "Organising golf charity events to fund cleft palate surgeries for children.",
    longDescription: "Swing for Smiles organises premium charity golf tournaments to raise funds for life-changing cleft palate and lip repair surgeries for children in underserved communities. A child born with a cleft condition in a wealthy country receives surgery within the first year of life. In many parts of India, families cannot afford this procedure. We are bridging that gap, one round at a time. Each ₹4,000 raised funds one complete surgical procedure.",
    category: "Healthcare",
    image: "😊",
    impact: "Funded 800+ life-changing surgeries for children.",
    founded: "2019",
    website: "www.swingforsmiles.in",
  },
};

export default function CharityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const charity = charities[id];
  const router = useRouter();

  async function handleSelectCharity() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push("/dashboard/charities");
    } else {
      router.push("/pricing");
    }
  }

  if (!charity) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-2xl font-bold mb-2">Charity Not Found</h1>
            <p className="text-gc-text-muted mb-6">This charity doesn&apos;t exist or has been removed.</p>
            <Link href="/charities" className="btn-green">Back to Charities</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 relative">
        <div className="max-w-4xl mx-auto px-6">

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/charities" className="inline-flex items-center gap-2 text-gc-text-muted hover:text-gc-green-400 transition-colors text-sm mb-8">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              Back to Charities
            </Link>
          </motion.div>

          {/* Hero Card */}
          <motion.div
            className="glass-card p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-20 h-20 rounded-2xl bg-gc-green-600/10 border border-gc-green-400/20 flex items-center justify-center text-4xl shrink-0">
                {charity.image}
              </div>
              <div className="flex-1">
                <span className="text-xs text-gc-gold-400 font-semibold uppercase tracking-widest mb-2 block">
                  {charity.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                  {charity.name}
                </h1>
                <p className="text-gc-text-secondary">{charity.description}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Impact", value: charity.impact, icon: "📊" },
              { label: "Founded", value: charity.founded, icon: "📅" },
              { label: "Website", value: charity.website, icon: "🌐" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card p-5 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-xs text-gc-text-muted mb-1 uppercase tracking-wider">{stat.label}</p>
                <p className="text-gc-text-primary text-sm font-medium">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Long Description */}
          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              About <span className="gradient-text-green">This Charity</span>
            </h2>
            <p className="text-gc-text-secondary leading-relaxed">
              {charity.longDescription}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSelectCharity}
                className="btn-green text-center text-sm"
              >
                Select This Charity
              </button>
              <Link href="/charities" className="btn-ghost text-center text-sm">
                Explore Other Charities
              </Link>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  );
}
