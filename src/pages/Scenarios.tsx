import { useState } from 'react';
import { Play, AlertTriangle, TrendingUp, TrendingDown, Minus, Settings2, Zap, Target, BarChart3, Clock } from 'lucide-react';
import type { EventType, Sector, SectorScore } from '../types';

const COUNTRIES = ['China', 'Pakistan', 'USA', 'Russia', 'Japan', 'Australia', 'Israel', 'Saudi Arabia'];
const EVENT_TYPES: { value: EventType; label: string; color: string; icon: string }[] = [
  { value: 'conflict', label: 'Military Conflict', color: '#EF4444', icon: '💥' },
  { value: 'trade', label: 'Trade War', color: '#F59E0B', icon: '📦' },
  { value: 'energy', label: 'Energy Crisis', color: '#D97706', icon: '⚡' },
  { value: 'climate', label: 'Climate Event', color: '#059669', icon: '🌊' },
  { value: 'technology', label: 'Tech Decoupling', color: '#8B5CF6', icon: '💻' },
  { value: 'diplomacy', label: 'Diplomatic Tensions', color: '#3B82F6', icon: '🤝' },
];

const SECTORS: Sector[] = ['economy', 'defense', 'trade', 'energy', 'diplomacy', 'technology'];

const SECTOR_COLORS: Record<Sector, string> = {
  economy: '#D97706',
  defense: '#DC2626',
  trade: '#CA8A04',
  energy: '#EA580C',
  diplomacy: '#2563EB',
  technology: '#7C3AED',
};

interface SimulationResult {
  sectorImpacts: SectorScore[];
  timeline: { month: string; impact: number }[];
  summary: string;
  confidence: number;
}

