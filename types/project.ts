export interface Project {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  canvasWidth: number;
  canvasHeight: number;
  canvasState: unknown;
  thumbnailUrl?: string | null;
}

export interface CollageSize {
  name: string;
  width: number;
  height: number;
  description: string;
  icon: string;
}

export interface GridLayout {
  id: string;
  name: string;
  rows: number;
  cols: number;
  preview: string; // SVG or description
}