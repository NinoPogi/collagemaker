import { LucideIcon } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  canvasWidth: number;
  canvasHeight: number;
  canvasState: CanvasState;
  gridRows: number;
  gridCols: number;
  thumbnailUrl?: string | null;
}

export interface CanvasState {
  width: number;
  height: number;
  objects?: unknown[];
  backgroundColor?: string;
  [key: string]: unknown;
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

export type ActiveObjectState = | {type: 'textbox'; fontFamily: string; fontSize?: number; fill?: string; fontWeight?: 'bold' | 'normal'; fontStyle?: string; underline?: boolean; linethrough?: boolean; textAlign?: string;} | {type: 'image'; src: string; scaleX: number; scaleY: number; filters?: Record<string, any>;} | {type: 'path' | 'circle' | 'rect' | 'group'; scaleX: number; scaleY: number; stroke: string; strokeWidth: number; fill: string;}

export interface ToolItem {
  id: string;
  name: string;
  icon: LucideIcon;
  disabled: boolean;
  withPanel: boolean;
}

