'use client';

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export default function EmptyState({ onCreateFirst }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-2xl">
        <div className="mb-8 animate-bounce-subtle">
          <svg className="w-32 h-32 mx-auto text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 
          className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          Start Collaging Now!
        </h2>
        <p className="text-xl text-slate-700 dark:text-slate-300 mb-10 leading-relaxed">
          You haven&apos;t created any collages yet. Click the button above or below to create your first masterpiece!
        </p>
        <button
          onClick={onCreateFirst}
          className="group px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300"
        >
          <span className="flex items-center gap-2">
            Create Your First Collage
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% {
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