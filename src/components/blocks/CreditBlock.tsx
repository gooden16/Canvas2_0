// src/components/blocks/CreditBlock.tsx

import React from 'react';
import { CreditBlock as CreditBlockType } from '../../types/canvas';
import { 
  CreditCard, 
  FileText, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  Circle,
  Percent,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface CreditBlockProps {
  block: CreditBlockType;
  onEdit: () => void;
  onConnectionStart: (port: string) => void;
  onConnectionEnd: (port: string) => void;
  isConnecting?: boolean;
}

export const CreditBlock: React.FC<CreditBlockProps> = ({
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
    return block.subtype === 'line' ? CreditCard : FileText;
  };

  const getBlockColor = () => {
    return block.subtype === 'line' 
      ? 'bg-dusty-pink bg-opacity-20 border-dusty-pink' 
      : 'bg-dusty-pink bg-opacity-15 border-dusty-pink border-opacity-70';
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

  const getUtilizationLevel = () => {
    const total = block.available + block.used;
    if (total === 0) return 0;
    return (block.used / total) * 100;
  };

  const getUtilizationColor = () => {
    const utilization = getUtilizationLevel();
    if (utilization > 80) return 'text-red-600 bg-red-100';
    if (utilization > 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getLTVStatus = () => {
    if (!block.collateral) return null;
    
    const ltv = block.collateral.ltv;
    if (ltv > 0.8) return 'high';
    if (ltv > 0.6) return 'medium';
    return 'low';
  };

  const IconComponent = getBlockIcon();
  const utilizationLevel = getUtilizationLevel();
  const ltvStatus = getLTVStatus();

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
          title="Payment input port"
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
          title="Funding output port"
        >
          <ArrowRight className="w-2 h-2 text-gray-500" />
        </button>
      </div>

      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b border-light-grey">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-dusty-pink bg-opacity-30 rounded">
            <IconComponent className="w-4 h-4 text-charcoal-grey" />
          </div>
          <div>
            <h3 className="font-montserrat text-sm font-bold text-charcoal-grey leading-tight">
              {block.name}
            </h3>
            <p className="font-montserrat text-xs text-medium-grey capitalize">
              {block.subtype === 'line' ? 'Line of Credit' : 'Term Loan'}
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
        {/* Available Credit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <CreditCard className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Available</span>
          </div>
          <span className="font-montserrat text-sm font-bold text-charcoal-grey">
            {formatCurrency(block.available)}
          </span>
        </div>

        {/* Utilization */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Percent className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Used</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-montserrat text-xs text-charcoal-grey">
              {formatCurrency(block.used)}
            </span>
            <span className={`
              px-1.5 py-0.5 text-xs rounded font-medium
              ${getUtilizationColor()}
            `}>
              {utilizationLevel.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Percent className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Rate</span>
          </div>
          <span className="font-montserrat text-xs text-charcoal-grey font-medium">
            {block.rate}
          </span>
        </div>

        {/* Payment Frequency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-medium-grey" />
            <span className="font-montserrat text-xs text-medium-grey">Payments</span>
          </div>
          <span className="font-montserrat text-xs text-charcoal-grey capitalize">
            {block.paymentFrequency}
          </span>
        </div>

        {/* Collateral Status */}
        {block.collateral && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-medium-grey" />
              <span className="font-montserrat text-xs text-medium-grey">LTV</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-montserrat text-xs text-charcoal-grey">
                {(block.collateral.ltv * 100).toFixed(0)}%
              </span>
              {ltvStatus === 'high' && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
        )}

        {/* Money Movement Capabilities */}
        <div className="flex items-center space-x-1 pt-1">
          <span className="font-montserrat text-xs text-medium-grey">Enabled:</span>
          <div className="flex space-x-1">
            {block.moneyMovement.achPayments && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                ACH
              </span>
            )}
            {block.moneyMovement.wireTransfers && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                WIRE
              </span>
            )}
            {block.moneyMovement.creditCard && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                CARD
              </span>
            )}
            {block.moneyMovement.checkPayments && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                CHECK
              </span>
            )}
          </div>
        </div>

        {/* High utilization warning */}
        {utilizationLevel > 80 && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-montserrat text-xs text-red-600">
              High utilization
            </span>
          </div>
        )}

        {/* High LTV warning */}
        {ltvStatus === 'high' && (
          <div className="flex items-center space-x-1 pt-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-montserrat text-xs text-orange-600">
              High LTV ratio
            </span>
          </div>
        )}
      </div>

      {/* Collateral indicator */}
      {block.collateral && (
        <div className="absolute top-1 right-1">
          <div className="w-3 h-3 bg-shield-blue rounded-full border border-white flex items-center justify-center">
            <Shield className="w-2 h-2 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};