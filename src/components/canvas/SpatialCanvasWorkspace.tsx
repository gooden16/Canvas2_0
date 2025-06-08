// src/components/canvas/SpatialCanvasWorkspace.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SpatialLayoutEngine, Position, GridPosition, VisualConnection } from '../../lib/spatialLayoutEngine';
import { CanvasBlock, BlockConnection, AutomationRule } from '../../types/canvas';
import { AssetBlock } from '../blocks/AssetBlock';
import { CreditBlock } from '../blocks/CreditBlock';
import { UserBlock } from '../blocks/UserBlock';
import { ConnectionRenderer } from './ConnectionRenderer';
import { Grid3X3, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface SpatialCanvasWorkspaceProps {
  blocks: CanvasBlock[];
  connections: BlockConnection[];
  automationRules: AutomationRule[];
  onBlockEdit: (blockId: string) => void;
  onDrop: (e: React.DragEvent, position: Position) => void;
  onAutomationRuleUpdate: (rules: AutomationRule[]) => void;
  onConnectionUpdate: (connections: BlockConnection[]) => void;
  onBlockUpdate: (blocks: CanvasBlock[]) => void;
  draggedBlockType: string;
}

export const SpatialCanvasWorkspace: React.FC<SpatialCanvasWorkspaceProps> = ({
  blocks,
  connections,
  automationRules,
  onBlockEdit,
  onDrop,
  onAutomationRuleUpdate,
  onConnectionUpdate,
  onBlockUpdate,
  draggedBlockType
}) => {
  const [engine] = useState(() => new SpatialLayoutEngine());
  const [dragOver, setDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ blockId: string; port: string } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Grid rendering
  const gridLines = engine.generateGridLines();

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      const snappedPosition = engine.snapToGrid(position);
      setDragPosition(snappedPosition);
      setDragOver(true);
    }
  }, [engine]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setDragPosition(null);

    if (svgRef.current && dragPosition) {
      onDrop(e, dragPosition);
    }
  }, [dragPosition, onDrop]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
      setDragPosition(null);
    }
  }, []);

  // Block dragging
  const handleBlockMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    e.stopPropagation();
    
    const block = blocks.find(b => b.id === blockId);
    if (!block || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setIsDraggingBlock(true);
    setDraggedBlock(blockId);
    setDragOffset({
      x: mousePos.x - block.position.x,
      y: mousePos.y - block.position.y
    });
    setSelectedBlock(blockId);
  }, [blocks]);

  // Handle mouse move for block dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingBlock || !draggedBlock || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const newPosition = {
      x: mousePos.x - dragOffset.x,
      y: mousePos.y - dragOffset.y
    };

    const snappedPosition = engine.snapToGrid(newPosition);
    const clampedPosition = engine.clampToViewBox(snappedPosition);

    // Update block position
    const updatedBlocks = blocks.map(block =>
      block.id === draggedBlock
        ? { ...block, position: clampedPosition }
        : block
    );

    onBlockUpdate(updatedBlocks);
  }, [isDraggingBlock, draggedBlock, dragOffset, blocks, onBlockUpdate, engine]);

  // Handle mouse up for block dragging
  const handleMouseUp = useCallback(() => {
    setIsDraggingBlock(false);
    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Connection handling
  const handleConnectionStart = useCallback((blockId: string, port: string) => {
    setIsConnecting(true);
    setConnectionStart({ blockId, port });
  }, []);

  const handleConnectionEnd = useCallback((blockId: string, port: string) => {
    if (isConnecting && connectionStart && connectionStart.blockId !== blockId) {
      // Create new connection
      const newConnection: BlockConnection = {
        id: `connection-${Date.now()}`,
        fromBlock: connectionStart.blockId,
        toBlock: blockId,
        fromPort: connectionStart.port,
        toPort: port
      };

      onConnectionUpdate([...connections, newConnection]);
    }

    setIsConnecting(false);
    setConnectionStart(null);
  }, [isConnecting, connectionStart, connections, onConnectionUpdate]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const currentScale = engine.getScale();
    engine.setScale(currentScale * 1.2);
  }, [engine]);

  const handleZoomOut = useCallback(() => {
    const currentScale = engine.getScale();
    engine.setScale(currentScale / 1.2);
  }, [engine]);

  // Convert grid position to SVG coordinates for positioning
  const getBlockPosition = (block: CanvasBlock) => {
    return block.position;
  };

  // Render connections using the ConnectionRenderer component
  const renderConnections = () => {
    return (
      <ConnectionRenderer
        connections={connections}
        blocks={blocks}
        automationRules={automationRules}
        engine={engine}
      />
    );
  };

  // Render individual block
  const renderBlock = (block: CanvasBlock) => {
    const position = getBlockPosition(block);
    const isSelected = selectedBlock === block.id;
    
    return (
      <g
        key={block.id}
        transform={`translate(${position.x}, ${position.y})`}
        className="canvas-block"
        onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
        style={{ cursor: isDraggingBlock ? 'grabbing' : 'grab' }}
      >
        {/* Block selection indicator */}
        {isSelected && (
          <rect
            x="-4"
            y="-4"
            width="208"
            height="88"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4,4"
            rx="8"
            className="selection-indicator"
          />
        )}
        
        {/* Block content as foreignObject to embed React components */}
        <foreignObject width="200" height="80">
          <div className="w-full h-full">
            {block.type === 'asset' && (
              <AssetBlock
                block={block}
                onEdit={() => onBlockEdit(block.id)}
                onConnectionStart={(port) => handleConnectionStart(block.id, port)}
                onConnectionEnd={(port) => handleConnectionEnd(block.id, port)}
                isConnecting={isConnecting}
              />
            )}
            {block.type === 'credit' && (
              <CreditBlock
                block={block}
                onEdit={() => onBlockEdit(block.id)}
                onConnectionStart={(port) => handleConnectionStart(block.id, port)}
                onConnectionEnd={(port) => handleConnectionEnd(block.id, port)}
                isConnecting={isConnecting}
              />
            )}
            {block.type === 'user' && (
              <UserBlock
                block={block}
                onEdit={() => onBlockEdit(block.id)}
                onConnectionStart={(port) => handleConnectionStart(block.id, port)}
                onConnectionEnd={(port) => handleConnectionEnd(block.id, port)}
                isConnecting={isConnecting}
              />
            )}
          </div>
        </foreignObject>
      </g>
    );
  };

  // Add event listeners for mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingBlock && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const fakeEvent = {
          clientX: e.clientX,
          clientY: e.clientY
        } as React.MouseEvent;
        handleMouseMove(fakeEvent as any);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingBlock) {
        handleMouseUp();
      }
    };

    if (isDraggingBlock) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingBlock, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-cream">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg border transition-colors ${
            showGrid 
              ? 'bg-white border-light-medium-grey text-charcoal-grey' 
              : 'bg-light-grey border-light-medium-grey text-medium-grey'
          }`}
          title="Toggle Grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white border border-light-medium-grey rounded-lg text-charcoal-grey hover:bg-light-grey transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white border border-light-medium-grey rounded-lg text-charcoal-grey hover:bg-light-grey transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={engine.getViewBox()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        style={{ 
          transform: `scale(${engine.getScale()})`,
          transformOrigin: 'top left'
        }}
      >
        {/* Background */}
        <rect
          width="100%"
          height="100%"
          fill="#faf9f7"
          stroke="none"
        />

        {/* Grid */}
        {showGrid && (
          <g className="grid-lines">
            {gridLines.vertical.map((line, index) => (
              <path
                key={`v-${index}`}
                d={line}
                stroke="#e2e1df"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
            {gridLines.horizontal.map((line, index) => (
              <path
                key={`h-${index}`}
                d={line}
                stroke="#e2e1df"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
          </g>
        )}

        {/* Connections */}
        <g className="connections">
          {renderConnections()}
        </g>

        {/* Blocks */}
        <g className="blocks">
          {blocks.map(renderBlock)}
        </g>

        {/* Drop preview */}
        {dragOver && dragPosition && draggedBlockType && (
          <g
            transform={`translate(${dragPosition.x}, ${dragPosition.y})`}
            className="drop-preview"
          >
            <rect
              width="200"
              height="80"
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="8,4"
              rx="8"
            />
            <text
              x="100"
              y="45"
              textAnchor="middle"
              className="fill-blue-600 text-sm font-medium"
            >
              Drop {draggedBlockType.replace('-', ' ')} here
            </text>
          </g>
        )}
      </svg>

      {/* Canvas info overlay */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs text-medium-grey border border-light-medium-grey">
        <div>Blocks: {blocks.length}</div>
        <div>Connections: {connections.length}</div>
        <div>Scale: {Math.round(engine.getScale() * 100)}%</div>
      </div>
    </div>
  );
};