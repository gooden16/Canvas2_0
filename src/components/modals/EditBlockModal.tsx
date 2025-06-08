import React, { useState } from 'react';
import { CanvasBlock } from '../../types/canvas';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditBlockModalProps {
  block: CanvasBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, parameters: any) => void;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({ 
  block, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [parameters, setParameters] = useState(block?.parameters || {});

  if (!isOpen || !block) return null;

  const handleSave = () => {
    onSave(block.id, parameters);
    onClose();
  };

  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const renderAssetParameters = () => (
    <div className="space-y-4">
      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Account Name
        </label>
        <input
          type="text"
          value={parameters.name || block.name}
          onChange={(e) => updateParameter('name', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
        />
      </div>

      {block.type === 'asset' && block.subtype === 'operating' && (
        <>
          <div>
            <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
              Replenishment Threshold
            </label>
            <input
              type="number"
              value={parameters.threshold || 50000}
              onChange={(e) => updateParameter('threshold', Number(e.target.value))}
              className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
            />
          </div>

          <div>
            <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
              Expected Balance
            </label>
            <input
              type="number"
              value={parameters.expectedBalance || 250000}
              onChange={(e) => updateParameter('expectedBalance', Number(e.target.value))}
              className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
            />
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
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
        >
          <option value="Base Rate">Base Rate</option>
          <option value="Yield Optimized">Yield Optimized</option>
          <option value="FDIC Maximized">FDIC Maximized</option>
        </select>
      </div>
    </div>
  );

  const renderCreditParameters = () => (
    <div className="space-y-4">
      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Credit Name
        </label>
        <input
          type="text"
          value={parameters.name || block.name}
          onChange={(e) => updateParameter('name', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
        />
      </div>

      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Rate Type
        </label>
        <select
          value={parameters.rateType || 'Variable'}
          onChange={(e) => updateParameter('rateType', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
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
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
        >
          <option value="Interest Only">Interest Only</option>
          <option value="Principal + Interest">Principal + Interest</option>
          <option value="Balloon">Balloon</option>
        </select>
      </div>

      <div>
        <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
          Currency
        </label>
        <select
          value={parameters.currency || 'USD'}
          onChange={(e) => updateParameter('currency', e.target.value)}
          className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-charcoal-grey bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cream rounded-xl shadow-deep max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-medium-grey">
          <h2 className="font-playfair text-h4 text-charcoal-grey">
            Edit {block.type === 'asset' ? 'Asset' : 'Credit'} Block
          </h2>
          <button
            onClick={onClose}
            className="text-medium-grey hover:text-charcoal-grey transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6 p-3 bg-light-blue bg-opacity-20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-deep-navy mt-0.5" />
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

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-light-medium-grey">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-light-medium-grey text-charcoal-grey rounded-lg font-montserrat text-subtitle font-bold hover:bg-light-grey transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-deep-navy text-cream rounded-lg font-montserrat text-subtitle font-bold hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Parameters</span>
          </button>
        </div>
      </div>
    </div>
  );
};