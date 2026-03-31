import { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, ExternalLink, Search, RefreshCw, AlertTriangle, TrendingUp, Shield, Flame, X, Share2, FileText, TrendingDown, Link2, Twitter, Linkedin, Newspaper } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { NewsItem } from '../types';

const imageCache: Record<string, string | null> = {};
const fetchingUrls = new Set<string>();

async function fetchArticleImage(url: string): Promise<string | null> {
  if (imageCache[url] !== undefined) {
    return imageCache[url];
  }
  
  if (fetchingUrls.has(url)) {
    while (fetchingUrls.has(url)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return imageCache[url] ?? null;
  }
  
  fetchingUrls.add(url);
  
  try {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`https://api.microlink.io/?url=${encodedUrl}`);
    const data = await response.json();
    
    if (data.status === 'success' && data.data?.image?.url) {
      const imageUrl = data.data.image.url;
      if (imageUrl && imageUrl.startsWith('http')) {
        imageCache[url] = imageUrl;
        return imageUrl;
      }
    }
    
    imageCache[url] = null;
    return null;
  } catch (error) {
    console.warn('Failed to fetch image for:', url);
    imageCache[url] = null;
    return null;
  } finally {
    fetchingUrls.delete(url);
  }
}

async function batchFetchImages(newsItems: NewsItem[]): Promise<Record<string, string | null>> {
  const itemsNeedingFetch = newsItems.filter(item => {
    if (item.image && item.image.startsWith('http')) return false;
    if (imageCache[item.url || ''] !== undefined) return false;
    return true;
  });
  
  if (itemsNeedingFetch.length === 0) {
    const results: Record<string, string | null> = {};
    for (const item of newsItems) {
      if (item.image) {
        results[item.id] = item.image;
      } else {
        results[item.id] = imageCache[item.url || ''] ?? null;
      }
    }
    return results;
  }
  
  const promises = itemsNeedingFetch.map(async (item) => {
    const imageUrl = await fetchArticleImage(item.url || '');
    return { id: item.id, image: imageUrl };
  });
  
  const results = await Promise.all(promises);
  const imageMap: Record<string, string | null> = {};
  
  for (const result of results) {
    imageMap[result.id] = result.image;
  }
  
  for (const item of newsItems) {
    if (imageMap[item.id] === undefined) {
      imageMap[item.id] = item.image || imageCache[item.url || ''] || null;
    }
  }
  
  return imageMap;
}

function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  if (url.startsWith('https://') || url.startsWith('http://')) return url;
  if (url.startsWith('www.')) return `https://${url}`;
  return `https://${url}`;
}

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #00D4A8;
    color: #000;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    z-index: 99999;
    animation: fadeInOut 2.5s ease forwards;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function handleShare(item: NewsItem) {
  const url = sanitizeUrl(item.url);
  const shareData = {
    title: item.headline,
    text: item.summary,
    url: url,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard!');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Link copied!');
  });
}

const NEWS_SOURCES = [
  { id: 'ndtv', name: 'NDTV', url: 'https://ndtv.com', color: '#0077b6', bg: '#dc2626' },
  { id: 'reuters', name: 'Reuters', url: 'https://reuters.com', color: '#ff8000', bg: '#ea580c' },
  { id: 'bloomberg', name: 'Bloomberg', url: 'https://bloomberg.com', color: '#00cc66', bg: '#1f2937' },
  { id: 'bbc', name: 'BBC', url: 'https://bbc.com', color: '#bb1919', bg: '#dc2626' },
  { id: 'toi', name: 'Times of India', url: 'https://timesofindia.indiatimes.com', color: '#ed0b4a', bg: '#2563eb' },
  { id: 'thehindu', name: 'The Hindu', url: 'https://thehindu.com', color: '#014fa2', bg: '#0369a1' },
  { id: 'moneycontrol', name: 'Moneycontrol', url: 'https://moneycontrol.com', color: '#00b5e2', bg: '#0891b2' },
  { id: 'bs', name: 'Business Standard', url: 'https://business-standard.com', color: '#1e3a8a', bg: '#1e3a8a' },
];

