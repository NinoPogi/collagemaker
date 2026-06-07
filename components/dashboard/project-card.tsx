"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Project } from "@/types/project";
import { deleteProject, updateProject } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LoaderCircle,
  ArrowRight,
  Image as ImageIcon,
  Calendar,
  Proportions,
  EllipsisVertical,
  SquarePen,
  Trash2,
} from "lucide-react";
interface ProjectCardProps {
  project: Project;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

export default function ProjectCard({
  project,
  isHovered,
  onHover,
  onLeave,
}: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // We need a way to edit title. Let's create a specialized modal or reuse.
  // For now, let's just use `window.prompt` for simplicity or quick implementation unless I want to create a full modal component right now.
  // The user asked for "2 options edit name or delete project".

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    setIsDropdownOpen(false);
    setIsDeleting(true);

    await deleteProject(project.id);
    setIsDeleting(false);
  };

  const handleEditName = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newTitle = window.prompt("Enter new project name:", project.title);
    if (newTitle && newTitle !== project.title) {
      updateProject(project.id, { title: newTitle });
    }
  };

  return (
    <div className="relative group">
      {isDeleting && (
        <div className="absolute inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl border-2 border-transparent">
          <div className="flex flex-col items-center gap-2">
            <LoaderCircle className="animate-spin h-8 w-8 text-orange-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Deleting...
            </span>
          </div>
        </div>
      )}
      <Link
        href={isDeleting ? "#" : `/editor/${project.id}`} // Disable link while deleting
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className="block"
      >
        <div
          className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
            isHovered
              ? "border-orange-400 shadow-2xl scale-105"
              : "border-orange-200 dark:border-slate-700 shadow-md hover:shadow-xl"
          }`}
        >
          {/* Project Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 dark:from-slate-700 dark:to-slate-600 relative overflow-hidden">
            {project.thumbnailUrl ? (
              <Image
                src={`${project.thumbnailUrl}?v=${new Date(project.updatedAt).getTime()}`}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-orange-300 dark:text-slate-500" />
              </div>
            )}
            {/* Overlay on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute bottom-4 left-4 text-white font-bold flex items-center gap-2">
                <span>Open Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
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
                <Calendar className="w-4 h-4" />

                <span>{formatDate(project.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <Proportions className="w-4 h-4" />
                <span>
                  {project.canvasWidth} × {project.canvasHeight}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10 opacity-100 transition-opacity">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm h-8 w-8"
              onClick={(e) => e.stopPropagation()} // Stop propagation to prevent navigation
            >
              <EllipsisVertical className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={handleEditName}>
              <SquarePen className="w-4 h-4 mr-2" />
              Edit Name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
