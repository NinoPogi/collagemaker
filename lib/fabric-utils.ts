import { Canvas, Rect, FabricObject, TDataUrlOptions } from 'fabric';

export function createGridLayout(
  rows: number,
  cols: number,
  canvasWidth: number,
  canvasHeight: number
): FabricObject[] {
  const objects: FabricObject[] = [];
  
  if (rows === 0 || cols === 0) {
    // Blank canvas
    return objects;
  }

  const cellWidth = canvasWidth / cols;
  const cellHeight = canvasHeight / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const rect = new Rect({
        left: col * cellWidth,
        top: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
        fill: '#f5f5f5',
        stroke: '#e0e0e0',
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        lockRotation: false,
      });

      objects.push(rect);
    }
  }

  return objects;
}

export function initializeCanvas(
  canvasWidth: number,
  canvasHeight: number,
  gridLayout?: { rows: number; cols: number }
): string {
  // Create a temporary canvas to generate the initial state
  const tempCanvas = new Canvas(null as never, {
    width: canvasWidth,
    height: canvasHeight,
  });

  // Add grid if specified
  if (gridLayout && gridLayout.rows > 0 && gridLayout.cols > 0) {
    const gridObjects = createGridLayout(
      gridLayout.rows,
      gridLayout.cols,
      canvasWidth,
      canvasHeight
    );
    
    gridObjects.forEach(obj => tempCanvas.add(obj));
  }

  // Serialize to JSON
  const canvasState = tempCanvas.toJSON();
  
  return JSON.stringify(canvasState);
}