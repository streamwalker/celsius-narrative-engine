interface PatentDiagramProps {
  diagramId: string;
}

const diagrams: Record<string, { boxes: { label: string; x: number; y: number; w: number }[]; arrows: { from: number; to: number }[] }> = {
  'core-system': {
    boxes: [
      { label: 'Narrative\nInput', x: 10, y: 30, w: 80 },
      { label: 'Tri-Axis\nParser', x: 120, y: 30, w: 90 },
      { label: 'A-AXIS\nState Machine', x: 240, y: 5, w: 100 },
      { label: 'B-AXIS\nState Machine', x: 240, y: 40, w: 100 },
      { label: 'C-AXIS\nState Machine', x: 240, y: 75, w: 100 },
      { label: 'Diagnostic\nEngine', x: 370, y: 15, w: 90 },
      { label: 'Metrics\nComputation', x: 370, y: 60, w: 90 },
      { label: 'Medium-Aware\nCalibration', x: 490, y: 5, w: 100 },
      { label: 'Script Parse\n+ Consistency', x: 490, y: 45, w: 100 },
      { label: 'Structured\nOutput', x: 490, y: 85, w: 100 },
    ],
    arrows: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
      { from: 2, to: 6 },
      { from: 3, to: 6 },
      { from: 4, to: 6 },
      { from: 5, to: 7 },
      { from: 6, to: 8 },
      { from: 5, to: 9 },
      { from: 6, to: 9 },
    ],
  },
  'interface-transformation': {
    boxes: [
      { label: 'Source\nData', x: 10, y: 30, w: 80 },
      { label: 'Mapping\nLayer', x: 120, y: 30, w: 90 },
      { label: 'Field\nTransform', x: 240, y: 30, w: 90 },
      { label: 'Timeline\nRenderer', x: 370, y: 5, w: 100 },
      { label: 'Target\nModule', x: 370, y: 40, w: 100 },
      { label: 'Comparison\nRenderer', x: 370, y: 75, w: 100 },
      { label: 'Bidirectional\nSync', x: 500, y: 5, w: 90 },
      { label: 'Storage\nShuttle', x: 500, y: 40, w: 90 },
      { label: 'Diff\nEngine', x: 500, y: 75, w: 90 },
    ],
    arrows: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 6 },
      { from: 4, to: 7 },
      { from: 5, to: 8 },
    ],
  },
};

export function PatentDiagram({ diagramId }: PatentDiagramProps) {
  const diagram = diagrams[diagramId];
  if (!diagram) return null;

  const getCenter = (box: { x: number; y: number; w: number }) => ({
    cx: box.x + box.w / 2,
    cy: box.y + 20,
  });

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 610 120" className="w-full max-w-3xl h-auto min-w-[400px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id={`arrow-${diagramId}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="hsl(var(--primary))" />
          </marker>
        </defs>
        {diagram.arrows.map((arrow, i) => {
          const from = getCenter(diagram.boxes[arrow.from]);
          const to = diagram.boxes[arrow.to];
          return (
            <line
              key={i}
              x1={from.cx + diagram.boxes[arrow.from].w / 2}
              y1={from.cy}
              x2={to.x}
              y2={to.y + 20}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              markerEnd={`url(#arrow-${diagramId})`}
              opacity={0.6}
            />
          );
        })}
        {diagram.boxes.map((box, i) => (
          <g key={i}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={40}
              rx={6}
              fill="hsl(var(--secondary))"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            {box.label.split('\n').map((line, li) => (
              <text
                key={li}
                x={box.x + box.w / 2}
                y={box.y + 18 + li * 13}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize="8"
                fontFamily="monospace"
              >
                {line}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
