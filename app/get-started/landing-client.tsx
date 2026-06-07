"use client";

import CTA from "@/components/landing/cta";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import { Image as ImageIcon } from "lucide-react";

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Hero />

      {/* Demo Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-slate-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 rounded-3xl p-12 min-h-[400px] flex items-center justify-center border-2 border-orange-300 dark:border-orange-600 shadow-xl">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <ImageIcon className="text-white scale-150" />
                </div>
                <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">
                  Interactive Demo Coming Soon
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Experience the magic of collage creation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
