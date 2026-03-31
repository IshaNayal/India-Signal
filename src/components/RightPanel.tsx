import { X, Activity } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { EventType } from '../types';

const TYPE_COLORS: Record<EventType, string> = {
  conflict: 'bg-danger',
  trade: 'bg-warning',
  diplomacy: 'bg-info',
  energy: 'bg-warning',
  technology: 'bg-[#8B5CF6]',
  climate: 'bg-success',
  defense: 'bg-danger',
};

export function RightPanel() {
  const { filteredEvents, setRightPanelOpen, setSelectedEvent } = useDashboardStore();

  return (
    <aside className="w-72 bg-bg-surface border-l border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          <span className="text-sm font-semibold text-text-primary">Live Feed</span>
          <span className="badge badge-neutral text-xs">{filteredEvents.length}</span>
        </div>
        <button onClick={() => setRightPanelOpen(false)} className="p-1 rounded hover:bg-bg-elevated transition-colors">
          <X size={14} className="text-text-muted" />
        </button>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredEvents.map((event, i) => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-bg-elevated ${
              i < filteredEvents.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${TYPE_COLORS[event.eventType]}`} />
              <div className="flex-1 min-w-0">
                {/* Headline */}
                <p className="text-sm text-text-primary font-medium leading-snug line-clamp-2">
                  {event.title}
                </p>
                {/* Metadata row */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-text-muted">{event.country}</span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted">{formatTimeAgo(event.timestamp)}</span>
                </div>
                {/* Impact */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-text-muted">Impact</span>
                  <span className={`text-xs font-mono font-bold ${
                    event.indiaImpactScore > 6 ? 'text-danger' :
                    event.indiaImpactScore > 3 ? 'text-warning' : 'text-success'
                  }`}>
                    {event.indiaImpactScore}/10
                  </span>
                  {event.isLive && (
                    <span className="badge badge-danger ml-auto">Live</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-text-muted">
            No events match filters
          </div>
        )}
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
