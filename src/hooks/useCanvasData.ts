import { useState } from 'react';
import { CanvasBlock, CanvasMetric, AutomationRule, BlockConnection } from '../types/canvas';

export const useCanvasData = () => {
  const [metrics] = useState<CanvasMetric[]>([
    {
      id: 'total-liquidity',
      name: 'Total Liquidity',
      value: '$3.5M',
      format: 'currency',
      trend: 'up',
      icon: 'DollarSign'
    },
    {
      id: 'monthly-cashflow',
      name: 'Net Cash Flow',
      value: '+$45K/mo',
      format: 'text',
      trend: 'up',
      icon: 'TrendingUp'
    },
    {
      id: 'ltv',
      name: 'LTV',
      value: '35%',
      format: 'percentage',
      trend: 'stable',
      icon: 'BarChart'
    },
    {
      id: 'alerts',
      name: 'Alerts',
      value: '0 Alerts • All Systems ✓',
      format: 'text',
      trend: 'stable',
      icon: 'Shield'
    }
  ]);

  const [blocks] = useState<CanvasBlock[]>([
    {
      id: 'reserve-asset',
      type: 'asset',
      subtype: 'reserve',
      name: 'Asset Block (Reserve)',
      position: { x: 50, y: 150 },
      balance: 1200000,
      yieldRate: 3.2,
      parameters: {
        yieldStrategy: 'Yield Optimized',
        balanceTarget: 1200000
      },
      connections: [
        { id: 'reserve-out', type: 'out', label: 'OUT' }
      ],
      status: 'active',
      moneyMovement: {
        checkDeposits: false,
        cashDeposits: false,
        zelleTransfers: false,
        achOutbound: false,
        wireTransfers: false
      }
    },
    {
      id: 'operating-asset',
      type: 'asset',
      subtype: 'operating',
      name: 'Asset Block (Operating)',
      position: { x: 350, y: 150 },
      balance: 75000,
      threshold: 50000,
      expectedBalance: 250000,
      parameters: {
        yieldStrategy: 'Base Rate',
        threshold: 50000,
        expectedBalance: 250000
      },
      connections: [
        { id: 'operating-in', type: 'in', label: 'IN' },
        { id: 'operating-out', type: 'out', label: 'OUT' }
      ],
      status: 'active',
      moneyMovement: {
        checkDeposits: true,
        cashDeposits: true,
        zelleTransfers: true,
        achOutbound: false,
        wireTransfers: false
      }
    },
    {
      id: 'credit-line',
      type: 'credit',
      subtype: 'line',
      name: 'Line of Credit',
      position: { x: 50, y: 400 },
      available: 2000000,
      used: 350000,
      rate: 'SOFR+2.25%',
      paymentFrequency: 'monthly',
      parameters: {
        rateType: 'Variable',
        paymentType: 'Interest Only',
        currency: 'USD'
      },
      connections: [
        { id: 'credit-fund', type: 'out', label: 'FUND' },
        { id: 'credit-repay', type: 'in', label: 'REPAY' }
      ],
      status: 'active',
      collateral: {
        assetType: 'Portfolio',
        value: 5000000,
        advanceRate: 80,
        ltv: 35,
        monitoring: true
      },
      moneyMovement: {
        achPayments: true,
        wireTransfers: true,
        creditCard: true,
        checkPayments: false
      }
    }
  ]);

  const [automationRules] = useState<AutomationRule[]>([
    {
      id: 'auto-replenishment',
      name: 'Auto-Replenishment Rule',
      type: 'replenishment',
      trigger: 'Operating < $50K',
      action: 'Transfer from Reserve',
      active: true,
      lastRun: '3 days ago',
      nextCheck: 'Real-time'
    },
    {
      id: 'monthly-payment',
      name: 'Monthly Payment Rule',
      type: 'payment',
      trigger: 'Monthly (1st business day)',
      action: 'Pay from Operating to Credit',
      active: true,
      lastRun: '1 week ago',
      nextCheck: 'Next month'
    }
  ]);

  const [connections] = useState<BlockConnection[]>([
    {
      id: 'replenishment-flow',
      fromBlock: 'reserve-asset',
      toBlock: 'operating-asset',
      fromPort: 'reserve-out',
      toPort: 'operating-in',
      automationRule: automationRules[0]
    },
    {
      id: 'payment-flow',
      fromBlock: 'operating-asset',
      toBlock: 'credit-line',
      fromPort: 'operating-out',
      toPort: 'credit-repay',
      automationRule: automationRules[1]
    }
  ]);

  return {
    metrics,
    blocks,
    automationRules,
    connections
  };
};