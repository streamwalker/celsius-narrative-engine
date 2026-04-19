
import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, CartesianGrid } from 'recharts';
import type { Scene } from '@/lib/narrative/types';

interface SeasonTensionChartProps {
  scenes: Scene[];
  totalEpisodes: number;
  activeEpisode: number;
  onEpisodeClick: (ep: number) => void;
}

const SeasonTensionChart = ({ scenes, totalEpisodes, activeEpisode, onEpisodeClick }: SeasonTensionChartProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const chartData = useMemo(() => {
    return Array.from({ length: totalEpisodes }, (_, i) => {
      const ep = i + 1;
      const epScenes = scenes.filter(s => s.episode === ep);
      const avgTension = epScenes.length > 0
        ? Math.round(epScenes.reduce((sum, s) => sum + (s.energyLevel || 0), 0) / epScenes.length)
        : null;
      const peakTension = epScenes.length > 0
        ? Math.max(...epScenes.map(s => s.energyLevel || 0))
        : null;
      const lowTension = epScenes.length > 0
        ? Math.min(...epScenes.map(s => s.energyLevel || 0))
        : null;
      return {
        episode: `Ep ${ep}`,
        episodeNum: ep,
        avg: avgTension,
        peak: peakTension,
        low: lowTension,
        scenes: epScenes.length,
      };
    });
  }, [scenes, totalEpisodes]);

  const hasData = chartData.some(d => d.avg !== null);
  if (!hasData) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground">
            Season Tension Arc
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-border bg-muted/5 p-3">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 4, left: -20 }}
              onClick={(e) => {
                if (e?.activePayload?.[0]?.payload?.episodeNum) {
                  onEpisodeClick(e.activePayload[0].payload.episodeNum);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="episode"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: any, name: any) => {
                  if (value === null) return ['—', name];
                  const label = name === 'avg' ? 'Avg Tension' : name === 'peak' ? 'Peak' : 'Low';
                  return [`${value}°C`, label];
                }}
                labelFormatter={(label) => label}
              />
              {/* Reference line for active episode */}
              <ReferenceLine
                x={`Ep ${activeEpisode}`}
                stroke="hsl(var(--primary))"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              {/* Peak tension area */}
              <Line
                type="monotone"
                dataKey="peak"
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls
              />
              {/* Low tension */}
              <Line
                type="monotone"
                dataKey="low"
                stroke="#60a5fa"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls
              />
              {/* Average tension - main line */}
              <Line
                type="monotone"
                dataKey="avg"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.avg === null) return <></>;
                  const isActive = payload.episodeNum === activeEpisode;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? 5 : 3}
                      fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--card))'}
                      stroke="hsl(var(--primary))"
                      strokeWidth={isActive ? 2.5 : 1.5}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                }}
                connectNulls
                activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-1 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-primary rounded inline-block" /> Avg Tension
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-500 rounded inline-block opacity-60" style={{ borderTop: '1px dashed' }} /> Peak
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-blue-400 rounded inline-block opacity-60" style={{ borderTop: '1px dashed' }} /> Low
            </span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SeasonTensionChart;
