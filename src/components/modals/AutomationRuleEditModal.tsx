// src/components/modals/AutomationRuleEditModal.tsx
// NEW FILE - Create this file

import React, { useState, useEffect } from 'react';
import { AutomationRule } from '../../types/canvas';
import { X, Save, AlertCircle, Zap, Calendar, Settings } from 'lucide-react';

interface AutomationRuleEditModalProps {
  ruleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleId: string, ruleData: any) => void;
}

export const AutomationRuleEditModal: React.FC<AutomationRuleEditModalProps> = ({ 
  ruleId, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [ruleData, setRuleData] = useState<any>({});

  useEffect(() => {
    if (ruleId && isOpen) {
      console.log('🔧 Loading rule data for:', ruleId);
      
      // Default rules data
      const defaultRules = {
        'auto-replenishment': {
          id: 'auto-replenishment',
          name: 'Auto-Replenishment Rule',
          type: 'replenishment',
          fromBlock: 'reserve-asset',
          toBlock: 'operating-asset',
          trigger: {
            type: 'balance_threshold',
            threshold: 50000,
            comparison: 'less_than'
          },
          action: {
            type: 'transfer',
            amount: 'auto',
            targetBalance: 250000
          },
          active: true,
          schedule: 'real-time',
          description: 'Automatically replenish operating account when balance falls below threshold'
        },
        'monthly-payment': {
          id: 'monthly-payment',
          name: 'Monthly Payment Rule',
          type: 'payment',
          fromBlock: 'operating-asset',
          toBlock: 'credit-line',
          trigger: {
            type: 'schedule',
            frequency: 'monthly',
            dayOfMonth: 1
          },
          action: {
            type: 'payment',
            amount: 'interest_only',
            paymentType: 'automatic'
          },
          active: true,
          schedule: 'monthly',
          description: 'Automatically make monthly interest payments on credit line'
        },
        'collateral-monitoring': {
          id: 'collateral-monitoring',
          name: 'Collateral Monitoring Rule',
          type: 'threshold',
          fromBlock: 'credit-line',
          toBlock: 'collateral-asset',
          trigger: {
            type: 'ltv_threshold',
            threshold: 80
          },
          action: {
            type: 'alert',
            alertType: 'margin_call'
          },
          active: true,
          schedule: 'real-time',
          description: 'Monitor collateral LTV and trigger alerts when thresholds are exceeded'
        }
      };
      
      // Handle fallback for unknown rules
      let selectedRule = defaultRules[ruleId as keyof typeof defaultRules];
      if (!selectedRule) {
        selectedRule = {
          id: ruleId,
          name: 'New Automation Rule',
          type: 'custom',
          fromBlock: 'unknown',
          toBlock: 'unknown',
          active: false,
          description: 'Custom automation rule - configure as needed'
        };
      }
      
      console.log('✅ Loaded rule data:', selectedRule);
      setRuleData(selectedRule);
    }
  }, [ruleId, isOpen]);

  if (!isOpen || !ruleId) return null;

  const handleSave = () => {
    console.log('💾 Saving automation rule:', ruleData);
    if (ruleId && ruleData) {
      onSave(ruleId, ruleData);
    }
    onClose();
  };

  const updateRuleData = (key: string, value: any) => {
    setRuleData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateNestedData = (section: string, key: string, value: any) => {
    setRuleData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const getRuleIcon = () => {
    switch (ruleData.type) {
      case 'replenishment':
        return Zap;
      case 'payment':
        return Calendar;
      case 'threshold':
        return AlertCircle;
      default:
        return Settings;
    }
  };

  const IconComponent = getRuleIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal-grey bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-cream rounded-lg shadow-deep w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-medium-grey">
          <div className="flex items-center space-x-3">
            <div className="bg-light-blue bg-opacity-40 p-2 rounded-lg">
              <IconComponent className="w-5 h-5 text-deep-navy" />
            </div>
            <div>
              <h2 className="font-playfair text-h4 text-charcoal-grey">
                Edit Automation Rule
              </h2>
              <p className="font-montserrat text-caption text-medium-grey">
                {ruleData.name || 'New Rule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-medium-grey hover:text-charcoal-grey transition-colors p-1 rounded-lg hover:bg-light-grey hover:bg-opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Rule Overview */}
          <div className="flex items-start space-x-3 mb-6 p-4 bg-light-blue bg-opacity-20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-deep-navy mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-montserrat text-subtitle font-bold text-deep-navy">
                Automation Rule Configuration
              </p>
              <p className="font-montserrat text-caption text-charcoal-grey">
                {ruleData.description || `Configure how ${ruleData.fromBlock?.replace('-', ' ')} connects to ${ruleData.toBlock?.replace('-', ' ')}.`}
              </p>
            </div>
          </div>

          {/* Basic Settings */}
          <div className="space-y-6">
            <div>
              <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
                Rule Name
              </label>
              <input
                type="text"
                value={ruleData.name || ''}
                onChange={(e) => updateRuleData('name', e.target.value)}
                className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
                placeholder="Enter rule name..."
              />
            </div>

            <div>
              <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
                Rule Type
              </label>
              <select
                value={ruleData.type || 'custom'}
                onChange={(e) => updateRuleData('type', e.target.value)}
                className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle transition-all duration-200"
              >
                <option value="replenishment">Replenishment</option>
                <option value="payment">Payment</option>
                <option value="threshold">Threshold</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
                Rule Status
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleData.active || false}
                    onChange={(e) => updateRuleData('active', e.target.checked)}
                    className="rounded border-light-medium-grey text-deep-navy focus:ring-deep-navy"
                  />
                  <span className="font-montserrat text-caption text-charcoal-grey">
                    Active
                  </span>
                </label>
                <div className={`w-2 h-2 rounded-full ${ruleData.active ? 'bg-deep-olive animate-pulse' : 'bg-medium-grey'}`}></div>
                <span className={`font-montserrat text-caption font-bold ${ruleData.active ? 'text-deep-olive' : 'text-medium-grey'}`}>
                  {ruleData.active ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>

            {/* Trigger Configuration */}
            {ruleData.trigger && (
              <div>
                <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
                  Trigger Configuration
                </label>
                <div className="space-y-3">
                  <select
                    value={ruleData.trigger?.type || 'manual'}
                    onChange={(e) => updateNestedData('trigger', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-caption"
                  >
                    <option value="balance_threshold">Balance Threshold</option>
                    <option value="schedule">Schedule</option>
                    <option value="ltv_threshold">LTV Threshold</option>
                    <option value="manual">Manual</option>
                  </select>
                  
                  {ruleData.trigger?.type === 'balance_threshold' && (
                    <input
                      type="number"
                      value={ruleData.trigger?.threshold || ''}
                      onChange={(e) => updateNestedData('trigger', 'threshold', Number(e.target.value))}
                      placeholder="Threshold amount"
                      className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-caption"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Action Configuration */}
            {ruleData.action && (
              <div>
                <label className="block font-montserrat text-subtitle font-bold text-charcoal-grey mb-2">
                  Action Configuration
                </label>
                <select
                  value={ruleData.action?.type || 'custom'}
                  onChange={(e) => updateNestedData('action', 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-caption"
                >
                  <option value="transfer">Transfer</option>
                  <option value="payment">Payment</option>
                  <option value="alert">Alert</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}

            {/* Connection Info */}
            <div className="bg-light-grey bg-opacity-50 p-4 rounded-lg">
              <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3">
                Block Connection
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="bg-light-blue bg-opacity-40 px-3 py-2 rounded-lg mb-2">
                    <span className="font-montserrat text-caption font-bold text-deep-navy">
                      FROM
                    </span>
                  </div>
                  <p className="font-montserrat text-caption text-charcoal-grey capitalize">
                    {ruleData.fromBlock?.replace('-', ' ') || 'Source Block'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-0.5 bg-charcoal-grey"></div>
                  <div className="w-0 h-0 border-l-4 border-l-charcoal-grey border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
                
                <div className="text-center">
                  <div className="bg-dusty-pink bg-opacity-40 px-3 py-2 rounded-lg mb-2">
                    <span className="font-montserrat text-caption font-bold text-deep-navy">
                      TO
                    </span>
                  </div>
                  <p className="font-montserrat text-caption text-charcoal-grey capitalize">
                    {ruleData.toBlock?.replace('-', ' ') || 'Target Block'}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
            <span>Save Rule</span>
          </button>
        </div>
      </div>
    </div>
  );
};