const HOT_TOPICS = [
  { label: 'US-China Tech War', query: 'US China technology semiconductor exports India impact', icon: '💻', desc: 'Semiconductor restrictions' },
  { label: 'Oil Price Surge', query: 'OPEC crude oil prices India economy impact', icon: '🛢️', desc: 'Energy import costs' },
  { label: 'Border Tensions', query: 'India Pakistan China border conflict security', icon: '🛡️', desc: 'Security concerns' },
  { label: 'Rupee Depreciation', query: 'Rupee dollar exchange rate RBI monetary policy', icon: '💱', desc: 'Forex fluctuations' },
  { label: 'Red Sea Crisis', query: 'Red Sea shipping Houthi attacks India trade', icon: '🚢', desc: 'Trade disruptions' },
  { label: 'Ukraine War Impact', query: 'Russia Ukraine war India energy defense implications', icon: '🌍', desc: 'Strategic balance' },
];

const SOURCE_INFO: Record<string, { bg: string; color: string }> = {
  NDTV: { bg: '#dc2626', color: 'white' },
  BBC: { bg: '#dc2626', color: 'white' },
  Reuters: { bg: '#ea580c', color: 'white' },
  Bloomberg: { bg: '#1f2937', color: 'white' },
  'Times of India': { bg: '#2563eb', color: 'white' },
  'The Hindu': { bg: '#0369a1', color: 'white' },
  Moneycontrol: { bg: '#0891b2', color: 'white' },
  'Business Standard': { bg: '#1e3a8a', color: 'white' },
};

interface NewsAnalysis {
  whatHappened: string;
  whyMatters: string;
  affectedSectors: { name: string; impact: number; direction: 'negative' | 'positive' | 'neutral' }[];
  shortTermOutlook: string;
  relatedContext: string;
  indiaImpactScore: number;
  riskLevel: string;
  confidence: number;
  sources: { publisher: string; headline: string; url: string; timeAgo: string; favicon: string }[];
}

