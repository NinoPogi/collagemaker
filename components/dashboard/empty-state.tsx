"use client";

import { ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export default function EmptyState({ onCreateFirst }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-2xl">
        <div className="mb-8 animate-bounce-subtle">
          <ImageIcon className="w-32 h-32 mx-auto text-orange-400" />
        </div>
        <h2
          className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          Start Collaging Now!
        </h2>
        <p className="text-xl text-slate-700 dark:text-slate-300 mb-10 leading-relaxed">
          You haven&apos;t created any collages yet. Click the button above or
          below to create your first masterpiece!
        </p>
        <Button
          onClick={onCreateFirst}
          className="group px-10 py-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300 border-none"
        >
          Create Your First Collage
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
