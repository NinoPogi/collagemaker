import { ReactNode } from "react";
import { SignInButton } from "@clerk/nextjs";


 export default function Hero(){
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent animate-fade-in" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          Collage Maker
          {/* Create Stunning Collages in Seconds */}
        </h2>
        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Transform your memories into beautiful photo collages with our intuitive drag-and-drop interface. No design skills needed – just upload, arrange, and share!
        </p>
        <div className="animate-bounce-subtle" style={{ animationDelay: '0.4s' }}>
          <SignInButton mode="modal" oauthFlow="popup">
          <button
        className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300"
      >
        Get Started
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
      </SignInButton>

        </div>
      </div>
    </section>
  )
}

