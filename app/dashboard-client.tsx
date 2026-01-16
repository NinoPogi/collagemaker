'use client';

import { Project } from '@/types/project';
import DashboardHeader from '@/components/dashboard/dashboard_header';
import EmptyState from '@/components/dashboard/empty_state';
import ProjectsGrid from '@/components/dashboard/projects_grid';
import CreateProjectModal from '@/components/modals/create-project-modal';
import { useState } from 'react';

interface DashboardClientProps {
  projects: Project[];
}

export default function DashboardClient({ projects = [] }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <DashboardHeader 
        projectCount={projects.length} 
        onNewProject={handleNewProject}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {projects.length === 0 ? (
          <EmptyState onCreateFirst={handleNewProject} />
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
