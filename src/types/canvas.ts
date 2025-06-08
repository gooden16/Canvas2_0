export interface BlockPosition {
  x: number;
  y: number;
}

export interface ConnectionPort {
  id: string;
  type: 'in' | 'out';
  label: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  type: 'replenishment' | 'payment' | 'threshold' | 'custom';
  trigger: string;
  action: string;
  active: boolean;
  lastRun?: string;
  nextCheck?: string;
}

export interface CanvasMetric {
  id: string;
  name: string;
  value: string | number;
  format: 'currency' | 'percentage' | 'number' | 'text';
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
}

export interface BlockConnection {
  id: string;
  fromBlock: string;
  toBlock: string;
  fromPort: string;
  toPort: string;
  automationRule?: AutomationRule;
}

export interface BaseBlock {
  id: string;
  type: string;
  name: string;
  position: BlockPosition;
  parameters: Record<string, any>;
  connections: ConnectionPort[];
  status: 'active' | 'pending' | 'error' | 'disabled';
}

export interface AssetBlock extends BaseBlock {
  type: 'asset';
  subtype: 'operating' | 'reserve';
  balance: number;
  yieldRate?: number;
  threshold?: number;
  expectedBalance?: number;
  moneyMovement: {
    checkDeposits: boolean;
    cashDeposits: boolean;
    zelleTransfers: boolean;
    achOutbound: boolean;
    wireTransfers: boolean;
  };
}

export interface CreditBlock extends BaseBlock {
  type: 'credit';
  subtype: 'line' | 'term';
  available: number;
  used: number;
  rate: string;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
  collateral?: CollateralInfo;
  moneyMovement: {
    achPayments: boolean;
    wireTransfers: boolean;
    creditCard: boolean;
    checkPayments: boolean;
  };
}

export interface CollateralInfo {
  assetType: string;
  value: number;
  advanceRate: number;
  ltv: number;
  monitoring: boolean;
}

export interface UserBlock extends BaseBlock {
  type: 'user';
  role: 'primary' | 'secondary' | 'readonly' | 'cardholder';
  permissions: string[];
  accessLevel: string;
}

export type CanvasBlock = AssetBlock | CreditBlock | UserBlock;