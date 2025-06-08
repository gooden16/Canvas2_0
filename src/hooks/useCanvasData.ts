// src/hooks/useCanvasData.ts

import { useState, useEffect } from 'react';
import { CanvasBlock, CanvasMetric, AutomationRule, BlockConnection, AssetBlock, CreditBlock } from '../types/canvas';

interface CanvasData {
  metrics: CanvasMetric[];
  blocks: CanvasBlock[];
  automationRules: AutomationRule[];
  connections: BlockConnection[];
}

export const useCanvasData = (): CanvasData => {
  // Default sample metrics
  const defaultMetrics: CanvasMetric[] = [
    {
      id: 'total-liquidity',
      name: 'Total Available Liquidity',
      value: 875000,
      format: 'currency',
      trend: 'up',
      icon: '💰'
    },
    {
      id: 'monthly-cashflow',
      name: 'Monthly Cash Flow',
      value: 45000,
      format: 'currency',
      trend: 'stable',
      icon: '📈'
    },
    {
      id: 'portfolio-ltv',
      name: 'Portfolio LTV',
      value: 0.52,
      format: 'percentage',
      trend: 'down',
      icon: '🏦'
    },
    {
      id: 'automation-rules',
      name: 'Active Rules',
      value: 3,
      format: 'number',
      trend: 'stable',
      icon: '⚡'
    }
  ];

  // Default sample blocks
  const defaultBlocks: CanvasBlock[] = [
    {
      id: 'asset-operating-1',
      type: 'asset',
      subtype: 'operating',
      name: 'Primary Operating Account',
      position: { x: 140, y: 140 },
      balance: 125000,
      yieldRate: 0.045,
      threshold: 50000,
      expectedBalance: 100000,
      parameters: {
        accountType: 'Operating',
        currency: 'USD',
        institution: 'JPMorgan Chase'
      },
      connections: [
        { id: 'asset-operating-1-in', type: 'in', label: 'FUND' },
        { id: 'asset-operating-1-out', type: 'out', label: 'TRANSFER' }
      ],
      status: 'active',
      moneyMovement: {
        checkDeposits: true,
        cashDeposits: true,
        zelleTransfers: true,
        achOutbound: false,
        wireTransfers: false
      }
    } as AssetBlock,
    {
      id: 'asset-reserve-1',
      type: 'asset',
      subtype: 'reserve',
      name: 'Reserve Account',
      position: { x: 380, y: 140 },
      balance: 250000,
      yieldRate: 0.042,
      threshold: 100000,
      expectedBalance: 200000,
      parameters: {
        accountType: 'Reserve',
        currency: 'USD',
        institution: 'JPMorgan Chase'
      },
      connections: [
        { id: 'asset-reserve-1-in', type: 'in', label: 'FUND' },
        { id: 'asset-reserve-1-out', type: 'out', label: 'TRANSFER' }
      ],
      status: 'active',
      moneyMovement: {
        checkDeposits: false,
        cashDeposits: false,
        zelleTransfers: false,
        achOutbound: true,
        wireTransfers: true
      }
    } as AssetBlock,
    {
      id: 'credit-line-1',
      type: 'credit',
      subtype: 'line',
      name: 'Business Line of Credit',
      position: { x: 140, y: 380 },
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
        { id: 'credit-line-1-fund', type: 'out', label: 'FUND' },
        { id: 'credit-line-1-repay', type: 'in', label: 'REPAY' }
      ],
      status: 'active',
      moneyMovement: {
        achPayments: true,
        wireTransfers: true,
        creditCard: true,
        checkPayments: false
      },
      collateral: {
        assetType: 'Investment Portfolio',
        value: 1200000,
        advanceRate: 0.65,
        ltv: 0.52,
        monitoring: true
      }
    } as CreditBlock
  ];

  // Default automation rules
  const defaultAutomationRules: AutomationRule[] = [
    {
      id: 'auto-replenish-1',
      name: 'Operating Account Replenishment',
      type: 'replenishment',
      trigger: 'Balance below $50,000',
      action: 'Transfer $50,000 from Reserve',
      active: true,
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'auto-payment-1',
      name: 'Credit Line Payment',
      type: 'payment',
      trigger: 'Monthly payment due',
      action: 'Pay interest from Operating Account',
      active: true,
      lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      nextCheck: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'auto-funding-1',
      name: 'Credit Card Funding',
      type: 'custom',
      trigger: 'Credit card payment needed',
      action: 'Fund from Line of Credit',
      active: true,
      lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Default connections
  const defaultConnections: BlockConnection[] = [
    {
      id: 'connection-1',
      fromBlock: 'asset-reserve-1',
      toBlock: 'asset-operating-1',
      fromPort: 'asset-reserve-1-out',
      toPort: 'asset-operating-1-in',
      automationRule: defaultAutomationRules[0]
    },
    {
      id: 'connection-2',
      fromBlock: 'asset-operating-1',
      toBlock: 'credit-line-1',
      fromPort: 'asset-operating-1-out',
      toPort: 'credit-line-1-repay',
      automationRule: defaultAutomationRules[1]
    }
  ];

  const [canvasData] = useState<CanvasData>({
    metrics: defaultMetrics,
    blocks: defaultBlocks,
    automationRules: defaultAutomationRules,
    connections: defaultConnections
  });

  // In a real application, this would:
  // 1. Load data from an API or local storage
  // 2. Handle loading states
  // 3. Manage data persistence
  // 4. Handle real-time updates
  
  useEffect(() => {
    // Simulate data loading
    console.log('Canvas data initialized:', canvasData);
  }, [canvasData]);

  return canvasData;
};