import { CollageSize, GridLayout } from '../types/project';

export const COLLAGE_SIZES: CollageSize[] = [
  {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    description: 'Perfect for Instagram',
    icon: '📱'
  },
  {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    description: 'Vertical story format',
    icon: '📲'
  },
  {
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    description: 'Standard Facebook image',
    icon: '👍'
  },
  {
    name: 'Twitter Post',
    width: 1200,
    height: 675,
    description: 'Twitter card format',
    icon: '🐦'
  },
  {
    name: 'Pinterest Pin',
    width: 1000,
    height: 1500,
    description: 'Tall Pinterest format',
    icon: '📌'
  },
  {
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    description: '16:9 video thumbnail',
    icon: '🎥'
  },
  {
    name: 'Desktop Wallpaper',
    width: 1920,
    height: 1080,
    description: 'Full HD wallpaper',
    icon: '🖥️'
  },
  {
    name: 'Custom',
    width: 1200,
    height: 800,
    description: 'Define your own size',
    icon: '✨'
  }
];

export const GRID_LAYOUTS: GridLayout[] = [
  {
    id: 'grid-2x2',
    name: '2×2 Grid',
    rows: 2,
    cols: 2,
    preview: 'grid'
  },
  {
    id: 'grid-3x3',
    name: '3×3 Grid',
    rows: 3,
    cols: 3,
    preview: 'grid'
  },
  {
    id: 'grid-2x3',
    name: '2×3 Grid',
    rows: 2,
    cols: 3,
    preview: 'grid'
  },
  {
    id: 'grid-3x2',
    name: '3×2 Grid',
    rows: 3,
    cols: 2,
    preview: 'grid'
  },
  {
    id: 'grid-1x2',
    name: '1×2 Split',
    rows: 1,
    cols: 2,
    preview: 'grid'
  },
  {
    id: 'grid-1x3',
    name: '1×3 Split',
    rows: 1,
    cols: 3,
    preview: 'grid'
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    rows: 0,
    cols: 0,
    preview: 'blank'
  }
];