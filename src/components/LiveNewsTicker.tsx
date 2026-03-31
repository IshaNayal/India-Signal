import { useState, useEffect } from 'react';
import { AlertCircle, Zap, FileText, RefreshCw, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { NewsItem, NewsCategory } from '../types';

const CATEGORY_STYLES: Record<NewsCategory, { bg: string; text: string; icon: React.ReactNode }> = {
  breaking: { bg: 'bg-accent-danger', text: 'text-white', icon: <AlertCircle size={10} /> },
  urgent: { bg: 'bg-accent-warning', text: 'text-bg-primary', icon: <Zap size={10} /> },
  analysis: { bg: 'bg-accent-diplomacy', text: 'text-white', icon: <FileText size={10} /> },
  update: { bg: 'bg-bg-elevated', text: 'text-text-muted', icon: <RefreshCw size={10} /> },
};

export function LiveNewsTicker() {
  const { news } = useDashboardStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, news.length]);

  const breakingNews = news.filter(n => n.isBreaking);
  const latestNews = news.slice(0, 1)[0];

  return (
    <div className="glass-card overflow-hidden">
      {breakingNews.length > 0 && (
        <div className="bg-accent-danger/20 border-b border-accent-danger/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-danger animate-pulse" />
            <span className="text-xs font-bold text-accent-danger uppercase tracking-wider">
              Breaking
            </span>
            <div className="flex-1" />
            <span className="text-xs text-accent-danger/80">
              {breakingNews[0].headline}
            </span>
          </div>
        </div>
      )}
      
      <div 
        className="p-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {latestNews && <NewsCard news={latestNews} featured />}
        
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <span className="text-[10px] text-text-muted">Scroll:</span>
          <div className="flex gap-1">
            {news.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-accent-teal' : 'bg-bg-elevated'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ news, featured = false }: { news: NewsItem; featured?: boolean }) {
  const style = CATEGORY_STYLES[news.category];
  const timeAgo = getTimeAgo(news.timestamp);

  return (
    <div className={`${featured ? '' : 'p-3 bg-bg-elevated rounded-lg'}`}>
      <div className="flex items-start gap-3">
        <div className={`${style.bg} ${style.text} px-2 py-1 rounded flex items-center gap-1 shrink-0`}>
          {style.icon}
          <span className="text-[10px] font-bold uppercase">{news.category}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`${featured ? 'text-base' : 'text-sm'} font-medium text-text-primary line-clamp-2 mb-1`}>
            {news.headline}
          </h4>
          <p className="text-xs text-text-muted line-clamp-2 mb-2">
            {news.summary}
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              {getCountryFlag(news.countryCode)} {news.country} • {timeAgo}
            </span>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted">Impact:</span>
              <span className={`text-xs font-mono font-bold ${
                news.impact >= 7 ? 'text-accent-danger' : 
                news.impact >= 4 ? 'text-accent-warning' : 'text-accent-teal'
              }`}>
                {news.impact}/10
              </span>
            </div>
          </div>
        </div>
        
        <button className="p-1 hover:bg-bg-elevated rounded text-text-muted hover:text-text-primary transition-colors">
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}

export function NewsGrid() {
  const { news } = useDashboardStore();
  const [filter, setFilter] = useState<NewsCategory | 'all'>('all');

  const filteredNews = filter === 'all' ? news : news.filter(n => n.category === filter);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <FileText size={14} className="text-accent-diplomacy" />
          Major News
        </h3>
        
        <div className="flex gap-1">
          {(['all', 'breaking', 'urgent', 'analysis', 'update'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${
                filter === cat 
                  ? 'bg-accent-teal/20 text-accent-teal' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        {filteredNews.map((item) => (
          <div 
            key={item.id} 
            className={`p-3 rounded-lg border transition-all cursor-pointer hover:border-accent-teal/50 ${
              item.isBreaking 
                ? 'bg-accent-danger/10 border-accent-danger/30' 
                : 'bg-bg-elevated border-border hover:bg-bg-elevated/80'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                CATEGORY_STYLES[item.category].bg + ' ' + CATEGORY_STYLES[item.category].text
              }`}>
                {item.category}
              </span>
              {item.isBreaking && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-danger animate-pulse" />
              )}
            </div>
            
            <h4 className="text-sm text-text-primary font-medium line-clamp-2 mb-1">
              {item.headline}
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">
                {getCountryFlag(item.countryCode)} {item.country}
              </span>
              <span className={`text-[10px] font-mono ${
                item.impact >= 7 ? 'text-accent-danger' : 
                item.impact >= 4 ? 'text-accent-warning' : 'text-accent-teal'
              }`}>
                Impact: {item.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    IN: '🇮🇳', CN: '🇨🇳', PK: '🇵🇰', US: '🇺🇸', RU: '🇷🇺',
    FR: '🇫🇷', JP: '🇯🇵', IL: '🇮🇱', SA: '🇸🇦', BD: '🇧🇩',
    TW: '🇹🇼', DE: '🇩🇪', AU: '🇦🇺', QA: '🇶🇦',
  };
  return flags[code] || '🌐';
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
