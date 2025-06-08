// src/components/blocks/AssetBlock.tsx

import React from 'react';
import { AssetBlock as AssetBlockType } from '../../types/canvas';
import { 
  Building2, 
  Landmark, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  Circle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface AssetBlockProps {
  block: AssetBlockType;
  onEdit: () => void;
  onConnectionStart: (port: string) => void;
  onConnectionEnd: (port: string) => void;
  isConnecting?: boolean;
}

export const AssetBlock: React.FC<AssetBlockProps> = ({
  block,
  onEdit,
  onConnectionStart,
  onConnectionEnd,
  isConnecting = false
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBlockIcon = () => {
    return block.subtype === 'operating' ? Building2 : Landmark;
  };

  const getBlockColor = () => {
    return block.subtype === 'operating' 
      ? 'bg-light-blue bg-opacity-20 border-light-blue' 
      : 'bg-light-blue bg-opacity-10 border-light-blue border-opacity-60';
  };

  const getStatusColor = () => {
    switch (block.status) {
      case 'active':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'disabled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBalanceStatus = () => {
    if (block.threshold && block.balance < block.threshold) {
      return 'low';
    }
    if (block.expectedBalance && Math.abs(block.balance - block.expectedBalance) > block.expectedBalance * 0.1) {
      return 'unexpected';
    }
    return 'normal';
  };

  const balanceStatus = getBalanceStatus();

  const IconComponent = getBlockIcon();

  return (
    <div className={`
      relative w-full h-full 
      bg-white border-2 rounded-lg shadow-sm
      hover:shadow-md transition-all duration-200
      ${getBlockColor()}
      ${isConnecting ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
    `}>
      {/* Connection Ports */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
        <button
          className={`
            w-4 h-4 rounded-full border-2 bg-white
            ${isConnecting ? 'border-blue-500 hover:bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            transition-colors duration-200
          `}
          onClick={() => onConnectionEnd('input')}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!isConnecting) onConnectionStart('input');
          }}
          title="Input connection port"
        >
          <ArrowLeft className="w-2 h-2 text-gray-500" />
        </button>
      </div>

      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
        <button
          className={`
            w-4 h-4 rounded-full border-2 bg-white
            ${isConnecting ? 'border-blue-500 hover:bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            transition-colors duration-200
          `}
          onClick={() => onConnectionEnd('output')}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!isConnecting) onConnectionStart('output');
          }}
          title="Output connection port"
        >
          <ArrowRight className="w-2 h-2 text-gray-500" />
        </button>
      </div>

      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b border-light-grey">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-light-blue bg-opacity-30 rounded">
            <IconComponent className="w-4 h-4 text-charcoal-grey" />
          </div>
          <div>
            <h3 className="font-montserrat text-sm font-bold text-charcoal-grey leading-tight">
              {block.name}
            </h3>
            <p className="font-montserrat text-xs text-medium-grey capitalize">
              {block.subtype} Asset
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Status indicator */}
          <Circle className={`w-2 h-2 fill-current ${getStatusColor()}`} />
          
          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-medium-grey hover:text-charcoal-grey transition-colors"
            title="Edit parameters"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-3 space-y-2">
        {/* Balance Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Balance</span>
          </div>
          <div className={`
            font-montserrat text-sm font-bold
            ${balanceStatus === 'low' ? 'text-red-600' : 
              balanceStatus === 'unexpected' ? 'text-yellow-600' : 'text-charcoal-grey'}
          `}>
            {formatCurrency(block.balance)}
          </div>
        </div>

        {/* Yield Rate (if applicable) */}
        {block.yieldRate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-medium-grey" />
              <span className="font-montserrat text-xs text-medium-grey">Yield</span>
            </div>
            <span className="font-montserrat text-xs text-charcoal-grey">
              {(block.yieldRate * 100).toFixed(2)}%
            </span>
          </div>
        )}

        {/* Money Movement Capabilities */}
        <div className="flex items-center space-x-1 pt-1">
          <span className="font-montserrat text-xs text-medium-grey">Enabled:</span>
          <div className="flex space-x-1">
            {block.moneyMovement.checkDeposits && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                CHECK
              </span>
            )}
            {block.moneyMovement.cashDeposits && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                CASH
              </span>
            )}
            {block.moneyMovement.zelleTransfers && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                ZELLE
              </span>
            )}
            {block.moneyMovement.achOutbound && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                ACH
              </span>
            )}
            {block.moneyMovement.wireTransfers && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                WIRE
              </span>
            )}
          </div>
        </div>

        {/* Threshold Warning */}
        {block.threshold && block.balance < block.threshold && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-montserrat text-xs text-red-600">
              Below threshold ({formatCurrency(block.threshold)})
            </span>
          </div>
        )}
      </div>

      {/* Active automation indicator */}
      {/* This could show if there are active automation rules affecting this block */}
      <div className="absolute top-1 right-1">
        {/* Could add automation status indicators here */}
      </div>
    </div>
  );
};