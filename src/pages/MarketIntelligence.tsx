import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, BarChart3, AlertTriangle, Activity, Search, ArrowUpRight, ArrowDownRight, Gauge, Layers, RefreshCw, ExternalLink } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  fetchAllMarketData,
  isMarketOpen as checkMarketOpen,
  formatPrice,
  getSourceBadgeClass,
} from '../services/marketDataService';
import type { MarketOverview as MarketOverviewData } from '../services/marketDataService';

const CYBER_LIME = '#00ff88';
const ELECTRIC_CRIMSON = '#ff4444';
const NEUTRAL_YELLOW = '#ffcc00';
const MUTED_SLATE = '#a0a8c0';
const CARD_BG = '#12121f';
const TEXT_MUTED = '#7a8299';
const TEXT_DIM = '#5a6280';

interface MarketNews {
  id: string;
  headline: string;
  source: string;
  url: string;
  timeAgo: string;
  category: 'geopolitical' | 'trade' | 'currency' | 'commodities' | 'policy';
  impact: 'risk' | 'opportunity' | 'neutral';
  summary: string;
  niftyImpact: number;
  affectedSectors: { name: string; change: number }[];
}

interface SparklineData {
  value: number;
}

const SAMPLE_NIFTY_DATA = [
  { value: 22100 }, { value: 22380 }, { value: 22290 }, { value: 22510 },
  { value: 22480 }, { value: 22620 }, { value: 22450 }
];

const SAMPLE_SENSEX_DATA = [
  { value: 72800 }, { value: 73200 }, { value: 73050 }, { value: 73680 },
  { value: 73590 }, { value: 73950 }, { value: 73820 }
];

const SAMPLE_VIX_DATA = [
  { value: 12.4 }, { value: 13.1 }, { value: 13.8 }, { value: 14.5 },
  { value: 13.9 }, { value: 14.8 }, { value: 14.2 }
];

const MARKET_NEWS: MarketNews[] = [
  { id: '1', headline: 'OPEC+ Extends Production Cuts, Brent Crude Surges 3%', source: 'Reuters', url: '#', timeAgo: '2h ago', category: 'commodities', impact: 'risk', summary: 'Oil cartel extends output restrictions through Q2, pushing crude prices above $90/barrel.', niftyImpact: -0.8, affectedSectors: [{ name: 'Energy', change: 2.1 }, { name: 'Auto', change: -0.4 }] },
  { id: '2', headline: 'RBI Keeps Rates Unchanged, Signals Pause on Easing', source: 'Economic Times', url: '#', timeAgo: '4h ago', category: 'policy', impact: 'neutral', summary: 'Reserve Bank maintains repo rate at 6.5%, awaits more clarity on inflation trajectory.', niftyImpact: 0.2, affectedSectors: [{ name: 'Banking', change: 0.3 }, { name: 'Realty', change: 0.1 }] },
  { id: '3', headline: 'Dollar Weakens After Fed Rate Decision, INR Gains', source: 'Bloomberg', url: '#', timeAgo: '6h ago', category: 'currency', impact: 'opportunity', summary: 'Rupee strengthens to 83.20 as Fed signals potential rate cuts.', niftyImpact: 0.5, affectedSectors: [{ name: 'IT', change: 0.8 }, { name: 'Pharma', change: 0.4 }] },
  { id: '4', headline: 'India-Pakistan Border Tensions Rise, Defense Stocks Rally', source: 'Business Standard', url: '#', timeAgo: '1d ago', category: 'geopolitical', impact: 'risk', summary: 'Ceasefire violations increase along LOC, triggering defense sector buying.', niftyImpact: -0.5, affectedSectors: [{ name: 'Defense', change: 3.2 }, { name: 'Aviation', change: -0.8 }] },
  { id: '5', headline: 'Q3 GDP Growth Beats Estimates at 8.4%, Markets Rally', source: 'Moneycontrol', url: '#', timeAgo: '1d ago', category: 'policy', impact: 'opportunity', summary: 'India outperforms emerging markets with strongest quarterly growth.', niftyImpact: 1.2, affectedSectors: [{ name: 'FMCG', change: 1.1 }, { name: 'Finance', change: 0.9 }] },
  { id: '6', headline: 'US-China Trade Talks Resume, Global Supply Chains Stabilize', source: 'Reuters', url: '#', timeAgo: '2d ago', category: 'trade', impact: 'opportunity', summary: 'Bilateral negotiations ease semiconductor tensions, benefiting IT export sector.', niftyImpact: 0.6, affectedSectors: [{ name: 'IT', change: 1.2 }, { name: 'Electronics', change: 0.7 }] },
  { id: '7', headline: 'Steel Prices Fall on Weak China Demand, Domestic Mills Impacted', source: 'Financial Express', url: '#', timeAgo: '3h ago', category: 'commodities', impact: 'risk', summary: 'Chinese steel exports surge, pressuring margins of Indian steel manufacturers.', niftyImpact: -0.4, affectedSectors: [{ name: 'Metal', change: -1.5 }, { name: 'Mining', change: -0.9 }] },
  { id: '8', headline: 'Pharma Sector Sees Revival as USFDA Approvals Accelerate', source: 'The Hindu Business', url: '#', timeAgo: '5h ago', category: 'trade', impact: 'opportunity', summary: 'Indian pharma companies receive 12 new drug approvals from US regulatory body.', niftyImpact: 0.4, affectedSectors: [{ name: 'Pharma', change: 1.8 }, { name: 'Healthcare', change: 0.6 }] },
];

