"use client";

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  projectCount: number;
  onNewProject: () => void;
}

export default function DashboardHeader({
  projectCount,
  onNewProject,
}: DashboardHeaderProps) {
  const { isLoaded } = useUser();

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
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {projectCount > 0 && (
            <Button
              onClick={onNewProject}
              className="px-4 md:px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 border-none"
            >
              <Plus className="mr-2 h-5 w-5" />
              <span className="md:inline">New Project</span>
            </Button>
          )}
          <div className="flex items-center justify-center">
            {!isLoaded ? (
              <Skeleton className="h-9 w-9 rounded-full bg-slate-200" />
            ) : (
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9",
                    },
                  }}
                />
              </SignedIn>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
