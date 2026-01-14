'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Project } from '@/types/project';
import { deleteProject, updateProject } from '@/app/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; 
import CreateProjectModal from '../modals/create-project-modal'; // We can reuse this or refactor it to accept initial data

interface ProjectCardProps {
  project: Project;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

export default function ProjectCard({ project, isHovered, onHover, onLeave }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // We need a way to edit title. Let's create a specialized modal or reuse. 
  // For now, let's just use `window.prompt` for simplicity or quick implementation unless I want to create a full modal component right now.
  // The user asked for "2 options edit name or delete project". 
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setIsDeleting(true);
    await deleteProject(project.id);
    setIsDeleting(false);
  };

  const handleEditName = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newTitle = window.prompt('Enter new project name:', project.title);
      if (newTitle && newTitle !== project.title) {
          updateProject(project.id, { title: newTitle });
      }
  };

  if (isDeleting) return null; // Optimistic update ui

  return (
    <div className="relative group">
    <Link
      href={`/editor/${project.id}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="block"
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
          isHovered
            ? 'border-orange-400 shadow-2xl scale-105'
            : 'border-orange-200 dark:border-slate-700 shadow-md hover:shadow-xl'
        }`}
      >
        {/* Project Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 dark:from-slate-700 dark:to-slate-600 relative overflow-hidden">
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-orange-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute bottom-4 left-4 text-white font-bold flex items-center gap-2">
              <span>Open Project</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {project.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(project.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>{project.canvasWidth} × {project.canvasHeight}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                    className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                    onClick={(e) => e.stopPropagation()} // Stop propagation to prevent navigation
                >
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleEditName}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Project
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  );
}