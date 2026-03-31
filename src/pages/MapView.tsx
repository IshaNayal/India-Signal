import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { X, Clock, ExternalLink, Globe, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboardStore } from '../store/dashboardStore';
import { MOCK_EVENTS } from '../data/mockData';
import type { GlobalEvent, EventType } from '../types';

const EVENT_COLORS: Record<EventType, string> = {
  conflict: '#EF4444',
  trade: '#F59E0B',
  diplomacy: '#3B82F6',
  energy: '#D97706',
  technology: '#8B5CF6',
  climate: '#059669',
  defense: '#DC2626',
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  CN: [35.8617, 104.1954],
  PK: [30.3753, 69.3451],
  US: [37.0902, -95.7129],
  RU: [61.5240, 105.3188],
  FR: [46.2276, 2.2137],
  JP: [36.2048, 138.2529],
  AU: [-25.2744, 133.7751],
  IL: [31.0461, 34.8516],
  SA: [23.8859, 45.0792],
  BD: [23.6850, 90.3563],
  IN: [20.5937, 78.9629],
  TW: [23.6978, 120.9605],
  DE: [51.1657, 10.4515],
  PH: [12.8797, 121.7740],
  QA: [25.3548, 51.1839],
};

function createMarkerIcon(color: string, isLive: boolean): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
      ">
        <div style="
          position: absolute;
          inset: 0;
          background: ${color};
          border-radius: 50%;
          opacity: 0.3;
          ${isLive ? 'animation: pulse 2s infinite;' : ''}
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: ${color};
          border-radius: 50%;
          border: 2px solid #0B1220;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function MapView() {
  const { selectedEvent, setSelectedEvent, eventTypeFilter } = useDashboardStore();

  const eventsToShow = eventTypeFilter === 'all' 
    ? MOCK_EVENTS.filter(e => COUNTRY_COORDS[e.countryCode])
    : MOCK_EVENTS.filter(e => e.eventType === eventTypeFilter && COUNTRY_COORDS[e.countryCode]);

  return (
    <div className="h-full w-full relative">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.1; }
        }
        .leaflet-container { background: #0B1220 !important; }
        .leaflet-popup-content-wrapper { 
          background: #111827 !important; 
          border: 1px solid #1F2937 !important;
          border-radius: 8px !important;
          color: #E5E7EB !important;
        }
        .leaflet-popup-tip { background: #111827 !important; }
        .leaflet-popup-close-button { color: #6B7280 !important; }
      `}</style>

      <MapContainer
        center={[20, 80]}
        zoom={4}
        className="h-full w-full"
        zoomControl={false}
        style={{ background: '#0B1220' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {eventsToShow.map((event) => {
          const coords = COUNTRY_COORDS[event.countryCode];
          if (!coords) return null;
          
          return (
            <Marker
              key={event.id}
              position={coords}
              icon={createMarkerIcon(EVENT_COLORS[event.eventType], event.isLive)}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <p className="font-semibold text-sm mb-1">{event.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{event.country}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">India Impact:</span>
                    <span className={`font-bold ${
                      event.indiaImpactScore > 6 ? 'text-red-500' : 
                      event.indiaImpactScore > 3 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {event.indiaImpactScore}/10
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 card p-4 z-[1000] min-w-[160px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h3 className="section-label">Event Types</h3>
        </div>
        <div className="space-y-2.5">
          {Object.entries(EVENT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-3 cursor-pointer group">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-text-secondary capitalize group-hover:text-text-primary transition-colors">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Event Detail — CRITICAL: setSelectedEvent handler preserved */}
      {selectedEvent && (
        <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* Timeline */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 card p-3 z-[1000] flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-accent" />
          <span className="text-xs text-text-muted">Timeline:</span>
        </div>
        <div className="flex gap-1">
          {['24h', '7d', '30d', 'All'].map((range, idx) => (
            <button
              key={range}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                idx === 0 
                  ? 'bg-accent text-white font-medium' 
                  : 'bg-bg-elevated hover:bg-bg-hover text-text-muted hover:text-text-primary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Map Info */}
      <div className="absolute bottom-4 right-4 card p-3 z-[1000] flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Globe size={12} className="text-accent" />
          <span className="text-xs text-text-muted">{eventsToShow.length} events</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <span className="text-xs text-text-muted">Click markers for details</span>
      </div>
    </div>
  );
}

interface EventDetailPanelProps {
  event: GlobalEvent;
  onClose: () => void;
}

function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const impactColor = event.indiaImpactScore > 6 ? 'text-danger' : event.indiaImpactScore > 3 ? 'text-warning' : 'text-success';
  const impactBg = event.indiaImpactScore > 6 ? 'bg-danger/15' : event.indiaImpactScore > 3 ? 'bg-warning/15' : 'bg-success/15';
  
  return (
    <div className="absolute top-4 left-4 w-96 card p-6 z-[1000] animate-slide-in-left">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge ${event.eventType === 'conflict' ? 'badge-danger' : 'badge-info'}`}>
              {event.eventType}
            </span>
            {event.isLive && (
              <span className="badge badge-danger flex items-center gap-1 animate-pulse">
                <AlertTriangle size={10} /> Live
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-text-primary leading-snug">{event.title}</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-md transition-colors group shrink-0">
          <X size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
        </button>
      </div>

      <p className="text-sm text-text-secondary mb-4 leading-relaxed">{event.summary}</p>

      {/* AI Summary */}
      {event.aiSummary && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={12} className="text-accent" />
            <p className="section-label text-accent">AI Analysis</p>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{event.aiSummary}</p>
        </div>
      )}

      {/* Impact Score */}
      <div className="flex items-center justify-between mb-4 p-4 bg-bg-elevated rounded-lg">
        <div>
          <span className="text-xs text-text-muted block mb-1">India Impact Score</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold font-mono ${impactColor}`}>
              {event.indiaImpactScore}
            </span>
            <span className="text-sm text-text-muted">/10</span>
          </div>
        </div>
        <div className={`w-14 h-14 rounded-full ${impactBg} flex items-center justify-center`}>
          <TrendingUp size={22} className={impactColor} />
        </div>
      </div>

      {/* Sectors */}
      <div className="flex flex-wrap gap-2 mb-4">
        {event.sectors.map((sector) => (
          <span key={sector} className="badge badge-neutral capitalize">
            {sector}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Clock size={12} />
          <span>{new Date(event.timestamp).toLocaleString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium rounded-md transition-colors"
        >
          Full Report
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
