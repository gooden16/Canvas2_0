// src/components/MetricsBar.tsx

import React, { useState } from 'react';
import { CanvasMetric } from '../types/canvas';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Plus, X } from 'lucide-react';

interface MetricsBarProps {
  metrics: CanvasMetric[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatValue = (value: string | number, format: string): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      case 'stable':
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
      default:
        return 'text-gray-600';
    }
  };

  // Sample default metrics if none provided
  const defaultMetrics: CanvasMetric[] = [
    {
      id: 'total-liquidity',
      name: 'Total Available Liquidity',
      value: 875000,
      format: 'currency',
      trend: 'up',
      icon: '💰'
    },
    {
      id: 'monthly-cashflow',
      name: 'Monthly Cash Flow',
      value: 45000,
      format: 'currency',
      trend: 'stable',
      icon: '📈'
    },
    {
      id: 'portfolio-ltv',
      name: 'Portfolio LTV',
      value: 0.52,
      format: 'percentage',
      trend: 'down',
      icon: '🏦'
    },
    {
      id: 'automation-rules',
      name: 'Active Rules',
      value: 3,
      format: 'number',
      trend: 'stable',
      icon: '⚡'
    }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className={`bg-white border-b border-gray-200 transition-all duration-300 ${isExpanded ? 'pb-6' : ''}`}>
      {/* Main metrics bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Metrics display */}
          <div className="flex items-center space-x-8">
            {displayMetrics.slice(0, 4).map((metric) => (
              <div key={metric.id} className="flex items-center space-x-3">
                <div className="text-lg">{metric.icon}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-montserrat text-lg font-bold ${getTrendColor(metric.trend)}`}>
                      {formatValue(metric.value, metric.format)}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <p className="font-montserrat text-xs text-gray-500 uppercase tracking-wide">
                    {metric.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Expand/collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-montserrat text-sm">
              {isExpanded ? 'Less' : 'More'} Metrics
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded metrics panel */}
      {isExpanded && (
        <div className="px-6 border-t border-gray-100">
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Canvas Analytics
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of all metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {displayMetrics.map((metric) => (
                <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{metric.icon}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className={`font-montserrat text-xl font-bold ${getTrendColor(metric.trend)} mb-1`}>
                    {formatValue(metric.value, metric.format)}
                  </div>
                  <p className="font-montserrat text-xs text-gray-600">
                    {metric.name}
                  </p>
                </div>
              ))}

              {/* Add new metric button */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
                <Plus className="w-6 h-6 text-gray-400 mb-2" />
                <p className="font-montserrat text-xs text-gray-500 text-center">
                  Add Custom Metric
                </p>
              </div>
            </div>

            {/* Metric insights */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-montserrat text-sm font-semibold text-blue-900 mb-2">
                📊 Canvas Insights
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="text-blue-800">
                  • <strong>Liquidity Status:</strong> Healthy with $875K available across all blocks
                </div>
                <div className="text-blue-800">
                  • <strong>Automation:</strong> 3 active rules monitoring thresholds and payments
                </div>
                <div className="text-blue-800">
                  • <strong>Risk Level:</strong> Low with 52% LTV on collateralized credit
                </div>
                <div className="text-blue-800">
                  • <strong>Cash Flow:</strong> Stable monthly flow with positive trend
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};