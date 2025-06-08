// src/components/modals/AutomationRuleEditModal.tsx

import React, { useState, useEffect } from 'react';
import { AutomationRule, BlockConnection, CanvasBlock } from '../../types/canvas';
import { X, Save, Trash2, Play, Pause, Zap, Clock, AlertCircle, Settings } from 'lucide-react';

interface AutomationRuleEditModalProps {
  automationRule: AutomationRule | null;
  connection: BlockConnection | null;
  fromBlock: CanvasBlock | null;
  toBlock: CanvasBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleId: string, updatedRule: Partial<AutomationRule>) => void;
  onDelete: (ruleId: string) => void;
}

export const AutomationRuleEditModal: React.FC<AutomationRuleEditModalProps> = ({
  automationRule,
  connection,
  fromBlock,
  toBlock,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [editedRule, setEditedRule] = useState<Partial<AutomationRule>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'conditions' | 'schedule'>('basic');

  useEffect(() => {
    if (automationRule) {
      setEditedRule({
        name: automationRule.name,
        type: automationRule.type,
        trigger: automationRule.trigger,
        action: automationRule.action,
        active: automationRule.active,
        lastRun: automationRule.lastRun,
        nextCheck: automationRule.nextCheck
      });
    }
  }, [automationRule]);

  const handleSave = () => {
    if (automationRule) {
      onSave(automationRule.id, editedRule);
      onClose();
    }
  };

  const handleDelete = () => {
    if (automationRule && window.confirm(`Are you sure you want to delete "${automationRule.name}"? This will remove the automation rule and its connection.`)) {
      onDelete(automationRule.id);
      onClose();
    }
  };

  const updateRule = (field: keyof AutomationRule, value: any) => {
    setEditedRule(prev => ({ ...prev, [field]: value }));
  };

  const getAutomationTypeIcon = (type: string) => {
    switch (type) {
      case 'replenishment':
        return '💰';
      case 'payment':
        return '💳';
      case 'threshold':
        return '⚠️';
      default:
        return '⚡';
    }
  };

  const getAutomationTypeColor = (type: string) => {
    switch (type) {
      case 'replenishment':
        return 'text-green-600 bg-green-100';
      case 'payment':
        return 'text-blue-600 bg-blue-100';
      case 'threshold':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-purple-600 bg-purple-100';
    }
  };

  const getActionTemplates = (type: string) => {
    switch (type) {
      case 'replenishment':
        return [
          'Transfer $50,000 from Reserve Account',
          'Transfer $25,000 from Reserve Account',
          'Transfer $100,000 from Reserve Account',
          'Transfer 80% of shortfall from Reserve Account'
        ];
      case 'payment':
        return [
          'Pay minimum amount due',
          'Pay interest only',
          'Pay full balance',
          'Pay fixed amount of $5,000'
        ];
      case 'threshold':
        return [
          'Send alert notification',
          'Pause other automation rules',
          'Execute rebalancing strategy',
          'Generate report for review'
        ];
      default:
        return [
          'Execute custom logic',
          'Send notification',
          'Create task for review'
        ];
    }
  };

  const getTriggerTemplates = (type: string) => {
    switch (type) {
      case 'replenishment':
        return [
          'Balance below $50,000',
          'Balance below $25,000',
          'Balance below $100,000',
          'Balance below 20% of target'
        ];
      case 'payment':
        return [
          'Monthly payment due',
          'Weekly payment due',
          'Interest payment due',
          '5 days before payment due'
        ];
      case 'threshold':
        return [
          'LTV exceeds 80%',
          'Utilization exceeds 90%',
          'Balance variance > 10%',
          'Risk score exceeds limit'
        ];
      default:
        return [
          'Custom condition met',
          'Time-based trigger',
          'Event-based trigger'
        ];
    }
  };

  if (!isOpen || !automationRule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getAutomationTypeColor(editedRule.type || 'custom')}`}>
              <span className="text-lg">{getAutomationTypeIcon(editedRule.type || 'custom')}</span>
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-900">
                Edit Automation Rule
              </h2>
              <p className="font-montserrat text-sm text-gray-500">
                {fromBlock?.name} → {toBlock?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Quick toggle active/inactive */}
            <button
              onClick={() => updateRule('active', !editedRule.active)}
              className={`p-2 rounded-lg transition-colors ${
                editedRule.active 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={editedRule.active ? 'Pause Rule' : 'Activate Rule'}
            >
              {editedRule.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['basic', 'conditions', 'schedule'].map((tab) => (
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
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Rule Name */}
              <div>
                <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={editedRule.name || ''}
                  onChange={(e) => updateRule('name', e.target.value)}
                  placeholder="Enter automation rule name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Rule Type */}
              <div>
                <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                  Automation Type
                </label>
                <select
                  value={editedRule.type || 'custom'}
                  onChange={(e) => updateRule('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="replenishment">Replenishment</option>
                  <option value="payment">Payment</option>
                  <option value="threshold">Threshold</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Status Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-montserrat text-sm font-medium text-gray-700">Last Run</span>
                  </div>
                  <p className="font-montserrat text-sm text-gray-600">
                    {editedRule.lastRun ? new Date(editedRule.lastRun).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                    <span className="font-montserrat text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full font-montserrat text-xs font-medium
                    ${editedRule.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {editedRule.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-6">
              {/* Trigger Condition */}
              <div>
                <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                  Trigger Condition
                </label>
                <input
                  type="text"
                  value={editedRule.trigger || ''}
                  onChange={(e) => updateRule('trigger', e.target.value)}
                  placeholder="When should this automation trigger?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Trigger Templates */}
                <div className="mt-2">
                  <p className="font-montserrat text-xs text-gray-500 mb-2">Common triggers:</p>
                  <div className="flex flex-wrap gap-2">
                    {getTriggerTemplates(editedRule.type || 'custom').map((template, index) => (
                      <button
                        key={index}
                        onClick={() => updateRule('trigger', template)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-montserrat hover:bg-blue-100 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                  Action to Take
                </label>
                <input
                  type="text"
                  value={editedRule.action || ''}
                  onChange={(e) => updateRule('action', e.target.value)}
                  placeholder="What action should be performed?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {/* Action Templates */}
                <div className="mt-2">
                  <p className="font-montserrat text-xs text-gray-500 mb-2">Common actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {getActionTemplates(editedRule.type || 'custom').map((template, index) => (
                      <button
                        key={index}
                        onClick={() => updateRule('action', template)}
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-montserrat hover:bg-green-100 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connection Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h4 className="font-montserrat text-sm font-semibold text-blue-900">
                    Connection Details
                  </h4>
                </div>
                <p className="font-montserrat text-xs text-blue-800">
                  This automation rule controls the flow between <strong>{fromBlock?.name}</strong> and <strong>{toBlock?.name}</strong>.
                  The trigger condition monitors {fromBlock?.name}, and when met, the action affects {toBlock?.name}.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Schedule Settings */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-montserrat text-sm font-semibold text-yellow-900">
                    Schedule Configuration
                  </h4>
                </div>
                <p className="font-montserrat text-xs text-yellow-800 mb-4">
                  Advanced scheduling options will be available in a future update. Currently, automation rules run based on real-time triggers.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-2">
                      Next Check
                    </label>
                    <input
                      type="datetime-local"
                      value={editedRule.nextCheck ? new Date(editedRule.nextCheck).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateRule('nextCheck', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editedRule.active || false}
                      onChange={(e) => updateRule('active', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="font-montserrat text-sm text-gray-700">
                      Enable automatic execution
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-red-100 border border-red-300 rounded-lg font-montserrat text-sm hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Rule</span>
          </button>
          
          <div className="flex items-center space-x-3">
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
    </div>
  );
};