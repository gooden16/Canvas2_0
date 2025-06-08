import React from 'react';
import { CanvasBlock } from '../../types/canvas';
import { DollarSign, CreditCard, Users, CheckCircle, Settings } from 'lucide-react';

interface BlockCardProps {
  block: CanvasBlock;
  onClick: () => void;
  className?: string;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onClick, className = '' }) => {
  const getBlockIcon = () => {
    switch (block.type) {
      case 'asset':
        return DollarSign;
      case 'credit':
        return CreditCard;
      case 'user':
        return Users;
      default:
        return DollarSign;
    }
  };

  const getBlockColor = () => {
    switch (block.type) {
      case 'asset':
        return block.subtype === 'reserve' ? 'bg-light-blue' : 'bg-light-blue';
      case 'credit':
        return 'bg-dusty-pink';
      case 'user':
        return 'bg-gold';
      default:
        return 'bg-light-grey';
    }
  };

  const getBlockEmoji = () => {
    switch (block.type) {
      case 'asset':
        return '🏦';
      case 'credit':
        return '💳';
      case 'user':
        return '👥';
      default:
        return '📊';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderAssetSummary = () => {
    if (block.type !== 'asset') return null;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-montserrat text-caption text-medium-grey">Current:</span>
          <span className="font-montserrat text-subtitle font-bold text-gold">
            {formatCurrency(block.balance)}
          </span>
        </div>
        
        {block.subtype === 'operating' && block.threshold && (
          <div className="flex justify-between items-center">
            <span className="font-montserrat text-caption text-medium-grey">Target:</span>
            <span className="font-montserrat text-caption font-bold text-charcoal-grey">
              {formatCurrency(block.threshold)}
            </span>
          </div>
        )}
        
        {block.yieldRate && (
          <div className="flex justify-between items-center">
            <span className="font-montserrat text-caption text-medium-grey">Yield:</span>
            <span className="font-montserrat text-caption font-bold text-deep-olive">
              {block.yieldRate}% APY
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderCreditSummary = () => {
    if (block.type !== 'credit') return null;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-montserrat text-caption text-medium-grey">Available:</span>
          <span className="font-montserrat text-subtitle font-bold text-deep-olive">
            {formatCurrency(block.available)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-montserrat text-caption text-medium-grey">Used:</span>
          <span className="font-montserrat text-caption font-bold text-charcoal-grey">
            {formatCurrency(block.used)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-montserrat text-caption text-medium-grey">Rate:</span>
          <span className="font-montserrat text-caption font-bold text-charcoal-grey">
            {block.rate}
          </span>
        </div>
      </div>
    );
  };

  const IconComponent = getBlockIcon();
  const colorClass = getBlockColor();

  return (
    <div 
      className={`bg-white border border-light-medium-grey rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer group ${className}`}
      onClick={onClick}
      data-block-id={block.id}
    >
      {/* Header with accent colors */}
      <div className={`${colorClass} bg-opacity-20 px-4 py-3 border-b border-light-medium-grey rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${colorClass} bg-opacity-40 p-2 rounded-lg group-hover:bg-opacity-50 transition-colors`}>
              <IconComponent className="w-4 h-4 text-deep-navy" />
            </div>
            <div>
              <h3 className="font-playfair text-subtitle font-bold text-deep-navy">
                {getBlockEmoji()} {block.type.toUpperCase()} BLOCK
              </h3>
              <p className="font-montserrat text-caption text-charcoal-grey">
                {block.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-deep-olive" />
            <Settings className="w-4 h-4 text-medium-grey group-hover:text-charcoal-grey transition-colors" />
          </div>
        </div>
      </div>

      {/* Content with proper spacing */}
      <div className="p-4">
        {renderAssetSummary()}
        {renderCreditSummary()}
        
        {/* Click to Edit Hint */}
        <div className="mt-4 pt-3 border-t border-light-medium-grey">
          <p className="font-montserrat text-caption text-medium-grey text-center group-hover:text-charcoal-grey transition-colors">
            Click to view parameters
          </p>
        </div>
      </div>
    </div>
  );
};