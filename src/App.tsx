import React, { useState } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { BuildingPalette } from './components/BuildingPalette';
import { CanvasWorkspace } from './components/canvas/CanvasWorkspace';
import { EditBlockModal } from './components/modals/EditBlockModal';
import { UserPanel } from './components/UserPanel';
import { useCanvasData } from './hooks/useCanvasData';
import { CanvasBlock, CanvasMetric, AutomationRule, BlockConnection } from './types/canvas';

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
      block.id === blockId ? { ...block, parameters: { ...block.parameters, ...parameters } } : block
    ));
    console.log('Saving block parameters:', blockId, parameters);
  };

  const handleDragStart = (blockType: string) => {
    setDraggedBlockType(blockType);
  };

  const generateBlockId = (type: string) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${type}-${timestamp}-${random}`;
  };

  const handleDrop = (e: React.DragEvent, position: { x: number; y: number }) => {
    if (!draggedBlockType) return;

    const blockId = generateBlockId(draggedBlockType);
    
    // Create new block based on type
    let newBlock: CanvasBlock;
    
    switch (draggedBlockType) {
      case 'asset-block':
        newBlock = {
          id: blockId,
          type: 'asset',
          subtype: 'operating',
          name: `Asset Block ${blocks.filter(b => b.type === 'asset').length + 1}`,
          position: { x: Math.max(0, position.x - 160), y: Math.max(0, position.y - 80) },
          balance: 100000,
          yieldRate: 2.5,
          parameters: {
            yieldStrategy: 'Base Rate',
            threshold: 25000,
            expectedBalance: 150000
          },
          connections: [
            { id: `${blockId}-in`, type: 'in', label: 'IN' },
            { id: `${blockId}-out`, type: 'out', label: 'OUT' }
          ],
          status: 'active',
          moneyMovement: {
            checkDeposits: true,
            cashDeposits: true,
            zelleTransfers: false,
            achOutbound: false,
            wireTransfers: false
          }
        };
        break;
        
      case 'credit-block':
        newBlock = {
          id: blockId,
          type: 'credit',
          subtype: 'line',
          name: `Credit Block ${blocks.filter(b => b.type === 'credit').length + 1}`,
          position: { x: Math.max(0, position.x - 160), y: Math.max(0, position.y - 80) },
          available: 500000,
          used: 0,
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
          }
        };
        break;
        
      case 'user-block':
        // Add user to user panel instead of canvas
        const newUser = {
          id: `user-${Date.now()}`,
          name: `New User ${users.length + 1}`,
          role: 'readonly' as const,
          avatar: '👤',
          status: 'offline' as const
        };
        setUsers(prev => [...prev, newUser]);
        setDraggedBlockType('');
        return;
        
      case 'automation-rule':
        // Add new automation rule
        const newRule: AutomationRule = {
          id: `rule-${Date.now()}`,
          name: `Custom Rule ${automationRules.length + 1}`,
          type: 'custom',
          trigger: 'Manual trigger',
          action: 'Custom action',
          active: false
        };
        setAutomationRules(prev => [...prev, newRule]);
        setDraggedBlockType('');
        return;
        
      case 'canvas-metric':
        // Add new metric to metrics bar
        const newMetric: CanvasMetric = {
          id: `metric-${Date.now()}`,
          name: 'New Metric',
          value: '$0',
          format: 'currency',
          trend: 'stable',
          icon: 'DollarSign'
        };
        setMetrics(prev => [...prev, newMetric]);
        setDraggedBlockType('');
        return;
        
      default:
        setDraggedBlockType('');
        return;
    }

    // Add the new block to canvas
    setBlocks(prev => [...prev, newBlock]);
    setDraggedBlockType('');
    
    console.log('Added new block:', newBlock);
  };

  const handleMetricsUpdate = (updatedMetrics: CanvasMetric[]) => {
    setMetrics(updatedMetrics);
  };

  const handleUserUpdate = (updatedUsers: any[]) => {
    setUsers(updatedUsers);
  };

  const handleAutomationRuleUpdate = (updatedRules: AutomationRule[]) => {
    setAutomationRules(updatedRules);
  };

  const handleConnectionUpdate = (updatedConnections: BlockConnection[]) => {
    setConnections(updatedConnections);
  };

  const handleBlockUpdate = (updatedBlocks: CanvasBlock[]) => {
    setBlocks(updatedBlocks);
  };

  const editingBlockData = editingBlock ? blocks.find(b => b.id === editingBlock) : null;

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <MetricsBar metrics={metrics} onMetricsUpdate={handleMetricsUpdate} />
      
      <div className="flex h-[calc(100vh-120px)] relative">
        <BuildingPalette onDragStart={handleDragStart} />
        
        <div className="flex-1 relative">
          <CanvasWorkspace 
            blocks={blocks}
            connections={connections}
            automationRules={automationRules}
            onBlockEdit={handleBlockEdit}
            onDrop={handleDrop}
            onAutomationRuleUpdate={handleAutomationRuleUpdate}
            onConnectionUpdate={handleConnectionUpdate}
            onBlockUpdate={handleBlockUpdate}
          />
          
          {/* User Panel in top right */}
          <UserPanel 
            users={users} 
            onUserUpdate={handleUserUpdate}
          />
        </div>
      </div>

      <EditBlockModal
        block={editingBlockData}
        isOpen={!!editingBlock}
        onClose={() => setEditingBlock(null)}
        onSave={handleSaveBlock}
      />
    </div>
  );
}

export default App;