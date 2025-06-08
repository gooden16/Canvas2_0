// FIXED: src/components/canvas/AutomationFlow.tsx
// This resolves the "Click the line → Automation Rule Editor opens" issue

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

  const createCurvedPath = (connectionData: any) => {
    const { start, end, sourceEdge, targetEdge } = connectionData;
    
    let cp1, cp2;
    const minDistance = 150;
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const controlDistance = Math.max(minDistance, distance * 0.4);
    
    if ((sourceEdge === 'right' && targetEdge === 'left') || (sourceEdge === 'left' && targetEdge === 'right')) {
      cp1 = {
        x: start.x + (sourceEdge === 'right' ? controlDistance : -controlDistance),
        y: start.y
      };
      cp2 = {
        x: end.x + (targetEdge === 'left' ? -controlDistance : controlDistance),
        y: end.y
      };
    } else {
      cp1 = {
        x: start.x + (sourceEdge === 'right' ? controlDistance : sourceEdge === 'left' ? -controlDistance : 0),
        y: start.y + (sourceEdge === 'bottom' ? controlDistance : sourceEdge === 'top' ? -controlDistance : 0)
      };
      
      cp2 = {
        x: end.x + (targetEdge === 'left' ? -controlDistance : targetEdge === 'right' ? controlDistance : 0),
        y: end.y + (targetEdge === 'top' ? -controlDistance : targetEdge === 'bottom' ? controlDistance : 0)
      };
    }
    
    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  };

  const getLineStyle = (connection: BlockConnection) => {
    const ruleType = connection.automationRule?.type;
    
    switch (ruleType) {
      case 'replenishment':
        return {
          stroke: '#4C6652',
          strokeWidth: 3,
          strokeDasharray: 'none',
          opacity: 0.9,
          markerId: 'arrowhead-green',
          glowColor: '#4C6652'
        };
      case 'payment':
        return {
          stroke: '#C27830',
          strokeWidth: 3,
          strokeDasharray: 'none',
          opacity: 0.9,
          markerId: 'arrowhead-orange',
          glowColor: '#C27830'
        };
      default:
        return {
          stroke: '#ADD8E6',
          strokeWidth: 2.5,
          strokeDasharray: 'none',
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
    
    connections.forEach((connection) => {
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
      glowPath.style.pointerEvents = 'none'; // Glow shouldn't interfere
      
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
      
      // CRITICAL FIX: Enable pointer events on the path
      path.style.pointerEvents = 'auto';
      path.style.cursor = 'pointer';
      
      // Add hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('stroke-width', (style.strokeWidth + 1).toString());
        path.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))';
      });
      
      path.addEventListener('mouseleave', () => {
        path.setAttribute('stroke-width', style.strokeWidth.toString());
        path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))';
      });

      // CRITICAL FIX: Add click handler with event handling
      path.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Connection clicked:', connection.id); // Debug log
        if (onConnectionClick) {
          onConnectionClick(connection.id);
        }
      });
      
      svgRef.current!.appendChild(path);

      // Create invisible interaction area for easier clicking
      const interactionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      interactionPath.setAttribute('d', pathData);
      interactionPath.setAttribute('stroke', 'transparent');
      interactionPath.setAttribute('stroke-width', '20'); // Wide click area
      interactionPath.setAttribute('fill', 'none');
      interactionPath.setAttribute('class', 'automation-interaction');
      
      // CRITICAL FIX: Enable pointer events on interaction area
      interactionPath.style.cursor = 'pointer';
      interactionPath.style.pointerEvents = 'auto';
      
      interactionPath.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Interaction area clicked:', connection.id); // Debug log
        if (onConnectionClick) {
          onConnectionClick(connection.id);
        }
      });

      svgRef.current!.appendChild(interactionPath);
      
      // Add enhanced label if automation rule exists
      if (connection.automationRule) {
        const pathElement = path;
        const pathLength = pathElement.getTotalLength();
        const labelPoint = pathElement.getPointAtLength(pathLength * 0.4);
        
        const midPoint = {
          x: labelPoint.x,
          y: labelPoint.y - 20
        };
        
        // Create label background
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('x', (midPoint.x - 40).toString());
        labelBg.setAttribute('y', (midPoint.y - 12).toString());
        labelBg.setAttribute('width', '80');
        labelBg.setAttribute('height', '20');
        labelBg.setAttribute('rx', '10');
        labelBg.setAttribute('fill', 'white');
        labelBg.setAttribute('stroke', style.stroke);
        labelBg.setAttribute('stroke-width', '1');
        labelBg.setAttribute('class', 'automation-label-bg');
        labelBg.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
        labelBg.style.pointerEvents = 'auto';
        labelBg.style.cursor = 'pointer';
        
        // Create label text
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.textContent = connection.automationRule.name;
        labelText.setAttribute('x', midPoint.x.toString());
        labelText.setAttribute('y', (midPoint.y - 2).toString());
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('class', 'automation-label');
        labelText.style.fontSize = '10px';
        labelText.style.fontWeight = 'bold';
        labelText.style.fill = style.stroke;
        labelText.style.pointerEvents = 'auto';
        labelText.style.cursor = 'pointer';
        
        // Add click handlers to label elements
        [labelBg, labelText].forEach(element => {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Label clicked:', connection.id); // Debug log
            if (onConnectionClick) {
              onConnectionClick(connection.id);
            }
          });
        });
        
        svgRef.current!.appendChild(labelBg);
        svgRef.current!.appendChild(labelText);
      }
    });
  };

  useEffect(() => {
    updateSVGSize();
    renderConnections();
    
    const handleResize = () => {
      updateSVGSize();
      renderConnections();
    };
    
    window.addEventListener('resize', handleResize);
    
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
      className="absolute inset-0 z-10"
      style={{ 
        width: '100%', 
        height: '100%',
        // CRITICAL FIX: Set pointer events to none on container, 
        // but enable them on individual elements
        pointerEvents: 'none'
      }}
    >
      <defs>
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
      </defs>
    </svg>
  );
};