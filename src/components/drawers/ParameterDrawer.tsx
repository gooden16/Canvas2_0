import React, { useState, useEffect } from 'react';
import { CanvasBlock } from '../../types/canvas';
import { X, Save, AlertCircle, DollarSign, CreditCard, Users } from 'lucide-react';

interface ParameterDrawerProps {
  block: CanvasBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, parameters: any) => void;
}

export const ParameterDrawer: React.FC<ParameterDrawerProps> = ({ 
  block, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [parameters, setParameters] = useState<any>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (block) {
      setParameters(block.parameters || {});
    }
  }, [block]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when drawer closes
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    // Delay the actual close to allow animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = () => {
    onSave(block!.id, parameters);
  };

  const updateParameter = (key: string, value: any) => {
    setParameters((prev: any) => ({ ...prev, [key]: value }));
  };

  if (!isOpen || !block) return null;

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
        return 'bg-light-blue';
      case 'credit':
        return 'bg-dusty-pink';
      case 'user':
        return 'bg-gold';
      default:
        return 'bg-light-grey';
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

  const renderAssetParameters = () => (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-light-grey bg-opacity-50 p-4 rounded-lg">
        <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3">
          Current Status
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-montserrat text-caption text-medium-grey">Balance:</span>
            <p className="font-montserrat text-subtitle font-bold text-charcoal-grey">
              {formatCurrency(block.balance)}
            </p>
          </div>
          {block.yieldRate && (
            <div>
              <span className="font-montserrat text-caption text-medium-grey">Yield:</span>
              <p className="font-montserrat text-subtitle font-bold text-deep-olive">
                {block.yieldRate}% APY
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editable Parameters */}
      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Account Name
        </label>
        <input
          type="text"
          value={parameters.name || block.name}
          onChange={(e) => updateParameter('name', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
        />
      </div>

      {block.subtype === 'operating' && (
        <>
          <div>
            <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
              Replenishment Threshold
            </label>
            <input
              type="number"
              value={parameters.threshold || block.threshold || 50000}
              onChange={(e) => updateParameter('threshold', Number(e.target.value))}
              className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
            />
            <p className="font-montserrat text-caption text-medium-grey mt-1">
              Reserve will replenish when operating balance falls below this amount
            </p>
          </div>

          <div>
            <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
              Target Balance
            </label>
            <input
              type="number"
              value={parameters.expectedBalance || block.expectedBalance || 250000}
              onChange={(e) => updateParameter('expectedBalance', Number(e.target.value))}
              className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
            />
            <p className="font-montserrat text-caption text-medium-grey mt-1">
              Ideal operating balance for daily operations
            </p>
          </div>
        </>
      )}

      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Yield Strategy
        </label>
        <select
          value={parameters.yieldStrategy || 'Base Rate'}
          onChange={(e) => updateParameter('yieldStrategy', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
        >
          <option value="Base Rate">Base Rate</option>
          <option value="Yield Optimized">Yield Optimized</option>
          <option value="FDIC Maximized">FDIC Maximized</option>
        </select>
      </div>

      {/* Money Movement */}
      <div>
        <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3">
          Money Movement Options
        </h4>
        <div className="space-y-2">
          {Object.entries(block.moneyMovement || {}).map(([key, enabled]) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => updateParameter(`moneyMovement.${key}`, e.target.checked)}
                className="rounded border-light-medium-grey text-deep-navy focus:ring-deep-navy transition-all duration-200"
              />
              <span className="font-montserrat text-caption text-charcoal-grey capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreditParameters = () => (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-light-grey bg-opacity-50 p-4 rounded-lg">
        <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3">
          Current Status
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-montserrat text-caption text-medium-grey">Available:</span>
            <p className="font-montserrat text-subtitle font-bold text-deep-olive">
              {formatCurrency(block.available)}
            </p>
          </div>
          <div>
            <span className="font-montserrat text-caption text-medium-grey">Used:</span>
            <p className="font-montserrat text-subtitle font-bold text-charcoal-grey">
              {formatCurrency(block.used)}
            </p>
          </div>
          <div>
            <span className="font-montserrat text-caption text-medium-grey">Rate:</span>
            <p className="font-montserrat text-subtitle font-bold text-charcoal-grey">
              {block.rate}
            </p>
          </div>
          <div>
            <span className="font-montserrat text-caption text-medium-grey">Payment:</span>
            <p className="font-montserrat text-subtitle font-bold text-charcoal-grey capitalize">
              {block.paymentFrequency}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Parameters */}
      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Credit Name
        </label>
        <input
          type="text"
          value={parameters.name || block.name}
          onChange={(e) => updateParameter('name', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
        />
      </div>

      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Rate Type
        </label>
        <select
          value={parameters.rateType || 'Variable'}
          onChange={(e) => updateParameter('rateType', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
        >
          <option value="Variable">Variable</option>
          <option value="Fixed">Fixed</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Payment Type
        </label>
        <select
          value={parameters.paymentType || 'Interest Only'}
          onChange={(e) => updateParameter('paymentType', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
        >
          <option value="Interest Only">Interest Only</option>
          <option value="Principal + Interest">Principal + Interest</option>
          <option value="Balloon">Balloon</option>
        </select>
      </div>

      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Payment Frequency
        </label>
        <select
          value={parameters.paymentFrequency || block.paymentFrequency}
          onChange={(e) => updateParameter('paymentFrequency', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Collateral Information */}
      {block.collateral && (
        <div className="bg-light-grey bg-opacity-50 p-4 rounded-lg">
          <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3">
            Collateral Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-montserrat text-caption text-medium-grey">Asset Type:</span>
              <p className="font-montserrat text-caption font-bold text-charcoal-grey">
                {block.collateral.assetType}
              </p>
            </div>
            <div>
              <span className="font-montserrat text-caption text-medium-grey">Value:</span>
              <p className="font-montserrat text-caption font-bold text-charcoal-grey">
                {formatCurrency(block.collateral.value)}
              </p>
            </div>
            <div>
              <span className="font-montserrat text-caption text-medium-grey">Advance Rate:</span>
              <p className="font-montserrat text-caption font-bold text-charcoal-grey">
                {block.collateral.advanceRate}%
              </p>
            </div>
            <div>
              <span className="font-montserrat text-caption text-medium-grey">LTV:</span>
              <p className="font-montserrat text-caption font-bold text-deep-olive">
                {block.collateral.ltv}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const IconComponent = getBlockIcon();
  const colorClass = getBlockColor();

  return (
    <>
      {/* Backdrop with fade animation */}
      <div 
        className={`fixed inset-0 bg-charcoal-grey z-40 transition-all duration-300 ease-out ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Drawer with slide animation */}
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[28rem] bg-cream shadow-deep z-50 overflow-y-auto transition-all duration-300 ease-out ${
          isAnimating 
            ? 'transform translate-x-0' 
            : 'transform translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`${colorClass} bg-opacity-20 px-6 py-4 border-b border-light-medium-grey sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${colorClass} bg-opacity-40 p-2 rounded-lg transition-all duration-200`}>
                <IconComponent className="w-5 h-5 text-deep-navy" />
              </div>
              <div>
                <h2 className="font-playfair text-h4 text-charcoal-grey">
                  {block.type === 'asset' ? 'Asset' : 'Credit'} Block Parameters
                </h2>
                <p className="font-montserrat text-caption text-medium-grey">
                  {block.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-medium-grey hover:text-charcoal-grey transition-all duration-200 hover:bg-light-grey hover:bg-opacity-50 p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content with staggered animation */}
        <div className={`p-6 transition-all duration-500 ease-out delay-100 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-start space-x-3 mb-6 p-3 bg-light-blue bg-opacity-20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-deep-navy mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-montserrat text-subtitle font-bold text-deep-navy">
                Parameter Configuration
              </p>
              <p className="font-montserrat text-caption text-charcoal-grey">
                Changes will affect how this block operates within your canvas automation.
              </p>
            </div>
          </div>

          {block.type === 'asset' ? renderAssetParameters() : renderCreditParameters()}
        </div>

        {/* Footer with slide-up animation */}
        <div className={`sticky bottom-0 bg-cream border-t border-light-medium-grey p-6 transition-all duration-500 ease-out delay-200 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-light-medium-grey text-charcoal-grey rounded-lg font-montserrat text-subtitle font-bold hover:bg-light-grey transition-all duration-200 transform hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-deep-navy text-cream rounded-lg font-montserrat text-subtitle font-bold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};