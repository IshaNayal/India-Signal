import { useState } from 'react';
import { ChevronRight, ChevronDown, AlertTriangle, TrendingUp, TrendingDown, Zap, Globe, DollarSign, Shield, Cpu } from 'lucide-react';
import { CAUSE_EFFECT_CHAINS } from '../data/mockData';
import type { CauseEffectNode, Sector } from '../types';

const SECTOR_COLORS: Record<Sector, string> = {
  economy: '#D97706',
  defense: '#DC2626',
  trade: '#CA8A04',
  energy: '#EA580C',
  diplomacy: '#2563EB',
  technology: '#7C3AED',
};

const SECTOR_ICONS: Record<Sector, React.ReactNode> = {
  economy: <DollarSign size={13} />,
  defense: <Shield size={13} />,
  trade: <TrendingUp size={13} />,
  energy: <Zap size={13} />,
  diplomacy: <Globe size={13} />,
  technology: <Cpu size={13} />,
};

export function CauseEffectFlow() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['chain1', 'chain2']));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId);
    else newExpanded.add(nodeId);
    setExpandedNodes(newExpanded);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-danger" />
          <h2 className="text-lg font-semibold text-text-primary">Cause-Effect Chain</h2>
        </div>
        <span className="text-xs text-text-muted">Click to expand</span>
      </div>
      <div className="space-y-1.5">
        {CAUSE_EFFECT_CHAINS.map((chain) => (
          <CauseEffectNodeComponent key={chain.id} node={chain} depth={0} expandedNodes={expandedNodes} onToggle={toggleNode} />
        ))}
      </div>
    </div>
  );
}

function CauseEffectNodeComponent({ node, depth, expandedNodes, onToggle }: {
  node: CauseEffectNode; depth: number; expandedNodes: Set<string>; onToggle: (id: string) => void;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSector = node.type === 'sector';
  const isCause = node.type === 'cause';

  const getNodeStyle = () => {
    if (isCause) return 'border-danger/30 bg-danger/5';
    if (isSector && node.sector) return 'border-l-4 bg-bg-elevated';
    return 'border-warning/30 bg-bg-elevated';
  };

  return (
    <div>
      <div
        className={`p-2.5 rounded-md border ${getNodeStyle()} ${hasChildren ? 'cursor-pointer hover:bg-bg-hover' : ''} transition-colors`}
        style={{ marginLeft: depth * 16 }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />
          ) : <span className="w-3.5" />}
          {isSector && node.sector && <span style={{ color: SECTOR_COLORS[node.sector] }}>{SECTOR_ICONS[node.sector]}</span>}
          {isCause && <AlertTriangle size={13} className="text-danger" />}
          {!isSector && !isCause && <TrendingDown size={13} className="text-warning" />}
          <span className="text-sm text-text-primary flex-1">{node.title}</span>
          <span className={`text-xs font-mono font-semibold ${node.impact >= 8 ? 'text-danger' : node.impact >= 5 ? 'text-warning' : 'text-success'}`}>
            {node.impact}/10
          </span>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="relative mt-1">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" style={{ marginLeft: depth * 16 + 7 }} />
          {node.children.map((child) => (
            <CauseEffectNodeComponent key={child.id} node={child} depth={depth + 1} expandedNodes={expandedNodes} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ImpactChainSummary() {
  const chain1 = CAUSE_EFFECT_CHAINS[0];
  const chain2 = CAUSE_EFFECT_CHAINS[1];

  const flattenChain = (node: CauseEffectNode, sectorImpacts: Map<Sector, number[]>): Map<Sector, number[]> => {
    if (node.type === 'sector' && node.sector) {
      const existing = sectorImpacts.get(node.sector) || [];
      sectorImpacts.set(node.sector, [...existing, node.impact]);
    }
    node.children.forEach(child => flattenChain(child, sectorImpacts));
    return sectorImpacts;
  };

  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const tradeImpacts = flattenChain(chain1, new Map());
  const defenseImpacts = flattenChain(chain2, new Map());

  const sectors = [
    { sector: 'trade' as Sector, total: avg(tradeImpacts.get('trade') || [0]) + avg(tradeImpacts.get('economy') || [0]) },
    { sector: 'energy' as Sector, total: avg(tradeImpacts.get('energy') || [0]) },
    { sector: 'economy' as Sector, total: avg(tradeImpacts.get('economy') || [0]) },
    { sector: 'defense' as Sector, total: avg(defenseImpacts.get('defense') || [0]) },
    { sector: 'diplomacy' as Sector, total: avg(defenseImpacts.get('diplomacy') || [0]) },
  ];

  return (
    <div>
      <p className="section-label mb-3">Sector Impact Summary</p>
      <div className="space-y-3">
        {sectors.sort((a, b) => b.total - a.total).map((s) => (
          <div key={s.sector} className="flex items-center gap-3">
            <span style={{ color: SECTOR_COLORS[s.sector] }} className="w-5 shrink-0">{SECTOR_ICONS[s.sector]}</span>
            <span className="text-sm text-text-primary capitalize w-20">{s.sector}</span>
            <div className="flex-1 h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s.total * 10}%`, backgroundColor: SECTOR_COLORS[s.sector] }} />
            </div>
            <span className={`text-sm font-mono font-semibold w-6 text-right ${s.total >= 7 ? 'text-danger' : s.total >= 4 ? 'text-warning' : 'text-success'}`}>
              {s.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
