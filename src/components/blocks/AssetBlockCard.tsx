import React, { useState } from 'react';
import { AssetBlock } from '../../types/canvas';
import { Settings, CheckCircle, Circle, DollarSign, TrendingUp, Target } from 'lucide-react';

interface AssetBlockCardProps {
  block: AssetBlock;
  onEdit: (blockId: string) => void;
}

export const AssetBlockCard: React.FC<AssetBlockCardProps> = ({ block, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMovementOptions = () => {
    const { moneyMovement } = block;
    const enabled = [];
    if (moneyMovement.checkDeposits) enabled.push('Check Deposits');
    if (moneyMovement.cashDeposits) enabled.push('Cash Deposits');
    if (moneyMovement.zelleTransfers) enabled.push('Zelle Transfers');
    if (moneyMovement.achOutbound) enabled.push('ACH Outbound');
    if (moneyMovement.wireTransfers) enabled.push('Wire Transfers');
    
    return enabled.length > 0 ? enabled : ['Internal transfers only'];
  };

  return (
    <div 
      className="bg-cream border border-light-medium-grey rounded-xl shadow-card hover:shadow-elevated transition-shadow"
      style={{ 
        position: 'absolute', 
        left: block.position.x, 
        top: block.position.y,
        width: '320px'
      }}
    >
      {/* Header */}
      <div className="bg-light-blue bg-opacity-20 px-4 py-3 border-b border-light-medium-grey rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-light-blue bg-opacity-40 p-1.5 rounded-lg">
              <DollarSign className="w-4 h-4 text-deep-navy" />
            </div>
            <div>
              <h3 className="font-montserrat text-subtitle font-bold text-deep-navy">
                🏦 ASSET BLOCK
              </h3>
              <p className="font-montserrat text-caption text-charcoal-grey">
                {block.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-deep-olive" />
            <span className="text-deep-olive font-montserrat text-caption font-bold">✓</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Balance Information */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-montserrat text-subtitle text-medium-grey">Current:</span>
            <span className="font-montserrat text-subtitle font-bold text-charcoal-grey">
              {formatCurrency(block.balance)}
            </span>
          </div>
          
          {block.threshold && (
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Target:</span>
              <span className="font-montserrat text-subtitle font-bold text-charcoal-grey">
                {formatCurrency(block.threshold)}
              </span>
            </div>
          )}
          
          {block.expectedBalance && (
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Expected:</span>
              <span className="font-montserrat text-subtitle font-bold text-charcoal-grey">
                {formatCurrency(block.expectedBalance)}
              </span>
            </div>
          )}
          
          {block.yieldRate && (
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Yield:</span>
              <span className="font-montserrat text-subtitle font-bold text-deep-olive">
                {block.yieldRate}% APY
              </span>
            </div>
          )}
        </div>

        {/* Money Movement */}
        <div>
          <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
            Money Movement:
          </h4>
          <div className="space-y-1">
            {getMovementOptions().map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-deep-olive" />
                <span className="font-montserrat text-caption text-charcoal-grey">
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Ports */}
        <div className="flex justify-between items-center py-2 border-t border-light-medium-grey">
          {block.connections.map((connection) => (
            <div key={connection.id} className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-charcoal-grey fill-current" />
              <span className="font-montserrat text-caption font-bold text-charcoal-grey">
                {connection.label}
              </span>
            </div>
          ))}
        </div>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(block.id)}
          className="w-full bg-deep-navy text-cream py-2 px-4 rounded-lg font-montserrat text-subtitle font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Edit Parameters</span>
        </button>
      </div>
    </div>
  );
};