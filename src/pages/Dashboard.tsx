import { TrendingUp, TrendingDown, Minus, AlertTriangle, DollarSign, Shield, Zap, Globe2, Cpu, ChevronRight } from 'lucide-react';
import { MOCK_COUNTRIES, SECTOR_SCORES, MOCK_EVENTS } from '../data/mockData';
import { ImpactChainSummary } from '../components/CauseEffectFlow';
import { IndiaImpactMap, ConflictTimeline, ThreatHeatmap } from '../components/IndiaImpactMap';
import type { Sector, ThreatLevel } from '../types';

const SECTOR_ICONS: Record<Sector, React.ReactNode> = {
  economy: <DollarSign size={16} />,
  defense: <Shield size={16} />,
  trade: <TrendingUp size={16} />,
  energy: <Zap size={16} />,
  diplomacy: <Globe2 size={16} />,
  technology: <Cpu size={16} />,
};

const SECTOR_COLORS: Record<Sector, string> = {
  economy: '#D97706',
  defense: '#DC2626',
  trade: '#CA8A04',
  energy: '#EA580C',
  diplomacy: '#2563EB',
  technology: '#7C3AED',
};

const THREAT_BADGE: Record<ThreatLevel, string> = {
  CRITICAL: 'badge-danger',
  HIGH: 'badge-warning',
  MEDIUM: 'badge-info',
  LOW: 'badge-success',
};

export function Dashboard() {
  const indiaThreatIndex = 67;
  const criticalThreats = MOCK_COUNTRIES.filter(c => c.threatLevel === 'CRITICAL' || c.threatLevel === 'HIGH');
  const liveEvents = MOCK_EVENTS.filter(e => e.isLive);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-[1600px]">

        {/* ── ROW 1: Key Metrics ── */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-primary">Strategic Overview</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-text-muted">{liveEvents.length} active events</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Threat Index — spans 3 cols */}
            <div className="col-span-3">
              <ThreatIndex score={indiaThreatIndex} />
            </div>
            {/* 6 Sector KPIs — 1.5 cols each (we use a nested 6-col grid) */}
            <div className="col-span-9 grid grid-cols-3 gap-4">
              {SECTOR_SCORES.map((sector) => (
                <SectorCard key={sector.sector} sector={sector} />
              ))}
            </div>
          </div>
        </section>

        {/* ── ROW 2: Map + Critical Threats ── */}
        <section className="grid grid-cols-12 gap-4">
          {/* Map — 8 cols */}
          <div className="col-span-8 card p-5">
            <IndiaImpactMap />
          </div>

          {/* Critical Threats — 4 cols */}
          <div className="col-span-4 card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-danger" />
              <h2 className="text-lg font-semibold text-text-primary">Critical Threats</h2>
              <span className="badge badge-danger ml-auto">{criticalThreats.length}</span>
            </div>
            <div className="space-y-1">
              {criticalThreats.slice(0, 6).map((country) => {
                const countryEvent = MOCK_EVENTS.find(e => e.countryCode === country.code && e.isLive);
                return (
                  <div key={country.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-bg-elevated transition-colors cursor-pointer group">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{country.name}</p>
                      {countryEvent && (
                        <p className="text-xs text-text-muted truncate mt-0.5">{countryEvent.title}</p>
                      )}
                    </div>
                    <span className={`badge ${THREAT_BADGE[country.threatLevel]}`}>
                      {country.threatLevel}
                    </span>
                    <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── ROW 3: Analysis Panels ── */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-4 card p-5">
            <ThreatHeatmap />
          </div>
          <div className="col-span-4 card p-5">
            <ImpactChainSummary />
          </div>
          <div className="col-span-4 card p-5">
            <ConflictTimeline />
          </div>
        </section>

      </div>
    </div>
  );
}

/* ── THREAT INDEX GAUGE ── */
function ThreatIndex({ score }: { score: number }) {
  const color = score > 70 ? '#DC2626' : score > 50 ? '#D97706' : '#059669';
  const label = score > 70 ? 'Critical' : score > 50 ? 'Elevated' : 'Normal';
  const circumference = 2 * Math.PI * 72;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card p-5 flex flex-col items-center justify-center h-full">
      <p className="section-label mb-4">Threat Index</p>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="#1E2536" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="72" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-xs text-text-muted mt-0.5">/100</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
    </div>
  );
}

/* ── SECTOR KPI CARD ── */
function SectorCard({ sector }: { sector: typeof SECTOR_SCORES[0] }) {
  const TrendIcon = sector.trend === 'up' ? TrendingUp : sector.trend === 'down' ? TrendingDown : Minus;
  const trendColor = sector.trend === 'up' ? 'text-success' : sector.trend === 'down' ? 'text-danger' : 'text-text-muted';
  const color = SECTOR_COLORS[sector.sector];

  return (
    <div className="card p-4 hover:bg-bg-elevated/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}18`, color }}>
            {SECTOR_ICONS[sector.sector]}
          </div>
          <span className="text-sm font-medium text-text-secondary capitalize">{sector.sector}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon size={14} className={trendColor} />
          {sector.change !== 0 && (
            <span className={`text-xs font-mono font-semibold ${trendColor}`}>
              {sector.change > 0 ? '+' : ''}{sector.change}%
            </span>
          )}
        </div>
      </div>
      {/* Score */}
      <div className="mb-3">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{sector.score}</span>
        <span className="text-sm text-text-muted ml-1">/100</span>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${sector.score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