function SkeletonNumber({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded ${className}`} style={{
      background: 'linear-gradient(90deg, #1a1a2e 25%, #252545 50%, #1a1a2e 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite'
    }} />
  );
}

function SparklineChart({ data, positive, height = 70 }: { data: SparklineData[]; positive: boolean; height?: number }) {
  const color = positive ? CYBER_LIME : ELECTRIC_CRIMSON;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GlassCard({ children, className = '', glow = false, style }: { children: React.ReactNode; className?: string; glow?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={`
      relative rounded-xl
      bg-gradient-to-br from-white/[0.03] to-transparent
      border border-white/[0.08]
      backdrop-blur-xl
      ${glow ? 'shadow-[0_0_30px_rgba(0,255,136,0.1)]' : ''}
      transition-all duration-500
      hover:border-white/[0.12]
      ${className}
    `} style={style}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent" />
      {children}
    </div>
  );
}

function StockDetailModal({ symbol, name, onClose }: { symbol: string; name: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`tv-stock-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const initWidget = () => {
      if ((window as any).TradingView && containerRef.current) {
        new (window as any).TradingView.widget({
          container_id: uniqueId.current,
          symbol: `NSE:${symbol}`,
          width: '100%',
          height: 500,
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          backgroundColor: '#0a0a14',
          gridColor: '#1a1a2e',
          hide_top_toolbar: false,
          hide_legend: false,
          allow_symbol_change: true,
          save_image: false,
          studies: ['MASimple@tv-basicstudies', 'Volume@tv-basicstudies', 'RSI@tv-basicstudies'],
        });
        setLoaded(true);
      }
    };

    if ((window as any).TradingView) {
      initWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }
  }, [symbol]);

  const openFullScreen = () => {
    window.open(
      `https://www.tradingview.com/chart/?symbol=NSE%3A${encodeURIComponent(symbol)}`,
      '_blank',
      'width=1920,height=1080'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div 
        className="relative rounded-2xl overflow-hidden w-full max-w-5xl mx-4"
        style={{ backgroundColor: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CYBER_LIME}20` }}>
              <BarChart3 size={18} style={{ color: CYBER_LIME }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>{name}</h2>
              <span className="text-sm font-mono" style={{ color: MUTED_SLATE }}>NSE: {symbol}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openFullScreen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: CYBER_LIME,
              }}
            >
              <ExternalLink size={14} />
              Full Screen
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <span className="text-xl" style={{ color: '#ffffff' }}>×</span>
            </button>
          </div>
        </div>
        
        <div className="p-4" style={{ height: 540 }}>
          {!loaded && (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0a0a14' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-4" style={{ border: `3px solid ${CYBER_LIME}30`, borderTopColor: CYBER_LIME }} />
                <p style={{ color: MUTED_SLATE }}>Loading chart...</p>
              </div>
            </div>
          )}
          <div id={uniqueId.current} ref={containerRef} className={loaded ? '' : 'hidden'} style={{ height: loaded ? '100%' : 0 }} />
        </div>
      </div>
    </div>
  );
}

function FlashText({ children, positive }: { children: string; positive: boolean }) {
  const [highlighted, setHighlighted] = useState(false);
  const prevValue = useRef(children);
  
  useEffect(() => {
    if (prevValue.current !== children) {
      setHighlighted(true);
      const timer = setTimeout(() => setHighlighted(false), 600);
      prevValue.current = children;
      return () => clearTimeout(timer);
    }
  }, [children]);
  
  return (
    <span
      className={`transition-all duration-500 ${highlighted ? 'scale-110' : ''}`}
      style={{
        color: highlighted ? (positive ? CYBER_LIME : ELECTRIC_CRIMSON) : '#ffffff',
        textShadow: highlighted ? `0 0 20px ${positive ? CYBER_LIME : ELECTRIC_CRIMSON}` : 'none',
      }}
    >
      {children}
    </span>
  );
}

function FearGreedGauge({ value = 42 }: { value?: number }) {
  const [needleAngle, setNeedleAngle] = useState(-90 + (value / 100) * 180);
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const newAngle = -90 + (value / 100) * 180;
    const startAngle = needleAngle;
    const startValue = displayValue;
    const duration = 800;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setNeedleAngle(startAngle + (newAngle - startAngle) * eased);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  const pulseColor = displayValue < 40 ? ELECTRIC_CRIMSON : displayValue > 60 ? CYBER_LIME : NEUTRAL_YELLOW;
  
  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={ELECTRIC_CRIMSON} stopOpacity={0.5} />
            <stop offset="50%" stopColor={NEUTRAL_YELLOW} stopOpacity={0.5} />
            <stop offset="100%" stopColor={CYBER_LIME} stopOpacity={0.5} />
          </linearGradient>
        </defs>
        
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round" />
        <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" strokeLinecap="round" />
        
        <g transform={`rotate(${needleAngle}, 100, 90)`}>
          <line x1="100" y1="90" x2="100" y2="30" stroke={pulseColor} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="100" cy="90" r="7" fill={pulseColor} />
        </g>
      </svg>
      
      <div className="absolute bottom-0 text-center">
        <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>{displayValue}</p>
        <p className="text-xs uppercase tracking-wider" style={{ color: MUTED_SLATE }}>Fear Index</p>
      </div>
    </div>
  );
}

function SectorDensityMap({ sectors }: { sectors: { name: string; change: number }[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sectors.map((sector, i) => {
        const isPositive = sector.change >= 0;
        const baseColor = isPositive ? CYBER_LIME : ELECTRIC_CRIMSON;
        
        return (
          <div
            key={i}
            className="rounded-lg p-3 cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: isPositive
                ? 'linear-gradient(135deg, #0a2818, #0d3320)'
                : 'linear-gradient(135deg, #200808, #2d0f0f)',
              border: `1px solid ${baseColor}40`,
              boxShadow: `inset 0 1px 0 ${baseColor}20`,
              minHeight: 80,
            }}
          >
            <div className="text-center">
              <p style={{ color: '#ffffff', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {sector.name}
              </p>
              <p
                style={{
                  color: baseColor,
                  fontSize: 22,
                  fontWeight: 800,
                  textShadow: `0 0 10px ${baseColor}80`,
                }}
              >
                {isPositive ? '+' : ''}{sector.change.toFixed(1)}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopBar({ isMarketOpen, marketData, isLoading }: { isMarketOpen: boolean; marketData: MarketOverviewData | null; isLoading: boolean }) {
  const tickers = [
    { name: 'NIFTY 50', value: marketData?.nifty ? formatPrice(marketData.nifty.value) : '—', change: marketData?.nifty?.changePercent || 0 },
    { name: 'SENSEX', value: marketData?.sensex ? formatPrice(marketData.sensex.value) : '—', change: marketData?.sensex?.changePercent || 0 },
    { name: 'USD/INR', value: marketData?.currency ? formatPrice(marketData.currency.usdInr) : '—', change: marketData?.currency?.changePercent || 0 },
    { name: 'INDIA VIX', value: marketData?.indiaVix ? formatPrice(marketData.indiaVix.value, 2) : '—', change: marketData?.indiaVix?.changePercent || 0 },
    { name: 'BRENT', value: marketData?.commodities ? `$${formatPrice(marketData.commodities.brent)}` : '—', change: marketData?.commodities?.brentChangePercent || 0 },
    { name: 'GOLD', value: marketData?.commodities ? `₹${formatPrice(marketData.commodities.goldInr)}` : '—', change: marketData?.commodities?.goldChangePercent || 0 },
  ];

  return (
    <div className="h-12 flex items-center overflow-hidden" style={{ backgroundColor: '#080812', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className={`px-4 border-r flex items-center gap-3 ${isMarketOpen ? '' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
        <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'animate-pulse' : ''}`} style={{ 
          backgroundColor: isMarketOpen ? CYBER_LIME : MUTED_SLATE,
          boxShadow: isMarketOpen ? `0 0 8px ${CYBER_LIME}` : 'none'
        }} />
        <span className="text-xs font-semibold" style={{ color: isMarketOpen ? CYBER_LIME : MUTED_SLATE }}>
          NSE {isMarketOpen ? 'LIVE' : 'CLOSED'}
        </span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...tickers, ...tickers].map((t, i) => (
            <div key={i} className="inline-flex items-center gap-4 px-6 text-xs" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-medium uppercase tracking-wide" style={{ color: MUTED_SLATE }}>{t.name}</span>
              <span className="font-bold" style={{ color: '#ffffff', fontSize: 12 }}>
                {isLoading && !marketData ? <SkeletonNumber className="w-16 h-4" /> : t.value}
              </span>
              <span className="font-medium" style={{ color: t.change >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON, fontSize: 11 }}>
                {isLoading && !marketData ? '' : `${t.change >= 0 ? '+' : ''}${t.change.toFixed(2)}%`}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#080812] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

function TopGainersLosers({ gainers, losers, onStockClick }: { gainers?: string[]; losers?: string[]; onStockClick?: (symbol: string, name: string) => void }) {
  const defaultGainers = [
    { symbol: 'HAL', name: 'Hindustan Aeronautics', change: '+4.2%' },
    { symbol: 'BEL', name: 'Bharat Electronics', change: '+3.8%' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', change: '+3.2%' },
    { symbol: 'BHEL', name: 'Bharat Heavy Electricals', change: '+2.9%' },
    { symbol: 'MCX', name: 'MCX India', change: '+2.4%' },
  ];
  const defaultLosers = [
    { symbol: 'IRCTC', name: 'IRCTC Ltd', change: '-2.8%' },
    { symbol: 'SPICEJET', name: 'SpiceJet Ltd', change: '-2.1%' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', change: '-1.9%' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', change: '-1.7%' },
    { symbol: 'HPCL', name: 'Hindustan Petroleum', change: '-1.5%' },
  ];

  const displayGainers = gainers || defaultGainers;
  const displayLosers = losers || defaultLosers;

  const handleStockClick = (stock: { symbol: string; name: string } | string) => {
    if (typeof stock === 'string') {
      const [symbol] = stock.split(' ');
      onStockClick?.(symbol, symbol);
    } else {
      onStockClick?.(stock.symbol, stock.name);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-4">
        <h3 className="text-xs uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: CYBER_LIME }}>
          <ArrowUpRight size={14} />
          <span>Top Gainers</span>
        </h3>
        <div>
          {displayGainers.map((stock, i) => {
            const name = typeof stock === 'string' ? stock.split(' ')[0] : stock.symbol;
            const change = typeof stock === 'string' ? stock.split(' ')[1] : stock.change;
            return (
              <button
                key={i}
                onClick={() => handleStockClick(stock)}
                className="w-full flex items-center justify-between py-2 transition-all duration-200 hover:bg-white/[0.03] cursor-pointer"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span style={{ color: '#e0e0e0', fontSize: 14 }}>{name}</span>
                <span style={{ color: CYBER_LIME, fontSize: 15, fontWeight: 700 }}>{change}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>
      
      <GlassCard className="p-4">
        <h3 className="text-xs uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: ELECTRIC_CRIMSON }}>
          <ArrowDownRight size={14} />
          <span>Top Losers</span>
        </h3>
        <div>
          {displayLosers.map((stock, i) => {
            const name = typeof stock === 'string' ? stock.split(' ')[0] : stock.symbol;
            const change = typeof stock === 'string' ? stock.split(' ')[1] : stock.change;
            return (
              <button
                key={i}
                onClick={() => handleStockClick(stock)}
                className="w-full flex items-center justify-between py-2 transition-all duration-200 hover:bg-white/[0.03] cursor-pointer"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span style={{ color: '#e0e0e0', fontSize: 14 }}>{name}</span>
                <span style={{ color: ELECTRIC_CRIMSON, fontSize: 15, fontWeight: 700 }}>{change}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function FIIIDataSection({ fiidata }: { fiidata?: { fiiNet: number; diiNet: number; netFlow: number } | null }) {
  const fiiNet = fiidata?.fiiNet ?? -824;
  const diiNet = fiidata?.diiNet ?? 612;
  const netFlow = fiidata?.netFlow ?? (fiiNet + diiNet);
  const total = Math.abs(fiiNet) + Math.abs(diiNet);
  const fiiWidth = total > 0 ? (Math.abs(fiiNet) / total) * 100 : 50;
  const diiWidth = total > 0 ? (Math.abs(diiNet) / total) * 100 : 50;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: MUTED_SLATE, fontSize: 13 }}>FII</span>
          <span style={{ color: ELECTRIC_CRIMSON, fontSize: 14, fontWeight: 700 }}>
            {fiiNet >= 0 ? '+' : '-'}₹{Math.abs(fiiNet)} Cr
          </span>
        </div>
        <div className="h-1 rounded" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="h-full rounded" style={{ width: `${fiiWidth}%`, backgroundColor: ELECTRIC_CRIMSON }} />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: MUTED_SLATE, fontSize: 13 }}>DII</span>
          <span style={{ color: CYBER_LIME, fontSize: 14, fontWeight: 700 }}>
            {diiNet >= 0 ? '+' : '-'}₹{Math.abs(diiNet)} Cr
          </span>
        </div>
        <div className="h-1 rounded" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="h-full rounded" style={{ width: `${diiWidth}%`, backgroundColor: CYBER_LIME }} />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color: MUTED_SLATE, fontSize: 13 }}>Net</span>
        <span style={{ color: netFlow >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON, fontSize: 14, fontWeight: 700 }}>
          {netFlow >= 0 ? '+' : '-'}₹{Math.abs(netFlow)} Cr
        </span>
      </div>
    </div>
  );
}

function TradingViewWidget({ height = 450, showPopout = true, defaultSymbol = 'NSE:NIFTY', enableSymbolChange = false }: { height?: number; showPopout?: boolean; defaultSymbol?: string; enableSymbolChange?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const uniqueId = useRef(`tv-${Math.random().toString(36).substr(2, 9)}`);

  const openPopout = () => {
    const width = window.screen.availWidth;
    const h = window.screen.availHeight;
    const left = 0;
    const top = 0;
    window.open(
      `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(defaultSymbol)}&interval=D&theme=dark&style=1&timezone=Asia%2FKolkata&locale=en`,
      '_blank',
      `width=${width},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const initWidget = () => {
      if ((window as any).TradingView && containerRef.current) {
        new (window as any).TradingView.widget({
          container_id: uniqueId.current,
          symbol: defaultSymbol,
          width: '100%',
          height: height,
          interval: 'D',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          backgroundColor: '#0a0a14',
          gridColor: '#1a1a2e',
          hide_top_toolbar: false,
          hide_legend: false,
          allow_symbol_change: enableSymbolChange,
          save_image: false,
          studies: ['MASimple@tv-basicstudies', 'Volume@tv-basicstudies'],
          toolbar_bg: '#0a0a14',
          enable_publishing: false,
          hide_side_toolbar: false,
        });
        setLoaded(true);
      }
    };

    if ((window as any).TradingView) {
      initWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }
  }, [height, defaultSymbol, enableSymbolChange]);

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#0a0a14' }}>
      {showPopout && (
        <button
          onClick={openPopout}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'rgba(0, 255, 136, 0.15)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            color: CYBER_LIME,
          }}
          title="Open in full screen"
        >
          <ExternalLink size={12} />
          <span>Pop Out</span>
        </button>
      )}
      <div style={{ height }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#0a0a14' }}>
            <SparklineChart data={SAMPLE_NIFTY_DATA} positive={false} height={height - 40} />
          </div>
        )}
        <div id={uniqueId.current} ref={containerRef} className={loaded ? '' : 'hidden'} style={{ height: loaded ? '100%' : 0 }} />
      </div>
    </div>
  );
}