export function Scenarios() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [eventType, setEventType] = useState<EventType>('conflict');
  const [intensity, setIntensity] = useState(5);
  const [duration, setDuration] = useState(3);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const sectorImpacts = SECTORS.map(sector => {
        let score = Math.random() * 40 + 30;
        let change = Math.random() * 20 - 10;
        
        if (eventType === 'conflict' && (sector === 'defense' || sector === 'diplomacy')) {
          score += 20;
          change -= 15;
        }
        if (eventType === 'trade' && (sector === 'trade' || sector === 'economy')) {
          score += 25;
          change -= 20;
        }
        if (eventType === 'climate' && (sector === 'economy' || sector === 'energy')) {
          score += 15;
          change -= 10;
        }
        
        score = Math.min(100, Math.max(0, score + intensity * 3));
        
        const trend: 'up' | 'down' | 'stable' = change > 2 ? 'down' : change < -2 ? 'up' : 'stable';
        
        return {
          sector,
          score: Math.round(score),
          trend,
          change: Math.round(change * 10) / 10,
        };
      });

      const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
      const timeline = months.map((month, i) => ({
        month,
        impact: Math.min(100, Math.max(0, 50 + intensity * 3 + (i - duration) * 5 + Math.random() * 10 - 5)),
      }));

      const summaries: Record<string, string> = {
        conflict: `Military tensions with ${selectedCountry} would primarily impact defense capabilities and diplomatic relations. Economic sectors would face moderate disruption through supply chain uncertainties.`,
        trade: `Trade restrictions with ${selectedCountry} would significantly affect import-dependent industries. Technology and manufacturing sectors face the highest exposure.`,
        sanctions: `International sanctions scenario involving ${selectedCountry} would require diplomatic navigation. Trade rerouting may offset some economic impacts.`,
        energy: `Energy supply disruption from ${selectedCountry} region would pressure domestic inflation. Alternative sourcing arrangements would be critical.`,
        technology: `Technology decoupling with ${selectedCountry} would accelerate domestic manufacturing but face short-term supply constraints.`,
        climate: `Climate events affecting ${selectedCountry} would impact global supply chains and commodity prices, with secondary effects on Indian markets.`,
      };

      setResult({
        sectorImpacts,
        timeline,
        summary: summaries[eventType] || summaries.conflict,
        confidence: 0.75 + Math.random() * 0.15,
      });
      
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <div className="h-full flex">
      {/* Configuration Panel */}
      <div className="w-96 bg-bg-surface border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <Settings2 size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Scenario Builder</h2>
            <p className="text-xs text-text-muted">Configure simulation parameters</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Country Selection */}
          <div>
            <label className="section-label flex items-center gap-2 mb-3">
              <Target size={12} className="text-accent" />
              Select Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
            >
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="section-label flex items-center gap-2 mb-3">
              <Zap size={12} className="text-warning" />
              Event Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEventType(type.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-all text-left ${
                    eventType === type.value 
                      ? 'bg-accent/10 border border-accent/30 text-text-primary' 
                      : 'bg-bg-elevated border border-border text-text-muted hover:text-text-secondary hover:border-border-light'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <label className="section-label flex items-center gap-2 mb-3">
              <TrendingUp size={12} className="text-danger" />
              Intensity: <span className="text-danger font-bold font-mono">{intensity}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-text-muted">Low</span>
              <span className="text-xs text-text-muted">Medium</span>
              <span className="text-xs text-text-muted">Critical</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <label className="section-label flex items-center gap-2 mb-3">
              <Clock size={12} className="text-accent" />
              Duration: <span className="text-accent font-bold font-mono">{duration} {duration === 1 ? 'month' : 'months'}</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-text-muted">1M</span>
              <span className="text-xs text-text-muted">3M</span>
              <span className="text-xs text-text-muted">6M</span>
            </div>
          </div>
        </div>

        {/* Scenario Context Summary */}
        <div className="mt-4 p-3 bg-bg-elevated rounded-lg border border-border">
          <p className="section-label mb-2">Current Scenario</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-text-muted">Country:</span> <span className="text-text-primary font-medium">{selectedCountry}</span></div>
            <div><span className="text-text-muted">Type:</span> <span className="text-text-primary font-medium capitalize">{eventType}</span></div>
            <div><span className="text-text-muted">Intensity:</span> <span className="text-danger font-mono font-bold">{intensity}/10</span></div>
            <div><span className="text-text-muted">Duration:</span> <span className="text-accent font-mono font-bold">{duration}M</span></div>
          </div>
        </div>

        {/* Run Simulation Button — CRITICAL: must remain accessible */}
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full py-4 bg-accent hover:bg-accent-muted disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors flex items-center justify-center gap-3 mt-3"
        >
          {isSimulating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Simulation...
            </>
          ) : (
            <>
              <Play size={20} />
              Run Simulation
            </>
          )}
        </button>
      </div>

      {/* Results Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-xl bg-bg-elevated flex items-center justify-center border border-border mb-6">
              <BarChart3 size={48} className="text-text-muted opacity-30" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3">Scenario Analysis</h3>
            <p className="text-sm text-text-muted max-w-lg leading-relaxed">
              Configure your scenario parameters on the left and run simulation to see potential impacts across all sectors and regions.
            </p>
            <div className="flex items-center gap-6 mt-6 text-xs text-text-muted">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" />Dynamic Simulation</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-warning" />Sector Analysis</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-info" />Timeline Projection</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Summary */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      {eventType.charAt(0).toUpperCase() + eventType.slice(1)} Scenario: {selectedCountry}
                    </h3>
                    <p className="text-xs text-text-muted">Impact projection based on current parameters</p>
                  </div>
                </div>
                <span className={`badge ${
                  result.confidence > 0.85 ? 'badge-success' :
                  result.confidence > 0.7 ? 'badge-warning' : 'badge-danger'
                }`}>
                  {Math.round(result.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{result.summary}</p>
            </div>

            {/* Sector Impact Bars */}
            <div className="card p-6">
              <h3 className="section-label flex items-center gap-2 mb-5">
                <BarChart3 size={14} className="text-accent" />
                Sector Impact Analysis
              </h3>
              <div className="space-y-4">
                {result.sectorImpacts.map((sector) => (
                  <div key={sector.sector} className="p-3 bg-bg-elevated rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary capitalize flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTOR_COLORS[sector.sector] }} />
                        {sector.sector}
                        {sector.trend === 'up' ? (
                          <TrendingUp size={14} className="text-success" />
                        ) : sector.trend === 'down' ? (
                          <TrendingDown size={14} className="text-danger" />
                        ) : (
                          <Minus size={14} className="text-text-muted" />
                        )}
                      </span>
                      <span className="text-sm font-bold font-mono" style={{ color: SECTOR_COLORS[sector.sector] }}>
                        {sector.score}/100
                        <span className="text-xs text-text-muted ml-1">
                          ({sector.change > 0 ? '+' : ''}{sector.change}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${sector.score}%`, backgroundColor: SECTOR_COLORS[sector.sector] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="section-label flex items-center gap-2 mb-5">
                <Clock size={14} className="text-accent" />
                Impact Timeline ({duration} months)
              </h3>
              <div className="flex items-end justify-between gap-3 h-40 px-4">
                {result.timeline.slice(0, duration).map((point) => (
                  <div key={point.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t-md transition-all duration-700 ease-out"
                      style={{ 
                        height: `${point.impact}%`,
                        backgroundColor: point.impact > 70 ? '#DC2626' : point.impact > 50 ? '#D97706' : '#059669',
                      }}
                    />
                    <span className="text-xs text-text-muted">{point.month.replace('Month ', 'M')}</span>
                    <span className={`text-xs font-bold font-mono ${
                      point.impact > 70 ? 'text-danger' : point.impact > 50 ? 'text-warning' : 'text-success'
                    }`}>
                      {Math.round(point.impact)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
