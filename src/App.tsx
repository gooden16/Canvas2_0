// src/App.tsx

import React, { useState } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { BuildingPalette } from './components/BuildingPalette';
import { SpatialCanvasWorkspace } from './components/canvas/SpatialCanvasWorkspace';
import { EditBlockModal } from './components/modals/EditBlockModal';
import { UserPanel } from './components/UserPanel';
import { useCanvasData } from './hooks/useCanvasData';
import { CanvasBlock, CanvasMetric, AutomationRule, BlockConnection, AssetBlock, CreditBlock, UserBlock } from './types/canvas';
import { Position } from './lib/spatialLayoutEngine';

function App() {
  const { metrics: initialMetrics, blocks: initialBlocks, automationRules: initialRules, connections: initialConnections } = useCanvasData();
  
  // State management
  const [metrics, setMetrics] = useState(initialMetrics);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [automationRules, setAutomationRules] = useState(initialRules);
  const [connections, setConnections] = useState(initialConnections);
  const [users, setUsers] = useState([
    { id: 'user-1', name: 'John Advisor', role: 'primary', avatar: '👨‍💼', status: 'online' },
    { id: 'user-2', name: 'Sarah Manager', role: 'secondary', avatar: '👩‍💼', status: 'away' }
  ]);
  
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [draggedBlockType, setDraggedBlockType] = useState<string>('');

  const handleBlockEdit = (blockId: string) => {
    setEditingBlock(blockId);
  };

  const handleSaveBlock = (blockId: string, parameters: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, parameters: { ...block.parameters, ...parameters } }
        : block
    ));
    setEditingBlock(null);
  };

  const handleDrop = (e: React.DragEvent, position: Position) => {
    const blockType = e.dataTransfer.getData('text/plain');
    const blockId = `${blockType}-${Date.now()}`;

    let newBlock: CanvasBlock;

    switch (blockType) {
      case 'asset-block':
        newBlock = {
          id: blockId,
          type: 'asset',
          subtype: 'operating',
          name: `Asset Block ${blocks.filter(b => b.type === 'asset').length + 1}`,
          position: { x: Math.max(0, position.x), y: Math.max(0, position.y) },
          balance: 75000,
          yieldRate: 0.0425,
          threshold: 50000,
          expectedBalance: 100000,
          parameters: {
            accountType: 'Operating',
            currency: 'USD',
            institution: 'Primary Bank'
          },
          connections: [
            { id: `${blockId}-in`, type: 'in', label: 'FUND' },
            { id: `${blockId}-out`, type: 'out', label: 'TRANSFER' }
          ],
          status: 'active',
          moneyMovement: {
            checkDeposits: true,
            cashDeposits: true,
            zelleTransfers: true,
            achOutbound: false,
            wireTransfers: false
          }
        } as AssetBlock;
        break;
        
      case 'credit-block':
        newBlock = {
          id: blockId,
          type: 'credit',
          subtype: 'line',
          name: `Credit Block ${blocks.filter(b => b.type === 'credit').length + 1}`,
          position: { x: Math.max(0, position.x), y: Math.max(0, position.y) },
          available: 500000,
          used: 125000,
          rate: 'SOFR+3.00%',
          paymentFrequency: 'monthly',
          parameters: {
            rateType: 'Variable',
            paymentType: 'Interest Only',
            currency: 'USD'
          },
          connections: [
            { id: `${blockId}-fund`, type: 'out', label: 'FUND' },
            { id: `${blockId}-repay`, type: 'in', label: 'REPAY' }
          ],
          status: 'active',
          moneyMovement: {
            achPayments: true,
            wireTransfers: true,
            creditCard: false,
            checkPayments: false
          },
          collateral: {
            assetType: 'Investment Portfolio',
            value: 1200000,
            advanceRate: 0.65,
            ltv: 0.52,
            monitoring: true
          }
        } as CreditBlock;
        break;
        
      case 'user-block':
        newBlock = {
          id: blockId,
          type: 'user',
          role: 'secondary',
          name: `User ${blocks.filter(b => b.type === 'user').length + 1}`,
          position: { x: Math.max(0, position.x), y: Math.max(0, position.y) },
          permissions: ['view', 'transact'],
          accessLevel: 'Standard',
          parameters: {
            department: 'Finance',
            approvalLimit: 10000
          },
          connections: [
            { id: `${blockId}-access`, type: 'in', label: 'ACCESS' },
            { id: `${blockId}-delegate`, type: 'out', label: 'DELEGATE' }
          ],
          status: 'active'
        } as UserBlock;
        break;
        
      case 'automation-rule':
        // Add new automation rule instead of a block
        const newRule: AutomationRule = {
          id: `rule-${Date.now()}`,
          name: `Auto Rule ${automationRules.length + 1}`,
          type: 'threshold',
          trigger: 'Balance below threshold',
          action: 'Transfer from Reserve',
          active: true,
          lastRun: new Date().toISOString(),
          nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        setAutomationRules(prev => [...prev, newRule]);
        setDraggedBlockType('');
        return;
        
      case 'canvas-metric':
        // Add new metric to metrics bar
        const newMetric: CanvasMetric = {
          id: `metric-${Date.now()}`,
          name: `Custom Metric ${metrics.length + 1}`,
          value: 0,
          format: 'currency',
          trend: 'stable',
          icon: '📊'
        };
        setMetrics(prev => [...prev, newMetric]);
        setDraggedBlockType('');
        return;
        
      default:
        console.warn('Unknown block type:', blockType);
        setDraggedBlockType('');
        return;
    }

    setBlocks(prev => [...prev, newBlock]);
    setDraggedBlockType('');
  };

  const handleAutomationRuleUpdate = (rules: AutomationRule[]) => {
    setAutomationRules(rules);
  };

  const handleConnectionUpdate = (newConnections: BlockConnection[]) => {
    setConnections(newConnections);
  };

  const handleBlockUpdate = (newBlocks: CanvasBlock[]) => {
    setBlocks(newBlocks);
  };

  const editingBlockData = editingBlock ? blocks.find(b => b.id === editingBlock) : null;

  return (
    <div className="min-h-screen bg-light-grey">
      {/* Header */}
      <Header />
      
      {/* Metrics Bar */}
      <MetricsBar metrics={metrics} />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar - Building Palette */}
        <BuildingPalette 
          onDragStart={setDraggedBlockType}
        />
        
        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <SpatialCanvasWorkspace
            blocks={blocks}
            connections={connections}
            automationRules={automationRules}
            onBlockEdit={handleBlockEdit}
            onDrop={handleDrop}
            onAutomationRuleUpdate={handleAutomationRuleUpdate}
            onConnectionUpdate={handleConnectionUpdate}
            onBlockUpdate={handleBlockUpdate}
            draggedBlockType={draggedBlockType}
          />
        </div>
        
        {/* Right Sidebar - User Panel */}
        <UserPanel 
          users={users}
          onUserUpdate={(updatedUsers) => setUsers(updatedUsers)}
        />
      </div>
      
      {/* Edit Block Modal */}
      {editingBlock && editingBlockData && (
        <EditBlockModal
          block={editingBlockData}
          isOpen={!!editingBlock}
          onClose={() => setEditingBlock(null)}
          onSave={handleSaveBlock}
        />
      )}
    </div>
  );
}

export default App;