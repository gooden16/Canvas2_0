import React, { useEffect, useRef } from 'react';
import { BlockConnection, CanvasBlock } from '../../types/canvas';

interface AutomationFlowProps {
  connections: BlockConnection[];
  blocks: CanvasBlock[];
  containerRef: React.RefObject<HTMLDivElement>;
  onConnectionClick?: (connectionId: string) => void;
}

export const AutomationFlow: React.FC<AutomationFlowProps> = ({ 
  connections, 
  blocks, 
  containerRef, 
  onConnectionClick 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const getOptimalConnectionPoints = (fromBlockId: string, toBlockId: string) => {
    if (!containerRef.current) return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, sourceEdge: 'right', targetEdge: 'left' };
    
    const fromElement = containerRef.current.querySelector(`[data-block-id="${fromBlockId}"]`);
    const toElement = containerRef.current.querySelector(`[data-block-id="${toBlockId}"]`);
    
    if (!fromElement || !toElement) return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, sourceEdge: 'right', targetEdge: 'left' };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    
    // Calculate all possible connection points for each block
    const sourcePoints = {
      right: { x: fromRect.right - containerRect.left, y: fromRect.top + fromRect.height/2 - containerRect.top },
      left: { x: fromRect.left - containerRect.left, y: fromRect.top + fromRect.height/2 - containerRect.top },
      top: { x: fromRect.left + fromRect.width/2 - containerRect.left, y: fromRect.top - containerRect.top },
      bottom: { x: fromRect.left + fromRect.width/2 - containerRect.left, y: fromRect.bottom - containerRect.top }
    };
    
    const targetPoints = {
      right: { x: toRect.right - containerRect.left, y: toRect.top + toRect.height/2 - containerRect.top },
      left: { x: toRect.left - containerRect.left, y: toRect.top + toRect.height/2 - containerRect.top },
      top: { x: toRect.left + toRect.width/2 - containerRect.left, y: toRect.top - containerRect.top },
      bottom: { x: toRect.left + toRect.width/2 - containerRect.left, y: toRect.bottom - containerRect.top }
    };
    
    // Find shortest distance between any two connection points
    let shortestDistance = Infinity;
    let bestConnection = null;
    
    Object.entries(sourcePoints).forEach(([sourceEdge, sourcePoint]) => {
      Object.entries(targetPoints).forEach(([targetEdge, targetPoint]) => {
        const distance = Math.sqrt(
          Math.pow(targetPoint.x - sourcePoint.x, 2) + 
          Math.pow(targetPoint.y - sourcePoint.y, 2)
        );
        
        // Prefer horizontal connections (right to left) for better flow
        const isHorizontalFlow = sourceEdge === 'right' && targetEdge === 'left';
        const adjustedDistance = isHorizontalFlow ? distance * 0.8 : distance;
        
        if (adjustedDistance < shortestDistance) {
          shortestDistance = adjustedDistance;
          bestConnection = {
            start: sourcePoint,
            end: targetPoint,
            sourceEdge,
            targetEdge
          };
        }
      });
    });
    
    return bestConnection || { start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, sourceEdge: 'right', targetEdge: 'left' };
  };

  const createCurvedPath = (connection: any) => {
    const { start, end, sourceEdge, targetEdge } = connection;
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Calculate control points for smooth curve based on edge directions
    let cp1, cp2;
    
    if (sourceEdge === 'right' && targetEdge === 'left') {
      // Horizontal flow - classic case
      const controlDistance = Math.max(50, Math.abs(dx) * 0.4);
      cp1 = { x: start.x + controlDistance, y: start.y };
      cp2 = { x: end.x - controlDistance, y: end.y };
    } else if (sourceEdge === 'bottom' && targetEdge === 'top') {
      // Vertical flow
      const controlDistance = Math.max(50, Math.abs(dy) * 0.4);
      cp1 = { x: start.x, y: start.y + controlDistance };
      cp2 = { x: end.x, y: end.y - controlDistance };
    } else if (sourceEdge === 'right' && targetEdge === 'top') {
      // Right to top - L-shaped curve
      cp1 = { x: start.x + Math.abs(dx) * 0.6, y: start.y };
      cp2 = { x: end.x, y: end.y - Math.abs(dy) * 0.6 };
    } else if (sourceEdge === 'bottom' && targetEdge === 'left') {
      // Bottom to left - L-shaped curve
      cp1 = { x: start.x, y: start.y + Math.abs(dy) * 0.6 };
      cp2 = { x: end.x - Math.abs(dx) * 0.6, y: end.y };
    } else {
      // Mixed directions - use adaptive control points
      const controlDistance = Math.max(50, Math.min(150, Math.abs(dx) * 0.3, Math.abs(dy) * 0.3));
      
      cp1 = {
        x: start.x + (sourceEdge === 'right' ? controlDistance : sourceEdge === 'left' ? -controlDistance : 0),
        y: start.y + (sourceEdge === 'bottom' ? controlDistance : sourceEdge === 'top' ? -controlDistance : 0)
      };
      
      cp2 = {
        x: end.x + (targetEdge === 'left' ? -controlDistance : targetEdge === 'right' ? controlDistance : 0),
        y: end.y + (targetEdge === 'top' ? -controlDistance : targetEdge === 'bottom' ? controlDistance : 0)
      };
    }
    
    // Create smooth cubic bezier curve
    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  };

  const getLineStyle = (connection: BlockConnection) => {
    const ruleType = connection.automationRule?.type;
    
    switch (ruleType) {
      case 'replenishment':
        return {
          stroke: '#4C6652', // deep-olive for replenishment flows
          strokeWidth: 3,
          strokeDasharray: 'none', // Solid line for active flows
          opacity: 0.9,
          markerId: 'arrowhead-green',
          glowColor: '#4C6652'
        };
      case 'payment':
        return {
          stroke: '#C27830', // bronzed-orange for payment flows
          strokeWidth: 3,
          strokeDasharray: 'none', // Solid line for consistency
          opacity: 0.9,
          markerId: 'arrowhead-orange',
          glowColor: '#C27830'
        };
      default:
        return {
          stroke: '#ADD8E6', // light-blue for default flows
          strokeWidth: 2.5,
          strokeDasharray: 'none', // All lines solid for consistency
          opacity: 0.8,
          markerId: 'arrowhead-blue',
          glowColor: '#ADD8E6'
        };
    }
  };

  const updateSVGSize = () => {
    if (!containerRef.current || !svgRef.current) return;
    
    const container = containerRef.current;
    svgRef.current.setAttribute('width', container.scrollWidth.toString());
    svgRef.current.setAttribute('height', container.scrollHeight.toString());
  };

  const renderConnections = () => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Clear existing paths
    const existingPaths = svgRef.current.querySelectorAll('.automation-path, .automation-label, .automation-label-bg, .automation-interaction');
    existingPaths.forEach(path => path.remove());
    
    connections.forEach((connection, index) => {
      const connectionData = getOptimalConnectionPoints(connection.fromBlock, connection.toBlock);
      const pathData = createCurvedPath(connectionData);
      const style = getLineStyle(connection);
      
      // Create glow effect path (background)
      const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      glowPath.setAttribute('d', pathData);
      glowPath.setAttribute('stroke', style.glowColor);
      glowPath.setAttribute('stroke-width', (style.strokeWidth + 3).toString());
      glowPath.setAttribute('stroke-dasharray', style.strokeDasharray);
      glowPath.setAttribute('opacity', '0.2');
      glowPath.setAttribute('fill', 'none');
      glowPath.setAttribute('class', 'automation-path automation-glow');
      glowPath.setAttribute('stroke-linecap', 'round');
      glowPath.style.filter = 'blur(3px)';
      
      svgRef.current!.appendChild(glowPath);
      
      // Create main path element
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('stroke', style.stroke);
      path.setAttribute('stroke-width', style.strokeWidth.toString());
      path.setAttribute('stroke-dasharray', style.strokeDasharray);
      path.setAttribute('opacity', style.opacity.toString());
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', `url(#${style.markerId})`);
      path.setAttribute('class', 'automation-path automation-main');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))';
      path.style.transition = 'all 0.3s ease';
      
      // Add hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('stroke-width', (style.strokeWidth + 1).toString());
        path.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))';
        path.style.cursor = 'pointer';
      });
      
      path.addEventListener('mouseleave', () => {
        path.setAttribute('stroke-width', style.strokeWidth.toString());
        path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))';
      });

      // Add click handler for editing automation rules
      path.addEventListener('click', () => {
        if (onConnectionClick) {
          onConnectionClick(connection.id);
        }
      });
      
      // Add subtle flow animation
      if (connection.automationRule?.active) {
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'stroke-dashoffset');
        animate.setAttribute('values', '0;20;0');
        animate.setAttribute('dur', '4s');
        animate.setAttribute('repeatCount', 'indefinite');
        path.appendChild(animate);
      }
      
      svgRef.current!.appendChild(path);

      // Create invisible interaction area for easier clicking
      const interactionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      interactionPath.setAttribute('d', pathData);
      interactionPath.setAttribute('stroke', 'transparent');
      interactionPath.setAttribute('stroke-width', '20');
      interactionPath.setAttribute('fill', 'none');
      interactionPath.setAttribute('class', 'automation-interaction');
      interactionPath.style.cursor = 'pointer';
      
      interactionPath.addEventListener('click', () => {
        if (onConnectionClick) {
          onConnectionClick(connection.id);
        }
      });

      svgRef.current!.appendChild(interactionPath);
      
      // Add enhanced label if automation rule exists
      if (connection.automationRule) {
        // Calculate label position at 40% along the path for better placement
        const pathElement = path;
        const pathLength = pathElement.getTotalLength();
        const labelPoint = pathElement.getPointAtLength(pathLength * 0.4);
        
        const midPoint = {
          x: labelPoint.x,
          y: labelPoint.y - 20
        };
        
        // Create label text first to measure dimensions
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.textContent = connection.automationRule.name;
        labelText.setAttribute('x', midPoint.x.toString());
        labelText.setAttribute('y', midPoint.y.toString());
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('class', 'automation-label');
        labelText.style.fontSize = '11px';
        labelText.style.fontWeight = '600';
        labelText.style.fill = '#333333';
        labelText.style.fontFamily = 'Montserrat, sans-serif';
        labelText.style.pointerEvents = 'none';
        
        // Temporarily add to measure
        svgRef.current!.appendChild(labelText);
        const textBBox = labelText.getBBox();
        
        // Create enhanced background with cream color and border
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('x', (textBBox.x - 8).toString());
        labelBg.setAttribute('y', (textBBox.y - 4).toString());
        labelBg.setAttribute('width', (textBBox.width + 16).toString());
        labelBg.setAttribute('height', (textBBox.height + 8).toString());
        labelBg.setAttribute('rx', '6');
        labelBg.setAttribute('fill', '#F5F2E7');
        labelBg.setAttribute('stroke', style.stroke);
        labelBg.setAttribute('stroke-width', '1');
        labelBg.setAttribute('class', 'automation-label-bg');
        labelBg.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
        labelBg.style.transition = 'all 0.2s ease';
        labelBg.style.cursor = 'pointer';
        
        // Add hover effects to label
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'automation-label-group');
        labelGroup.style.cursor = 'pointer';
        
        const handleLabelHover = (isHover: boolean) => {
          if (isHover) {
            labelBg.setAttribute('fill', '#FFFFFF');
            labelBg.setAttribute('stroke-width', '2');
            labelText.style.fill = style.stroke;
            labelBg.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
            labelGroup.style.transform = 'scale(1.05)';
          } else {
            labelBg.setAttribute('fill', '#F5F2E7');
            labelBg.setAttribute('stroke-width', '1');
            labelText.style.fill = '#333333';
            labelBg.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
            labelGroup.style.transform = 'scale(1)';
          }
        };
        
        labelGroup.addEventListener('mouseenter', () => handleLabelHover(true));
        labelGroup.addEventListener('mouseleave', () => handleLabelHover(false));
        labelGroup.addEventListener('click', () => {
          if (onConnectionClick) {
            onConnectionClick(connection.id);
          }
        });
        
        // Remove the temporary text element
        svgRef.current!.removeChild(labelText);
        
        // Add background and text to group
        labelGroup.appendChild(labelBg);
        labelGroup.appendChild(labelText);
        
        svgRef.current!.appendChild(labelGroup);
      }
    });
  };

  useEffect(() => {
    updateSVGSize();
    renderConnections();
    
    // Re-render on window resize
    const handleResize = () => {
      updateSVGSize();
      renderConnections();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateSVGSize();
      renderConnections();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [connections, blocks]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* Enhanced arrow markers with better visibility and consistent styling */}
        <marker
          id="arrowhead-green"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M2,2 L2,10 L10,6 z"
            fill="#4C6652"
            stroke="#4C6652"
            strokeWidth="0.5"
          />
        </marker>
        
        <marker
          id="arrowhead-orange"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M2,2 L2,10 L10,6 z"
            fill="#C27830"
            stroke="#C27830"
            strokeWidth="0.5"
          />
        </marker>
        
        <marker
          id="arrowhead-blue"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M2,2 L2,10 L10,6 z"
            fill="#ADD8E6"
            stroke="#ADD8E6"
            strokeWidth="0.5"
          />
        </marker>

        {/* Enhanced gradient definitions for flow effects */}
        <linearGradient id="flow-gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4C6652" stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="#4C6652" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#4C6652" stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>

        <linearGradient id="flow-gradient-orange" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C27830" stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="#C27830" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#C27830" stopOpacity="0.3">
            <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};