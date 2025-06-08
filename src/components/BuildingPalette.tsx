import React from 'react';
import { Building2, CreditCard, Users, Zap, BarChart3, CircleDot as DragHandleDots2 } from 'lucide-react';

interface BuildingPaletteProps {
  onDragStart: (blockType: string) => void;
}

export const BuildingPalette: React.FC<BuildingPaletteProps> = ({ onDragStart }) => {
  const buildingBlocks = [
    {
      id: 'asset-block',
      name: 'Asset Block',
      icon: Building2,
      description: 'Operating or Reserve Account',
      color: 'bg-light-blue',
      emoji: '🏦'
    },
    {
      id: 'credit-block',
      name: 'Credit Block',
      icon: CreditCard,
      description: 'Term Loan or Line of Credit',
      color: 'bg-dusty-pink',
      emoji: '💳'
    },
    {
      id: 'user-block',
      name: 'User Block',
      icon: Users,
      description: 'Add to user panel →',
      color: 'bg-gold',
      emoji: '👥'
    }
  ];

  const automationTools = [
    {
      id: 'automation-rule',
      name: 'Automation Rule',
      icon: Zap,
      description: 'Custom business logic',
      color: 'bg-bronzed-orange',
      emoji: '⚡'
    }
  ];

  const canvasTools = [
    {
      id: 'canvas-metric',
      name: 'Canvas Metric',
      icon: BarChart3,
      description: 'Add to metrics bar ↑',
      color: 'bg-deep-olive',
      emoji: '📊'
    }
  ];

  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', blockType);
    onDragStart(blockType);
  };

  const renderSection = (title: string, items: any[]) => (
    <div className="mb-6">
      <h3 className="font-playfair text-caption font-bold text-deep-olive mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="bg-white border border-light-grey rounded-lg p-3 cursor-grab hover:shadow-card transition-all duration-200 group hover:border-light-medium-grey hover:bg-light-grey hover:bg-opacity-30 active:cursor-grabbing"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <DragHandleDots2 className="w-3 h-3 text-medium-grey group-hover:text-charcoal-grey transition-colors" />
                  <div className={`${item.color} bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-colors`}>
                    <IconComponent className="w-4 h-4 text-charcoal-grey" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{item.emoji}</span>
                    <div className="font-montserrat text-subtitle font-bold text-charcoal-grey">
                      {item.name}
                    </div>
                  </div>
                  <div className="font-montserrat text-caption text-medium-grey">
                    {item.description}
                  </div>
                </div>
              </div>
              
              {/* Drag hint */}
              <div className="mt-2 pt-2 border-t border-light-grey opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-montserrat text-xs text-medium-grey text-center">
                  Drag to canvas to add
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-light-grey border-r border-light-medium-grey p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="font-playfair text-h4 text-charcoal-grey mb-2">🏗️ Build Mode</h2>
        <p className="font-montserrat text-caption text-medium-grey">
          Drag components to build your liquidity solution
        </p>
      </div>

      {renderSection('Building Blocks', buildingBlocks)}
      {renderSection('Automation', automationTools)}
      {renderSection('Canvas Level', canvasTools)}
      
      {/* Instructions */}
      <div className="mt-8 p-3 bg-cream rounded-lg border border-light-medium-grey">
        <h4 className="font-montserrat text-caption font-bold text-charcoal-grey mb-2">
          💡 Quick Tips
        </h4>
        <ul className="space-y-1 font-montserrat text-xs text-medium-grey">
          <li>• Asset/Credit blocks go on canvas</li>
          <li>• Users appear in top-right panel</li>
          <li>• Metrics add to header bar</li>
          <li>• Rules create automation flows</li>
        </ul>
      </div>
    </div>
  );
};