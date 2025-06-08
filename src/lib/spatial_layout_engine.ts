// src/lib/spatialLayoutEngine.ts

export interface GridConfig {
  cellSize: number;
  snapTolerance: number;
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  padding: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface ConnectionPoint {
  id: string;
  blockId: string;
  type: 'input' | 'output';
  position: Position;
  label: string;
}

export interface VisualConnection {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
  type: 'automation' | 'data' | 'payment';
  animated: boolean;
  active: boolean;
}

export class SpatialLayoutEngine {
  private config: GridConfig;
  private scale: number = 1;
  private offset: Position = { x: 0, y: 0 };

  constructor(config: Partial<GridConfig> = {}) {
    this.config = {
      cellSize: 120,
      snapTolerance: 15,
      viewBox: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      },
      padding: 20,
      ...config
    };
  }

  // Grid system methods
  positionToGrid(position: Position): GridPosition {
    const { cellSize, padding } = this.config;
    return {
      row: Math.round((position.y - padding) / cellSize),
      col: Math.round((position.x - padding) / cellSize)
    };
  }

  gridToPosition(gridPos: GridPosition): Position {
    const { cellSize, padding } = this.config;
    return {
      x: gridPos.col * cellSize + padding,
      y: gridPos.row * cellSize + padding
    };
  }

  snapToGrid(position: Position): Position {
    const { cellSize, snapTolerance, padding } = this.config;
    
    const relativeX = position.x - padding;
    const relativeY = position.y - padding;
    
    const nearestCol = Math.round(relativeX / cellSize);
    const nearestRow = Math.round(relativeY / cellSize);
    
    const snappedX = nearestCol * cellSize + padding;
    const snappedY = nearestRow * cellSize + padding;
    
    // Only snap if within tolerance
    const deltaX = Math.abs(position.x - snappedX);
    const deltaY = Math.abs(position.y - snappedY);
    
    if (deltaX <= snapTolerance && deltaY <= snapTolerance) {
      return { x: snappedX, y: snappedY };
    }
    
    return position;
  }

  // Viewport management
  setScale(scale: number): void {
    this.scale = Math.max(0.5, Math.min(2.0, scale));
  }

  getScale(): number {
    return this.scale;
  }

  setOffset(offset: Position): void {
    this.offset = offset;
  }

  getOffset(): Position {
    return this.offset;
  }

  screenToCanvas(screenPos: Position): Position {
    return {
      x: (screenPos.x - this.offset.x) / this.scale,
      y: (screenPos.y - this.offset.y) / this.scale
    };
  }

  canvasToScreen(canvasPos: Position): Position {
    return {
      x: canvasPos.x * this.scale + this.offset.x,
      y: canvasPos.y * this.scale + this.offset.y
    };
  }

  // Grid rendering helpers
  generateGridLines(): { vertical: string[]; horizontal: string[] } {
    const { cellSize, viewBox, padding } = this.config;
    const vertical: string[] = [];
    const horizontal: string[] = [];

    // Vertical lines
    for (let x = padding; x <= viewBox.width; x += cellSize) {
      vertical.push(`M ${x} 0 L ${x} ${viewBox.height}`);
    }

    // Horizontal lines
    for (let y = padding; y <= viewBox.height; y += cellSize) {
      horizontal.push(`M 0 ${y} L ${viewBox.width} ${y}`);
    }

    return { vertical, horizontal };
  }

  // Connection system
  calculateConnectionPath(from: Position, to: Position, type: 'straight' | 'curved' | 'stepped' = 'curved'): string {
    switch (type) {
      case 'straight':
        return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      
      case 'stepped':
        const midX = from.x + (to.x - from.x) / 2;
        return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
      
      case 'curved':
      default:
        const controlPoint1X = from.x + (to.x - from.x) * 0.5;
        const controlPoint2X = to.x - (to.x - from.x) * 0.5;
        return `M ${from.x} ${from.y} C ${controlPoint1X} ${from.y} ${controlPoint2X} ${to.y} ${to.x} ${to.y}`;
    }
  }

  // Block positioning helpers
  findEmptyGridPosition(occupiedPositions: GridPosition[]): GridPosition {
    const maxSearchRadius = 10;
    
    // Start from center and spiral outward
    for (let radius = 0; radius <= maxSearchRadius; radius++) {
      for (let row = -radius; row <= radius; row++) {
        for (let col = -radius; col <= radius; col++) {
          // Only check border positions for this radius
          if (Math.abs(row) === radius || Math.abs(col) === radius) {
            const candidate = { row: row + 5, col: col + 5 }; // Offset from center
            
            const isOccupied = occupiedPositions.some(pos => 
              pos.row === candidate.row && pos.col === candidate.col
            );
            
            if (!isOccupied) {
              return candidate;
            }
          }
        }
      }
    }
    
    // Fallback to a random position
    return { row: 5, col: 5 };
  }

  // Collision detection
  isPositionOccupied(position: GridPosition, occupiedPositions: GridPosition[]): boolean {
    return occupiedPositions.some(pos => 
      pos.row === position.row && pos.col === position.col
    );
  }

  // Block size management
  getBlockBounds(gridPos: GridPosition, blockSize: { width: number; height: number } = { width: 1, height: 1 }): {
    topLeft: Position;
    bottomRight: Position;
    center: Position;
  } {
    const topLeft = this.gridToPosition(gridPos);
    const bottomRight = {
      x: topLeft.x + (blockSize.width * this.config.cellSize),
      y: topLeft.y + (blockSize.height * this.config.cellSize)
    };
    const center = {
      x: topLeft.x + (blockSize.width * this.config.cellSize) / 2,
      y: topLeft.y + (blockSize.height * this.config.cellSize) / 2
    };

    return { topLeft, bottomRight, center };
  }

  // Connection port positions
  generateConnectionPorts(blockCenter: Position, blockSize: { width: number; height: number }): {
    top: Position;
    right: Position;
    bottom: Position;
    left: Position;
  } {
    const halfWidth = (blockSize.width * this.config.cellSize) / 2;
    const halfHeight = (blockSize.height * this.config.cellSize) / 2;

    return {
      top: { x: blockCenter.x, y: blockCenter.y - halfHeight },
      right: { x: blockCenter.x + halfWidth, y: blockCenter.y },
      bottom: { x: blockCenter.x, y: blockCenter.y + halfHeight },
      left: { x: blockCenter.x - halfWidth, y: blockCenter.y }
    };
  }

  // Configuration updates
  updateConfig(newConfig: Partial<GridConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): GridConfig {
    return { ...this.config };
  }

  // Utility methods
  getViewBox(): string {
    const { x, y, width, height } = this.config.viewBox;
    return `${x} ${y} ${width} ${height}`;
  }

  clampToViewBox(position: Position): Position {
    const { viewBox } = this.config;
    return {
      x: Math.max(0, Math.min(viewBox.width, position.x)),
      y: Math.max(0, Math.min(viewBox.height, position.y))
    };
  }
}