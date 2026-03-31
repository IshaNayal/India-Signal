export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EventType = 'conflict' | 'trade' | 'diplomacy' | 'energy' | 'technology' | 'climate' | 'defense';
export type Sector = 'economy' | 'defense' | 'trade' | 'energy' | 'diplomacy' | 'technology';
export type NewsCategory = 'breaking' | 'urgent' | 'analysis' | 'update';

export interface GlobalEvent {
  id: string;
  title: string;
  summary: string;
  country: string;
  countryCode: string;
  eventType: EventType;
  timestamp: string;
  indiaImpactScore: number;
  sectors: Sector[];
  isLive: boolean;
  aiSummary?: string;
  causeId?: string;
  effectIds?: string[];
}

export interface RegionalImpactItem {
  region: string;
  percentage: number;
  color: 'red' | 'orange' | 'yellow' | 'green';
}

export interface AffectedNation {
  country: string;
  code: string;
  status: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
}

export interface SectorImpact {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TimelineEvent {
  date: string;
  event: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  sector: string;
}

export interface Recommendation {
  rank: number;
  title: string;
  detail: string;
  urgency: 'critical' | 'high' | 'moderate' | 'low';
}

export interface SimulationSource {
  publisher: string;
  headline: string;
  url: string;
  time_ago: string;
  sector: string;
}

export interface SimulationData {
  query_topic: string;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impact_score: number;
  confidence: number;
  events_count: number;
  regional_impact: RegionalImpactItem[];
  affected_nations: AffectedNation[];
  sectors: SectorImpact[];
  timeline: TimelineEvent[];
  recommendations: Recommendation[];
  sources: SimulationSource[];
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  threatLevel: ThreatLevel;
  relationScore: number;
  tradeVolume: number;
  militaryStrength: number;
  activeEvents: number;
}

export interface SectorScore {
  sector: Sector;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
  confidence?: number;
  simulation?: SimulationResult;
}

export interface SimulationResult {
  scenario: string;
  timeline: { month: string; impact: number; description: string }[];
  affectedSectors: { sector: Sector; impact: number; probability: number }[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  category: NewsCategory;
  country: string;
  countryCode: string;
  timestamp: string;
  impact: number;
  relatedEventId?: string;
  isBreaking?: boolean;
  source?: string;
  url?: string;
  image?: string;
}

export interface CauseEffectNode {
  id: string;
  eventId: string;
  title: string;
  type: 'cause' | 'effect' | 'sector';
  sector?: Sector;
  impact: number;
  children: CauseEffectNode[];
}

export interface ConflictDot {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  type: 'military' | 'political' | 'economic';
  country: string;
  description: string;
  timestamp: string;
}

export interface Scenario {
  id: string;
  country: string;
  eventType: EventType;
  intensity: number;
  duration: number;
  sectorImpacts: SectorScore[];
  timeline: { month: string; impact: number }[];
  summary: string;
  confidence: number;
}

export interface AppState {
  activePage: 'map' | 'dashboard' | 'analyst' | 'scenarios' | 'countries' | 'news' | 'market';
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  newsPanelOpen: boolean;
  selectedCountry: string | null;
  selectedEvent: GlobalEvent | null;
  searchQuery: string;
  eventTypeFilter: EventType | 'all';
  timeFilter: 'today' | 'week' | 'month' | 'all';
  news: NewsItem[];
}
