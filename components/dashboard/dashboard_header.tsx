'use client';

import { SignedIn, UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  projectCount: number;
  onNewProject: () => void;
}

export default function DashboardHeader({ projectCount, onNewProject }: DashboardHeaderProps) {
  return (
    <header className="border-b border-orange-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            My Collages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </p>
        </div>
  
<div className="flex items-center gap-4">
  {projectCount > 0 && (
            <button
              onClick={onNewProject}
              className="group px-4 md:px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">New Project</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 hidden md:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
  
          )}
          <SignedIn >
              <UserButton />
          </SignedIn>
</div>
      </div>
    </header>
  );
}