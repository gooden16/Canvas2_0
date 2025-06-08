import React, { useState, useRef } from 'react';
import { CanvasBlock, BlockConnection, AutomationRule } from '../../types/canvas';
import { BlockCard } from '../blocks/BlockCard';
import { ParameterDrawer } from '../drawers/ParameterDrawer';
import { AutomationRuleEditor } from './AutomationRuleEditor';
import { AutomationFlow } from './AutomationFlow';
import { Edit3, Check, X, Move, Grid3X3 } from 'lucide-react';

interface SpatialCanvasWorkspaceProps {
  blocks: CanvasBlock[];
  connections: BlockConnection[];
  automationRules: AutomationRule[];
  onBlockEdit: (blockId: string) => void;
  onDrop: (e: React.DragEvent, position: { x: number; y: number }) => void;
  onAutomationRuleUpdate: (rules: AutomationRule[]) => void;
  onConnectionUpdate: (connections: BlockConnection[]) => void;
  onBlockUpdate: (blocks: CanvasBlock[]) => void;
}

export const SpatialCanvasWorkspace: React.FC<SpatialCanvasWorkspaceProps> = ({ 
  blocks, 
  connections, 
  automationRules,
  onBlockEdit, 
  onDrop,
  onAutomationRuleUpdate,
  onConnectionUpdate,
  onBlockUpdate
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<CanvasBlock | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Canvas title editing state
  const [canvasTitle, setCanvasTitle] = useState('My Canvas');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Grid configuration
  const GRID_SIZE = 40;
  const BLOCK_SPACING = 320; // Minimum spacing between blocks

  const snapToGrid = (x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    };
  };

  const findNextAvailablePosition = (preferredX: number, preferredY: number) => {
    const snapped = snapToGrid(preferredX, preferredY);
    let testX = snapped.x;
    let testY = snapped.y;
    
    // Check if position is occupied
    const isPositionOccupied = (x: number, y: number) => {
      return blocks.some(block => {
        const distance = Math.sqrt(
          Math.pow(block.position.x - x, 2) + Math.pow(block.position.y - y, 2)
        );
        return distance < BLOCK_SPACING;
      });
    };

    // Find next available position in a spiral pattern
    let radius = 0;
    const maxRadius = 10;
    
    while (radius <= maxRadius) {
      for (let angle = 0; angle < 360; angle += 45) {
        const radians = (angle * Math.PI) / 180;
        const offsetX = Math.cos(radians) * radius * GRID_SIZE;
        const offsetY = Math.sin(radians) * radius * GRID_SIZE;
        
        const candidateX = Math.max(0, testX + offsetX);
        const candidateY = Math.max(0, testY + offsetY);
        
        if (!isPositionOccupied(candidateX, candidateY)) {
          return snapToGrid(candidateX, candidateY);
        }
      }
      radius++;
    }
    
    // Fallback to original position if no space found
    return snapped;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const rawPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Find next available grid position
    const position = findNextAvailablePosition(rawPosition.x, rawPosition.y);
    onDrop(e, position);
  };

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: string) => {
    if (e.button !== 0) return; // Only left click
    
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setDraggedBlock(blockId);
    setIsDraggingBlock(true);
    setDragOffset({
      x: e.clientX - (canvasRect.left + block.position.x),
      y: e.clientY - (canvasRect.top + block.position.y)
    });

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBlock || !draggedBlock || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - canvasRect.left - dragOffset.x,
      y: e.clientY - canvasRect.top - dragOffset.y
    };

    const snappedPosition = snapToGrid(Math.max(0, newPosition.x), Math.max(0, newPosition.y));
    
    // Update block position
    const updatedBlocks = blocks.map(block =>
      block.id === draggedBlock
        ? { ...block, position: snappedPosition }
        : block
    );
    
    onBlockUpdate(updatedBlocks);
  };

  const handleMouseUp = () => {
    setIsDraggingBlock(false);
    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleBlockClick = (block: CanvasBlock) => {
    if (isDraggingBlock) return;
    setSelectedBlock(block);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedBlock(null);
  };

  const handleParameterSave = (blockId: string, parameters: any) => {
    onBlockEdit(blockId);
    handleDrawerClose();
  };

  const handleConnectionClick = (connectionId: string) => {
    console.log('🔍 Connection clicked:', connectionId);
    console.log('📋 Available connections:', connections);
    console.log('⚙️ Available automation rules:', automationRules);
    
    const connection = connections.find(c => c.id === connectionId);
    console.log('✅ Found connection:', connection);
    
    if (connection) {
      // Method 1: Check if connection has embedded automation rule
      if (connection.automationRule?.id) {
        console.log('🎯 Using embedded rule:', connection.automationRule.id);
        setEditingRule(connection.automationRule.id);
        return;
      }
      
      // Method 2: Find automation rule by matching connection pattern
      const matchingRule = automationRules.find(rule => {
        // Pattern matching for different rule types
        const connectionPatterns = {
          'auto-replenishment': (c: any) => 
            (c.fromBlock.includes('reserve') && c.toBlock.includes('operating')) ||
            (c.fromBlock.includes('asset') && c.toBlock.includes('asset')),
          'monthly-payment': (c: any) => 
            (c.fromBlock.includes('operating') && c.toBlock.includes('credit')) ||
            (c.fromBlock.includes('asset') && c.toBlock.includes('credit')),
          'collateral-monitoring': (c: any) => 
            (c.fromBlock.includes('credit') && c.toBlock.includes('collateral'))
        };
        
        const pattern = connectionPatterns[rule.id as keyof typeof connectionPatterns];
        return pattern ? pattern(connection) : false;
      });
      
      if (matchingRule) {
        console.log('🎯 Found matching rule:', matchingRule.id);
        setEditingRule(matchingRule.id);
        return;
      }
      
      // Method 3: Create fallback rule based on connection type
      console.log('🔧 Creating fallback rule');
      if ((connection.fromBlock.includes('reserve') && connection.toBlock.includes('operating')) ||
          (connection.fromBlock.includes('asset') && connection.toBlock.includes('asset'))) {
        setEditingRule('auto-replenishment');
      } else if ((connection.fromBlock.includes('operating') && connection.toBlock.includes('credit')) ||
                 (connection.fromBlock.includes('asset') && connection.toBlock.includes('credit'))) {
        setEditingRule('monthly-payment');
      } else {
        setEditingRule('auto-replenishment'); // Default fallback
      }
    } else {
      console.log('❌ Connection not found! Opening default rule.');
      setEditingRule('auto-replenishment');
    }
  };

  const handleRuleSave = (ruleId: string, ruleData: any) => {
    console.log('💾 Saving rule:', ruleId, ruleData);
    
    if (onAutomationRuleUpdate) {
      const updatedRules = automationRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...ruleData } : rule
      );
      onAutomationRuleUpdate(updatedRules);
    }
    
    setEditingRule(null);
  };

  // Title editing functions
  const startEditingTitle = () => {
    setTempTitle(canvasTitle);
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    if (tempTitle.trim()) {
      setCanvasTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
    setTempTitle('');
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setTempTitle('');
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-cream">
      {/* Canvas Header with proper typography hierarchy */}
      <div className="p-4 sm:p-6 border-b border-light-medium-grey bg-cream">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 mb-2">
            {isEditingTitle ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleTitleKeyPress}
                  onBlur={saveTitle}
                  autoFocus
                  className="font-playfair text-h4 sm:text-h3 text-charcoal-grey bg-transparent border-b-2 border-deep-navy focus:outline-none focus:border-gold transition-colors flex-1 min-w-0"
                  placeholder="Enter canvas name..."
                />
                <button
                  onClick={saveTitle}
                  className="text-deep-olive hover:text-charcoal-grey transition-colors p-1 rounded"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={cancelEditingTitle}
                  className="text-medium-grey hover:text-charcoal-grey transition-colors p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={startEditingTitle}>
                <h2 className="font-playfair text-h4 sm:text-h3 text-charcoal-grey group-hover:text-deep-navy transition-colors">
                  {canvasTitle}
                </h2>
                <Edit3 className="w-5 h-5 text-medium-grey group-hover:text-deep-navy transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            )}
          </div>
          
          {/* Grid indicator */}
          <div className="flex items-center space-x-2 text-medium-grey">
            <Grid3X3 className="w-4 h-4" />
            <span className="font-montserrat text-caption">Grid: {GRID_SIZE}px</span>
          </div>
        </div>
        <p className="font-montserrat text-caption sm:text-subtitle text-medium-grey max-w-2xl">
          Drag components from the left panel to build your liquidity solution. 
          Click blocks to edit parameters or click automation arrows to configure rules.
        </p>
      </div>

      {/* Canvas Content with grid snapping */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-auto bg-cream cursor-${isDraggingBlock ? 'grabbing' : 'default'} ${
          dragOver ? 'bg-light-blue bg-opacity-20' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Enhanced Background Grid */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #CCCCCC 1px, transparent 1px),
              linear-gradient(to bottom, #CCCCCC 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
          }}
        />

        {/* Major grid lines every 5 units */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #999999 1px, transparent 1px),
              linear-gradient(to bottom, #999999 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`
          }}
        />

        {/* Interactive SVG Automation Flow Overlay */}
        <AutomationFlow 
          connections={connections} 
          blocks={blocks} 
          containerRef={canvasRef}
          onConnectionClick={handleConnectionClick}
        />

        {/* Canvas Layout */}
        <div className="relative p-4 sm:p-6 lg:p-8 min-h-[800px]">
          {/* Dynamic Block Rendering with drag handles */}
          {blocks.map((block) => (
            <div 
              key={block.id} 
              className={`absolute group ${isDraggingBlock && draggedBlock === block.id ? 'z-50' : 'z-10'}`}
              style={{
                left: block.position.x,
                top: block.position.y,
                width: 'auto'
              }}
              data-block-id={block.id}
            >
              {/* Drag Handle */}
              <div 
                className="absolute -top-2 -left-2 w-6 h-6 bg-deep-navy text-cream rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
                onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
                title="Drag to reposition"
              >
                <Move className="w-3 h-3" />
              </div>
              
              <BlockCard
                block={block}
                onClick={() => handleBlockClick(block)}
                className={`shadow-card hover:shadow-elevated transition-all duration-200 ${
                  isDraggingBlock && draggedBlock === block.id 
                    ? 'shadow-deep scale-105 rotate-1' 
                    : ''
                }`}
              />
            </div>
          ))}
        </div>

        {/* Drop Zone Overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-light-blue bg-opacity-10 border-2 border-dashed border-light-blue flex items-center justify-center z-20">
            <div className="bg-white px-8 py-6 rounded-lg shadow-elevated">
              <p className="font-montserrat text-headline font-bold text-charcoal-grey text-center">
                Drop component here to add to canvas
              </p>
              <p className="font-montserrat text-caption text-medium-grey text-center mt-2">
                Will snap to grid with proper spacing
              </p>
            </div>
          </div>
        )}

        {/* Dragging indicator */}
        {isDraggingBlock && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-deep-navy text-cream px-4 py-2 rounded-lg shadow-elevated z-50">
            <p className="font-montserrat text-caption font-bold">
              Repositioning block - release to snap to grid
            </p>
          </div>
        )}
      </div>

      {/* Parameter Drawer */}
      <ParameterDrawer
        block={selectedBlock}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        onSave={handleParameterSave}
      />

      {/* Automation Rule Editor */}
      <AutomationRuleEditor
        ruleId={editingRule}
        isOpen={!!editingRule}
        onClose={() => setEditingRule(null)}
        onSave={handleRuleSave}
      />
    </div>
  );
};