function MarketOverview({ marketData, isLoading, onStockClick }: { marketData: MarketOverviewData | null; isLoading: boolean; onStockClick: (symbol: string, name: string) => void }) {
  const indexCards = [
    { 
      name: 'Nifty 50', 
      value: marketData?.nifty?.value, 
      change: marketData?.nifty?.changePercent || 0,
      high: marketData?.nifty?.high,
      low: marketData?.nifty?.low,
      sparkline: SAMPLE_NIFTY_DATA,
      icon: BarChart3 
    },
    { 
      name: 'Sensex', 
      value: marketData?.sensex?.value, 
      change: marketData?.sensex?.changePercent || 0,
      high: marketData?.sensex?.high,
      low: marketData?.sensex?.low,
      sparkline: SAMPLE_SENSEX_DATA,
      icon: TrendingUp 
    },
    { 
      name: 'India VIX', 
      value: marketData?.indiaVix?.value, 
      change: marketData?.indiaVix?.changePercent || 0,
      high: marketData?.indiaVix?.value ? marketData.indiaVix.value * 1.1 : undefined,
      low: marketData?.indiaVix?.value ? marketData.indiaVix.value * 0.9 : undefined,
      sparkline: SAMPLE_VIX_DATA,
      icon: Activity 
    },
  ];

  const macroIndicators = [
    { name: 'Repo Rate', value: marketData?.macro?.repoRate ? `${marketData.macro.repoRate}%` : '6.50%', change: 'HOLD', signal: 'neutral' as const },
    { name: 'Inflation CPI', value: marketData?.macro?.inflationCPI ? `${marketData.macro.inflationCPI}%` : '5.10%', change: `${(marketData?.macro?.inflationCPI ?? 5.1) < 5.5 ? '▼' : '▲'}0.2%`, signal: (marketData?.macro?.inflationCPI ?? 5.1) < 5.5 ? 'positive' as const : 'negative' as const },
    { name: 'USD/INR', value: marketData?.currency ? formatPrice(marketData.currency.usdInr) : '83.42', change: `${(marketData?.currency?.changePercent ?? 0) >= 0 ? '▼' : '▲'}${Math.abs((marketData?.currency?.changePercent) ?? 0.3).toFixed(1)}%`, signal: (marketData?.currency?.changePercent ?? 0) > 0 ? 'positive' as const : 'negative' as const },
    { name: 'Crude (Brent)', value: marketData?.commodities ? `$${formatPrice(marketData.commodities.brent)}` : '$89.4', change: `${(marketData?.commodities?.brentChangePercent ?? 0) >= 0 ? '▲' : '▼'}${Math.abs((marketData?.commodities?.brentChangePercent) ?? 2.1).toFixed(1)}%`, signal: 'negative' as const },
    { name: 'FII Flow', value: `${(marketData?.fiidata?.fiiNet ?? -824) >= 0 ? '+' : '-'}₹${Math.abs(marketData?.fiidata?.fiiNet ?? 824)}Cr`, change: (marketData?.fiidata?.fiiNet ?? -824) >= 0 ? 'INFLOW' : 'OUTFLOW', signal: (marketData?.fiidata?.fiiNet ?? -824) >= 0 ? 'positive' as const : 'negative' as const },
    { name: 'DII Flow', value: `${(marketData?.fiidata?.diiNet ?? 612) >= 0 ? '+' : '-'}₹${Math.abs(marketData?.fiidata?.diiNet ?? 612)}Cr`, change: (marketData?.fiidata?.diiNet ?? 612) >= 0 ? 'INFLOW' : 'OUTFLOW', signal: (marketData?.fiidata?.diiNet ?? 612) >= 0 ? 'positive' as const : 'negative' as const },
  ];

  const sectorMap = marketData?.sectors?.length ? 
    marketData.sectors.map(s => ({ name: s.name, change: s.change })) :
    [
      { name: 'Energy', change: 2.1 }, { name: 'Defense', change: 3.2 }, { name: 'IT', change: -0.3 },
      { name: 'Banking', change: -0.8 }, { name: 'Metal', change: 1.5 }, { name: 'Pharma', change: 0.5 },
      { name: 'FMCG', change: 0.2 }, { name: 'Auto', change: -1.2 },
    ];

  return (
    <div className="p-6 space-y-6">
      {/* Index Cards */}
      <div className="grid grid-cols-3 gap-4">
        {indexCards.map((item, idx) => (
          <GlassCard key={idx} className="p-5" style={{ backgroundColor: CARD_BG }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CYBER_LIME}15` }}>
                  <item.icon size={14} strokeWidth={1.5} style={{ color: CYBER_LIME }} />
                </div>
                <span style={{ color: MUTED_SLATE, fontSize: 12 }}>{item.name}</span>
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded"
                style={{
                  backgroundColor: item.change >= 0 ? `${CYBER_LIME}20` : `${ELECTRIC_CRIMSON}20`,
                  color: item.change >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON
                }}
              >
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
            
            <p className="text-3xl font-bold mb-1" style={{ color: '#ffffff' }}>
              {isLoading ? (
                <SkeletonNumber className="w-32 h-8" />
              ) : (
                <FlashText positive={item.change >= 0}>
                  {item.value ? (item.name === 'India VIX' ? formatPrice(item.value, 2) : formatPrice(item.value)) : '—'}
                </FlashText>
              )}
            </p>
            
            <div className="flex items-center gap-4 mb-3" style={{ color: TEXT_DIM, fontSize: 11 }}>
              <span>H: <span style={{ color: '#a0a8c0' }}>{item.high ? (item.name === 'India VIX' ? formatPrice(item.high, 2) : formatPrice(item.high)) : '—'}</span></span>
              <span>L: <span style={{ color: '#a0a8c0' }}>{item.low ? (item.name === 'India VIX' ? formatPrice(item.low, 2) : formatPrice(item.low)) : '—'}</span></span>
            </div>
            
            <SparklineChart data={item.sparkline} positive={item.change >= 0} />
          </GlassCard>
        ))}
      </div>

      {/* Sector Map and Fear & Greed */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <GlassCard className="p-5" style={{ backgroundColor: CARD_BG }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>Sector Density Map</h3>
              <div className="flex items-center gap-4 text-xs" style={{ color: MUTED_SLATE }}>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded" style={{ backgroundColor: CYBER_LIME }} />
                  Gainers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded" style={{ backgroundColor: ELECTRIC_CRIMSON }} />
                  Losers
                </span>
              </div>
            </div>
            <SectorDensityMap sectors={sectorMap} />
          </GlassCard>
        </div>
        
        <div className="col-span-4">
          <GlassCard className="p-5 h-full" style={{ backgroundColor: CARD_BG }}>
            <div className="flex items-center gap-2 mb-4">
              <Gauge size={14} strokeWidth={1.5} style={{ color: MUTED_SLATE }} />
              <h3 className="text-sm font-semibold" style={{ color: '#ffffff' }}>Fear & Greed</h3>
            </div>
            <FearGreedGauge value={42} />
          </GlassCard>
        </div>
      </div>

      {/* Top Gainers / Losers */}
      <TopGainersLosers onStockClick={onStockClick} />

      {/* Macro Indicators */}
      <GlassCard className="p-5" style={{ backgroundColor: CARD_BG }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-wider" style={{ color: '#ffffff' }}>Macro Indicators</h3>
          <Layers size={14} strokeWidth={1.5} style={{ color: MUTED_SLATE }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {macroIndicators.map((item, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: TEXT_MUTED, fontSize: 12 }}>{item.name}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: item.signal === 'positive' ? `${CYBER_LIME}20` : item.signal === 'negative' ? `${ELECTRIC_CRIMSON}20` : 'rgba(148,163,184,0.15)',
                    color: item.signal === 'positive' ? CYBER_LIME : item.signal === 'negative' ? ELECTRIC_CRIMSON : MUTED_SLATE
                  }}
                >
                  {item.change}
                </span>
              </div>
              <p className="text-lg font-bold font-mono" style={{ color: '#ffffff' }}>
                {isLoading ? <SkeletonNumber className="w-16 h-6" /> : item.value}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Full-width TradingView Chart */}
      <GlassCard className="p-5" style={{ backgroundColor: CARD_BG }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xs uppercase tracking-wider" style={{ color: '#ffffff' }}>Nifty 50</h3>
            {marketData?.nifty?.source && (
              <span className={`text-[10px] px-2 py-0.5 rounded ${getSourceBadgeClass(marketData.nifty.source.type)}`}>
                {marketData.nifty.source.type === 'live' ? '● Live' : '◐ Delayed'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
              }}
              defaultValue="NSE:NIFTY"
              onChange={(e) => {
                const symbol = e.target.value;
                if (typeof window !== 'undefined' && (window as any).reloadTradingView) {
                  (window as any).reloadTradingView(symbol);
                }
              }}
            >
              <option value="NSE:NIFTY" style={{ backgroundColor: '#12121f' }}>Nifty 50</option>
              <option value="BSE:SENSEX" style={{ backgroundColor: '#12121f' }}>BSE Sensex</option>
              <option value="NSE:BANKNIFTY" style={{ backgroundColor: '#12121f' }}>Bank Nifty</option>
              <option value="NSE:FINNIFTY" style={{ backgroundColor: '#12121f' }}>Finnifty</option>
              <option value="NSE:MIDCAPNIFTY" style={{ backgroundColor: '#12121f' }}>Midcap Nifty</option>
              <option value="NSE:NIFTYIT" style={{ backgroundColor: '#12121f' }}>Nifty IT</option>
              <option value="NSE:NIFTYPHARMA" style={{ backgroundColor: '#12121f' }}>Nifty Pharma</option>
              <option value="NSE:NIFTYAUTO" style={{ backgroundColor: '#12121f' }}>Nifty Auto</option>
              <option value="NSE:NIFTYFMCG" style={{ backgroundColor: '#12121f' }}>Nifty FMCG</option>
              <option value="NSE:NIFTYENERGY" style={{ backgroundColor: '#12121f' }}>Nifty Energy</option>
              <option value="NSE:NIFTYMETAL" style={{ backgroundColor: '#12121f' }}>Nifty Metal</option>
              <option value="NSE:NIFTYREALTY" style={{ backgroundColor: '#12121f' }}>Nifty Realty</option>
            </select>
            <div className="flex gap-1">
              {['1D', '1W', '1M', '3M', '1Y'].map((range, i) => (
                <button key={range} className="px-2 py-1 text-[10px] rounded transition-all"
                  style={{
                    backgroundColor: i === 0 ? CYBER_LIME : 'transparent',
                    color: i === 0 ? '#050505' : MUTED_SLATE
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
        <TradingViewWidget height={450} showPopout={true} defaultSymbol="NSE:NIFTY" />
      </GlassCard>

      {/* Disclaimer */}
      <GlassCard className="p-4" style={{ backgroundColor: 'rgba(255,179,71,0.05)', borderColor: 'rgba(255,179,71,0.2)' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={14} strokeWidth={1.5} style={{ color: NEUTRAL_YELLOW }} />
          <p className="text-xs leading-relaxed" style={{ color: NEUTRAL_YELLOW }}>
            For informational purposes only. Not financial advice. Consult SEBI registered advisor before making investment decisions.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

function NewsAnalysisView({ news }: { news: MarketNews }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const sentiment = news.impact === 'risk' ? 'BEARISH' : news.impact === 'opportunity' ? 'BULLISH' : 'NEUTRAL';
  const sentimentColor = sentiment === 'BULLISH' ? CYBER_LIME : sentiment === 'BEARISH' ? ELECTRIC_CRIMSON : NEUTRAL_YELLOW;

  return (
    <div className={`p-6 space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <GlassCard glow className="p-6" style={{ backgroundColor: CARD_BG }}>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{
              backgroundColor: news.impact === 'risk' ? `${ELECTRIC_CRIMSON}20` : news.impact === 'opportunity' ? `${CYBER_LIME}20` : 'rgba(148,163,184,0.15)',
              color: news.impact === 'risk' ? ELECTRIC_CRIMSON : news.impact === 'opportunity' ? CYBER_LIME : MUTED_SLATE
            }}
          >
            {news.impact.toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: MUTED_SLATE }}>{news.source} • {news.timeAgo}</span>
        </div>
        
        <h2 className="text-xl font-bold mb-6" style={{ color: '#ffffff' }}>{news.headline}</h2>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ 
            backgroundColor: news.niftyImpact >= 0 ? `${CYBER_LIME}10` : `${ELECTRIC_CRIMSON}10`, 
            border: `1px solid ${news.niftyImpact >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON}30` 
          }}>
            <p className="text-2xl font-bold font-mono" style={{ color: news.niftyImpact >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON }}>
              {news.niftyImpact >= 0 ? '+' : ''}{news.niftyImpact}%
            </p>
            <p className="text-[10px] mt-1" style={{ color: MUTED_SLATE }}>Est. Nifty Impact</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
            <p className="text-2xl font-bold font-mono" style={{ color: '#ffffff' }}>{Math.abs(news.niftyImpact) * 10}/10</p>
            <p className="text-[10px] mt-1" style={{ color: MUTED_SLATE }}>Impact Score</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
            <p className="text-2xl font-bold font-mono" style={{ color: '#ffffff' }}>{75 + Math.floor(Math.random() * 20)}%</p>
            <p className="text-[10px] mt-1" style={{ color: MUTED_SLATE }}>Confidence</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
            <p className="text-lg font-bold font-mono" style={{ color: sentimentColor }}>{sentiment}</p>
            <p className="text-[10px] mt-1" style={{ color: MUTED_SLATE }}>Market Sentiment</p>
          </div>
        </div>
      </GlassCard>

      <SectorDensityMap sectors={news.affectedSectors} />

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5" style={{ backgroundColor: CARD_BG }}>
          <h3 className="text-xs uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: ELECTRIC_CRIMSON }}>
            <ArrowDownRight size={14} />
            Risk Factors
          </h3>
          <ul className="space-y-3">
            {['Increased market volatility expected', 'Sector rotation likely', 'Foreign institutional flow uncertainty', 'Currency headwinds if USD strengthens'].map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(224,224,224,0.8)' }}>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ELECTRIC_CRIMSON }} />
                {risk}
              </li>
            ))}
          </ul>
        </GlassCard>
        
        <GlassCard className="p-5" style={{ backgroundColor: CARD_BG }}>
          <h3 className="text-xs uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: CYBER_LIME }}>
            <ArrowUpRight size={14} />
            Opportunities
          </h3>
          <ul className="space-y-3">
            {[...new Set(news.affectedSectors.map(s => s.name))].slice(0, 4).map((sector, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(224,224,224,0.8)' }}>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: CYBER_LIME }} />
                {sector} sector showing strength
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

export function MarketIntelligence() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'geopolitical' | 'trade' | 'currency' | 'commodities' | 'policy'>('all');
  const [selectedNews, setSelectedNews] = useState<MarketNews | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState<MarketOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const handleStockClick = useCallback((symbol: string, name: string) => {
    setSelectedStock({ symbol, name });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAllMarketData();
      setMarketData(data);
    } catch (error) {
      console.warn('Failed to fetch market data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const updateMarketStatus = () => {
      const open = checkMarketOpen();
      setIsMarketOpen(open);
    };
    
    updateMarketStatus();
    fetchData();
    
    const statusInterval = setInterval(updateMarketStatus, 60000);
    const dataInterval = setInterval(fetchData, 60000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(dataInterval);
    };
  }, [fetchData]);

  const filteredNews = MARKET_NEWS.filter(n => {
    const matchesSearch = n.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || n.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#050505' }}>
      <TopBar isMarketOpen={isMarketOpen} marketData={marketData} isLoading={isLoading} />

      <div className="flex-1 flex overflow-hidden">
        {/* News Feed Sidebar */}
        <div className="w-[360px] flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(10,10,10,0.5)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#ffffff' }}>Market News</h2>
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <RefreshCw size={14} style={{ color: MUTED_SLATE }} />
              </button>
            </div>
            
            <div className="relative mb-3">
              <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED_SLATE }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ffffff'
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-1">
              {(['all', 'geopolitical', 'trade', 'currency', 'commodities', 'policy'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className="px-2 py-1 text-[10px] rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: activeFilter === filter ? CYBER_LIME : 'rgba(255,255,255,0.03)',
                    color: activeFilter === filter ? '#050505' : MUTED_SLATE,
                    fontWeight: activeFilter === filter ? 600 : 400
                  }}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNews.map((news) => (
              <button
                key={news.id}
                onClick={() => setSelectedNews(news)}
                className={`w-full text-left p-4 transition-all duration-300 ${selectedNews?.id === news.id ? 'border-l-2' : ''}`}
                style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  backgroundColor: selectedNews?.id === news.id ? 'rgba(0,255,136,0.05)' : 'transparent',
                  borderLeftColor: selectedNews?.id === news.id ? CYBER_LIME : 'transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{
                    backgroundColor: news.impact === 'risk' ? ELECTRIC_CRIMSON : news.impact === 'opportunity' ? CYBER_LIME : '#2a2a3e',
                    color: news.impact === 'opportunity' ? '#000000' : '#ffffff'
                  }}>
                    {news.impact.toUpperCase()}
                  </span>
                  <span className="text-[10px]" style={{ color: TEXT_DIM }}>{news.source} • {news.timeAgo}</span>
                </div>
                
                <h3 className="text-sm font-bold leading-snug mb-2" style={{ color: '#e0e0e0' }}>
                  {news.headline}
                </h3>
                
                <p className="text-xs leading-relaxed mb-3" style={{ color: TEXT_MUTED }}>
                  {news.summary}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {news.affectedSectors.slice(0, 2).map((sector, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded" style={{
                      backgroundColor: sector.change >= 0 ? '#0d3320' : '#2d0f0f',
                      color: sector.change >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON
                    }}>
                      {sector.name} {sector.change >= 0 ? '+' : ''}{sector.change}%
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedNews ? (
            <NewsAnalysisView news={selectedNews} />
          ) : (
            <MarketOverview marketData={marketData} isLoading={isLoading} onStockClick={handleStockClick} />
          )}
        </div>

        {/* Right Panel */}
        <div className="w-[320px] overflow-y-auto" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(10,10,10,0.3)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider" style={{ color: '#ffffff' }}>Commodities</h3>
              {marketData?.commodities?.source && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getSourceBadgeClass(marketData.commodities.source.type)}`}>
                  {marketData.commodities.source.type === 'live' ? '●' : '◐'}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {[
                { name: 'Brent Crude', value: marketData?.commodities ? `$${formatPrice(marketData.commodities.brent)}` : '$89.4', change: marketData?.commodities?.brentChangePercent || 2.1 },
                { name: 'Gold (USD)', value: marketData?.commodities ? `$${formatPrice(marketData.commodities.gold)}` : '$2,030', change: marketData?.commodities?.goldChangePercent || 0.8 },
                { name: 'Gold (INR)', value: marketData?.commodities ? `₹${formatPrice(marketData.commodities.goldInr)}` : '₹62,400', change: marketData?.commodities?.goldChangePercent || 0.8 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span style={{ color: MUTED_SLATE, fontSize: 13 }}>{item.name}</span>
                  <div className="text-right">
                    <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 700 }}>{item.value}</span>
                    <span className="ml-2 font-medium" style={{ color: item.change >= 0 ? CYBER_LIME : ELECTRIC_CRIMSON, fontSize: 12 }}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider" style={{ color: '#ffffff' }}>Institutional Flow</h3>
              {marketData?.fiidata?.source && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getSourceBadgeClass(marketData.fiidata.source.type)}`}>
                  {marketData.fiidata.source.type === 'live' ? '●' : '◐'}
                </span>
              )}
            </div>
            <FIIIDataSection fiidata={marketData?.fiidata} />
          </div>

          <div className="p-4">
            <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: '#ffffff' }}>Market Events</h3>
            <div className="space-y-2">
              {[
                { date: 'Mar 20', event: 'RBI Policy Minutes', impact: 'high' },
                { date: 'Mar 21', event: 'US Fed Chair Speech', impact: 'high' },
                { date: 'Mar 22', event: 'India CPI Data', impact: 'medium' },
                { date: 'Mar 25', event: 'Q4 Earnings Season', impact: 'medium' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <span className="text-[10px] w-12" style={{ color: TEXT_DIM }}>{item.date}</span>
                  <span className="text-xs flex-1" style={{ color: '#e0e0e0' }}>{item.event}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.impact === 'high' ? ELECTRIC_CRIMSON : NEUTRAL_YELLOW }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {selectedStock && (
        <StockDetailModal
          symbol={selectedStock.symbol}
          name={selectedStock.name}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
}
