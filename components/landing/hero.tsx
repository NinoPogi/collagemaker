import { ReactNode } from "react";

interface HeroProps {
  cta: ReactNode;
}

const Hero = ({ cta }: HeroProps) => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent animate-fade-in" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          Create Stunning Collages in Seconds
        </h2>
        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Transform your memories into beautiful photo collages with our intuitive drag-and-drop interface. No design skills needed – just upload, arrange, and share!
        </p>
        <div className="animate-bounce-subtle" style={{ animationDelay: '0.4s' }}>
          {cta}
        </div>
      </div>
    </section>
  )
}

export default Hero