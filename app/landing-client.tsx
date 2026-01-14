'use client';

import CTA from "@/components/landing/cta";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import CreateProjectModal from "@/components/modals/create-project-modal";
import { useState } from "react";
import Link from 'next/link';

interface LandingClientProps {
  isSignedIn: boolean;
  hasProjects: boolean;
}

export default function LandingClient({ isSignedIn, hasProjects }: LandingClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderCTA = () => {
    // Case 1: Signed in with projects -> Go to Dashboard
    if (isSignedIn && hasProjects) {
      return (
        <Link 
          href="/dashboard"
          className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300"
        >
          Go to Dashboard
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      );
    }

    // Case 2: Signed in or Guest -> Show Create/Get Started (opens modal)
    // Note: If guest, modal might need auth handling, but for now we follow existing pattern
    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300"
      >
        {isSignedIn ? "Create Your First Collage" : "Get Started"}
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Hero cta={renderCTA()} />
      
      {/* Demo Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            See It In Action
          </h3>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-slate-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 rounded-3xl p-12 min-h-[400px] flex items-center justify-center border-2 border-orange-300 dark:border-orange-600 shadow-xl">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">Interactive Demo Coming Soon</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Experience the magic of collage creation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Features />
      <CTA />
      <Footer />
      
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
