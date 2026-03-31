import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CONFLICT_DOTS } from '../data/mockData';

const TYPE_COLORS = {
  military: '#DC2626',
  political: '#D97706',
  economic: '#CA8A04',
};

const TYPE_LABELS: Record<string, string> = {
  military: 'Military',
  political: 'Political',
  economic: 'Economic',
};

export function IndiaImpactMap() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <h2 className="text-lg font-semibold text-text-primary">Conflict Zones</h2>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      <div className="h-72 rounded-lg overflow-hidden border border-border">
        <MapContainer center={[28, 78]} zoom={3} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {CONFLICT_DOTS.map((dot) => (
            <CircleMarker
              key={dot.id}
              center={[dot.lat, dot.lng]}
              radius={dot.intensity}
              pathOptions={{ color: TYPE_COLORS[dot.type], fillColor: TYPE_COLORS[dot.type], fillOpacity: 0.35, weight: 1.5 }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[dot.type] }} />
                    <span className="font-semibold text-sm">{dot.country}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{dot.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">Intensity</span>
                    <span className={`text-xs font-bold ${dot.intensity >= 8 ? 'text-red-600' : dot.intensity >= 5 ? 'text-orange-500' : 'text-yellow-500'}`}>
                      {dot.intensity}/10
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export function ConflictTimeline() {
  const sortedDots = [...CONFLICT_DOTS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <p className="section-label mb-3">Recent Escalations</p>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {sortedDots.slice(0, 6).map((dot, index) => {
          const timeAgo = getTimeAgo(dot.timestamp);
          const isNew = new Date().getTime() - new Date(dot.timestamp).getTime() < 6 * 60 * 60 * 1000;

          return (
            <div
              key={dot.id}
              className={`flex items-center gap-3 p-2.5 rounded-md transition-colors ${isNew ? 'bg-danger/5 border border-danger/15' : 'hover:bg-bg-elevated'}`}
            >
              <span className="text-sm font-mono text-text-muted w-4 text-right">{index + 1}</span>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[dot.type] }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{dot.description}</p>
                <p className="text-xs text-text-muted">{dot.country}</p>
              </div>
              <span className={`text-xs font-mono font-semibold ${dot.intensity >= 8 ? 'text-danger' : dot.intensity >= 5 ? 'text-warning' : 'text-success'}`}>
                {dot.intensity}
              </span>
              <span className="text-xs text-text-muted w-8 text-right">{timeAgo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export function ThreatHeatmap() {
  const regions = [
    { name: 'Western Front', countries: ['Pakistan'], baseScore: 85, trend: 'up' },
    { name: 'Northern Border', countries: ['China'], baseScore: 72, trend: 'stable' },
    { name: 'Middle East', countries: ['Israel', 'Saudi Arabia'], baseScore: 55, trend: 'down' },
    { name: 'Southeast Asia', countries: ['Vietnam', 'Philippines'], baseScore: 45, trend: 'up' },
    { name: 'Central Asia', countries: ['Afghanistan'], baseScore: 40, trend: 'stable' },
    { name: 'Europe', countries: ['Russia', 'Ukraine'], baseScore: 35, trend: 'down' },
  ];

  const getColor = (score: number) => score >= 70 ? '#DC2626' : score >= 40 ? '#D97706' : '#059669';

  return (
    <div>
      <p className="section-label mb-3">Regional Threat Assessment</p>
      <div className="space-y-3">
        {regions.map((region) => (
          <div key={region.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-text-primary">{region.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${region.trend === 'up' ? 'text-danger' : region.trend === 'down' ? 'text-success' : 'text-text-muted'}`}>
                  {region.trend === 'up' ? '↑' : region.trend === 'down' ? '↓' : '→'}
                </span>
                <span className="text-sm font-mono font-semibold" style={{ color: getColor(region.baseScore) }}>
                  {region.baseScore}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${region.baseScore}%`, backgroundColor: getColor(region.baseScore) }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1">{region.countries.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
