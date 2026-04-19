import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  CharacterRelationship,
  loadRelationships,
  RELATIONSHIP_COLORS,
  RELATIONSHIP_ICONS,
  RELATIONSHIP_LABELS
} from '@/lib/character-relationships';
import { loadGroups, CharacterGroup } from '@/lib/character-groups';
import { CharacterRelationshipEditor } from './character-relationship-editor';

interface Character {
  id: string;
  name: string;
  image?: string;
}

interface RelationshipGraphProps {
  characters: Character[];
  onNodeClick?: (characterId: string) => void;
  onRefresh?: () => void;
  className?: string;
  showGroups?: boolean;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  glowIntensity: number;
}

// Audio context for sound effects
let audioContext: AudioContext | null = null;

function playInteractionSound(type: 'hover' | 'click' | 'connect' | 'disconnect') {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different interactions
    switch (type) {
      case 'hover':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'connect':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'disconnect':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
    }
  } catch (e) {
    // Audio not supported, silently fail
  }
}

export function RelationshipGraph({ 
  characters, 
  onNodeClick,
  onRefresh,
  className = '',
  showGroups = true
}: RelationshipGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorCharacters, setEditorCharacters] = useState<{ source: Character; target: Character } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const relationships = useMemo(() => loadRelationships(), [onRefresh]);
  const groups = useMemo(() => showGroups ? loadGroups() : [], [showGroups, onRefresh]);

  // Get group for a character
  const getCharacterGroup = useCallback((charId: string): CharacterGroup | undefined => {
    return groups.find(g => g.characterIds.includes(charId));
  }, [groups]);

  // Measure container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 600, height: rect.height || 400 });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize positions with animation values
  useEffect(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
    
    const newPositions = characters.map((char, i) => {
      const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2;
      return {
        id: char.id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        scale: 1,
        glowIntensity: 0,
      };
    });
    
    setPositions(newPositions);
  }, [characters, dimensions]);

  // Force simulation with animation updates
  useEffect(() => {
    if (draggedNode) return;
    
    const interval = setInterval(() => {
      setPositions(prev => {
        const newPositions = prev.map(node => ({ ...node }));
        
        // Repulsion between nodes
        for (let i = 0; i < newPositions.length; i++) {
          for (let j = i + 1; j < newPositions.length; j++) {
            const dx = newPositions[j].x - newPositions[i].x;
            const dy = newPositions[j].y - newPositions[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1000 / (dist * dist);
            
            newPositions[i].vx -= (dx / dist) * force * 0.01;
            newPositions[i].vy -= (dy / dist) * force * 0.01;
            newPositions[j].vx += (dx / dist) * force * 0.01;
            newPositions[j].vy += (dy / dist) * force * 0.01;
          }
        }
        
        // Attraction to center
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        
        for (const node of newPositions) {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * 0.001;
          node.vy += dy * 0.001;
          
          // Apply velocity with damping
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.9;
          node.vy *= 0.9;
          
          // Keep in bounds
          node.x = Math.max(40, Math.min(dimensions.width - 40, node.x));
          node.y = Math.max(40, Math.min(dimensions.height - 40, node.y));

          // Animate scale and glow
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;
          const targetScale = isHovered ? 1.15 : isSelected ? 1.1 : 1;
          const targetGlow = isHovered || isSelected ? 1 : 0;
          
          node.scale += (targetScale - node.scale) * 0.2;
          node.glowIntensity += (targetGlow - node.glowIntensity) * 0.2;
        }
        
        return newPositions;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [draggedNode, dimensions, hoveredNode, selectedNode]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDraggedNode(nodeId);
    if (soundEnabled) playInteractionSound('click');
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPositions(prev => prev.map(node => 
      node.id === draggedNode 
        ? { ...node, x, y, vx: 0, vy: 0 }
        : node
    ));
  }, [draggedNode]);

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleNodeHover = (charId: string | null) => {
    if (charId !== hoveredNode) {
      setHoveredNode(charId);
      if (charId && soundEnabled) {
        playInteractionSound('hover');
      }
    }
  };

  const handleNodeClick = (charId: string) => {
    setSelectedNode(prev => prev === charId ? null : charId);
    if (soundEnabled) playInteractionSound('click');
    if (onNodeClick) {
      onNodeClick(charId);
    }
  };

  const handleEdgeClick = (rel: CharacterRelationship) => {
    const source = characters.find(c => c.id === rel.sourceId);
    const target = characters.find(c => c.id === rel.targetId);
    if (source && target) {
      if (soundEnabled) playInteractionSound('connect');
      setEditorCharacters({ source, target });
      setEditorOpen(true);
    }
  };

  const getNodePosition = (id: string) => {
    return positions.find(p => p.id === id) || { x: 0, y: 0, scale: 1, glowIntensity: 0 };
  };

  // Filter relationships to only show those between visible characters
  const visibleRelationships = relationships.filter(rel => 
    characters.some(c => c.id === rel.sourceId) && 
    characters.some(c => c.id === rel.targetId)
  );

  const nodeRadius = 28;

  return (
    <>
      <div 
        ref={containerRef}
        className={`relative bg-muted/20 rounded-lg border overflow-hidden ${className}`}
        style={{ minHeight: 400 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Sound toggle */}
        <button
          className={`absolute top-2 left-2 z-10 p-2 rounded-lg text-xs transition-colors ${
            soundEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          }`}
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
        >
          {/* Defs for filters and gradients */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Animated gradient for edges */}
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8">
                <animate attributeName="offset" values="0;1;0" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.2">
                <animate attributeName="offset" values="0.5;1.5;0.5" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Group color backgrounds */}
            {groups.map(group => (
              <radialGradient key={group.id} id={`group-${group.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={group.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={group.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Group backgrounds */}
          {showGroups && groups.map(group => {
            const groupChars = characters.filter(c => group.characterIds.includes(c.id));
            if (groupChars.length < 2) return null;

            const groupPositions = groupChars.map(c => getNodePosition(c.id));
            const centerX = groupPositions.reduce((sum, p) => sum + p.x, 0) / groupPositions.length;
            const centerY = groupPositions.reduce((sum, p) => sum + p.y, 0) / groupPositions.length;
            const maxDist = Math.max(...groupPositions.map(p => 
              Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
            )) + 60;

            return (
              <circle
                key={group.id}
                cx={centerX}
                cy={centerY}
                r={maxDist}
                fill={`url(#group-${group.id})`}
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
              />
            );
          })}

          {/* Edges with animations */}
          {visibleRelationships.map(rel => {
            const source = getNodePosition(rel.sourceId);
            const target = getNodePosition(rel.targetId);
            const color = RELATIONSHIP_COLORS[rel.type];
            const isHovered = hoveredEdge === rel.id;
            const strokeWidth = (1 + (rel.strength / 5)) * (isHovered ? 1.5 : 1);
            
            // Calculate midpoint for label
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            
            return (
              <g key={rel.id}>
                {/* Glow effect on hover */}
                {isHovered && (
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={color}
                    strokeWidth={strokeWidth + 4}
                    strokeOpacity={0.3}
                    filter="url(#glow)"
                  />
                )}
                
                {/* Main edge line */}
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={isHovered ? 1 : 0.6}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredEdge(rel.id)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => handleEdgeClick(rel)}
                >
                  {/* Animate dash for hovered edges */}
                  {isHovered && (
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,1000;1000,0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  )}
                </line>
                
                {/* Edge label with animation */}
                <g 
                  className={`transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-70'}`}
                  style={{ transform: isHovered ? 'scale(1.2)' : 'scale(1)', transformOrigin: `${midX}px ${midY}px` }}
                >
                  <circle
                    cx={midX}
                    cy={midY}
                    r={12}
                    fill="var(--background)"
                    stroke={color}
                    strokeWidth={1}
                    className={isHovered ? 'opacity-100' : 'opacity-0'}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="text-sm pointer-events-none select-none"
                    style={{ fontSize: isHovered ? '14px' : '12px' }}
                  >
                    {RELATIONSHIP_ICONS[rel.type]}
                  </text>
                </g>
              </g>
            );
          })}
          
          {/* Nodes with enhanced animations */}
          {characters.map(char => {
            const pos = getNodePosition(char.id);
            const isDragging = draggedNode === char.id;
            const isHovered = hoveredNode === char.id;
            const isSelected = selectedNode === char.id;
            const group = getCharacterGroup(char.id);
            
            return (
              <g
                key={char.id}
                transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale})`}
                className="cursor-pointer"
                onMouseDown={(e) => handleMouseDown(e, char.id)}
                onMouseEnter={() => handleNodeHover(char.id)}
                onMouseLeave={() => handleNodeHover(null)}
                onClick={() => handleNodeClick(char.id)}
                style={{ 
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                {/* Glow effect */}
                {pos.glowIntensity > 0.1 && (
                  <circle
                    r={nodeRadius + 8}
                    fill={group?.color || 'var(--primary)'}
                    opacity={pos.glowIntensity * 0.4}
                    filter="url(#glow)"
                  />
                )}
                
                {/* Group indicator ring */}
                {group && (
                  <circle
                    r={nodeRadius + 4}
                    fill="none"
                    stroke={group.color}
                    strokeWidth={3}
                    opacity={0.6}
                    strokeDasharray={isSelected ? '8 4' : 'none'}
                  >
                    {isSelected && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                )}
                
                {/* Main node circle */}
                <circle
                  r={nodeRadius}
                  className="fill-background"
                  stroke={isSelected ? 'var(--primary)' : 'var(--border)'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                
                {/* Clip path for image */}
                <clipPath id={`clip-${char.id}`}>
                  <circle r={nodeRadius - 2} />
                </clipPath>
                
                {/* Character image or initial */}
                {char.image ? (
                  <image
                    href={char.image}
                    x={-(nodeRadius - 2)}
                    y={-(nodeRadius - 2)}
                    width={(nodeRadius - 2) * 2}
                    height={(nodeRadius - 2) * 2}
                    clipPath={`url(#clip-${char.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-lg font-medium fill-foreground pointer-events-none select-none"
                  >
                    {char.name.charAt(0).toUpperCase()}
                  </text>
                )}
                
                {/* Pulse animation on hover */}
                {isHovered && (
                  <circle
                    r={nodeRadius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    opacity={0.5}
                  >
                    <animate
                      attributeName="r"
                      from={nodeRadius}
                      to={nodeRadius + 15}
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="0.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                
                {/* Name label */}
                <text
                  y={nodeRadius + 14}
                  textAnchor="middle"
                  className="text-xs fill-foreground pointer-events-none select-none font-medium"
                >
                  {char.name.length > 12 ? char.name.slice(0, 10) + '...' : char.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs">
          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {(Object.entries(RELATIONSHIP_LABELS) as [string, string][]).slice(0, 6).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: RELATIONSHIP_COLORS[type as keyof typeof RELATIONSHIP_COLORS] }}
                />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {characters.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No characters to display
          </div>
        )}
        
        {characters.length > 0 && visibleRelationships.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            <div className="text-center">
              <p>No relationships defined yet</p>
              <p className="text-xs mt-1">Click on a character to add relationships</p>
            </div>
          </div>
        )}
      </div>

      {/* Relationship Editor */}
      {editorCharacters && (
        <CharacterRelationshipEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          sourceCharacter={editorCharacters.source}
          targetCharacter={editorCharacters.target}
          onUpdate={onRefresh}
        />
      )}
    </>
  );
}