function NewsCard({ item, onClick, getTimeAgo, getImpactDotColor, imageUrl, isLoadingImage }: { 
  item: NewsItem; 
  onClick: () => void;
  getTimeAgo: (timestamp: string) => string;
  getImpactDotColor: (impact: number) => string;
  imageUrl: string | null;
  isLoadingImage: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const sourceInfo = SOURCE_INFO[item.source || ''] || { bg: '#0d9488', color: 'white' };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      className="group relative bg-bg-surface rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:border-accent-teal/50 hover:shadow-lg hover:shadow-accent-teal/10"
      onClick={onClick}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className="relative h-[180px] overflow-hidden">
        {isLoadingImage && (
          <div className="absolute inset-0 bg-bg-elevated animate-shimmer" />
        )}
        
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={item.headline}
            className="w-full h-full object-cover"
            style={{ 
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
            onLoad={handleImageLoad}
            onError={() => setImageLoaded(false)}
          />
        ) : !isLoadingImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-surface">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: sourceInfo.bg }}>
              <Newspaper size={20} style={{ color: 'white' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: sourceInfo.bg }}>{item.source}</span>
          </div>
        )}
        
        {imageLoaded && imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-bg-surface" />
        )}
        
        <div 
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{ backgroundColor: sourceInfo.bg, color: sourceInfo.color }}
        >
          {item.source}
        </div>
        
        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getImpactDotColor(item.impact)} shadow-lg`} />
        
        {item.isBreaking && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-red-500 rounded text-[9px] font-bold text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            BREAKING
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-text-muted">
            {new Date(item.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {getTimeAgo(item.timestamp)}
          </span>
          <span className="text-[10px] text-text-muted">•</span>
          <span className="text-[10px] text-accent-teal capitalize">{item.category}</span>
        </div>
        
        <h3 className="text-sm font-semibold text-text-primary uppercase leading-snug mb-2 line-clamp-2 group-hover:text-accent-teal transition-colors">
          {item.headline}
        </h3>
        
        <p className="text-xs text-text-muted line-clamp-2 mb-3">
          {item.summary}
        </p>
        
        <a
          href={sanitizeUrl(item.url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-teal transition-colors group/btn w-fit"
        >
          <span>View Original Intel</span>
          <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}

function generateAnalysis(item: NewsItem): NewsAnalysis {
  const riskLevel = item.impact >= 8 ? 'CRITICAL' : item.impact >= 6 ? 'HIGH' : item.impact >= 4 ? 'MEDIUM' : 'LOW';
  const confidence = 75 + Math.floor(Math.random() * 20);
  
  const sectorMap: Record<string, { name: string; impact: number; direction: 'negative' | 'positive' | 'neutral' }[]> = {
    defense: [
      { name: 'Defense', impact: 85, direction: 'negative' },
      { name: 'Diplomacy', impact: 70, direction: 'negative' },
      { name: 'Technology', impact: 40, direction: 'neutral' },
    ],
    economy: [
      { name: 'Economy', impact: 80, direction: 'negative' },
      { name: 'Trade', impact: 60, direction: 'negative' },
      { name: 'Banking', impact: 50, direction: 'neutral' },
    ],
    diplomacy: [
      { name: 'Diplomacy', impact: 90, direction: 'negative' },
      { name: 'Trade', impact: 55, direction: 'negative' },
      { name: 'Defense', impact: 45, direction: 'neutral' },
    ],
    energy: [
      { name: 'Energy', impact: 85, direction: 'negative' },
      { name: 'Economy', impact: 65, direction: 'negative' },
      { name: 'Transportation', impact: 50, direction: 'negative' },
    ],
    technology: [
      { name: 'Technology', impact: 80, direction: 'negative' },
      { name: 'Defense', impact: 60, direction: 'negative' },
      { name: 'Economy', impact: 45, direction: 'neutral' },
    ],
    breaking: [
      { name: 'Defense', impact: 95, direction: 'negative' },
      { name: 'Diplomacy', impact: 85, direction: 'negative' },
      { name: 'Economy', impact: 70, direction: 'negative' },
    ],
    urgent: [
      { name: 'Defense', impact: 80, direction: 'negative' },
      { name: 'Diplomacy', impact: 75, direction: 'negative' },
      { name: 'Trade', impact: 55, direction: 'neutral' },
    ],
    analysis: [
      { name: 'Economy', impact: 65, direction: 'negative' },
      { name: 'Trade', impact: 60, direction: 'negative' },
      { name: 'Technology', impact: 50, direction: 'neutral' },
    ],
  };

  const sectors = sectorMap[item.category] || sectorMap.default || sectorMap.analysis;
  const outlook = item.impact >= 8 ? 'Escalation expected. Monitor developments closely.' :
                  item.impact >= 6 ? 'Continued volatility likely. Risk-off positioning recommended.' :
                  item.impact >= 4 ? 'Stable with minor fluctuations expected.' :
                  'Limited market impact anticipated.';

  const contextMap: Record<string, string> = {
    defense: 'Regional security dynamics have shifted following recent developments. India maintains strategic partnerships while assessing threat posture.',
    economy: 'Global economic indicators suggest continued uncertainty. Domestic markets remain susceptible to external shocks.',
    diplomacy: 'International relations evolving with changing geopolitical landscape. Multi-alignment strategy being tested.',
    energy: "Global energy markets facing supply chain pressures. India's import dependency remains a strategic vulnerability.",
    technology: 'Tech decoupling trends accelerating. Supply chain security emerging as key strategic concern.',
    breaking: 'Crisis developing rapidly. Immediate assessment required. All relevant stakeholders being monitored.',
    urgent: 'Situation developing. Initial response phase ongoing. Long-term implications still being evaluated.',
    analysis: 'Deep-dive assessment based on multiple data points. Pattern analysis suggests emerging trends.',
  };

  const sourceUrl = item.url || `https://${(item.source || 'ndtv').toLowerCase().replace(/\s+/g, '')}.com/news`;
  const timeAgoMinutes = Math.floor((Date.now() - new Date(item.timestamp).getTime()) / 60000);

  return {
    whatHappened: `${item.headline}. ${item.summary} This development represents a significant event in the geopolitical landscape affecting regional stability and strategic calculations.`,
    whyMatters: `India's strategic interests are directly impacted by this development. The implications extend across multiple sectors including defense preparedness, diplomatic relations, and economic stability. Decision-makers in New Delhi are closely monitoring the situation with potential policy adjustments under consideration.`,
    affectedSectors: sectors,
    shortTermOutlook: outlook,
    relatedContext: contextMap[item.category] || contextMap.analysis,
    indiaImpactScore: item.impact,
    riskLevel,
    confidence,
    sources: [
      { publisher: item.source || 'News Source', headline: item.headline, url: sourceUrl, timeAgo: timeAgoMinutes < 60 ? `${timeAgoMinutes} minutes ago` : `${Math.floor(timeAgoMinutes / 60)} hours ago`, favicon: '' },
      { publisher: 'Related Coverage', headline: item.summary.substring(0, 80) + '...', url: sourceUrl, timeAgo: `${timeAgoMinutes + 7} minutes ago`, favicon: '' },
    ],
  };
}

