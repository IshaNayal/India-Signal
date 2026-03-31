import { useState, useRef, useEffect } from 'react';
import { Bot, User, RefreshCw, PieChart, ExternalLink, Clock, ChevronRight, Shield, Lock, Radio, Maximize2, Minimize2, Download, Share2, Star, Timer, Target, Zap, Copy, Check, ChevronDown, ChevronUp, Search, History, TrendingUp } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useDashboardStore } from '../store/dashboardStore';
import { MOCK_EVENTS, MOCK_COUNTRIES, SECTOR_SCORES } from '../data/mockData';
import type { Sector, ChatMessage, SimulationData, RegionalImpactItem, AffectedNation, SectorImpact, TimelineEvent, Recommendation, SimulationSource } from '../types';

interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceIcon: string;
  url: string;
  publishedAt: string;
  relevance: string;
}

interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
}

interface AnalysisResult {
  id: string;
  query: string;
  queryIntent: QueryIntent;
  simulationData: SimulationData;
  primaryEvent: typeof MOCK_EVENTS[0];
  relatedEvents: typeof MOCK_EVENTS;
  sectorImpacts: { sector: Sector; currentScore: number; projectedImpact: number; change: number; probability: number }[];
  regionalImpact: { region: string; countries: string[]; impact: number; change: number }[];
  timeline: { period: string; impact: number; description: string; keyActions: string[]; date?: string }[];
  recommendations: { priority: number; action: string; rationale: string; stakeholders: string[] }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedCountries: { name: string; flag: string; code: string; relation: number; currentTension: string }[];
  sources: NewsArticle[];
  summary: string;
  confidence: number;
  timestamp: string;
  detailedResponse: string;
  followUpSuggestions: string[];
}

