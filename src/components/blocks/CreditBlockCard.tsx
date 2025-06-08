import React from 'react';
import { CreditBlock } from '../../types/canvas';
import { Settings, CheckCircle, Circle, CreditCard, BarChart, Shield, Percent } from 'lucide-react';

interface CreditBlockCardProps {
  block: CreditBlock;
  onEdit: (blockId: string) => void;
}

export const CreditBlockCard: React.FC<CreditBlockCardProps> = ({ block, onEdit }) => {
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
    if (moneyMovement.achPayments) enabled.push('ACH Payments');
    if (moneyMovement.wireTransfers) enabled.push('Wire Transfers');
    if (moneyMovement.creditCard) enabled.push('Credit Card');
    if (moneyMovement.checkPayments) enabled.push('Check Payments');
    
    return enabled;
  };

  return (
    <div 
      className="bg-cream border border-light-medium-grey rounded-xl shadow-card hover:shadow-elevated transition-shadow"
      style={{ 
        position: 'absolute', 
        left: block.position.x, 
        top: block.position.y,
        width: '480px'
      }}
    >
      {/* Header */}
      <div className="bg-dusty-pink bg-opacity-20 px-4 py-3 border-b border-light-medium-grey rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-dusty-pink bg-opacity-40 p-1.5 rounded-lg">
              <CreditCard className="w-4 h-4 text-deep-navy" />
            </div>
            <div>
              <h3 className="font-montserrat text-subtitle font-bold text-deep-navy">
                💳 CREDIT BLOCK
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

      <div className="flex">
        {/* Credit Information */}
        <div className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Available:</span>
              <span className="font-montserrat text-subtitle font-bold text-deep-olive">
                {formatCurrency(block.available)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Used:</span>
              <span className="font-montserrat text-subtitle font-bold text-charcoal-grey">
                {formatCurrency(block.used)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Rate:</span>
              <span className="font-montserrat text-subtitle font-bold text-charcoal-grey">
                {block.rate}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-subtitle text-medium-grey">Payment:</span>
              <span className="font-montserrat text-subtitle font-bold text-charcoal-grey capitalize">
                {block.paymentFrequency}
              </span>
            </div>
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

          <button
            onClick={() => onEdit(block.id)}
            className="w-full bg-deep-navy text-cream py-2 px-4 rounded-lg font-montserrat text-subtitle font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Parameters</span>
          </button>
        </div>

        {/* Collateral Section */}
        {block.collateral && (
          <div className="w-48 bg-light-grey bg-opacity-50 p-4 border-l border-light-medium-grey rounded-r-xl">
            <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3">
              COLLATERAL
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BarChart className="w-4 h-4 text-medium-grey" />
                <span className="font-montserrat text-caption text-charcoal-grey">
                  {block.collateral.assetType}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-montserrat text-caption text-medium-grey">Value:</span>
                  <span className="font-montserrat text-caption font-bold text-charcoal-grey">
                    {formatCurrency(block.collateral.value)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-medium-grey" />
                    <span className="font-montserrat text-caption text-medium-grey">
                      {block.collateral.advanceRate}% Advance
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Percent className="w-3 h-3 text-medium-grey" />
                    <span className="font-montserrat text-caption text-medium-grey">LTV:</span>
                  </div>
                  <span className="font-montserrat text-caption font-bold text-deep-olive">
                    {block.collateral.ltv}%
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onEdit(`${block.id}-collateral`)}
              className="w-full mt-4 bg-charcoal-grey text-cream py-1.5 px-3 rounded-lg font-montserrat text-caption font-bold hover:bg-opacity-90 transition-colors"
            >
              Edit Collateral
            </button>
          </div>
        )}
      </div>
    </div>
  );
};