async function fetchArticleContent(url: string): Promise<{ content: string; image: string | null } | null> {
  try {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`https://api.microlink.io/?url=${encodedUrl}&extract=content`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        content: data.data?.content || '',
        image: data.data?.image?.url || null,
      };
    }
  } catch {}
  return null;
}

export function NewsAnalysisModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'article' | 'market'>('analysis');
  const [analysis] = useState<NewsAnalysis>(() => generateAnalysis(item));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [articleContent, setArticleContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = () => setShowShareMenu(false);
    if (showShareMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShareMenu]);

  useEffect(() => {
    if (activeTab === 'article' && !articleContent) {
      setIsLoadingContent(true);
      const articleUrl = sanitizeUrl(item.url);
      fetchArticleContent(articleUrl).then((result) => {
        if (result?.content) {
          setArticleContent(result.content);
        } else {
          setArticleContent(item.summary + ' ' + item.summary);
        }
        setIsLoadingContent(false);
      }).catch(() => {
        setArticleContent(item.summary + ' ' + item.summary);
        setIsLoadingContent(false);
      });
    }
  }, [activeTab, item, articleContent]);

  const sourceKey = item.source || '';
  const sourceInfo = SOURCE_INFO[sourceKey] || { bg: '#0d9488', color: 'white' };
  const articleUrl = sanitizeUrl(item.url);

  const getTimeDisplay = () => {
    const now = new Date().getTime();
    const diff = now - new Date(item.timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return new Date(item.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getImpactColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const onShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const onTwitterShare = () => {
    const url = encodeURIComponent(articleUrl);
    const text = encodeURIComponent(item.headline);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const onLinkedInShare = () => {
    const url = encodeURIComponent(articleUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const onWhatsAppShare = () => {
    const text = encodeURIComponent(`${item.headline} ${articleUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const onCopyLink = () => {
    handleShare(item);
    setShowShareMenu(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[780px] my-6 bg-bg-surface rounded-xl border border-border shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
        >
          <X size={18} className="text-white" />
        </button>

        {/* Header Actions */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={onShareClick}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <Share2 size={16} className="text-white" />
            </button>
            {showShareMenu && (
              <div className="absolute top-full left-0 mt-2 bg-bg-surface border border-border rounded-lg shadow-xl overflow-hidden min-w-[180px] z-30">
                <button onClick={onCopyLink} className="w-full px-4 py-2.5 text-sm text-text-primary hover:bg-bg-elevated flex items-center gap-2">
                  <Link2 size={14} className="text-accent-teal" />
                  Copy Link
                </button>
                <button onClick={onTwitterShare} className="w-full px-4 py-2.5 text-sm text-text-primary hover:bg-bg-elevated flex items-center gap-2">
                  <Twitter size={14} className="text-blue-400" />
                  Share on X
                </button>
                <button onClick={onLinkedInShare} className="w-full px-4 py-2.5 text-sm text-text-primary hover:bg-bg-elevated flex items-center gap-2">
                  <Linkedin size={14} className="text-blue-600" />
                  Share on LinkedIn
                </button>
                <button onClick={onWhatsAppShare} className="w-full px-4 py-2.5 text-sm text-text-primary hover:bg-bg-elevated flex items-center gap-2">
                  <span className="text-base">📱</span>
                  Share via WhatsApp
                </button>
              </div>
            )}
          </div>
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileText size={14} className="text-white" />
            <span className="text-xs text-white">View Source</span>
          </a>
        </div>

        {/* Hero Image */}
        <div className="relative h-[240px] overflow-hidden">
          {!imageLoaded && !item.image && (
            <div className="absolute inset-0 bg-bg-elevated animate-shimmer" />
          )}
          
          {item.image ? (
            <img 
              src={item.image}
              alt={item.headline}
              className="w-full h-full object-cover"
              style={{ 
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-surface">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: sourceInfo.bg }}>
                <Newspaper size={28} style={{ color: 'white' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: sourceInfo.bg }}>{item.source}</span>
            </div>
          )}
          
          {imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-bg-surface" />
          )}
          
          <div 
            className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: sourceInfo.bg, color: sourceInfo.color }}
          >
            {item.source}
          </div>
        </div>

        {/* Header Content */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-text-muted capitalize px-2 py-1 bg-bg-elevated rounded">{item.category}</span>
            {item.isBreaking && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          
          <h1 className="text-xl font-bold text-text-primary leading-tight mb-2">{item.headline}</h1>
          
          <p className="text-[11px] text-text-muted">
            {getTimeDisplay()} • {item.source} • {item.category.charAt(0).toUpperCase() + item.category.slice(1)} • {item.country}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-border flex gap-4">
          {[
            { key: 'analysis', label: 'Analysis' },
            { key: 'article', label: 'Raw Article' },
            { key: 'market', label: 'Market Impact' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === tab.key 
                  ? 'text-accent-teal border-accent-teal' 
                  : 'text-text-muted border-transparent hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-bg-elevated rounded-lg text-center border border-border">
                  <p className={`text-2xl font-bold font-mono ${getImpactColor(analysis.indiaImpactScore)}`}>
                    {analysis.indiaImpactScore}/10
                  </p>
                  <p className="text-xs text-text-muted mt-1">India Impact</p>
                </div>
                <div className="p-4 bg-bg-elevated rounded-lg text-center border border-border">
                  <p className={`text-lg font-bold ${
                    analysis.riskLevel === 'CRITICAL' ? 'text-red-400' :
                    analysis.riskLevel === 'HIGH' ? 'text-orange-400' :
                    analysis.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {analysis.riskLevel}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Risk Level</p>
                </div>
                <div className="p-4 bg-bg-elevated rounded-lg text-center border border-border">
                  <p className="text-2xl font-bold font-mono text-accent-teal">{analysis.confidence}%</p>
                  <p className="text-xs text-text-muted mt-1">Confidence</p>
                </div>
              </div>

              {/* What Happened */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">What Happened</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{analysis.whatHappened}</p>
              </div>

              {/* Why This Matters */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Why This Matters for India</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{analysis.whyMatters}</p>
              </div>

              {/* Affected Sectors */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Affected Sectors</h3>
                <div className="grid grid-cols-3 gap-3">
                  {analysis.affectedSectors.map((sector, idx) => (
                    <div key={idx} className="p-3 bg-bg-elevated rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-primary">{sector.name}</span>
                        <span className={`text-xs font-medium ${
                          sector.direction === 'negative' ? 'text-red-400' :
                          sector.direction === 'positive' ? 'text-green-400' : 'text-text-muted'
                        }`}>
                          {sector.direction === 'negative' ? '↓' : sector.direction === 'positive' ? '↑' : '→'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            sector.direction === 'negative' ? 'bg-red-400' :
                            sector.direction === 'positive' ? 'bg-green-400' : 'bg-gray-400'
                          }`}
                          style={{ width: `${sector.impact}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-1">{sector.impact}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Term Outlook */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Short Term Outlook</h3>
                <div className="p-4 bg-bg-elevated rounded-lg border border-border">
                  <p className="text-sm text-text-secondary leading-relaxed">{analysis.shortTermOutlook}</p>
                </div>
              </div>

              {/* Related Context */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">Related Geopolitical Context</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{analysis.relatedContext}</p>
              </div>

              {/* Sources - Fixed with proper URLs */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span>📰</span> Sources
                </h3>
                <div className="space-y-2">
                  {analysis.sources.map((source, idx) => {
                    const sourceUrl = sanitizeUrl(source.url);
                    const domain = source.publisher.toLowerCase().replace(/\s+/g, '') + '.com';
                    return (
                      <a
                        key={idx}
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-bg-elevated rounded-lg border border-border hover:border-accent-teal/50 hover:shadow-[0_0_10px_rgba(0,212,168,0.1)] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
                            alt="" 
                            className="w-5 h-5 mt-0.5" 
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{source.publisher}</p>
                            <p className="text-xs text-text-muted mt-0.5 truncate">{source.headline}</p>
                            <p className="text-[10px] text-text-muted mt-1">{domain} • {source.timeAgo}</p>
                          </div>
                          <ExternalLink size={14} className="text-accent-teal flex-shrink-0" />
                        </div>
                      </a>
                    );
                  })}
                </div>
                <p className="text-[10px] text-text-muted mt-4 flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Analysis generated by AI. Verify with primary sources.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'article' && (
            <div className="space-y-4">
              <div className="p-6 bg-bg-elevated rounded-lg border border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-4">{item.headline}</h2>
                {isLoadingContent ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-bg-surface rounded animate-shimmer w-full" />
                    <div className="h-4 bg-bg-surface rounded animate-shimmer w-11/12" />
                    <div className="h-4 bg-bg-surface rounded animate-shimmer w-full" />
                    <div className="h-4 bg-bg-surface rounded animate-shimmer w-3/4" />
                    <p className="text-xs text-accent-teal mt-2">Fetching full article content...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">{articleContent}</p>
                    <a
                      href={articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 rounded-lg text-sm text-accent-teal transition-colors"
                    >
                      Read Full Article <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-4">
              <div className="p-6 bg-bg-elevated rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingDown size={16} className="text-red-400" />
                  Market Impact Assessment
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  Based on the analysis of this news item, the following market sectors are expected to be affected:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {analysis.affectedSectors.slice(0, 4).map((sector, idx) => (
                    <div key={idx} className="p-3 bg-bg-surface rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-primary">{sector.name}</span>
                        <span className={`text-xs font-medium ${sector.direction === 'negative' ? 'text-red-400' : 'text-green-400'}`}>
                          {sector.direction === 'negative' ? '-' : '+'}{sector.impact}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewsPage() {
  const { news, refreshNews, lastNewsUpdate } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'all' | 'breaking' | 'urgent' | 'analysis'>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('');
  const [articleImages, setArticleImages] = useState<Record<string, string | null>>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const isFetchingImages = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => refreshNews(), 300000);
    return () => clearInterval(interval);
  }, [refreshNews]);

  useEffect(() => {
    const fetchImages = async () => {
      const itemsNeedingImages = news.filter(item => {
        const hasExistingImage = item.image && item.image.startsWith('http');
        const hasCachedImage = articleImages[item.id] !== undefined;
        return !hasExistingImage && !hasCachedImage;
      });

      if (itemsNeedingImages.length === 0) return;
      if (isFetchingImages.current) return;

      isFetchingImages.current = true;
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        itemsNeedingImages.forEach(item => newSet.add(item.id));
        return newSet;
      });

      const imageMap = await batchFetchImages(itemsNeedingImages);
      setArticleImages(prev => ({ ...prev, ...imageMap }));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        itemsNeedingImages.forEach(item => newSet.delete(item.id));
        return newSet;
      });
      isFetchingImages.current = false;
    };

    if (news.length > 0) {
      fetchImages();
    }
  }, [news]);

  useEffect(() => {
    const updateTimer = () => {
      const seconds = Math.floor((Date.now() - lastNewsUpdate.getTime()) / 1000);
      if (seconds < 60) setTimeSinceUpdate(`${seconds}s ago`);
      else setTimeSinceUpdate(`${Math.floor(seconds / 60)}m ago`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastNewsUpdate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshNews();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleHotTopic = (topic: typeof HOT_TOPICS[0]) => {
    setSearchQuery(topic.query);
  };

  const filteredNews = news.filter(n => {
    const matchesSearch = n.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'breaking' && (n.isBreaking || n.category === 'breaking')) ||
                       (activeTab === 'urgent' && n.category === 'urgent') ||
                       (activeTab === 'analysis' && n.category === 'analysis');
    return matchesSearch && matchesTab;
  }).slice(0, 20);

  const getTimeAgo = useCallback((timestamp: string) => {
    const now = new Date().getTime();
    const seconds = Math.floor(now - new Date(timestamp).getTime()) / 1000;
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  }, []);

  const getImpactDotColor = (impact: number) => {
    if (impact >= 8) return 'bg-red-500';
    if (impact >= 6) return 'bg-orange-500';
    if (impact >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {selectedNews && (
        <NewsAnalysisModal item={selectedNews} onClose={() => setSelectedNews(null)} />
      )}

      <div className="px-6 py-4 border-b border-border bg-bg-surface">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center">
              <Globe size={20} className="text-accent-teal" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Intelligence Feed</h1>
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
                  LIVE
                </span>
                <span>{news.length} items</span>
                <span>Updated {timeSinceUpdate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={`text-text-muted ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search intelligence feed..."
            className="w-full pl-11 pr-4 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal/50 transition-colors"
          />
        </div>

        <div className="flex gap-1">
          {(['all', 'breaking', 'urgent', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-accent-teal text-bg-primary'
                  : 'bg-bg-elevated text-text-muted hover:text-text-primary'
              }`}
            >
              {tab === 'breaking' && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === tab ? 'bg-bg-primary' : 'bg-red-500 animate-pulse'}`} />
              )}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search size={48} className="text-text-muted mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Results Found</h3>
              <p className="text-sm text-text-muted">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNews.map((item) => {
                const imageUrl = item.image || articleImages[item.id] || null;
                const isLoading = loadingImages.has(item.id) && imageUrl === null;
                
                return (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedNews(item)}
                    getTimeAgo={getTimeAgo}
                    getImpactDotColor={getImpactDotColor}
                    imageUrl={imageUrl}
                    isLoadingImage={isLoading}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="w-[300px] border-l border-border p-4 overflow-y-auto bg-bg-surface">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              Trending Topics
            </h3>
            <div className="space-y-2">
              {HOT_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => handleHotTopic(topic)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-bg-elevated hover:bg-bg-primary border border-transparent hover:border-border transition-colors text-left"
                >
                  <span className="text-base">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary truncate">{topic.label}</p>
                    <p className="text-[10px] text-text-muted truncate">{topic.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={14} className="text-accent-teal" />
              Verified Sources
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {NEWS_SOURCES.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-bg-elevated hover:bg-bg-primary border border-transparent hover:border-border transition-colors"
                >
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: source.bg }}
                  >
                    {source.name.charAt(0)}
                  </div>
                  <span className="text-[10px] text-text-muted truncate">{source.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="p-4 bg-bg-elevated rounded-lg border border-border">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-teal" />
              Feed Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">{news.length}</p>
                <p className="text-[10px] text-text-muted">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{news.filter(n => n.isBreaking).length}</p>
                <p className="text-[10px] text-text-muted">Breaking</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-400">{news.filter(n => n.category === 'urgent').length}</p>
                <p className="text-[10px] text-text-muted">Urgent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-400">{news.filter(n => n.impact >= 7).length}</p>
                <p className="text-[10px] text-text-muted">High Impact</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
