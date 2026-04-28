"use client";

import Link from "next/link";
import { useState } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase/client";
import {
  APP_NAME,
  CURRENCY_SYMBOL,
  PLAN_MONTHLY_PRICE,
  PLAN_YEARLY_PRICE,
} from "@/lib/constants";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

const yearlyMonthly = Math.round(PLAN_YEARLY_PRICE / 12);
const savingsPercent = Math.round(
  ((PLAN_MONTHLY_PRICE * 12 - PLAN_YEARLY_PRICE) / (PLAN_MONTHLY_PRICE * 12)) * 100
);

const planFeatures = [
  "Stableford score tracking",
  "Rolling 5-score window",
  "Monthly draw entry",
  "Charity giving (10-25%)",
  "Winner prize pool",
  "Performance insights",
];

import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const router = useRouter();

  const handleSubscribe = async (planType: "monthly" | "yearly") => {
    setLoading(planType);

    try {
      // Step 0: Ensure user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/pricing");
        return;
      }

      // Step 1: Create Razorpay order from our API
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.error || "Failed to create order");
      }

      // Step 2: Handle mock mode (no Razorpay keys)
      if (order.mock) {
        console.log("🧪 Mock checkout — simulating successful payment");
        alert(
          `✅ Mock Payment Successful!\n\nPlan: ${planType}\nAmount: ${CURRENCY_SYMBOL}${planType === "monthly" ? PLAN_MONTHLY_PRICE : PLAN_YEARLY_PRICE}\nOrder ID: ${order.id}\n\n(Configure Razorpay keys in .env.local for real payments)`
        );
        window.location.href = "/dashboard";
        return;
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: APP_NAME,
        description: `${planType === "monthly" ? "Monthly" : "Yearly"} Subscription`,
        order_id: order.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify payment on server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              planType,
              userId: user.id
            }),
          });

          const result = await verifyRes.json();

          if (result.success) {
            window.location.href = "/dashboard";
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#059669", // gc-green-600
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Load Razorpay Checkout script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Navbar />
      <main className="min-h-screen pt-28 pb-20 gradient-hero relative overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-green w-[500px] h-[500px] -top-40 -right-40" />
        <div className="orb orb-gold w-[350px] h-[350px] bottom-0 -left-40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              Choose Your <span className="gradient-text-gold">Plan</span>
            </h1>
            <p className="text-gc-text-secondary text-lg max-w-lg mx-auto">
              One subscription. Unlimited impact. Every plan includes full access
              to score tracking, monthly draws, and charity giving.
            </p>
          </motion.div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <motion.div
              className="glass-card p-8 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gc-text-secondary mb-1">
                  Monthly Plan
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-[family-name:var(--font-outfit)] text-gc-text-primary">
                    {CURRENCY_SYMBOL}{PLAN_MONTHLY_PRICE}
                  </span>
                  <span className="text-gc-text-muted text-sm">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gc-text-secondary">
                    <svg className="w-4 h-4 text-gc-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe("monthly")}
                className="btn-green w-full"
                disabled={loading !== null}
                id="pricing-monthly-cta"
              >
                {loading === "monthly" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Subscribe Monthly"
                )}
              </button>
            </motion.div>

            {/* Yearly Plan */}
            <motion.div
              className="glass-card-gold p-8 flex flex-col relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Recommended badge */}
              <div className="absolute top-0 right-0">
                <div className="gradient-gold text-gc-bg-primary text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                  SAVE {savingsPercent}%
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gc-gold-400 mb-1">
                  Yearly Plan
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-[family-name:var(--font-outfit)] text-gc-text-primary">
                    {CURRENCY_SYMBOL}{PLAN_YEARLY_PRICE.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gc-text-muted text-sm">/year</span>
                </div>
                <p className="text-gc-gold-400/70 text-xs mt-1">
                  That&apos;s just {CURRENCY_SYMBOL}{yearlyMonthly}/month
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gc-text-secondary">
                    <svg className="w-4 h-4 text-gc-gold-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe("yearly")}
                className="btn-gold w-full"
                disabled={loading !== null}
                id="pricing-yearly-cta"
              >
                {loading === "yearly" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gc-bg-primary/30 border-t-gc-bg-primary rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Subscribe Yearly — Best Value"
                )}
              </button>
            </motion.div>
          </div>

          {/* Payment info */}
          <motion.div
            className="text-center mt-12 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gc-text-muted text-sm">
              Secure payments powered by <strong className="text-gc-text-secondary">Razorpay</strong>. 
              Supports UPI, cards, net banking, and wallets.
            </p>
            <p className="text-gc-text-muted text-xs">
              All plans include a 7-day free trial. Cancel anytime. Prices in INR (₹).
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
