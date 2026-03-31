import { AlertTriangle, TrendingUp, DollarSign, Zap, Globe2, Shield, Cpu } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { MOCK_COUNTRIES, MOCK_EVENTS } from '../data/mockData';
import type { ThreatLevel } from '../types';

interface SidebarProps {
  collapsed: boolean;
}

const THREAT_DOT: Record<ThreatLevel, string> = {
  CRITICAL: 'bg-danger',
  HIGH: 'bg-warning',
  MEDIUM: 'bg-info',
  LOW: 'bg-success',
};

const FILTER_ICONS: Record<string, React.ReactNode> = {
  conflict: <AlertTriangle size={13} />,
  trade: <TrendingUp size={13} />,
  diplomacy: <Globe2 size={13} />,
  energy: <Zap size={13} />,
  defense: <Shield size={13} />,
  technology: <Cpu size={13} />,
  economy: <DollarSign size={13} />,
  climate: <Zap size={13} />,
};

export function Sidebar({ collapsed }: SidebarProps) {
  const { eventTypeFilter, setEventTypeFilter, setSelectedEvent } = useDashboardStore();
  const liveEvents = MOCK_EVENTS.filter(e => e.isLive);

  if (collapsed) {
    return (
      <aside className="w-14 bg-bg-surface border-r border-border flex flex-col items-center py-4 gap-3 shrink-0">
        {MOCK_COUNTRIES.filter(c => c.threatLevel === 'CRITICAL' || c.threatLevel === 'HIGH').slice(0, 6).map((country) => (
          <div
            key={country.id}
            className="w-9 h-9 rounded-md bg-bg-elevated flex items-center justify-center cursor-pointer hover:bg-bg-hover transition-colors relative"
            title={country.name}
          >
            <span className="text-base">{country.flag}</span>
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${THREAT_DOT[country.threatLevel]} ring-2 ring-bg-surface`} />
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-56 bg-bg-surface border-r border-border flex flex-col shrink-0">
      {/* Watchlist */}
      <div className="p-4 border-b border-border">
        <p className="section-label mb-3">Watchlist</p>
        <div className="space-y-0.5">
          {MOCK_COUNTRIES.map((country) => (
            <div
              key={country.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-bg-elevated cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{country.flag}</span>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors truncate">
                  {country.name}
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 ${THREAT_DOT[country.threatLevel]}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border">
        <p className="section-label mb-3">Filters</p>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'conflict', 'trade', 'diplomacy', 'energy'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setEventTypeFilter(type)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${eventTypeFilter === type
                  ? 'bg-accent/10 text-accent'
                  : 'bg-bg-elevated text-text-muted hover:text-text-secondary'
                }
              `}
            >
              {type !== 'all' && FILTER_ICONS[type]}
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Live Alerts */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <p className="section-label">Live Alerts</p>
        </div>
        <div className="space-y-2">
          {liveEvents.slice(0, 5).map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="p-2.5 rounded-md bg-bg-elevated hover:bg-bg-hover cursor-pointer transition-colors"
            >
              <p className="text-sm text-text-primary line-clamp-2 leading-snug mb-1">{event.title}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-semibold ${
                  event.indiaImpactScore > 6 ? 'text-danger' :
                  event.indiaImpactScore > 3 ? 'text-warning' : 'text-success'
                }`}>
                  {event.indiaImpactScore}/10
                </span>
                <span className="text-xs text-text-muted">{formatTimeAgo(event.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