const afghanistanNews: NewsArticle[] = [
  { id: 'af1', headline: 'Afghanistan: Taliban Forces Seize Key Provincial Capital', summary: 'Islamic Emirate forces advance on northern provinces. Regional stability concerns mount.', source: 'BBC News', sourceIcon: '🌍', url: 'https://bbc.com/news/afghanistan-conflict', publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
  { id: 'af2', headline: 'Pakistan-Afghanistan Border: Torkham Crossing Closed Amid Clashes', summary: 'Both armies exchange fire at border posts. Civilian crossings suspended indefinitely.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/asia/pakistan-afghanistan-border', publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
  { id: 'af3', headline: 'UN Security Council Discusses Afghanistan-Pakistan Tensions', summary: 'Secretary-General urges dialogue. Refugee flow concerns raised by neighboring nations.', source: 'Al Jazeera', sourceIcon: '🌐', url: 'https://aljazeera.com/afghanistan-un-security-council', publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
  { id: 'af4', headline: 'Pakistan:TTP Militants Launch Attacks from Afghan Territory', summary: ' Tehrik-i-Taliban Pakistan exploits Afghan sanctuaries. Security forces on high alert.', source: 'The Hindu', sourceIcon: '📰', url: 'https://thehindu.com/afghanistan-ttp-attacks', publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
  { id: 'af5', headline: ' Durand Line Dispute: Historical Border Creates Modern Tensions', summary: 'Afghanistan refuses to recognize 1893 British-drawn boundary with Pakistan.', source: 'BBC News', sourceIcon: '🌍', url: 'https://bbc.com/news/durand-line', publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
];

const russiaUkraineNews: NewsArticle[] = [
  { id: 'ru1', headline: 'Ukraine: Russian Forces Launch Major Offensive in Donbas Region', summary: 'Moscow intensifies ground assault. Ukrainian defenses under severe pressure.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/ukraine/russia-offensive', publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
  { id: 'ru2', headline: 'NATO Summit: Allies Pledge Additional Military Aid to Ukraine', summary: '$40 billion package approved. Air defense systems prioritized.', source: 'BBC News', sourceIcon: '🌍', url: 'https://bbc.com/news/nato-ukraine-aid', publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
  { id: 'ru3', headline: 'Peace Negotiations: Both Sides Claim Progress in Talks', summary: 'Qatar-mediated discussions continue. Ceasefire terms remain disputed.', source: 'Al Jazeera', sourceIcon: '🌐', url: 'https://aljazeera.com/ukraine-peace-talks', publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
  { id: 'ru4', headline: 'India\'s Position: PM Modi Speaks to Both Zelensky and Putin', summary: 'New Delhi maintains balanced approach. Calls for immediate cessation of hostilities.', source: 'NDTV', sourceIcon: '📺', url: 'https://ndtv.com/india/ukraine-india-diplomacy', publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
];

const israelGazaNews: NewsArticle[] = [
  { id: 'ig1', headline: 'Gaza: Ceasefire Negotiations Stall at Final Hurdle', summary: 'Hamas and Israel differ on hostage release terms. International pressure mounts.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/middle-east/gaza-ceasefire', publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
  { id: 'ig2', headline: 'Red Sea: Houthi Attacks Disrupt Global Shipping Lanes', summary: 'Yemen-based group targets commercial vessels. Insurance costs surge 300%.', source: 'Bloomberg', sourceIcon: '💰', url: 'https://bloomberg.com/markets/red-sea-houthi', publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), relevance: 'Trade' },
  { id: 'ig3', headline: 'Humanitarian Crisis: 2 Million Gaza Civilians Need Aid', summary: 'UNRWA warns of famine risk. India sends third relief consignment.', source: 'Al Jazeera', sourceIcon: '🌐', url: 'https://aljazeera.com/gaza-humanitarian', publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
];

interface QueryIntent {
  originalQuery: string;
  primaryActors: string[];
  secondaryActors: string[];
  conflictType: string;
  indiaAngle: 'direct' | 'third_party' | 'observer';
  queryType: 'direct_conflict' | 'third_party_impact' | 'general_analysis' | 'clarification_needed';
  keywords: string[];
  confidence: number;
  suggestedClarification?: string[];
}

const COUNTRY_ALIASES: Record<string, string[]> = {
  'india': ['india', 'indian', 'new delhi'],
  'pakistan': ['pakistan', 'pakistani', 'islamabad', 'punjab'],
  'china': ['china', 'chinese', 'beijing', 'pla'],
  'usa': ['usa', 'america', 'american', 'united states', 'washington'],
  'russia': ['russia', 'russian', 'moscow', 'kremlin'],
  'ukraine': ['ukraine', 'ukrainian', 'kyiv', 'kiev'],
  'afghanistan': ['afghanistan', 'afghan', 'taliban', 'kabul'],
  'israel': ['israel', 'israeli', 'tel aviv'],
  'gaza': ['gaza', 'palestine', 'palestinian', 'hamas'],
  'iran': ['iran', 'iranian', 'tehran'],
  'taiwan': ['taiwan', 'taiwanese', 'beijing'],
  'japan': ['japan', 'japanese', 'tokyo'],
  'australia': ['australia', 'australian', 'canberra'],
  'nepal': ['nepal', 'nepalese', 'kathmandu'],
  'bangladesh': ['bangladesh', 'bangladeshi', 'dhaka'],
  'sri lanka': ['sri lanka', 'sri lankan', 'colombo'],
  'myanmar': ['myanmar', 'burma', 'myanmarese'],
};

const CONFLICT_KEYWORDS = ['war', 'conflict', 'tension', 'crisis', 'attack', 'border', 'dispute', 'sanctions', 'invasion', 'offensive', 'military', 'clash', 'ceasefire', 'negotiations', 'treaty'];

const RELATIONSHIP_KEYWORDS = {
  indiaAsSubject: ['india and', 'india-pak', 'india china', 'india\'s', 'indian response', 'india\'s stance'],
  thirdParty: ['effect on india', 'impact on india', 'affect india', 'how does', 'india implications', 'spillover', 'implications for india', 'on india'],
};

function extractQueryIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();
  
  const detectedCountries: string[] = [];
  const keywords: string[] = [];
  
  for (const [country, aliases] of Object.entries(COUNTRY_ALIASES)) {
    for (const alias of aliases) {
      if (lowerQuery.includes(alias)) {
        if (!detectedCountries.includes(country)) {
          detectedCountries.push(country);
        }
        break;
      }
    }
  }
  
  for (const kw of CONFLICT_KEYWORDS) {
    if (lowerQuery.includes(kw)) {
      keywords.push(kw);
    }
  }
  
  let indiaAngle: QueryIntent['indiaAngle'] = 'observer';
  let queryType: QueryIntent['queryType'] = 'general_analysis';
  
  const indiaInQuery = detectedCountries.includes('india');
  
  if (indiaInQuery && detectedCountries.length === 2) {
    const other = detectedCountries.find(c => c !== 'india');
    if (other) {
      indiaAngle = 'direct';
      queryType = 'direct_conflict';
    }
  }
  
  for (const kw of RELATIONSHIP_KEYWORDS.thirdParty) {
    if (lowerQuery.includes(kw)) {
      indiaAngle = 'third_party';
      queryType = 'third_party_impact';
      break;
    }
  }
  
  if (!indiaInQuery && detectedCountries.length === 2) {
    indiaAngle = 'third_party';
    queryType = 'general_analysis';
  }
  
  if (detectedCountries.length > 2) {
    queryType = 'clarification_needed';
  }
  
  if (detectedCountries.length === 0) {
    if (keywords.some(k => CONFLICT_KEYWORDS.includes(k))) {
      queryType = 'general_analysis';
    }
  }
  
  let confidence = 50;
  if (detectedCountries.length === 2) confidence += 30;
  if (keywords.length > 0) confidence += 15;
  if (query.length > 20) confidence += 10;
  confidence = Math.min(95, confidence);
  
  const ambiguousPairs: Record<string, string[]> = {
    'pakistan-afghanistan': ['Pakistan vs Afghanistan conflict', 'Pakistan-India conflict involving Afghanistan', 'Afghanistan-India conflict involving Pakistan'],
    'russia-ukraine': ['Russia-Ukraine war', 'Russia-NATO escalation', 'Ukraine-India relations'],
    'israel-gaza': ['Israel-Gaza conflict', 'Middle East regional impact', 'Impact on India'],
  };
  
  const key = detectedCountries.slice().sort().join('-');
  const suggestedClarification = ambiguousPairs[key];
  
  return {
    originalQuery: query,
    primaryActors: detectedCountries.filter(c => c !== 'india'),
    secondaryActors: detectedCountries.filter(c => c === 'india'),
    conflictType: keywords.length > 0 ? 'armed conflict' : 'geopolitical situation',
    indiaAngle,
    queryType,
    keywords,
    confidence,
    suggestedClarification,
  };
}

function getNewsForIntent(intent: QueryIntent): NewsArticle[] {
  const actors = intent.primaryActors;
  
  if (actors.includes('afghanistan') && actors.includes('pakistan')) {
    return afghanistanNews;
  }
  
  if (actors.includes('russia') || actors.includes('ukraine')) {
    return [...russiaUkraineNews, ...getPakistanNews().slice(0, 2)];
  }
  
  if (actors.includes('gaza') || actors.includes('israel')) {
    return [...israelGazaNews, ...getPakistanNews().slice(0, 2)];
  }
  
  return getNewsForQuery(intent.originalQuery);
}

function getPakistanNews(): NewsArticle[] {
  const now = new Date();
  return [
    { id: 'p1', headline: 'India-Pakistan Border: Army Responds to Ceasefire Violations in Kupwara', summary: 'Security forces neutralized infiltration attempt along Line of Control. Heavy firing reported.', source: 'NDTV', sourceIcon: '📺', url: 'https://ndtv.com/india-news/kupwara', publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'p2', headline: 'Pakistan-Afghanistan Border: Torkham Crossing Closed Amid Clashes', summary: 'Both armies exchange fire at border posts. Refugee movement suspended.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/asia/pak-afghan', publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'p3', headline: 'Kashmir: Security Forces Launch Counter-Insurgency Operations', summary: 'Army and police launch joint operations. Several militants killed.', source: 'India Today', sourceIcon: '📰', url: 'https://indiatoday.in/kashmir', publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'p4', headline: 'Pakistan Economy: IMF Talks Enter Critical Phase', summary: 'Islamabad seeks $3 billion extension as reserves fall.', source: 'Financial Times', sourceIcon: '💹', url: 'https://ft.com/pakistan-imf', publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), relevance: 'Economy' },
    { id: 'p5', headline: 'Wagah Border: Tensions Rise During Flag-Lowering Ceremony', summary: 'Security personnel exchange fire. Both sides exchange accusations.', source: 'Times of India', sourceIcon: '📰', url: 'https://timesofindia.indiatimes.com/wagah', publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'p6', headline: 'Pakistan PM Visits Beijing: CPEC Expansion Discussed', summary: 'Joint statement expected on economic corridor investments.', source: 'The Hindu', sourceIcon: '📰', url: 'https://thehindu.com/pakistan-china', publishedAt: new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
  ];
}

function getNewsForQuery(query: string): NewsArticle[] {
  const lowerQuery = query.toLowerCase();
  const articles: NewsArticle[] = [];
  
  if (lowerQuery.includes('china') || lowerQuery.includes('taiwan')) {
    articles.push(...getChinaNews());
  } else if (lowerQuery.includes('pakistan') && !lowerQuery.includes('afghanistan')) {
    articles.push(...getPakistanNews());
  } else if (lowerQuery.includes('afghanistan')) {
    articles.push(...afghanistanNews);
  } else if (lowerQuery.includes('russia') || lowerQuery.includes('ukraine')) {
    articles.push(...russiaUkraineNews);
  } else if (lowerQuery.includes('gaza') || lowerQuery.includes('israel')) {
    articles.push(...israelGazaNews);
  } else if (lowerQuery.includes('energy') || lowerQuery.includes('oil')) {
    articles.push(...getEnergyNews());
  } else if (lowerQuery.includes('trade')) {
    articles.push(...getTradeNews());
  } else if (lowerQuery.includes('quad')) {
    articles.push(...getQuadNews());
  } else {
    articles.push(...getDefaultNews());
  }
  
  return articles.slice(0, 6);
}

function getChinaNews(): NewsArticle[] {
  const now = new Date();
  return [
    { id: 'n1', headline: 'China Deploys Additional Forces Near Arunachal Pradesh Border', summary: 'Satellite imagery confirms troop buildup along disputed LAC regions.', source: 'NDTV', sourceIcon: '📺', url: 'https://ndtv.com/india-news/china-troops', publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'n2', headline: 'US Imposes New Tech Export Restrictions on Chinese Companies', summary: 'Washington expands semiconductor restrictions affecting AI chips.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/tech/china-restrictions', publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), relevance: 'Technology' },
    { id: 'n3', headline: 'Taiwan Strait: PLA Conducts Dual-Carrier Military Exercises', summary: 'China\'s military exercises near Taiwan enter third consecutive week.', source: 'BBC News', sourceIcon: '🌍', url: 'https://bbc.com/news/taiwan-strait', publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'n4', headline: 'China-Pakistan Economic Corridor: $5B Additional Investment Announced', summary: 'Beijing pledges new investments during Islamabad visit.', source: 'The Hindu', sourceIcon: '📰', url: 'https://thehindu.com/cpec', publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
    { id: 'n5', headline: 'Chinese Tech Giants Face Stricter Data Security Regulations', summary: 'Beijing introduces new rules affecting Alibaba and ByteDance.', source: 'Bloomberg', sourceIcon: '💰', url: 'https://bloomberg.com/tech/china-data', publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(), relevance: 'Technology' },
  ];
}

function getEnergyNews(): NewsArticle[] {
  const now = new Date();
  return [
    { id: 'e1', headline: 'Oil Prices Surge Past $90 as OPEC+ Extends Production Cuts', summary: 'Brent crude crosses key barrier. India\'s import bill to increase.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/markets/oil', publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), relevance: 'Economy' },
    { id: 'e2', headline: 'LNG Prices Hit Six-Month High Amid European Demand Surge', summary: 'Asia spot prices follow rally. India considers reserve release.', source: 'Bloomberg', sourceIcon: '💰', url: 'https://bloomberg.com/markets/lng', publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), relevance: 'Energy' },
    { id: 'e3', headline: 'Saudi Aramco Increases India Investment with Refinery Stake', summary: 'World\'s largest oil company acquires 25% in coastal refinery.', source: 'Times of India', sourceIcon: '📰', url: 'https://timesofindia.indiatimes.com/saudi-india', publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), relevance: 'Energy' },
    { id: 'e4', headline: 'India\'s Renewable Energy Capacity Crosses 200 GW', summary: 'Solar and wind installations accelerate. 500 GW target by 2030.', source: 'The Hindu', sourceIcon: '📰', url: 'https://thehindu.com/renewable-energy', publishedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(), relevance: 'Energy' },
  ];
}

function getTradeNews(): NewsArticle[] {
  const now = new Date();
  return [
    { id: 't1', headline: 'Red Sea Crisis: Shipping Costs Jump 300% on Asia-Europe Routes', summary: 'Houthi attacks force Cape of Good Hope diversion.', source: 'Bloomberg', sourceIcon: '💰', url: 'https://bloomberg.com/red-sea', publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), relevance: 'Trade' },
    { id: 't2', headline: 'India-EU Free Trade Agreement Talks Resume', summary: 'Both sides agree on accelerated timeline for negotiations.', source: 'Financial Times', sourceIcon: '💹', url: 'https://ft.com/india-eu-fta', publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), relevance: 'Trade' },
    { id: 't3', headline: 'Pharma Exports: US FDA Raises Quality Concerns', summary: 'Regulatory flags inspection findings at API facilities.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/healthcare/pharma', publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(), relevance: 'Trade' },
    { id: 't4', headline: 'Apple Announces $2 Billion Manufacturing Expansion', summary: 'Foxconn and Tata Electronics set up new iPhone factories.', source: 'Times of India', sourceIcon: '📰', url: 'https://timesofindia.indiatimes.com/apple', publishedAt: new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString(), relevance: 'Trade' },
  ];
}

function getQuadNews(): NewsArticle[] {
  const now = new Date();
  return [
    { id: 'q1', headline: 'Quad Summit: Leaders Agree on Maritime Security Framework', summary: 'US, India, Japan, Australia sign Indo-Pacific cooperation agreement.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/quad', publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
    { id: 'q2', headline: 'Malabar Exercise: Japan Joins India, US, Australia in Bay of Bengal', summary: 'Annual naval drills include anti-submarine warfare.', source: 'India Today', sourceIcon: '📰', url: 'https://indiatoday.in/malabar', publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), relevance: 'Defense' },
    { id: 'q3', headline: 'Semiconductor Alliance: Quad Nations Announce Joint Chip Initiative', summary: '$10 billion fund to reduce Taiwan/China dependency.', source: 'Bloomberg', sourceIcon: '💰', url: 'https://bloomberg.com/quad-chips', publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), relevance: 'Technology' },
  ];
}

function getDefaultNews(): NewsArticle[] {
  const now = new Date();
  return [
    { id: 'd1', headline: 'Global Markets Rally on Fed Rate Cut Expectations', summary: 'Wall Street and Asian indices surge on inflation data.', source: 'Bloomberg', sourceIcon: '💰', url: 'https://bloomberg.com/markets', publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), relevance: 'Economy' },
    { id: 'd2', headline: 'Climate Summit: Nations Agree on Carbon Emission Targets', summary: 'COP31 agreement includes binding commitments.', source: 'BBC News', sourceIcon: '🌍', url: 'https://bbc.com/climate', publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), relevance: 'Climate' },
    { id: 'd3', headline: 'Ukraine Conflict: Peace Talks Resume in Geneva', summary: 'Both parties agree to negotiate under UN mediation.', source: 'Reuters', sourceIcon: '🔴', url: 'https://reuters.com/ukraine-peace', publishedAt: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
    { id: 'd4', headline: 'Gaza Crisis: Humanitarian Ceasefire Extended', summary: 'Qatar-mediated agreement brings temporary relief.', source: 'Al Jazeera', sourceIcon: '🌐', url: 'https://aljazeera.com/gaza', publishedAt: new Date(now.getTime() - 13 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
    { id: 'd5', headline: 'US Presidential Election: Policy Implications for India', summary: 'Both candidates signal continued QUAD support.', source: 'The Hindu', sourceIcon: '📰', url: 'https://thehindu.com/us-election', publishedAt: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(), relevance: 'Diplomacy' },
  ];
}

function generateDetailedResponse(_query: string, intent: QueryIntent, sources: NewsArticle[]): { response: string; confidence: number; followUps: string[] } {
  const actors = intent.primaryActors;
  const topicName = actors.length >= 2 
    ? `${actors[0].charAt(0).toUpperCase() + actors[0].slice(1)}-${actors[1].charAt(0).toUpperCase() + actors[1].slice(1)}` 
    : actors[0] ? actors[0].charAt(0).toUpperCase() + actors[0].slice(1) : 'Geopolitical';
  
  const primaryCountry = actors[0] || 'the region';
  const secondaryCountry = actors[1] || '';
  
  const confidence = Math.min(95, intent.confidence + 20);
  
  let indiaSection = '';
  if (intent.indiaAngle === 'third_party') {
    indiaSection = `
## Impact on India

• **Border Security:** India's ${primaryCountry === 'pakistan' ? 'western & northern borders' : 'surrounding territories'} face potential spillover effects

• **Terrorism Concerns:** Intelligence agencies monitoring for increased militant activity exploiting the conflict

• **Refugee Considerations:** India may face pressure to manage refugee flows from affected regions

• **Diplomatic Positioning:** MEA calling for restraint from all parties while maintaining non-interference policy

• **Economic Impact:** Regional trade disruptions affecting India's export corridors and supply chains`;
  } else if (intent.indiaAngle === 'direct') {
    indiaSection = `
## Direct Impact on India

• **Military Readiness:** Armed forces at elevated alert levels along all affected borders

• **National Security:** Direct threats to territorial integrity under NSC coordination

• **International Diplomacy:** Active outreach to P5 nations and regional partners

• **Economic Implications:** Defense expenditure increasing, strategic reserves being reviewed`;
  } else {
    indiaSection = `
## Regional Context

India maintains strategic interest in regional stability while monitoring developments closely.`;
  }
  
  const keyDevs = sources.slice(0, 4).map((s) => {
    const hoursAgo = Math.round((Date.now() - new Date(s.publishedAt).getTime()) / (1000 * 60 * 60));
    const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
    return { bold: s.relevance, content: s.headline, source: s.source, time: timeStr };
  });

  const response = `## Overview

The ${topicName} conflict represents a significant development in regional geopolitics.

**Background:**
The ${primaryCountry.charAt(0).toUpperCase() + primaryCountry.slice(1)} conflict${secondaryCountry ? ` involving ${secondaryCountry.charAt(0).toUpperCase() + secondaryCountry.slice(1)}` : ''} has deep historical roots and has evolved through multiple phases.

**Current Situation:**
The situation remains fluid with ongoing military activity. Both parties maintain mobilized forces along contested boundaries.

## Key Developments

${keyDevs.map(d => `• **${d.bold}**: ${d.content} [${d.source}, ${d.time}]`).join('\n')}

## Conflict Analysis

• ${primaryCountry.charAt(0).toUpperCase() + primaryCountry.slice(1)}: Pursuing ${intent.conflictType} objectives
• ${secondaryCountry ? secondaryCountry.charAt(0).toUpperCase() + secondaryCountry.slice(1) + ': Defending territorial integrity' : 'International Community: Mediating for peaceful resolution'}

**Causes:** Territorial disputes, historical grievances, and competing strategic interests.

${indiaSection}

## What To Watch

• Military offensives or ceasefire violations
• Civilian casualty reports and humanitarian response
• Diplomatic meetings and international statements
• Refugee movements and regional stability

---

*Intelligence Analysis | ${sources.length} sources | Confidence: ${confidence}%*`;

  const followUps = intent.indiaAngle === 'third_party' ? [
    `What specific border security measures is India taking?`,
    `How does this affect India's regional diplomacy?`,
    `What are the economic implications for India?`,
    `What is the probability of spillover into India?`,
  ] : intent.indiaAngle === 'direct' ? [
    `What is India's military response strategy?`,
    `How are allied nations responding?`,
    `What economic sanctions are being considered?`,
    `What is the projected timeline for resolution?`,
  ] : [
    `What is the humanitarian situation?`,
    `How is the international community responding?`,
    `What are the long-term implications?`,
    `What peace initiatives are underway?`,
  ];

  return { response, confidence, followUps };
}

const HOT_TOPICS = [
  { q: "US-China Tech War Impact on India", icon: '💻', desc: 'Semiconductor & AI chip restrictions' },
  { q: "OPEC Cuts - Oil Price Surge Effect", icon: '🛢️', desc: 'India\'s energy import bill' },
  { q: "Pakistan-Afghanistan Border Tensions", icon: '🛡️', desc: 'TTP threats & regional security' },
  { q: "Rupee Fall & RBI Response", icon: '💱', desc: 'Forex reserves & monetary policy' },
  { q: "Red Sea Crisis - Trade Routes", icon: '🚢', desc: 'Shipping disruptions & costs' },
  { q: "Russia-Ukraine - India's Position", icon: '🌍', desc: 'Defense deals & energy imports' },
];

export function AIAnalyst() {
  const { chatMessages, addChatMessage, clearChat } = useDashboardStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [msgCounter, setMsgCounter] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<AnalysisResult[]>([]);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingTopic, setAnalyzingTopic] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setSessionTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, currentAnalysis]);

  const generateSimulationData = (_query: string, intent: QueryIntent, events: typeof MOCK_EVENTS, news: NewsArticle[]): SimulationData => {
    const actors = intent.primaryActors;
    const topicName = actors.length >= 2 
      ? `${actors[0].charAt(0).toUpperCase() + actors[0].slice(1)}-${actors[1].charAt(0).toUpperCase() + actors[1].slice(1)} Conflict`
      : actors[0] ? `${actors[0].charAt(0).toUpperCase() + actors[0].slice(1)} Situation` 
      : 'Geopolitical Analysis';
    
    const primaryEvent = events[0];
    const impactScore = primaryEvent ? Math.round(primaryEvent.indiaImpactScore * 10) / 10 : 5.0;
    const riskScore = impactScore > 7 ? 'CRITICAL' : impactScore > 5 ? 'HIGH' : impactScore > 3 ? 'MEDIUM' : 'LOW';
    
    const regionalImpactMap: Record<string, { base: number; color: 'red' | 'orange' | 'yellow' | 'green' }> = {
      'afghanistan-pakistan': { base: 91, color: 'red' },
      'pakistan': { base: 88, color: 'red' },
      'afghanistan': { base: 85, color: 'red' },
      'china': { base: 65, color: 'orange' },
      'taiwan': { base: 70, color: 'orange' },
      'russia': { base: 55, color: 'orange' },
      'ukraine': { base: 50, color: 'orange' },
      'israel': { base: 45, color: 'yellow' },
      'gaza': { base: 48, color: 'yellow' },
    };
    
    let southAsiaImpact = 50;
    let eastAsiaImpact = 30;
    let middleEastImpact = 25;
    let europeImpact = 20;
    const americasImpact = 15;
    
    actors.forEach(actor => {
      if (regionalImpactMap[actor]) {
        const data = regionalImpactMap[actor];
        if (actor === 'afghanistan' || actor === 'pakistan') southAsiaImpact = data.base;
        if (actor === 'china' || actor === 'taiwan') eastAsiaImpact = data.base;
        if (actor === 'israel' || actor === 'gaza') middleEastImpact = data.base;
        if (actor === 'russia' || actor === 'ukraine') europeImpact = data.base + 15;
      }
    });
    
    if (actors.includes('afghanistan') || actors.includes('pakistan')) {
      middleEastImpact = Math.max(middleEastImpact, 45);
      europeImpact = Math.max(europeImpact, 35);
    }
    
    const regional_impact: RegionalImpactItem[] = [
      { region: 'South Asia', percentage: southAsiaImpact, color: southAsiaImpact > 70 ? 'red' : southAsiaImpact > 50 ? 'orange' : 'yellow' },
      { region: 'East Asia', percentage: eastAsiaImpact, color: eastAsiaImpact > 70 ? 'red' : eastAsiaImpact > 50 ? 'orange' : eastAsiaImpact > 30 ? 'yellow' : 'green' },
      { region: 'Middle East', percentage: middleEastImpact, color: middleEastImpact > 70 ? 'red' : middleEastImpact > 50 ? 'orange' : middleEastImpact > 30 ? 'yellow' : 'green' },
      { region: 'Europe', percentage: europeImpact, color: europeImpact > 70 ? 'red' : europeImpact > 50 ? 'orange' : europeImpact > 30 ? 'yellow' : 'green' },
      { region: 'Americas', percentage: americasImpact, color: americasImpact > 70 ? 'red' : americasImpact > 50 ? 'orange' : americasImpact > 30 ? 'yellow' : 'green' },
    ];
    
    const countryStatusMap: Record<string, { status: string; severity: 'critical' | 'high' | 'moderate' | 'low' }> = {
      'afghanistan': { status: 'Active conflict', severity: 'critical' },
      'pakistan': { status: 'Active conflict', severity: 'critical' },
      'china': { status: 'Escalating tension', severity: 'high' },
      'india': { status: 'Monitoring', severity: 'moderate' },
      'russia': { status: 'Active conflict', severity: 'critical' },
      'ukraine': { status: 'Active conflict', severity: 'critical' },
      'israel': { status: 'Active conflict', severity: 'critical' },
      'gaza': { status: 'Humanitarian crisis', severity: 'critical' },
      'iran': { status: 'Monitoring', severity: 'moderate' },
      'usa': { status: 'Diplomatic involvement', severity: 'moderate' },
    };
    
    const affected_nations: AffectedNation[] = actors.slice(0, 4).map(actor => {
      const countryData = countryStatusMap[actor] || { status: 'Monitoring', severity: 'moderate' as const };
      const countryCodes: Record<string, string> = {
        'afghanistan': 'AF', 'pakistan': 'PK', 'china': 'CN', 'india': 'IN',
        'russia': 'RU', 'ukraine': 'UA', 'israel': 'IL', 'gaza': 'PS',
        'iran': 'IR', 'usa': 'US', 'taiwan': 'TW'
      };
      const countryNames: Record<string, string> = {
        'afghanistan': 'Afghanistan', 'pakistan': 'Pakistan', 'china': 'China', 'india': 'India',
        'russia': 'Russia', 'ukraine': 'Ukraine', 'israel': 'Israel', 'gaza': 'Palestine',
        'iran': 'Iran', 'usa': 'United States', 'taiwan': 'Taiwan'
      };
      return {
        country: countryNames[actor] || actor.charAt(0).toUpperCase() + actor.slice(1),
        code: countryCodes[actor] || actor.substring(0, 2).toUpperCase(),
        status: countryData.status,
        severity: countryData.severity,
      };
    });
    
    if (!affected_nations.find(n => n.code === 'IN') && actors.length > 0) {
      const indiaSeverity = intent.indiaAngle === 'third_party' ? 'high' : intent.indiaAngle === 'direct' ? 'critical' : 'moderate';
      affected_nations.push({ country: 'India', code: 'IN', status: 'Monitoring developments', severity: indiaSeverity });
    }
    
    const sectorScoresMap: Record<string, SectorImpact[]> = {
      'afghanistan': [
        { name: 'Defense', score: 9.1, trend: 'up' },
        { name: 'Diplomacy', score: 7.8, trend: 'up' },
        { name: 'Economy', score: 6.2, trend: 'down' },
        { name: 'Trade', score: 5.4, trend: 'down' },
        { name: 'Humanitarian', score: 8.9, trend: 'up' },
        { name: 'Energy', score: 4.5, trend: 'stable' },
      ],
      'pakistan': [
        { name: 'Defense', score: 8.5, trend: 'up' },
        { name: 'Diplomacy', score: 7.2, trend: 'up' },
        { name: 'Economy', score: 6.8, trend: 'down' },
        { name: 'Trade', score: 5.9, trend: 'down' },
        { name: 'Humanitarian', score: 7.5, trend: 'up' },
        { name: 'Energy', score: 5.2, trend: 'stable' },
      ],
      'china': [
        { name: 'Defense', score: 8.2, trend: 'up' },
        { name: 'Diplomacy', score: 6.5, trend: 'stable' },
        { name: 'Economy', score: 7.8, trend: 'down' },
        { name: 'Trade', score: 8.1, trend: 'up' },
        { name: 'Technology', score: 9.2, trend: 'up' },
        { name: 'Energy', score: 5.8, trend: 'stable' },
      ],
      'russia': [
        { name: 'Defense', score: 9.0, trend: 'up' },
        { name: 'Diplomacy', score: 5.5, trend: 'down' },
        { name: 'Economy', score: 6.2, trend: 'down' },
        { name: 'Trade', score: 4.8, trend: 'down' },
        { name: 'Energy', score: 8.5, trend: 'up' },
        { name: 'Humanitarian', score: 7.2, trend: 'up' },
      ],
      'ukraine': [
        { name: 'Defense', score: 9.2, trend: 'up' },
        { name: 'Diplomacy', score: 6.8, trend: 'stable' },
        { name: 'Economy', score: 5.5, trend: 'down' },
        { name: 'Trade', score: 3.8, trend: 'down' },
        { name: 'Humanitarian', score: 9.5, trend: 'up' },
        { name: 'Energy', score: 7.2, trend: 'up' },
      ],
      'israel': [
        { name: 'Defense', score: 9.4, trend: 'up' },
        { name: 'Diplomacy', score: 5.2, trend: 'down' },
        { name: 'Economy', score: 6.8, trend: 'down' },
        { name: 'Trade', score: 5.5, trend: 'down' },
        { name: 'Humanitarian', score: 9.1, trend: 'up' },
        { name: 'Energy', score: 4.2, trend: 'stable' },
      ],
      'gaza': [
        { name: 'Defense', score: 8.8, trend: 'up' },
        { name: 'Diplomacy', score: 4.8, trend: 'down' },
        { name: 'Economy', score: 3.2, trend: 'down' },
        { name: 'Trade', score: 2.5, trend: 'down' },
        { name: 'Humanitarian', score: 9.8, trend: 'up' },
        { name: 'Energy', score: 2.1, trend: 'down' },
      ],
    };
    
    const defaultSectors: SectorImpact[] = [
      { name: 'Defense', score: 5.5, trend: 'stable' },
      { name: 'Diplomacy', score: 5.0, trend: 'stable' },
      { name: 'Economy', score: 5.2, trend: 'stable' },
      { name: 'Trade', score: 4.8, trend: 'stable' },
      { name: 'Humanitarian', score: 5.5, trend: 'stable' },
      { name: 'Energy', score: 4.5, trend: 'stable' },
    ];
    
    const sectors = actors[0] && sectorScoresMap[actors[0]] ? sectorScoresMap[actors[0]] : defaultSectors;
    
    const now = new Date();
    const timeline: TimelineEvent[] = [
      { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], event: 'Initial escalation reported', severity: 'high', sector: 'Defense' },
      { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], event: 'International response initiated', severity: 'moderate', sector: 'Diplomacy' },
      { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], event: 'Humanitarian concerns raised', severity: 'high', sector: 'Humanitarian' },
      { date: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString().split('T')[0], event: 'Latest intelligence update', severity: actors.includes('afghanistan') || actors.includes('pakistan') ? 'critical' : 'high', sector: 'Defense' },
    ];
    
    const recommendations: Recommendation[] = [
      { rank: 1, title: 'Immediate Diplomatic Engagement', detail: 'Back-channel talks needed within 72 hours', urgency: 'critical' },
      { rank: 2, title: 'Border Security Reinforcement', detail: 'Monitoring all border crossing points', urgency: 'high' },
      { rank: 3, title: 'Intelligence Sharing', detail: 'Coordinate with allied agencies', urgency: 'high' },
    ];
    
    const simSources: SimulationSource[] = news.slice(0, 5).map(n => ({
      publisher: n.source,
      headline: n.headline,
      url: n.url,
      time_ago: getTimeAgo(n.publishedAt),
      sector: n.relevance || 'General',
    }));
    
    return {
      query_topic: topicName,
      risk_level: riskScore as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      impact_score: impactScore,
      confidence: intent.confidence,
      events_count: events.length,
      regional_impact,
      affected_nations,
      sectors,
      timeline,
      recommendations,
      sources: simSources,
    };
  };
  
  const getTimeAgo = (isoString: string): string => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const generateAnalysis = (query: string, id: string): AnalysisResult => {
    const intent = extractQueryIntent(query);
    
    let filtered = [...MOCK_EVENTS];
    
    const actors = intent.primaryActors;
    
    if (actors.includes('afghanistan') && actors.includes('pakistan')) {
      filtered = MOCK_EVENTS.filter(e => 
        e.country === 'Afghanistan' || 
        (e.countryCode === 'PK' && !e.title.toLowerCase().includes('india') && !e.summary.toLowerCase().includes('india'))
      );
    } else if (actors.includes('china') || actors.includes('taiwan')) {
      filtered = MOCK_EVENTS.filter(e => e.countryCode === 'CN' || e.countryCode === 'TW' || e.eventType === 'technology');
    } else if (actors.includes('pakistan') && !actors.includes('afghanistan')) {
      filtered = MOCK_EVENTS.filter(e => e.countryCode === 'PK' || e.eventType === 'conflict');
    } else if (actors.includes('afghanistan')) {
      filtered = MOCK_EVENTS.filter(e => e.country === 'Afghanistan');
    } else if (actors.includes('russia') || actors.includes('ukraine')) {
      filtered = MOCK_EVENTS.filter(e => e.countryCode === 'RU' || e.countryCode === 'UA' || e.eventType === 'diplomacy');
    } else if (actors.includes('israel') || actors.includes('gaza')) {
      filtered = MOCK_EVENTS.filter(e => e.countryCode === 'IL' || e.country === 'Israel' || e.eventType === 'trade');
    } else if (intent.keywords.some(k => ['energy', 'oil', 'gas'].includes(k))) {
      filtered = MOCK_EVENTS.filter(e => e.eventType === 'energy' || e.countryCode === 'SA' || e.countryCode === 'QA');
    } else if (intent.keywords.some(k => ['trade', 'shipping', 'export', 'import'].includes(k))) {
      filtered = MOCK_EVENTS.filter(e => e.eventType === 'trade' || e.countryCode === 'IL' || e.country === 'Israel');
    }
    
    filtered = filtered.sort((a, b) => b.indiaImpactScore - a.indiaImpactScore);
    const primaryEvent = filtered[0] || MOCK_EVENTS[0];
    const sectors: Sector[] = ['economy', 'defense', 'trade', 'energy', 'diplomacy', 'technology'];
    
    const sources = getNewsForIntent(intent);
    const { response: detailedResponse, confidence, followUps } = generateDetailedResponse(query, intent, sources);
    
    const sectorImpacts = sectors.map((sector) => {
      const baseSector = SECTOR_SCORES.find(s => s.sector === sector);
      const currentScore = baseSector?.score || 50;
      let projectedImpact = 30;
      let change = 0;
      let probability = 0.5;
      
      if (primaryEvent.sectors.includes(sector)) {
        projectedImpact = Math.min(100, 50 + primaryEvent.indiaImpactScore * 5);
        change = -Math.round(primaryEvent.indiaImpactScore * 2);
        probability = 0.7 + (primaryEvent.indiaImpactScore / 20);
      }
      
      if (filtered.some(e => e.sectors.includes(sector))) {
        projectedImpact = Math.min(100, projectedImpact + 15);
        change = Math.round(change * 1.3);
        probability = Math.min(0.95, probability + 0.1);
      }
      
      return { sector, currentScore, projectedImpact, change, probability: Math.round(probability * 100) / 100 };
    }).sort((a, b) => b.projectedImpact - a.projectedImpact);

    const affectedCountries = filtered.slice(0, 4).map(e => {
      const country = MOCK_COUNTRIES.find(c => c.code === e.countryCode) || MOCK_COUNTRIES[0];
      return {
        name: country.name,
        flag: country.flag,
        code: country.code,
        relation: country.relationScore,
        currentTension: country.threatLevel === 'CRITICAL' ? 'Active conflict' : country.threatLevel === 'HIGH' ? 'Elevated tension' : 'Moderate concern'
      };
    });

    const regionalImpact = [
      { region: 'South Asia', countries: ['India', 'Pakistan', 'Bangladesh', 'Nepal'], impact: Math.round(75 + primaryEvent.indiaImpactScore), change: 8 },
      { region: 'East Asia', countries: ['China', 'Japan', 'Taiwan', 'South Korea'], impact: Math.round(55 + primaryEvent.indiaImpactScore * 0.5), change: 5 },
      { region: 'Middle East', countries: ['Saudi Arabia', 'UAE', 'Qatar', 'Israel'], impact: Math.round(45 + primaryEvent.indiaImpactScore * 0.3), change: 3 },
      { region: 'Americas', countries: ['USA', 'Canada', 'Brazil'], impact: Math.round(35 + primaryEvent.indiaImpactScore * 0.2), change: 2 },
    ];

    const timeline = [
      { period: 'Immediate (0-30 days)', impact: Math.round(40 + primaryEvent.indiaImpactScore * 3), description: 'Crisis identification and initial response', keyActions: ['Emergency cabinet meeting', 'Intelligence briefing', 'Strategic reserves review'] },
      { period: 'Short-term (1-3 months)', impact: Math.round(50 + primaryEvent.indiaImpactScore * 4), description: 'Policy implementation and resource mobilization', keyActions: ['Parliamentary discussions', 'Allied coordination', 'Economic relief package'] },
      { period: 'Medium-term (3-6 months)', impact: Math.round(60 + primaryEvent.indiaImpactScore * 4.5), description: 'Full impact manifestation and structural adjustments', keyActions: ['Sectoral reforms', 'Trade renegotiations', 'Infrastructure investments'] },
      { period: 'Long-term (6-12 months)', impact: Math.round(55 + primaryEvent.indiaImpactScore * 4), description: 'New equilibrium establishment', keyActions: ['Policy consolidation', 'Defense modernization', 'Regional leadership'] },
    ];

    const recommendations = [
      { priority: 1, action: 'Immediate Diplomatic Engagement', rationale: 'De-escalation critical within 48 hours', stakeholders: ['MEA', 'NSA', 'PMO'] },
      { priority: 2, action: 'Strategic Reserve Activation', rationale: `${Math.round(primaryEvent.indiaImpactScore * 15)} days of reserves available`, stakeholders: ['MoD', 'Petroleum Ministry'] },
      { priority: 3, action: 'Allied Nation Coordination', rationale: 'Quad partners briefed simultaneously', stakeholders: ['External Affairs', 'Defense Attaches'] },
      { priority: 4, action: 'Economic Contingency Measures', rationale: `$${Math.round(primaryEvent.indiaImpactScore * 5)}B intervention capacity ready`, stakeholders: ['Finance Ministry', 'RBI'] },
      { priority: 5, action: 'Public Communication Strategy', rationale: 'Prevent panic through calibrated release', stakeholders: ['PMO', 'I&B Ministry'] },
    ];

    const simulationData = generateSimulationData(query, intent, filtered, sources);

    return {
      id,
      query,
      queryIntent: intent,
      simulationData,
      primaryEvent,
      relatedEvents: filtered,
      sectorImpacts,
      regionalImpact,
      timeline,
      recommendations,
      riskLevel: primaryEvent.indiaImpactScore > 7 ? 'critical' : primaryEvent.indiaImpactScore > 5 ? 'high' : 'medium',
      affectedCountries,
      sources,
      summary: detailedResponse.substring(0, 200) + '...',
      confidence,
      detailedResponse,
      followUpSuggestions: followUps,
      timestamp: new Date().toISOString()
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const newCounter = msgCounter + 1;
    setMsgCounter(newCounter);

    const userMessage: ChatMessage = {
      id: `msg-${newCounter}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    const query = input.trim();
    setInput('');
    setIsTyping(true);
    setAnalyzingTopic(query);
    setLoadingStep(1);

    setQueryHistory(prev => [
      { id: `history-${newCounter}`, query, timestamp: new Date().toISOString() },
      ...prev.slice(0, 9)
    ]);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 800);

    setTimeout(() => {
      clearInterval(stepInterval);
      const analysis = generateAnalysis(query, `analysis-${newCounter}`);
      
      setSimulationHistory(prev => {
        const newHistory = [analysis, ...prev];
        return newHistory.slice(0, 10);
      });
      setCurrentAnalysis(analysis);
      setLoadingStep(0);

      const aiMessage: ChatMessage = {
        id: `msg-${newCounter + 1}`,
        role: 'ai',
        content: analysis.detailedResponse,
        timestamp: new Date().toISOString(),
        confidence: analysis.confidence / 100,
      };

      addChatMessage(aiMessage);
      setIsTyping(false);
      setAnalyzingTopic('');
    }, 3500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.JSX.Element[] = [];
    let listItems: { bold?: string; content: string; source?: string; time?: string }[] = [];

    const processList = () => {
      if (listItems.length > 0) {
        elements.push(
          <div key={`list-${elements.length}`} className="space-y-2 my-3">
            {listItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-bg-elevated/50 rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent-teal mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-relaxed">
                    {item.bold && <span className="font-bold text-accent-teal">{item.bold}: </span>}
                    <span>{item.content}</span>
                  </p>
                  {item.source && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 bg-accent-diplomacy/10 rounded text-[10px] text-accent-diplomacy font-medium">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-text-muted">{item.time}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        listItems = [];
      }
    };

    const parseSourceCitation = (text: string): { content: string; source?: string; time?: string } => {
      const sourceMatch = text.match(/\[([^\],]+),\s*([^\]]+)\]/);
      if (sourceMatch) {
        return {
          content: text.replace(/\[([^\],]+),\s*([^\]]+)\]/, '').trim(),
          source: sourceMatch[1].trim(),
          time: sourceMatch[2].trim()
        };
      }
      return { content: text };
    };

    const parseBoldPrefix = (text: string): { bold?: string; content: string } => {
      const boldMatch = text.match(/^\*\*(.+?)\*\*[:\s]*(.*)$/);
      if (boldMatch) {
        return { bold: boldMatch[1], content: boldMatch[2] };
      }
      return { content: text };
    };

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
        processList();
        elements.push(
          <div key={i} className="mt-5 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-accent-teal rounded-full" />
              <h2 className="text-sm font-bold text-accent-teal tracking-wider uppercase">
                {line.replace('## ', '')}
              </h2>
            </div>
          </div>
        );
      } else if (line.startsWith('• ')) {
        const cleanLine = line.replace('• ', '');
        const boldParsed = parseBoldPrefix(cleanLine);
        const sourceParsed = parseSourceCitation(boldParsed.content);
        listItems.push({
          bold: boldParsed.bold,
          content: sourceParsed.content,
          source: sourceParsed.source,
          time: sourceParsed.time
        });
      } else if (line.trim() === '---') {
        processList();
        elements.push(<div key={i} className="border-t border-border/50 my-4" />);
      } else if (line.trim().startsWith('*') && line.trim().endsWith('*')) {
        processList();
        elements.push(
          <div key={i} className="mt-4 p-3 bg-bg-elevated/30 rounded-lg border-l-2 border-accent-teal/50">
            <p className="text-xs text-text-muted italic">
              {line.replace(/\*/g, '')}
            </p>
          </div>
        );
      } else if (line.startsWith('- ')) {
        const content = line.replace(/^-\s*/, '');
        const boldParsed = parseBoldPrefix(content);
        elements.push(
          <div key={i} className="flex items-start gap-2 my-1 text-sm text-text-secondary">
            <span className="text-accent-teal mt-1">•</span>
            <span>
              {boldParsed.bold && <span className="font-semibold text-text-primary">{boldParsed.bold}: </span>}
              <span>{boldParsed.content}</span>
            </span>
          </div>
        );
      } else if (line.trim()) {
        processList();
        const boldParsed = parseBoldPrefix(line);
        const sourceParsed = parseSourceCitation(boldParsed.content);
        elements.push(
          <p key={i} className="text-sm text-text-secondary leading-relaxed my-1">
            {boldParsed.bold && <span className="font-bold text-text-primary">{boldParsed.bold}: </span>}
            <span>{sourceParsed.content}</span>
            {sourceParsed.source && (
              <span className="ml-2">
                <span className="px-1.5 py-0.5 bg-accent-diplomacy/10 rounded text-[10px] text-accent-diplomacy font-medium">
                  {sourceParsed.source}
                </span>
                {sourceParsed.time && <span className="ml-1 text-[10px] text-text-muted">{sourceParsed.time}</span>}
              </span>
            )}
          </p>
        );
      } else {
        processList();
      }
    });

    processList();
    return elements;
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'text-accent-teal';
    if (conf >= 70) return 'text-accent-warning';
    return 'text-accent-danger';
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary relative overflow-hidden">
      {/* TOP SECRET Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg]">
          <span className="text-[100px] font-black text-accent-danger whitespace-nowrap">TOP SECRET</span>
        </div>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-border bg-bg-surface relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-xl border-2 border-accent-teal/30" />
                <div className="absolute inset-1 rounded-lg border border-accent-teal/20" />
                <div className="w-10 h-10 rounded-full border-2 border-accent-teal/50 relative overflow-hidden">
                  <div className="absolute inset-0 animate-radar bg-gradient-to-tr from-accent-teal/50 to-transparent" />
                </div>
                <div className="absolute w-2 h-2 bg-accent-teal rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary tracking-wider">INTELLIGENCE COMMAND</h2>
              <span className="px-2 py-0.5 bg-accent-danger/20 border border-accent-danger/30 rounded text-[10px] text-accent-danger font-medium flex items-center gap-1">
                <Lock size={8} /> CLASSIFIED
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated rounded-lg border border-border">
              <Timer size={12} className="text-accent-teal" />
              <span className="text-xs font-mono text-text-primary">{formatSessionTime(sessionTimer)}</span>
            </div>

            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border rounded-lg border border-border transition-colors"
            >
              <History size={12} className="text-text-muted" />
              <span className="text-xs text-text-muted">History</span>
            </button>

            {currentAnalysis && (
              <button
                onClick={() => setPanelExpanded(!panelExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-accent-teal/10 hover:bg-accent-teal/20 border border-accent-teal/30 rounded-lg text-sm text-accent-teal transition-colors"
              >
                {panelExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                {panelExpanded ? 'Collapse' : 'Expand'}
              </button>
            )}

            {chatMessages.length > 0 && (
              <button
                onClick={() => { clearChat(); setCurrentAnalysis(null); setSimulationHistory([]); setSessionTimer(0); }}
                className="p-2 hover:bg-bg-elevated rounded-lg transition-colors text-text-muted hover:text-text-primary"
              >
                <RefreshCw size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Radio size={10} className="animate-pulse text-accent-teal" />
              LIVE CONNECTION
            </span>
            <span>|</span>
            <span>Groq AI Engine v2.0</span>
            <span>|</span>
            <span>UTC {new Date().toISOString().slice(11, 16)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{MOCK_EVENTS.length} Intelligence Sources</span>
            <span>|</span>
            <span>{chatMessages.length / 2} Sessions</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Chat Area */}
        <div className={`${panelExpanded ? 'flex-[2.5]' : 'flex-1'} flex flex-col border-r border-border transition-all duration-300`}>
          {/* Query History Sidebar */}
          {showHistory && (
            <div className="border-b border-border bg-bg-elevated p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">Recent Queries</span>
                <button onClick={() => setShowHistory(false)} className="text-text-muted hover:text-text-primary">
                  <ChevronUp size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {queryHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setInput(item.query); setShowHistory(false); }}
                    className="px-2 py-1 bg-bg-surface hover:bg-border rounded text-[10px] text-text-muted truncate max-w-[150px]"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent-teal/20 to-accent-diplomacy/20 flex items-center justify-center border border-accent-teal/30">
                    <Shield size={56} className="text-accent-teal" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-accent-teal/20 animate-ping" />
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-accent-danger rounded-full text-[10px] text-white font-bold animate-pulse">
                    LIVE
                  </div>
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2 tracking-widest">
                  INTELLIGENCE COMMAND
                </h3>
                <p className="text-sm text-text-muted max-w-lg mb-6">
                  AI-powered geopolitical intelligence with real-time analysis and strategic insights for India.
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-orange-400" />
                  <span className="text-xs text-orange-400 font-medium">Trending Topics</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
                  {HOT_TOPICS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(item.q)}
                      className="p-4 bg-bg-elevated hover:bg-accent-teal/5 hover:border-accent-teal/30 rounded-xl text-left transition-all border border-transparent group"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-medium text-text-primary flex-1">{item.q}</span>
                        <ChevronRight size={14} className="text-accent-teal opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <p className="text-[10px] text-text-muted pl-7">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((message) => {
              const analysis = message.role === 'ai' && currentAnalysis ? currentAnalysis : null;
              
              return (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-accent-teal/40 to-accent-teal/10 border border-accent-teal/40' 
                      : 'bg-gradient-to-br from-accent-diplomacy/40 to-accent-diplomacy/10 border border-accent-diplomacy/40'
                  }`}>
                    {message.role === 'user' 
                      ? <User size={20} className="text-accent-teal" />
                      : <Bot size={20} className="text-accent-diplomacy" />
                    }
                  </div>
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-accent-teal/25 to-accent-teal/5 border border-accent-teal/30' 
                        : 'bg-bg-elevated border border-border'
                    }`}>
                      {message.role === 'ai' && analysis && (
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                          <div className="flex items-center gap-3">
                            <Bot size={12} className="text-accent-diplomacy" />
                            <span className="text-[10px] font-medium text-accent-diplomacy">INTELLIGENCE ANALYSIS</span>
                            <span className={`text-[10px] font-bold ${getConfidenceColor(analysis.confidence)}`}>
                              {analysis.confidence}% CONFIDENCE
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="p-1.5 hover:bg-bg-surface rounded transition-colors"
                              title="Copy response"
                            >
                              {copiedId === message.id ? <Check size={12} className="text-accent-teal" /> : <Copy size={12} className="text-text-muted" />}
                            </button>
                            <button className="p-1.5 hover:bg-bg-surface rounded transition-colors" title="Share">
                              <Share2 size={12} className="text-text-muted" />
                            </button>
                            <button className="p-1.5 hover:bg-bg-surface rounded transition-colors" title="Export">
                              <Download size={12} className="text-text-muted" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {renderMarkdown(message.content)}
                      </div>

                      {/* Sources Section */}
                      {message.role === 'ai' && analysis && (
                        <SourcesSection sources={analysis.sources} />
                      )}

                      {/* Follow-up Suggestions */}
                      {message.role === 'ai' && analysis && analysis.followUpSuggestions && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-[10px] text-text-muted mb-2 uppercase tracking-wider">Suggested Follow-ups</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.followUpSuggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => setInput(suggestion)}
                                className="px-3 py-1.5 bg-bg-surface hover:bg-accent-teal/10 border border-border hover:border-accent-teal/30 rounded-lg text-[11px] text-text-muted hover:text-accent-teal transition-colors"
                              >
                                <Search size={10} className="inline mr-1" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-text-muted">
                        {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-text-muted">IST</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Processing Animation */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-diplomacy/40 to-accent-diplomacy/10 border border-accent-diplomacy/40 flex items-center justify-center">
                  <Bot size={20} className="text-accent-diplomacy" />
                </div>
                <div className="rounded-2xl p-4 bg-bg-elevated border border-border max-w-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-accent-teal rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-accent-teal">ANALYZING</span>
                  </div>
                  {analyzingTopic && (
                    <p className="text-xs text-text-secondary mb-2 font-medium truncate max-w-[280px]">
                      {analyzingTopic}
                    </p>
                  )}
                  <div className="flex gap-1 mb-2">
                    <span className="w-2 h-2 bg-accent-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-[10px] text-text-muted">Cross-referencing {MOCK_EVENTS.length}+ sources</p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-bg-surface">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter intelligence query..."
                  className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 pl-12 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal/50 focus:ring-1 focus:ring-accent-teal/20 transition-all"
                />
                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-accent-teal to-accent-diplomacy hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-bg-primary transition-all flex items-center gap-2 shadow-lg shadow-accent-teal/20"
              >
                <Zap size={16} />
                Analyze
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
              <span className="flex items-center gap-2">
                <Lock size={10} />
                AES-256 Encrypted
              </span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        {panelExpanded && (
          <div className="w-[580px] flex flex-col bg-bg-surface overflow-hidden">
            {simulationHistory.length > 0 ? (
              <>
                <SimulationHistoryBar 
                  simulations={simulationHistory} 
                  currentId={currentAnalysis?.id}
                  onSelect={(sim) => setCurrentAnalysis(sim)}
                />
                {currentAnalysis ? (
                  <AnalysisPanel 
                    analysis={currentAnalysis} 
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    loadingStep={loadingStep}
                  />
                ) : isTyping ? (
                  <LoadingPanel loadingStep={loadingStep} topic={analyzingTopic} />
                ) : (
                  <EmptyPanel />
                )}
              </>
            ) : currentAnalysis ? (
              <AnalysisPanel 
                analysis={currentAnalysis} 
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                loadingStep={loadingStep}
              />
            ) : isTyping ? (
              <LoadingPanel loadingStep={loadingStep} topic={analyzingTopic} />
            ) : (
              <EmptyPanel />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SimulationHistoryBar({ simulations, currentId, onSelect }: { 
  simulations: AnalysisResult[]; 
  currentId?: string;
  onSelect: (sim: AnalysisResult) => void;
}) {
  return (
    <div className="p-3 border-b border-border bg-bg-elevated">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Simulation History</span>
        <span className="text-[10px] text-accent-teal">{simulations.length} analyses</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {simulations.slice(0, 5).map((sim) => (
          <button
            key={sim.id}
            onClick={() => onSelect(sim)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-left transition-all ${
              sim.id === currentId 
                ? 'bg-accent-teal/20 border border-accent-teal/50' 
                : 'bg-bg-surface border border-border hover:border-border/80'
            }`}
          >
            <p className="text-[10px] font-medium text-text-primary truncate max-w-[120px]">
              {sim.simulationData.query_topic.length > 20 
                ? sim.simulationData.query_topic.substring(0, 20) + '...' 
                : sim.simulationData.query_topic}
            </p>
            <p className={`text-[9px] ${
              sim.simulationData.risk_level === 'CRITICAL' ? 'text-accent-danger' :
              sim.simulationData.risk_level === 'HIGH' ? 'text-accent-warning' :
              'text-text-muted'
            }`}>
              {sim.simulationData.risk_level}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingPanel({ loadingStep, topic }: { loadingStep: number; topic: string }) {
  const messages = [
    { step: 1, text: 'Parsing query intent...', icon: '🔍' },
    { step: 2, text: 'Fetching live intelligence...', icon: '🌐' },
    { step: 3, text: 'Building regional impact model...', icon: '📊' },
    { step: 4, text: 'Running threat simulation...', icon: '🛡️' },
    { step: 5, text: 'Compiling analysis report...', icon: '📝' },
  ];

  return (
    <>
      <div className="p-4 border-b border-border bg-bg-elevated">
        <div className="flex items-center gap-2 mb-2">
          <Radio size={14} className="text-accent-teal animate-pulse" />
          <span className="text-[10px] text-accent-teal font-medium animate-pulse">ANALYZING</span>
        </div>
        <p className="text-xs font-semibold text-text-primary truncate">{topic || 'Intelligence Query'}</p>
        <p className="text-[10px] text-text-muted truncate mt-1">Generating dynamic simulation...</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="p-4 bg-bg-elevated rounded-xl border border-border animate-pulse">
            <div className="h-32 bg-bg-surface rounded-lg" />
          </div>
          
          <div className="p-4 bg-bg-elevated rounded-xl border border-border">
            <div className="mb-3 h-4 bg-bg-surface rounded w-1/3 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 bg-bg-surface rounded w-20 animate-pulse" />
                  <div className="flex-1 h-3 bg-bg-surface rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-bg-elevated rounded-xl border border-border">
            <div className="mb-3 h-4 bg-bg-surface rounded w-1/4 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-bg-surface rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-bg-surface rounded-xl animate-pulse">
            <div className="space-y-1.5">
              {messages.map((msg) => (
                <div key={msg.step} className={`flex items-center gap-2 text-xs ${loadingStep >= msg.step ? 'text-accent-teal' : 'text-text-muted'}`}>
                  {loadingStep >= msg.step ? (
                    <>
                      {loadingStep === msg.step ? (
                        <span className="animate-pulse">{msg.icon}</span>
                      ) : (
                        <Check size={10} className="text-accent-teal" />
                      )}
                      <span className={loadingStep === msg.step ? 'font-medium' : ''}>{msg.text}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 text-center opacity-30">{msg.icon}</span>
                      <span className="opacity-30">{msg.text}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 h-1 bg-bg-elevated rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-teal transition-all duration-300"
                style={{ width: `${(loadingStep / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyPanel() {
  return (
    <>
      <div className="p-4 border-b border-border bg-bg-elevated">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-text-muted" />
          <span className="text-xs text-text-muted">Simulation Dashboard</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Target size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
          <p className="text-sm text-text-muted">Enter a query to see simulation data</p>
          <p className="text-xs text-text-muted mt-1 opacity-60">Data will be dynamically generated</p>
        </div>
      </div>
    </>
  );
}

function SourcesSection({ sources }: { sources: NewsArticle[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 pt-3 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 bg-bg-surface hover:bg-border rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <ExternalLink size={12} className="text-accent-teal" />
          <span className="text-xs text-text-muted">{sources.length} Sources Cited</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>
      
      {expanded && (
        <div className="mt-2 space-y-2">
          {sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-bg-surface hover:bg-border rounded-lg transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{source.sourceIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary font-medium line-clamp-2 group-hover:text-accent-teal transition-colors">
                    {source.headline}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-accent-diplomacy font-medium">{source.source}</span>
                    <span className="text-[10px] text-text-muted">•</span>
                    <span className="text-[10px] text-text-muted">{formatTimeAgo(source.publishedAt)}</span>
                    <span className="text-[10px] text-text-muted">•</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-bg-elevated rounded text-text-muted">{source.relevance}</span>
                  </div>
                </div>
                <ExternalLink size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AnalysisPanel({ analysis, favorites, onToggleFavorite, loadingStep }: { analysis: AnalysisResult; favorites: string[]; onToggleFavorite: (id: string) => void; loadingStep?: number }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'timeline' | 'sources'>('overview');
  
  const simData = analysis.simulationData;
  const isLoading = loadingStep !== undefined && loadingStep > 0;
  
  const loadingMessages = [
    { step: 1, text: 'Parsing query intent...', icon: '🔍' },
    { step: 2, text: 'Fetching live intelligence...', icon: '🌐' },
    { step: 3, text: 'Building regional impact model...', icon: '📊' },
    { step: 4, text: 'Running threat simulation...', icon: '🛡️' },
    { step: 5, text: 'Compiling analysis report...', icon: '📝' },
  ];

  return (
    <>
      <div className="p-4 border-b border-border bg-bg-elevated">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-accent-teal animate-pulse" />
                <span className="text-[10px] text-accent-teal font-medium">LIVE</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                simData.risk_level === 'CRITICAL' ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30' :
                simData.risk_level === 'HIGH' ? 'bg-accent-warning/20 text-accent-warning border border-accent-warning/30' :
                simData.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                'bg-accent-teal/20 text-accent-teal border border-accent-teal/30'
              }`}>
                {simData.risk_level} RISK
              </span>
            </div>
            <p className="text-xs font-semibold text-text-primary truncate mt-1">{simData.query_topic}</p>
            <p className="text-[10px] text-text-muted truncate mt-0.5">
              {simData.events_count} events analyzed | Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${simData.confidence >= 85 ? 'text-accent-teal' : simData.confidence >= 70 ? 'text-accent-warning' : 'text-accent-danger'}`}>
              {simData.confidence}% Conf
            </span>
            <button onClick={() => onToggleFavorite(analysis.id)} className="p-2 rounded-lg hover:bg-bg-surface transition-colors">
              <Star size={16} className={favorites.includes(analysis.id) ? 'text-accent-warning fill-accent-warning' : 'text-text-muted'} />
            </button>
            <button className="p-2 rounded-lg hover:bg-bg-surface transition-colors">
              <Download size={16} className="text-text-muted" />
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="mb-3 p-3 bg-bg-surface rounded-lg border border-accent-teal/20">
            <div className="space-y-1.5">
              {loadingMessages.map((msg) => (
                <div key={msg.step} className={`flex items-center gap-2 text-xs ${loadingStep >= msg.step ? 'text-accent-teal' : 'text-text-muted'}`}>
                  {loadingStep >= msg.step ? (
                    <>
                      {loadingStep === msg.step ? (
                        <span className="animate-pulse">{msg.icon}</span>
                      ) : (
                        <Check size={10} className="text-accent-teal" />
                      )}
                      <span className={loadingStep === msg.step ? 'font-medium' : ''}>{msg.text}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 text-center opacity-30">{msg.icon}</span>
                      <span className="opacity-30">{msg.text}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 bg-bg-elevated rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-teal transition-all duration-300"
                style={{ width: `${(loadingStep / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex gap-1 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: <Target size={10} /> },
            { id: 'sectors', label: 'Sectors', icon: <PieChart size={10} /> },
            { id: 'timeline', label: 'Timeline', icon: <Clock size={10} /> },
            { id: 'sources', label: `Sources (${simData.sources.length})`, icon: <ExternalLink size={10} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id 
                  ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/30' 
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'sectors' && <SectorsTab analysis={analysis} />}
        {activeTab === 'timeline' && <TimelineTab analysis={analysis} />}
        {activeTab === 'sources' && <SourcesTab analysis={analysis} />}
      </div>
    </>
  );
}

function OverviewTab({ analysis }: { analysis: AnalysisResult }) {
  const simData = analysis.simulationData;
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-3">Impact Score</h4>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2028" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={simData.impact_score >= 7 ? '#FF4444' : simData.impact_score >= 4 ? '#FF8C00' : '#00FFB3'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${simData.impact_score * 25.13} ${251.3 - simData.impact_score * 25.13}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-lg font-bold ${
                simData.impact_score >= 7 ? 'text-accent-danger' :
                simData.impact_score >= 4 ? 'text-accent-warning' : 'text-accent-teal'
              }`}>
                {simData.impact_score}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Related Events</span>
              <span className="text-text-primary font-medium">{simData.events_count}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Sectors Affected</span>
              <span className="text-text-primary font-medium">{simData.sectors.filter(s => s.score > 6).length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Nations Tracked</span>
              <span className="text-text-primary font-medium">{simData.affected_nations.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-3">Regional Impact</h4>
        <div className="space-y-2">
          {simData.regional_impact.map((region) => (
            <div key={region.region} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-20">{region.region}</span>
              <div className="flex-1 h-3 bg-bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${region.percentage}%`,
                    backgroundColor: region.color === 'red' ? '#FF4444' : region.color === 'orange' ? '#FF8C00' : region.color === 'yellow' ? '#FFD700' : '#00FFB3'
                  }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right">{region.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-3">Affected Nations</h4>
        <div className="space-y-2">
          {simData.affected_nations.slice(0, 5).map((nation) => (
            <div key={nation.code} className="flex items-center gap-3 p-2 bg-bg-surface rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-accent-teal/10 flex items-center justify-center text-xs font-bold text-accent-teal">
                {nation.code}
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-primary font-medium">{nation.country}</p>
                <p className="text-[10px] text-text-muted">{nation.status}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                nation.severity === 'critical' ? 'bg-accent-danger/20 text-accent-danger' :
                nation.severity === 'high' ? 'bg-accent-warning/20 text-accent-warning' :
                nation.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-accent-teal/20 text-accent-teal'
              }`}>
                {nation.severity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-3">Recommendations</h4>
        <div className="space-y-2">
          {simData.recommendations.slice(0, 3).map((rec) => (
            <div key={rec.rank} className="flex items-start gap-2 p-2 bg-bg-surface rounded-lg">
              <span className="w-6 h-6 rounded-full bg-accent-teal/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent-teal">{rec.rank}</span>
              </span>
              <div>
                <p className="text-xs text-text-primary font-medium">{rec.title}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{rec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectorsTab({ analysis }: { analysis: AnalysisResult }) {
  const simData = analysis.simulationData;
  
  const pieData = simData.sectors.map(s => ({
    name: s.name,
    value: s.score,
    color: s.trend === 'up' ? '#FF4444' : s.trend === 'down' ? '#00FFB3' : '#6B7280'
  }));

  return (
    <div className="space-y-4">
      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-4">Sector Impact Scores</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0A0C10', border: '1px solid #2A2D35', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-4">Impact by Sector</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simData.sectors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D35" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0C10', border: '1px solid #2A2D35', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="score" name="Score" fill="#00FFB3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {simData.sectors.map((sector, idx) => (
        <div key={idx} className="p-4 bg-bg-elevated rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sector.trend === 'up' ? '#FF444420' : sector.trend === 'down' ? '#00FFB320' : '#6B728020' }}>
                <TrendingUp size={16} style={{ color: sector.trend === 'up' ? '#FF4444' : sector.trend === 'down' ? '#00FFB3' : '#6B7280' }} />
              </div>
              <span className="text-sm text-text-primary font-medium">{sector.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono" style={{ color: sector.trend === 'up' ? '#FF4444' : sector.trend === 'down' ? '#00FFB3' : '#6B7280' }}>
                {sector.score}
              </span>
              <span className={`text-xs ${sector.trend === 'up' ? 'text-accent-danger' : sector.trend === 'down' ? 'text-accent-teal' : 'text-text-muted'}`}>
                {sector.trend === 'up' ? '↑' : sector.trend === 'down' ? '↓' : '→'}
              </span>
            </div>
          </div>
          <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${sector.score * 10}%`,
                backgroundColor: sector.trend === 'up' ? '#FF4444' : sector.trend === 'down' ? '#00FFB3' : '#6B7280'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineTab({ analysis }: { analysis: AnalysisResult }) {
  const simData = analysis.simulationData;
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-4">Recent Events Timeline</h4>
        <div className="space-y-3">
          {simData.timeline.map((event, i) => (
            <div key={i} className="relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
              <div className="flex gap-3 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  event.severity === 'critical' ? 'bg-accent-danger/20 border-2 border-accent-danger' :
                  event.severity === 'high' ? 'bg-accent-warning/20 border-2 border-accent-warning' :
                  'bg-bg-elevated border-2 border-border'
                }`}>
                  <span className={`text-xs font-bold ${
                    event.severity === 'critical' ? 'text-accent-danger' :
                    event.severity === 'high' ? 'text-accent-warning' : 'text-text-muted'
                  }`}>{i + 1}</span>
                </div>
                <div className="flex-1 p-3 bg-bg-elevated rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-text-primary font-bold">{event.date}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      event.severity === 'critical' ? 'bg-accent-danger/20 text-accent-danger' :
                      event.severity === 'high' ? 'bg-accent-warning/20 text-accent-warning' :
                      event.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-accent-teal/20 text-accent-teal'
                    }`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-text-primary mb-2">{event.event}</p>
                  <span className="px-2 py-1 bg-bg-surface rounded text-[10px] text-text-muted">
                    {event.sector}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider mb-3">Recommended Actions</h4>
        <div className="space-y-2">
          {simData.recommendations.map((rec) => (
            <div key={rec.rank} className="p-3 bg-bg-surface rounded-lg border-l-2" style={{ 
              borderColor: rec.urgency === 'critical' ? '#FF4444' : 
                           rec.urgency === 'high' ? '#FF8C00' : '#00FFB3' 
            }}>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center text-xs font-bold text-text-muted">
                  {rec.rank}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-text-primary font-medium">{rec.title}</p>
                  <p className="text-[10px] text-text-muted mt-1">{rec.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourcesTab({ analysis }: { analysis: AnalysisResult }) {
  const simData = analysis.simulationData;
  
  return (
    <div className="space-y-4">
      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider">Intelligence Sources</h4>
          <span className="px-2 py-0.5 bg-bg-surface rounded text-[10px] text-text-muted">{simData.sources.length} sources</span>
        </div>
        
        <div className="space-y-3">
          {simData.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-bg-surface hover:bg-border rounded-xl transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-accent-teal">{source.publisher.substring(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium line-clamp-2 group-hover:text-accent-teal transition-colors">
                    {source.headline}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-accent-diplomacy font-medium">{source.publisher}</span>
                    <span className="text-[10px] text-text-muted">•</span>
                    <span className="text-[10px] text-text-muted">{source.time_ago}</span>
                    <span className="px-1.5 py-0.5 bg-bg-elevated rounded text-[10px] text-text-muted">{source.sector}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="p-4 bg-accent-teal/5 rounded-xl border border-accent-teal/30">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-accent-teal" />
          <h4 className="text-xs font-semibold text-accent-teal uppercase tracking-wider">Verification Status</h4>
        </div>
        <p className="text-xs text-text-muted">
          Confidence Level: <span className="text-accent-teal font-bold">{simData.confidence}%</span>
        </p>
        <p className="text-xs text-text-muted mt-1">
          Analysis based on {simData.events_count} intelligence events
        </p>
      </div>
    </div>
  );
}
