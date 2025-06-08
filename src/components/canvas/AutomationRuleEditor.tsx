import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Zap, Calendar, DollarSign, Settings } from 'lucide-react';

interface AutomationRuleEditorProps {
  ruleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleId: string, ruleData: any) => void;
}

export const AutomationRuleEditor: React.FC<AutomationRuleEditorProps> = ({ 
  ruleId, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [ruleData, setRuleData] = useState<any>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (ruleId) {
      // Load rule data based on ruleId
      const defaultRules = {
        'auto-replenishment': {
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
          schedule: 'real-time'
        },
        'monthly-payment': {
          name: 'Monthly Payment Rule',
          type: 'payment',
          fromBlock: 'operating-asset',
          toBlock: 'credit-line',
          trigger: {
            type: 'schedule',
            frequency: 'monthly',
            dayOfMonth: 1,
            businessDaysOnly: true
          },
          action: {
            type: 'payment',
            amount: 'interest_only',
            paymentType: 'automatic'
          },
          active: true,
          schedule: 'monthly'
        }
      };
      
      setRuleData(defaultRules[ruleId as keyof typeof defaultRules] || {});
    }
  }, [ruleId]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = () => {
    onSave(ruleId!, ruleData);
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

  if (!isOpen || !ruleId) return null;

  const getRuleIcon = () => {
    switch (ruleData.type) {
      case 'replenishment':
        return Zap;
      case 'payment':
        return Calendar;
      default:
        return Settings;
    }
  };

  const getRuleColor = () => {
    switch (ruleData.type) {
      case 'replenishment':
        return 'bg-deep-olive';
      case 'payment':
        return 'bg-light-blue';
      default:
        return 'bg-charcoal-grey';
    }
  };

  const IconComponent = getRuleIcon();
  const colorClass = getRuleColor();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-charcoal-grey z-40 transition-all duration-300 ease-out ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Editor Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[32rem] bg-cream shadow-deep z-50 overflow-y-auto transition-all duration-300 ease-out ${
          isAnimating 
            ? 'transform translate-x-0' 
            : 'transform translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`${colorClass} bg-opacity-20 px-6 py-4 border-b border-light-medium-grey sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${colorClass} bg-opacity-40 p-2 rounded-lg`}>
                <IconComponent className="w-5 h-5 text-deep-navy" />
              </div>
              <div>
                <h2 className="font-playfair text-h4 text-charcoal-grey">
                  Edit Automation Rule
                </h2>
                <p className="font-montserrat text-caption text-medium-grey">
                  {ruleData.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-medium-grey hover:text-charcoal-grey transition-colors p-1 rounded-lg hover:bg-light-grey hover:bg-opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 transition-all duration-500 ease-out delay-100 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Rule Overview */}
          <div className="flex items-start space-x-3 mb-6 p-4 bg-light-blue bg-opacity-20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-deep-navy mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-montserrat text-subtitle font-bold text-deep-navy">
                Automation Rule Configuration
              </p>
              <p className="font-montserrat text-caption text-charcoal-grey">
                This rule creates an automated connection between {ruleData.fromBlock?.replace('-', ' ')} and {ruleData.toBlock?.replace('-', ' ')} blocks.
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
              />
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
                  {ruleData.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            {/* Trigger Configuration */}
            <div className="bg-light-grey bg-opacity-50 p-4 rounded-lg">
              <h4 className="font-montserrat text-subtitle font-bold text-charcoal-grey mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Trigger Conditions
              </h4>
              
              {ruleData.type === 'replenishment' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-caption font-bold text-charcoal-grey mb-2">
                      Threshold Amount
                    </label>
                    <input
                      type="number"
                      value={ruleData.trigger?.threshold || 50000}
                      onChange={(e) => updateNestedData('trigger', 'threshold', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle"
                    />
                    <p className="font-montserrat text-caption text-medium-grey mt-1">
                      Rule triggers when operating balance falls below this amount
                    </p>
                  </div>
                  
                  <div>
                    <label className="block font-montserrat text-caption font-bold text-charcoal-grey mb-2">
                      Target Replenishment Amount
                    </label>
                    <input
                      type="number"
                      value={ruleData.action?.targetBalance || 250000}
                      onChange={(e) => updateNestedData('action', 'targetBalance', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle"
                    />
                    <p className="font-montserrat text-caption text-medium-grey mt-1">
                      Amount to transfer to reach target balance
                    </p>
                  </div>
                </div>
              )}

              {ruleData.type === 'payment' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-caption font-bold text-charcoal-grey mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={ruleData.trigger?.frequency || 'monthly'}
                      onChange={(e) => updateNestedData('trigger', 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block font-montserrat text-caption font-bold text-charcoal-grey mb-2">
                      Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={ruleData.trigger?.dayOfMonth || 1}
                      onChange={(e) => updateNestedData('trigger', 'dayOfMonth', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ruleData.trigger?.businessDaysOnly || false}
                        onChange={(e) => updateNestedData('trigger', 'businessDaysOnly', e.target.checked)}
                        className="rounded border-light-medium-grey text-deep-navy focus:ring-deep-navy"
                      />
                      <span className="font-montserrat text-caption text-charcoal-grey">
                        Business days only
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-montserrat text-caption font-bold text-charcoal-grey mb-2">
                      Payment Type
                    </label>
                    <select
                      value={ruleData.action?.amount || 'interest_only'}
                      onChange={(e) => updateNestedData('action', 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-light-medium-grey rounded-lg focus:ring-2 focus:ring-deep-navy focus:border-transparent font-montserrat text-subtitle"
                    >
                      <option value="interest_only">Interest Only</option>
                      <option value="principal_interest">Principal + Interest</option>
                      <option value="minimum_payment">Minimum Payment</option>
                      <option value="fixed_amount">Fixed Amount</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

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
                    {ruleData.fromBlock?.replace('-', ' ')}
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
                    {ruleData.toBlock?.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 bg-cream border-t border-light-medium-grey p-6 transition-all duration-500 ease-out delay-200 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-light-medium-grey text-charcoal-grey rounded-lg font-montserrat text-subtitle font-bold hover:bg-light-grey transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-deep-navy text-cream rounded-lg font-montserrat text-subtitle font-bold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Rule</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};