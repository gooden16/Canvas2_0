// src/components/modals/EditBlockModal.tsx

import React, { useState, useEffect } from 'react';
import { CanvasBlock, AssetBlock, CreditBlock, UserBlock } from '../../types/canvas';
import { X, Save, AlertCircle, DollarSign, CreditCard, Users, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

interface EditBlockModalProps {
  block: CanvasBlock;
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
  const [parameters, setParameters] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'money-movement' | 'advanced'>('basic');

  useEffect(() => {
    if (block) {
      setParameters({
        ...block.parameters,
        name: block.name,
        // Include block-specific fields
        ...(block.type === 'asset' && {
          balance: (block as AssetBlock).balance,
          threshold: (block as AssetBlock).threshold,
          yieldRate: (block as AssetBlock).yieldRate,
          moneyMovement: (block as AssetBlock).moneyMovement
        }),
        ...(block.type === 'credit' && {
          available: (block as CreditBlock).available,
          used: (block as CreditBlock).used,
          rate: (block as CreditBlock).rate,
          paymentFrequency: (block as CreditBlock).paymentFrequency,
          moneyMovement: (block as CreditBlock).moneyMovement
        }),
        ...(block.type === 'user' && {
          role: (block as UserBlock).role,
          permissions: (block as UserBlock).permissions,
          accessLevel: (block as UserBlock).accessLevel
        })
      });
    }
  }, [block]);

  const handleSave = () => {
    onSave(block.id, parameters);
    onClose();
  };

  const updateParameter = (key: string, value: any) => {
    setParameters((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleMoneyMovement = (capability: string) => {
    setParameters((prev: any) => ({
      ...prev,
      moneyMovement: {
        ...prev.moneyMovement,
        [capability]: !prev.moneyMovement?.[capability]
      }
    }));
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'asset':
        return DollarSign;
      case 'credit':
        return CreditCard;
      case 'user':
        return Users;
      default:
        return Settings;
    }
  };

  const getBlockColor = () => {
    switch (block.type) {
      case 'asset':
        return 'text-blue-600 bg-blue-100';
      case 'credit':
        return 'text-pink-600 bg-pink-100';
      case 'user':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen || !block) return null;

  const IconComponent = getBlockIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getBlockColor()}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-900">
                Edit {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
              </h2>
              <p className="font-montserrat text-sm text-gray-500">
                Configure parameters and settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['basic', 'money-movement', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  py-4 px-1 border-b-2 font-montserrat text-sm font-medium transition-colors
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                  Block Name
                </label>
                <input
                  type="text"
                  value={parameters.name || ''}
                  onChange={(e) => updateParameter('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Asset-specific fields */}
              {block.type === 'asset' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                        Current Balance
                      </label>
                      <input
                        type="number"
                        value={parameters.balance || 0}
                        onChange={(e) => updateParameter('balance', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                        Threshold Alert
                      </label>
                      <input
                        type="number"
                        value={parameters.threshold || 0}
                        onChange={(e) => updateParameter('threshold', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                      Yield Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={(parameters.yieldRate * 100) || 0}
                      onChange={(e) => updateParameter('yieldRate', (parseFloat(e.target.value) || 0) / 100)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Credit-specific fields */}
              {block.type === 'credit' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                        Available Credit
                      </label>
                      <input
                        type="number"
                        value={parameters.available || 0}
                        onChange={(e) => updateParameter('available', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                        Used Amount
                      </label>
                      <input
                        type="number"
                        value={parameters.used || 0}
                        onChange={(e) => updateParameter('used', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                        Interest Rate
                      </label>
                      <input
                        type="text"
                        value={parameters.rate || ''}
                        onChange={(e) => updateParameter('rate', e.target.value)}
                        placeholder="e.g., SOFR+3.00%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                        Payment Frequency
                      </label>
                      <select
                        value={parameters.paymentFrequency || 'monthly'}
                        onChange={(e) => updateParameter('paymentFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* User-specific fields */}
              {block.type === 'user' && (
                <>
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                      User Role
                    </label>
                    <select
                      value={parameters.role || 'readonly'}
                      onChange={(e) => updateParameter('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="readonly">Read Only</option>
                      <option value="cardholder">Card Holder</option>
                      <option value="secondary">Secondary User</option>
                      <option value="primary">Primary User</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                      Access Level
                    </label>
                    <input
                      type="text"
                      value={parameters.accessLevel || ''}
                      onChange={(e) => updateParameter('accessLevel', e.target.value)}
                      placeholder="e.g., Standard, Limited, Full"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'money-movement' && (block.type === 'asset' || block.type === 'credit') && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <h4 className="font-montserrat text-sm font-semibold text-blue-900">
                    Money Movement Configuration
                  </h4>
                </div>
                <p className="font-montserrat text-xs text-blue-800">
                  Enable or disable specific payment methods and transfer capabilities for this block.
                </p>
              </div>

              {block.type === 'asset' && (
                <div className="space-y-4">
                  <h4 className="font-montserrat text-lg font-semibold text-gray-900">Asset Block Capabilities</h4>
                  
                  {[
                    { key: 'checkDeposits', label: 'Check Deposits', description: 'Accept check deposits into this account' },
                    { key: 'cashDeposits', label: 'Cash Deposits', description: 'Accept cash deposits via ATM or branch' },
                    { key: 'zelleTransfers', label: 'Zelle Transfers', description: 'Send and receive Zelle payments' },
                    { key: 'achOutbound', label: 'ACH Outbound', description: 'Send ACH transfers to external accounts' },
                    { key: 'wireTransfers', label: 'Wire Transfers', description: 'Send and receive wire transfers' }
                  ].map((capability) => (
                    <div key={capability.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-montserrat text-sm font-medium text-gray-900">
                          {capability.label}
                        </div>
                        <div className="font-montserrat text-xs text-gray-600">
                          {capability.description}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMoneyMovement(capability.key)}
                        className="flex items-center"
                      >
                        {parameters.moneyMovement?.[capability.key] ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {block.type === 'credit' && (
                <div className="space-y-4">
                  <h4 className="font-montserrat text-lg font-semibold text-gray-900">Credit Block Capabilities</h4>
                  
                  {[
                    { key: 'achPayments', label: 'ACH Payments', description: 'Make payments via ACH transfer' },
                    { key: 'wireTransfers', label: 'Wire Transfers', description: 'Make payments via wire transfer' },
                    { key: 'creditCard', label: 'Credit Card Funding', description: 'Fund credit card payments' },
                    { key: 'checkPayments', label: 'Check Payments', description: 'Make payments via check' }
                  ].map((capability) => (
                    <div key={capability.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-montserrat text-sm font-medium text-gray-900">
                          {capability.label}
                        </div>
                        <div className="font-montserrat text-xs text-gray-600">
                          {capability.description}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleMoneyMovement(capability.key)}
                        className="flex items-center"
                      >
                        {parameters.moneyMovement?.[capability.key] ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-montserrat text-sm font-semibold text-yellow-900">
                    Advanced Settings
                  </h4>
                </div>
                <p className="font-montserrat text-xs text-yellow-800">
                  These settings affect automation rules and system behavior. Change with caution.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={parameters.institution || ''}
                    onChange={(e) => updateParameter('institution', e.target.value)}
                    placeholder="e.g., JPMorgan Chase"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={parameters.currency || 'USD'}
                    onChange={(e) => updateParameter('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={parameters.department || ''}
                    onChange={(e) => updateParameter('department', e.target.value)}
                    placeholder="e.g., Finance, Operations"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-montserrat text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-montserrat text-sm hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};