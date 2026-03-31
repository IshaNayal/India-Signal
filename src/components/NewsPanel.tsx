import { useState } from 'react';
import { Globe, ExternalLink, X, Clock, TrendingUp, Zap, Link2, Newspaper, Search, ChevronRight } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { NewsAnalysisModal } from '../pages/NewsPage';
import type { NewsItem } from '../types';

const NEWS_SOURCES = [
  { id: 'ndtv', name: 'NDTV', url: 'https://ndtv.com', icon: '📺' },
  { id: 'reuters', name: 'Reuters', url: 'https://reuters.com', icon: '🔴' },
  { id: 'bbc', name: 'BBC News', url: 'https://bbc.com/news', icon: '🌍' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://bloomberg.com', icon: '💰' },
  { id: 'thehindu', name: 'The Hindu', url: 'https://thehindu.com', icon: '📰' },
  { id: 'defense', name: 'Defense News', url: 'https://defensenews.com', icon: '🛡️' },
];

export function NewsPanel() {
  const { newsPanelOpen, setNewsPanelOpen, news, events, selectedNews, setSelectedNews } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'live' | 'top' | 'sources'>('live');
  const [searchQuery, setSearchQuery] = useState('');

  if (!newsPanelOpen) return null;

  const filteredNews = news.filter(n =>
    n.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const liveNews = news.filter(n => n.isBreaking || n.category === 'breaking').slice(0, 6);
  const topNews = [...news].sort((a, b) => b.impact - a.impact).slice(0, 8);

  return (
    <>
      {/* Analysis Modal — renders when a news item is clicked */}
      {selectedNews && (
        <NewsAnalysisModal item={selectedNews} onClose={() => setSelectedNews(null)} />
      )}

      <div className="w-96 border-l border-border bg-bg-surface flex flex-col animate-slide-in shrink-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">Intelligence Feed</h2>
            </div>
            <button onClick={() => setNewsPanelOpen(false)} className="p-1.5 rounded-md hover:bg-bg-elevated transition-colors">
              <X size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            {[
              { id: 'live' as const, label: 'Live', icon: <Zap size={13} /> },
              { id: 'top' as const, label: 'Top Stories', icon: <TrendingUp size={13} /> },
              { id: 'sources' as const, label: 'Sources', icon: <Link2 size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-bg-primary border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'live' && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                <span className="section-label">Live Updates</span>
              </div>
              {liveNews.map((item, i) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  showBorder={i < liveNews.length - 1}
                  onClick={() => setSelectedNews(item)}
                />
              ))}

              <div className="px-4 pt-4 pb-2">
                <span className="section-label flex items-center gap-1.5"><Clock size={12} /> Recent</span>
              </div>
              {filteredNews.filter(n => !n.isBreaking).slice(0, 5).map((item, i, arr) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  compact
                  showBorder={i < arr.length - 1}
                  onClick={() => setSelectedNews(item)}
                />
              ))}
            </div>
          )}

          {activeTab === 'top' && (
            <div>
              <div className="px-4 pt-3 pb-2">
                <span className="section-label flex items-center gap-1.5"><TrendingUp size={12} /> By Impact</span>
              </div>
              {topNews.map((item, i) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  showRank={i + 1}
                  showBorder={i < topNews.length - 1}
                  onClick={() => setSelectedNews(item)}
                />
              ))}
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="p-4 space-y-2">
              <p className="section-label mb-3">Verified Sources</p>
              {NEWS_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => window.open(source.url, '_blank')}
                  className="w-full p-3 rounded-md bg-bg-elevated hover:bg-bg-hover text-left flex items-center gap-3 transition-colors"
                >
                  <span className="text-lg">{source.icon}</span>
                  <span className="text-sm text-text-primary font-medium flex-1">{source.name}</span>
                  <ExternalLink size={13} className="text-text-muted" />
                </button>
              ))}

              <p className="section-label mt-6 mb-3 flex items-center gap-1.5"><Globe size={12} /> Related Events</p>
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2.5 rounded-md bg-bg-elevated">
                  <p className="text-sm text-text-primary line-clamp-1 flex-1">{event.title}</p>
                  <span className={`text-xs font-mono font-semibold ml-2 ${event.indiaImpactScore >= 7 ? 'text-danger' : event.indiaImpactScore >= 4 ? 'text-warning' : 'text-success'}`}>
                    {event.indiaImpactScore}/10
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Reusable News Row — NOW WITH onClick ── */
function NewsRow({ item, compact, showRank, showBorder, onClick }: {
  item: NewsItem;
  compact?: boolean;
  showRank?: number;
  showBorder?: boolean;
  onClick: () => void;
}) {
  const impactColor = item.impact >= 7 ? 'text-danger' : item.impact >= 4 ? 'text-warning' : 'text-success';
  const categoryBadge = item.isBreaking ? 'badge-danger' : item.category === 'urgent' ? 'badge-warning' : 'badge-neutral';

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 hover:bg-bg-elevated transition-colors cursor-pointer group ${showBorder ? 'border-b border-border' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        {showRank && (
          <span className={`text-sm font-mono font-bold mt-0.5 w-5 text-right shrink-0 ${showRank <= 2 ? 'text-danger' : 'text-text-muted'}`}>
            {showRank}
          </span>
        )}
        {!compact && !showRank && (
          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${item.impact >= 7 ? 'bg-danger' : item.impact >= 4 ? 'bg-warning' : 'bg-success'}`} />
        )}
        <div className="flex-1 min-w-0">
          {!compact && (
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${categoryBadge}`}>{item.isBreaking ? 'Breaking' : item.category}</span>
              <span className={`text-xs font-mono font-semibold ${impactColor}`}>{item.impact}/10</span>
            </div>
          )}
          <p className={`${compact ? 'text-sm' : 'text-sm font-medium'} text-text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors`}>
            {item.headline}
          </p>
          {!compact && <p className="text-xs text-text-secondary line-clamp-1 mt-1">{item.summary}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">{item.country}</span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-muted">{formatTime(item.timestamp)}</span>
            {compact && <span className={`text-xs font-mono font-semibold ml-auto ${impactColor}`}>{item.impact}/10</span>}
          </div>
        </div>
        {/* Click indicator */}
        <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
      </div>
    </div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
