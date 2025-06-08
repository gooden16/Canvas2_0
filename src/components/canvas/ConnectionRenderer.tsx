// src/components/canvas/ConnectionRenderer.tsx

import React from 'react';
import { BlockConnection, CanvasBlock, AutomationRule } from '../../types/canvas';
import { SpatialLayoutEngine, Position } from '../../lib/spatialLayoutEngine';

interface ConnectionRendererProps {
  connections: BlockConnection[];
  blocks: CanvasBlock[];
  automationRules: AutomationRule[];
  engine: SpatialLayoutEngine;
}

interface BlockBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

interface ConnectionPoint {
  position: Position;
  side: 'left' | 'right' | 'top' | 'bottom';
}

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connections,
  blocks,
  automationRules,
  engine
}) => {
  const BLOCK_WIDTH = 200;
  const BLOCK_HEIGHT = 80;
  const CONNECTION_PORT_SIZE = 8;

  const getBlockBounds = (block: CanvasBlock): BlockBounds => {
    return {
      left: block.position.x,
      right: block.position.x + BLOCK_WIDTH,
      top: block.position.y,
      bottom: block.position.y + BLOCK_HEIGHT,
      centerX: block.position.x + BLOCK_WIDTH / 2,
      centerY: block.position.y + BLOCK_HEIGHT / 2
    };
  };

  const getOptimalConnectionPoints = (fromBlock: CanvasBlock, toBlock: CanvasBlock): {
    from: ConnectionPoint;
    to: ConnectionPoint;
  } => {
    const fromBounds = getBlockBounds(fromBlock);
    const toBounds = getBlockBounds(toBlock);

    // Calculate the distance between block centers
    const deltaX = toBounds.centerX - fromBounds.centerX;
    const deltaY = toBounds.centerY - fromBounds.centerY;

    let fromSide: 'left' | 'right' | 'top' | 'bottom';
    let toSide: 'left' | 'right' | 'top' | 'bottom';

    // Determine optimal connection sides based on relative positions
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal connection is preferred
      if (deltaX > 0) {
        // toBlock is to the right of fromBlock
        fromSide = 'right';
        toSide = 'left';
      } else {
        // toBlock is to the left of fromBlock
        fromSide = 'left';
        toSide = 'right';
      }
    } else {
      // Vertical connection is preferred
      if (deltaY > 0) {
        // toBlock is below fromBlock
        fromSide = 'bottom';
        toSide = 'top';
      } else {
        // toBlock is above fromBlock
        fromSide = 'top';
        toSide = 'bottom';
      }
    }

    // Calculate exact connection points on the edges
    const fromPoint = getEdgePoint(fromBounds, fromSide, toBounds.centerX, toBounds.centerY);
    const toPoint = getEdgePoint(toBounds, toSide, fromBounds.centerX, fromBounds.centerY);

    return {
      from: { position: fromPoint, side: fromSide },
      to: { position: toPoint, side: toSide }
    };
  };

  const getEdgePoint = (bounds: BlockBounds, side: 'left' | 'right' | 'top' | 'bottom', targetX: number, targetY: number): Position => {
    switch (side) {
      case 'left':
        return {
          x: bounds.left,
          y: Math.max(bounds.top + 10, Math.min(bounds.bottom - 10, targetY))
        };
      case 'right':
        return {
          x: bounds.right,
          y: Math.max(bounds.top + 10, Math.min(bounds.bottom - 10, targetY))
        };
      case 'top':
        return {
          x: Math.max(bounds.left + 10, Math.min(bounds.right - 10, targetX)),
          y: bounds.top
        };
      case 'bottom':
        return {
          x: Math.max(bounds.left + 10, Math.min(bounds.right - 10, targetX)),
          y: bounds.bottom
        };
    }
  };

  const createCurvedPath = (from: ConnectionPoint, to: ConnectionPoint): string => {
    const startX = from.position.x;
    const startY = from.position.y;
    const endX = to.position.x;
    const endY = to.position.y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate control points for smooth curves
    const curveFactor = Math.min(distance * 0.4, 120); // Adaptive curve based on distance

    let cp1X = startX;
    let cp1Y = startY;
    let cp2X = endX;
    let cp2Y = endY;

    // Adjust control points based on connection sides
    switch (from.side) {
      case 'right':
        cp1X = startX + curveFactor;
        break;
      case 'left':
        cp1X = startX - curveFactor;
        break;
      case 'bottom':
        cp1Y = startY + curveFactor;
        break;
      case 'top':
        cp1Y = startY - curveFactor;
        break;
    }

    switch (to.side) {
      case 'right':
        cp2X = endX + curveFactor;
        break;
      case 'left':
        cp2X = endX - curveFactor;
        break;
      case 'bottom':
        cp2Y = endY + curveFactor;
        break;
      case 'top':
        cp2Y = endY - curveFactor;
        break;
    }

    return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  };

  const getConnectionStyle = (connection: BlockConnection, automationRule?: AutomationRule) => {
    const isActive = automationRule?.active ?? false;
    const connectionType = automationRule?.type ?? 'custom';
    
    const styles = {
      replenishment: {
        stroke: isActive ? '#10b981' : '#6b7280',
        strokeWidth: '3',
        strokeDasharray: isActive ? '0' : '8,4',
        filter: isActive ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' : 'none'
      },
      payment: {
        stroke: isActive ? '#3b82f6' : '#6b7280',
        strokeWidth: '3',
        strokeDasharray: isActive ? '0' : '8,4',
        filter: isActive ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))' : 'none'
      },
      threshold: {
        stroke: isActive ? '#f59e0b' : '#6b7280',
        strokeWidth: '2',
        strokeDasharray: isActive ? '12,4' : '8,4',
        filter: isActive ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))' : 'none'
      },
      custom: {
        stroke: isActive ? '#8b5cf6' : '#6b7280',
        strokeWidth: '2',
        strokeDasharray: isActive ? '0' : '6,3',
        filter: isActive ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))' : 'none'
      }
    };

    return styles[connectionType as keyof typeof styles] || styles.custom;
  };

  const renderConnectionPorts = (connectionPoint: ConnectionPoint, color: string, id: string) => {
    const { position, side } = connectionPoint;
    
    return (
      <circle
        cx={position.x}
        cy={position.y}
        r={CONNECTION_PORT_SIZE / 2}
        fill={color}
        stroke="white"
        strokeWidth="2"
        className="connection-port"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
        }}
      />
    );
  };

  const renderFlowAnimation = (pathData: string, automationRule?: AutomationRule) => {
    if (!automationRule?.active) return null;

    const connectionType = automationRule.type;
    const colors = {
      replenishment: '#10b981',
      payment: '#3b82f6',
      threshold: '#f59e0b',
      custom: '#8b5cf6'
    };

    const color = colors[connectionType as keyof typeof colors] || colors.custom;

    return (
      <>
        {/* Main flow particle */}
        <circle r="4" fill={color} opacity="0.9">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={pathData}
          />
          <animate
            attributeName="opacity"
            values="0.9;0.4;0.9"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Secondary smaller particles for more dynamic effect */}
        <circle r="2" fill={color} opacity="0.6">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={pathData}
            begin="1s"
          />
        </circle>
      </>
    );
  };

  const renderConnectionLabel = (pathData: string, automationRule?: AutomationRule, pathId: string) => {
    if (!automationRule || !automationRule.active) return null;

    return (
      <g className="connection-label">
        {/* Background for better readability */}
        <text>
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            <tspan 
              fill="white" 
              stroke="white" 
              strokeWidth="4"
              fontSize="12"
              fontFamily="Montserrat"
              fontWeight="600"
            >
              {automationRule.name}
            </tspan>
          </textPath>
        </text>
        {/* Actual label text */}
        <text>
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            <tspan 
              fill="#374151" 
              fontSize="12"
              fontFamily="Montserrat"
              fontWeight="600"
            >
              {automationRule.name}
            </tspan>
          </textPath>
        </text>
      </g>
    );
  };

  return (
    <g className="connections-layer">
      <defs>
        {/* Define arrowhead markers for different connection types */}
        {['replenishment', 'payment', 'threshold', 'custom'].map(type => (
          <marker
            key={type}
            id={`arrowhead-${type}`}
            markerWidth="12"
            markerHeight="8"
            refX="11"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,8 L12,4 z"
              fill={type === 'replenishment' ? '#10b981' : 
                   type === 'payment' ? '#3b82f6' :
                   type === 'threshold' ? '#f59e0b' : '#8b5cf6'}
            />
          </marker>
        ))}
      </defs>

      {connections.map((connection) => {
        const fromBlock = blocks.find(b => b.id === connection.fromBlock);
        const toBlock = blocks.find(b => b.id === connection.toBlock);
        const automationRule = automationRules.find(rule => rule.id === connection.automationRule?.id);
        
        if (!fromBlock || !toBlock) return null;

        const { from, to } = getOptimalConnectionPoints(fromBlock, toBlock);
        const pathData = createCurvedPath(from, to);
        const style = getConnectionStyle(connection, automationRule);
        const pathId = `connection-path-${connection.id}`;
        const connectionType = automationRule?.type || 'custom';

        return (
          <g key={connection.id} className="connection-group">
            {/* Define the path for reuse */}
            <defs>
              <path id={pathId} d={pathData} />
            </defs>
            
            {/* Main connection line */}
            <path
              d={pathData}
              fill="none"
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              strokeDasharray={style.strokeDasharray}
              style={{ filter: style.filter }}
              className="connection-line transition-all duration-300"
              markerEnd={`url(#arrowhead-${connectionType})`}
            />

            {/* Connection ports */}
            {renderConnectionPorts(from, style.stroke, `from-${connection.id}`)}
            {renderConnectionPorts(to, style.stroke, `to-${connection.id}`)}

            {/* Connection label */}
            {renderConnectionLabel(pathData, automationRule, pathId)}

            {/* Flow animation */}
            {renderFlowAnimation(pathData, automationRule)}

            {/* Invisible hover area for interaction */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              className="connection-hover-area cursor-pointer opacity-0 hover:opacity-20 hover:stroke-blue-300"
              onClick={() => console.log('Connection clicked:', connection)}
              title={automationRule?.name || 'Connection'}
            />
          </g>
        );
      })}
    </g>
  );
};