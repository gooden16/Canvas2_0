import React, { useState } from 'react';
import { CanvasMetric } from '../types/canvas';
import { DollarSign, TrendingUp, BarChart, Shield, AlertTriangle, CheckCircle, Edit3, Plus, X, Save } from 'lucide-react';

interface MetricsBarProps {
  metrics: CanvasMetric[];
  onMetricsUpdate?: (metrics: CanvasMetric[]) => void;
}

const getIcon = (iconName: string) => {
  const iconMap = {
    DollarSign,
    TrendingUp,
    BarChart,
    Shield,
    AlertTriangle,
    CheckCircle
  };
  return iconMap[iconName as keyof typeof iconMap] || DollarSign;
};

const getTrendColor = (trend?: string) => {
  switch (trend) {
    case 'up': return 'text-deep-olive';
    case 'down': return 'text-burgundy';
    default: return 'text-medium-grey';
  }
};

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, onMetricsUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<CanvasMetric[]>(metrics);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);

  const startEditing = () => {
    setEditingMetrics([...metrics]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingMetrics(metrics);
    setIsEditing(false);
    setEditingMetricId(null);
  };

  const saveMetrics = () => {
    onMetricsUpdate?.(editingMetrics);
    setIsEditing(false);
    setEditingMetricId(null);
  };

  const updateMetric = (id: string, field: keyof CanvasMetric, value: any) => {
    setEditingMetrics(prev => 
      prev.map(metric => 
        metric.id === id ? { ...metric, [field]: value } : metric
      )
    );
  };

  const addNewMetric = () => {
    const newMetric: CanvasMetric = {
      id: `metric-${Date.now()}`,
      name: 'New Metric',
      value: '$0',
      format: 'currency',
      trend: 'stable',
      icon: 'DollarSign'
    };
    setEditingMetrics(prev => [...prev, newMetric]);
    setEditingMetricId(newMetric.id);
  };

  const removeMetric = (id: string) => {
    setEditingMetrics(prev => prev.filter(metric => metric.id !== id));
  };

  const renderEditableMetric = (metric: CanvasMetric) => {
    const IconComponent = getIcon(metric.icon || 'DollarSign');
    const isEditingThis = editingMetricId === metric.id;

    return (
      <div key={metric.id} className="flex items-center space-x-2 flex-shrink-0 bg-light-grey bg-opacity-50 rounded-lg p-2 border border-light-medium-grey">
        {isEditingThis ? (
          <div className="flex items-center space-x-2 min-w-0">
            {/* Icon Selector */}
            <select
              value={metric.icon || 'DollarSign'}
              onChange={(e) => updateMetric(metric.id, 'icon', e.target.value)}
              className="w-8 h-8 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
            >
              <option value="DollarSign">💰</option>
              <option value="TrendingUp">📈</option>
              <option value="BarChart">📊</option>
              <option value="Shield">🛡️</option>
              <option value="AlertTriangle">⚠️</option>
              <option value="CheckCircle">✅</option>
            </select>

            {/* Name Input */}
            <input
              type="text"
              value={metric.name}
              onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
              className="w-20 px-2 py-1 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
              placeholder="Name"
            />

            {/* Value Input */}
            <input
              type="text"
              value={metric.value}
              onChange={(e) => updateMetric(metric.id, 'value', e.target.value)}
              className="w-16 px-2 py-1 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
              placeholder="Value"
            />

            {/* Trend Selector */}
            <select
              value={metric.trend || 'stable'}
              onChange={(e) => updateMetric(metric.id, 'trend', e.target.value)}
              className="w-12 h-8 text-xs border border-light-medium-grey rounded focus:ring-1 focus:ring-deep-navy"
            >
              <option value="up">↗️</option>
              <option value="down">↘️</option>
              <option value="stable">→</option>
            </select>

            {/* Save/Cancel */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setEditingMetricId(null)}
                className="text-deep-olive hover:text-charcoal-grey transition-colors p-1"
              >
                <Save className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeMetric(metric.id)}
                className="text-burgundy hover:text-charcoal-grey transition-colors p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-light-blue hover:bg-opacity-20 rounded p-1 transition-colors"
            onClick={() => setEditingMetricId(metric.id)}
          >
            <IconComponent className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
            <div className="flex items-center space-x-1">
              <span className="font-montserrat text-caption font-bold text-charcoal-grey whitespace-nowrap">
                {metric.name}:
              </span>
              <span className={`font-montserrat text-caption font-bold ${getTrendColor(metric.trend)} whitespace-nowrap`}>
                {metric.value}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDisplayMetric = (metric: CanvasMetric) => {
    const IconComponent = getIcon(metric.icon || 'DollarSign');
    return (
      <div key={metric.id} className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${getTrendColor(metric.trend)}`} />
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="font-montserrat text-caption sm:text-subtitle font-bold text-charcoal-grey whitespace-nowrap">
            {metric.name}:
          </span>
          <span className={`font-montserrat text-caption sm:text-subtitle font-bold ${getTrendColor(metric.trend)} whitespace-nowrap`}>
            {metric.value}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cream border-b border-light-grey px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Metrics - Responsive Layout */}
        <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto flex-1">
          {isEditing ? (
            <>
              {editingMetrics.map(renderEditableMetric)}
              <button
                onClick={addNewMetric}
                className="flex items-center space-x-1 bg-deep-navy text-cream px-3 py-2 rounded-lg font-montserrat text-caption font-bold hover:bg-opacity-90 transition-colors flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </>
          ) : (
            metrics.map(renderDisplayMetric)
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={saveMetrics}
                className="bg-deep-olive text-cream px-3 py-2 rounded-lg font-montserrat text-caption font-bold hover:bg-opacity-90 transition-colors flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={cancelEditing}
                className="bg-medium-grey text-cream px-3 py-2 rounded-lg font-montserrat text-caption font-bold hover:bg-opacity-90 transition-colors flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="bg-light-blue bg-opacity-80 text-deep-navy px-3 py-2 rounded-lg font-montserrat text-caption font-bold hover:bg-opacity-100 transition-colors flex items-center space-x-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button className="bg-deep-navy text-cream px-3 sm:px-4 py-2 rounded-lg font-montserrat text-caption sm:text-subtitle font-bold hover:bg-opacity-90 transition-colors">
                📊 Metrics
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};