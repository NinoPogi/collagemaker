import { useRef, useCallback, MutableRefObject } from 'react';
import { GridCanvasRef } from './grid-canvas';

export interface MultiCanvasState {
  cells: Record<string, object>;
}

interface UseMultiCanvasOptions {
  rows: number;
  cols: number;
  canvasWidth: number;
  canvasHeight: number;
  initialState?: MultiCanvasState | null;
}

export function useMultiCanvas({
  rows,
  cols,
  canvasWidth,
  canvasHeight,
  initialState,
}: UseMultiCanvasOptions) {
  const cellRefs = useRef<Map<number, GridCanvasRef>>(new Map());
  const activeCell = useRef<number>(0);

  // Calculate cell dimensions
  const cellWidth = canvasWidth / cols;
  const cellHeight = canvasHeight / rows;
  const totalCells = rows * cols;

  // Register a cell ref
  const registerCellRef = useCallback((index: number, ref: GridCanvasRef | null) => {
    if (ref) {
      cellRefs.current.set(index, ref);
    } else {
      cellRefs.current.delete(index);
    }
  }, []);

  // Get the active cell's ref
  const getActiveRef = useCallback((): GridCanvasRef | null => {
    return cellRefs.current.get(activeCell.current) ?? null;
  }, []);

  // Set the active cell
  const setActiveCell = useCallback((index: number) => {
    activeCell.current = index;
  }, []);

  // Add image to active cell
  const addImageToActiveCell = useCallback((url: string) => {
    const ref = getActiveRef();
    if (ref) {
      ref.addImageFromUrl(url);
    }
  }, [getActiveRef]);

  // Add text to active cell
  const addTextToActiveCell = useCallback(() => {
    const ref = getActiveRef();
    if (ref) {
      ref.addText();
    }
  }, [getActiveRef]);

  // Delete active object in active cell
  const deleteActiveInCell = useCallback(() => {
    const ref = getActiveRef();
    if (ref) {
      ref.deleteActive();
    }
  }, [getActiveRef]);

  // Get all cells' state as a single object
  const getAllCellsState = useCallback((): MultiCanvasState => {
    const cells: Record<string, object> = {};
    cellRefs.current.forEach((ref, index) => {
      const state = ref.getJsonState();
      if (state) {
        cells[index.toString()] = state;
      }
    });
    return { cells };
  }, []);

  // Generate composite image from all cells
  const generateCompositeImage = useCallback(async (
    multiplier: number = 2
  ): Promise<string | null> => {
    if (totalCells === 0) return null;

    // Create an offscreen canvas to composite all cells
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasWidth * multiplier;
    compositeCanvas.height = canvasHeight * multiplier;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return null;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

    // Draw each cell at its position
    const promises: Promise<void>[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const ref = cellRefs.current.get(index);
        if (!ref) continue;

        const dataUrl = ref.toDataURL({ multiplier });
        if (!dataUrl) continue;

        const x = col * cellWidth * multiplier;
        const y = row * cellHeight * multiplier;

        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, x, y);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = dataUrl;
        });
        promises.push(promise);
      }
    }

    await Promise.all(promises);
    return compositeCanvas.toDataURL('image/png', 1);
  }, [rows, cols, cellWidth, cellHeight, canvasWidth, canvasHeight, totalCells]);

  // Generate thumbnail (smaller composite)
  const generateThumbnail = useCallback(async (): Promise<string | null> => {
    return generateCompositeImage(0.5);
  }, [generateCompositeImage]);

  // Download the composite image
  const downloadComposite = useCallback(async (title: string) => {
    const dataUrl = await generateCompositeImage(2);
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `${title}.png`;
    link.href = dataUrl;
    link.click();
  }, [generateCompositeImage]);

  // Get initial state for a specific cell
  const getCellInitialState = useCallback((index: number): object | null => {
    if (!initialState?.cells) return null;
    return initialState.cells[index.toString()] ?? null;
  }, [initialState]);

  return {
    cellWidth,
    cellHeight,
    totalCells,
    rows,
    cols,
    registerCellRef,
    setActiveCell,
    activeCell,
    addImageToActiveCell,
    addTextToActiveCell,
    deleteActiveInCell,
    getAllCellsState,
    generateCompositeImage,
    generateThumbnail,
    downloadComposite,
    getCellInitialState,
  };
}
