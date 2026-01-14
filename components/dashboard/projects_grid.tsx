'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import ProjectCard from './project_card';

interface ProjectsGridProps {
  projects: Project[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          isHovered={hoveredCard === project.id}
          onHover={() => setHoveredCard(project.id)}
          onLeave={() => setHoveredCard(null)}
        />
      ))}
    </div>
  );
}