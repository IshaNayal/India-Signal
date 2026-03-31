import { useState, useEffect } from 'react';
import { Globe, Bell, User, Menu, Newspaper, X } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { NEWS_ITEMS } from '../data/mockData';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'map', label: 'Map View', icon: '🗺️' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'analyst', label: 'AI Analyst', icon: '🤖' },
  { id: 'scenarios', label: 'Scenarios', icon: '🔮' },
  { id: 'market', label: 'Markets', icon: '📈' },
] as const;

export function Navbar() {
  const [time, setTime] = useState(new Date());
  const { activePage, setActivePage, setSidebarCollapsed, sidebarCollapsed, newsPanelOpen, setNewsPanelOpen } = useDashboardStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const breakingNews = NEWS_ITEMS.find(n => n.isBreaking);

  return (
    <nav className="bg-bg-surface border-b border-border relative z-50 shrink-0">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-accent/20" />

      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md hover:bg-bg-elevated transition-colors"
          >
            <Menu size={18} className="text-text-secondary" />
          </button>

          <div className="flex items-center gap-2.5">
            <Globe size={20} className="text-accent" />
            <span className="text-lg font-bold text-text-primary tracking-wide">
              India Signal
            </span>
          </div>

          <div className="h-5 w-px bg-border mx-2" />

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${activePage === item.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Status + Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {breakingNews && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md badge-danger max-w-xs">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse shrink-0" />
              <span className="text-xs font-semibold truncate">{breakingNews.headline}</span>
            </div>
          )}

          <div className="text-right">
            <p className="text-sm font-mono text-text-primary tabular-nums">
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-text-muted">
              IST · {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>

          <div className="h-5 w-px bg-border" />

          <button className="relative p-2 rounded-md hover:bg-bg-elevated transition-colors">
            <Bell size={16} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>

          <button
            onClick={() => setNewsPanelOpen(!newsPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              newsPanelOpen
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {newsPanelOpen ? <X size={14} /> : <Newspaper size={14} />}
            Feed
          </button>

          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
              <User size={13} className="text-accent" />
            </div>
            <span className="text-sm text-text-secondary">Analyst</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
