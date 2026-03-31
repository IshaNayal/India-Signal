import type { GlobalEvent, Country, SectorScore, NewsItem, ConflictDot, CauseEffectNode } from '../types';

export const MOCK_EVENTS: GlobalEvent[] = [
  {
    id: '1',
    title: 'US-China Trade Tensions Escalate',
    summary: 'New tariffs announced on semiconductor exports, affecting global supply chains. Biden administration expands export controls on advanced AI chips.',
    country: 'China',
    countryCode: 'CN',
    eventType: 'trade',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 6.5,
    sectors: ['economy', 'technology', 'trade'],
    isLive: true,
    aiSummary: 'India could benefit from redirected supply chains but faces semiconductor shortages.'
  },
  {
    id: '2',
    title: 'Pakistan Border Skirmish in Kashmir',
    summary: 'Exchange of fire reported along Line of Control. Indian Army reports multiple ceasefire violations.',
    country: 'Pakistan',
    countryCode: 'PK',
    eventType: 'conflict',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 9.2,
    sectors: ['defense', 'diplomacy'],
    isLive: true,
    aiSummary: 'Immediate security concern. Increased military readiness required on western border.'
  },
  {
    id: '3',
    title: 'Russia-Ukraine Peace Talks Resume',
    summary: 'Mediation efforts intensify as both parties agree to negotiate. Ceasefire discussions show progress.',
    country: 'Russia',
    countryCode: 'RU',
    eventType: 'diplomacy',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 4.0,
    sectors: ['diplomacy', 'energy', 'trade'],
    isLive: false,
    aiSummary: 'Potential reduction in oil prices could benefit Indian economy.'
  },
  {
    id: '4',
    title: 'Gaza Conflict Impacts Shipping Routes',
    summary: 'Red Sea tensions causing shipping delays and insurance increases. Houthi attacks divert trade routes.',
    country: 'Israel',
    countryCode: 'IL',
    eventType: 'conflict',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 5.5,
    sectors: ['trade', 'energy', 'economy'],
    isLive: true,
    aiSummary: 'Increased freight costs will impact import-dependent sectors.'
  },
  {
    id: '5',
    title: 'OPEC+ Announces Production Cuts',
    summary: 'Oil output reduction to support global prices. Saudi Arabia leads initiative for price stabilization.',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    eventType: 'energy',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 7.0,
    sectors: ['energy', 'economy'],
    isLive: false,
    aiSummary: 'Higher oil import bills will widen trade deficit and pressure rupee.'
  },
  {
    id: '6',
    title: 'Quad Summit Strengthens Indo-Pacific Cooperation',
    summary: 'New maritime security agreements signed with US, Japan, Australia. Focus on freedom of navigation.',
    country: 'USA',
    countryCode: 'US',
    eventType: 'diplomacy',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 3.5,
    sectors: ['diplomacy', 'defense'],
    isLive: false,
    aiSummary: 'Strategic win for India in balancing Chinese influence in the region.'
  },
  {
    id: '7',
    title: 'Taiwan Strait Military Exercises',
    summary: 'PLA conducts large-scale drills near Taiwan. Multiple warships and aircraft involved.',
    country: 'Taiwan',
    countryCode: 'TW',
    eventType: 'conflict',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 4.5,
    sectors: ['trade', 'technology', 'economy'],
    isLive: false,
    aiSummary: 'TSMC disruptions could boost Indian semiconductor manufacturing prospects.'
  },
  {
    id: '8',
    title: 'EU Carbon Border Tax Implementation',
    summary: 'New environmental tariffs affect steel and aluminum exports. CBAM enters second phase.',
    country: 'Germany',
    countryCode: 'DE',
    eventType: 'trade',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 5.0,
    sectors: ['trade', 'economy', 'technology'],
    isLive: false,
    aiSummary: 'Indian exporters will face additional compliance costs.'
  },
  {
    id: '9',
    title: 'South China Sea Tensions Rise',
    summary: 'Philippines confronts Chinese vessels in disputed waters. Maritime incidents increase.',
    country: 'Philippines',
    countryCode: 'PH',
    eventType: 'conflict',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 3.0,
    sectors: ['trade', 'diplomacy'],
    isLive: false,
    aiSummary: 'Indirect impact on Indian trade routes through South China Sea.'
  },
  {
    id: '10',
    title: 'AI Chip Export Restrictions Expand',
    summary: 'US tightens controls on advanced semiconductor exports to China. Nvidia chips restricted.',
    country: 'USA',
    countryCode: 'US',
    eventType: 'technology',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 6.0,
    sectors: ['technology', 'economy', 'trade'],
    isLive: false,
    aiSummary: 'Opportunity for India to attract relocating tech manufacturing.'
  },
  {
    id: '11',
    title: 'India-Pakistan Attari Border Incident',
    summary: 'Security forces exchange fire at Wagah border crossing. Tensions escalate overnight.',
    country: 'Pakistan',
    countryCode: 'PK',
    eventType: 'conflict',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 8.5,
    sectors: ['defense', 'diplomacy'],
    isLive: true,
    aiSummary: 'Immediate security escalation. Diplomatic channels activated.'
  },
  {
    id: '12',
    title: 'Monsoon Deficit in Northern States',
    summary: 'Below-normal rainfall affects agricultural output projections. 8 states declare drought-like conditions.',
    country: 'India',
    countryCode: 'IN',
    eventType: 'climate',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 5.5,
    sectors: ['economy', 'energy'],
    isLive: true,
    aiSummary: 'Food inflation concerns and rural income impact expected.'
  },
  {
    id: '13',
    title: 'India-France Rafale Deal Expansion',
    summary: 'Additional fighter jets ordered for Indian Air Force. ₹65,000 crore deal signed.',
    country: 'France',
    countryCode: 'FR',
    eventType: 'defense',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 2.5,
    sectors: ['defense', 'diplomacy'],
    isLive: false,
    aiSummary: 'Strengthens defense capabilities and strategic partnership.'
  },
  {
    id: '14',
    title: 'Global LNG Prices Surge',
    summary: 'Winter demand and supply constraints push prices higher. Asian spot prices hit 6-month high.',
    country: 'Qatar',
    countryCode: 'QA',
    eventType: 'energy',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 6.5,
    sectors: ['energy', 'economy'],
    isLive: true,
    aiSummary: 'Higher energy import bill will impact fiscal deficit targets.'
  },
  {
    id: '15',
    title: 'Bangladesh Political Unrest',
    summary: 'Opposition protests disrupt port operations. Trade delays expected at Chattogram.',
    country: 'Bangladesh',
    countryCode: 'BD',
    eventType: 'conflict',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    indiaImpactScore: 4.0,
    sectors: ['trade', 'diplomacy'],
    isLive: true,
    aiSummary: 'Trade through Chattogram port may face delays.'
  },
];

export const MOCK_COUNTRIES: Country[] = [
  { id: '1', name: 'China', code: 'CN', flag: '🇨🇳', threatLevel: 'HIGH', relationScore: 35, tradeVolume: 136, militaryStrength: 92, activeEvents: 2 },
  { id: '2', name: 'Pakistan', code: 'PK', flag: '🇵🇰', threatLevel: 'CRITICAL', relationScore: 15, tradeVolume: 2.8, militaryStrength: 45, activeEvents: 2 },
  { id: '3', name: 'USA', code: 'US', flag: '🇺🇸', threatLevel: 'LOW', relationScore: 78, tradeVolume: 128, militaryStrength: 95, activeEvents: 2 },
  { id: '4', name: 'Russia', code: 'RU', flag: '🇷🇺', threatLevel: 'MEDIUM', relationScore: 65, tradeVolume: 65, militaryStrength: 88, activeEvents: 1 },
  { id: '5', name: 'France', code: 'FR', flag: '🇫🇷', threatLevel: 'LOW', relationScore: 82, tradeVolume: 12, militaryStrength: 72, activeEvents: 1 },
  { id: '6', name: 'Japan', code: 'JP', flag: '🇯🇵', threatLevel: 'LOW', relationScore: 85, tradeVolume: 22, militaryStrength: 68, activeEvents: 0 },
  { id: '7', name: 'Australia', code: 'AU', flag: '🇦🇺', threatLevel: 'LOW', relationScore: 80, tradeVolume: 35, militaryStrength: 52, activeEvents: 0 },
  { id: '8', name: 'Israel', code: 'IL', flag: '🇮🇱', threatLevel: 'MEDIUM', relationScore: 70, tradeVolume: 8, militaryStrength: 78, activeEvents: 1 },
  { id: '9', name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', threatLevel: 'LOW', relationScore: 75, tradeVolume: 52, militaryStrength: 65, activeEvents: 1 },
  { id: '10', name: 'Bangladesh', code: 'BD', flag: '🇧🇩', threatLevel: 'MEDIUM', relationScore: 68, tradeVolume: 18, militaryStrength: 35, activeEvents: 1 },
];

export const SECTOR_SCORES: SectorScore[] = [
  { sector: 'economy', score: 62, trend: 'down', change: -3 },
  { sector: 'defense', score: 78, trend: 'stable', change: 0 },
  { sector: 'trade', score: 55, trend: 'down', change: -5 },
  { sector: 'energy', score: 45, trend: 'down', change: -8 },
  { sector: 'diplomacy', score: 70, trend: 'up', change: 2 },
  { sector: 'technology', score: 58, trend: 'up', change: 4 },
];

export const SUGGESTED_QUESTIONS = [
  "What's China's current threat posture?",
  "How does Gaza conflict affect India's oil imports?",
  "Latest developments on India-Pakistan border?",
  "Impact of US-China trade war on India?",
  "Energy security concerns this quarter?",
  "Assessment of Quad alliance effectiveness?",
  "Simulate escalation scenarios with Pakistan",
  "What-if China invades Taiwan? Impact on India?",
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    headline: 'BREAKING: Indian Army responds to ceasefire violations in Kupwara',
    summary: 'Security forces neutralized infiltration attempt along LOC. Heavy firing reported from Pakistani side.',
    category: 'breaking',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    impact: 9,
    isBreaking: true,
    source: 'NDTV',
    url: 'https://www.ndtv.com/india-news/indian-army-responds-to-ceasefire-violations-in-kupwara-5678910'
  },
  {
    id: 'n2',
    headline: 'Oil prices surge 5% after OPEC+ announces deeper cuts',
    summary: 'Brent crude crosses $90/barrel mark for first time this quarter. Impact on India\'s import bill expected.',
    category: 'urgent',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    impact: 7,
    relatedEventId: '5',
    source: 'Reuters',
    url: 'https://www.reuters.com/markets/commodities/oil-prices-surge-after-opec-announces-deeper-cuts-2024-03-15/'
  },
  {
    id: 'n3',
    headline: 'Analysis: Cascading effects of Red Sea crisis on Indian exporters',
    summary: 'Shipping costs up 300%, textile and pharma sectors worst hit. Exporters seeking alternative routes.',
    category: 'analysis',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    impact: 6,
    relatedEventId: '4',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/news/articles/red-sea-crisis-impact-on-indian-exporters-2024'
  },
  {
    id: 'n4',
    headline: 'China deploys additional troops near Arunachal Pradesh',
    summary: 'Satellite imagery shows buildup at multiple forward locations along LAC in Eastern Ladakh.',
    category: 'urgent',
    country: 'China',
    countryCode: 'CN',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    impact: 8,
    source: 'BBC',
    url: 'https://www.bbc.com/news/world-asia-india-68541234'
  },
  {
    id: 'n5',
    headline: 'Update: Monsoon recovery in South India, North still deficit',
    summary: 'Overall rainfall at 85% of normal, agricultural concerns persist in 8 states.',
    category: 'update',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    impact: 5,
    relatedEventId: '12',
    source: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/india/monsoon-recovery-south-north-deficit-2024'
  },
  {
    id: 'n6',
    headline: 'Semiconductor fab deal: Tata & TSMC in advanced talks',
    summary: '₹19,000 crore investment for chip manufacturing unit in Gujarat. Construction to begin Q1 next year.',
    category: 'analysis',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'Moneycontrol',
    url: 'https://www.moneycontrol.com/news/business/tata-tsmc-semiconductor-deal-7890123.html'
  },
  {
    id: 'n7',
    headline: 'Quad nations announce joint naval exercises in Bay of Bengal',
    summary: 'Malabar 2024 to include anti-submarine warfare drills. China likely to monitor exercises.',
    category: 'update',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    impact: 3,
    source: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/quad-naval-exercises-bay-of-bengal-2024'
  },
  {
    id: 'n8',
    headline: 'Forex reserves drop $3.2 billion amid Rupee pressure',
    summary: 'Currency touches 84 mark against USD. RBI intervenes to stabilize the rupee.',
    category: 'urgent',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    impact: 7,
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/news/forex-reserves-drop-rupee-pressure-2024'
  },
  {
    id: 'n9',
    headline: 'BREAKING: Houthi missile strikes hit commercial vessel in Gulf of Aden',
    summary: 'Indian Navy warship rescues crew. Red Sea shipping disruptions intensify.',
    category: 'breaking',
    country: 'Yemen',
    countryCode: 'YE',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    impact: 8,
    isBreaking: true,
    source: 'Reuters',
    url: 'https://www.reuters.com/world/asia-pacific/houthi-missile-strikes-gulf-of-aden-2024-03-15/'
  },
  {
    id: 'n10',
    headline: 'Pakistan PM arrives in Beijing for 3-day official visit',
    summary: 'Joint statement expected on economic corridor. China-Pakistan alliance strengthening.',
    category: 'analysis',
    country: 'Pakistan',
    countryCode: 'PK',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    impact: 6,
    source: 'BBC',
    url: 'https://www.bbc.com/news/world-asia-pakistan-china-visit-2024'
  },
  {
    id: 'n11',
    headline: 'US Senate passes $8 billion India defense aid package',
    summary: 'F-18 Super Hornet jets and Patriot missile defense systems included in the deal.',
    category: 'urgent',
    country: 'USA',
    countryCode: 'US',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    impact: 5,
    source: 'NDTV',
    url: 'https://www.ndtv.com/india-news/us-senate-defense-aid-package-india-5678901'
  },
  {
    id: 'n12',
    headline: 'India surpasses $400 billion in IT exports for first time',
    summary: 'Software services exports reach record high. IT sector contributes 7.5% to GDP.',
    category: 'update',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'Moneycontrol',
    url: 'https://www.moneycontrol.com/news/business/it-exports-400-billion-1234567.html'
  },
  {
    id: 'n13',
    headline: 'Bangladesh garment factory workers protest enters third week',
    summary: 'Port operations disrupted. Indian exporters face delays in textile shipments.',
    category: 'urgent',
    country: 'Bangladesh',
    countryCode: 'BD',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    impact: 5,
    source: 'Reuters',
    url: 'https://www.reuters.com/world/asia/bangladesh-garment-protests-2024'
  },
  {
    id: 'n14',
    headline: 'LNG spot prices hit 6-month high amid European demand surge',
    summary: 'Asia spot prices follow suit. India\'s energy import bill to increase by 15%.',
    category: 'analysis',
    country: 'Qatar',
    countryCode: 'QA',
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    impact: 7,
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/news/lng-prices-6-month-high-2024'
  },
  {
    id: 'n15',
    headline: 'Taiwan earthquake: TSMC chip fabs evacuated, production affected',
    summary: 'Global chip supply chain fears. India semiconductor push gains strategic importance.',
    category: 'urgent',
    country: 'Taiwan',
    countryCode: 'TW',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    impact: 6,
    source: 'BBC',
    url: 'https://www.bbc.com/news/world-asia-taiwan-earthquake-tsmc-2024'
  },
  {
    id: 'n16',
    headline: 'India-Australia CEPA trade volume crosses $50 billion',
    summary: 'New milestones in bilateral trade. Services sector leads growth at 25%.',
    category: 'update',
    country: 'Australia',
    countryCode: 'AU',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    impact: 3,
    source: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/india-australia-cepa-trade-2024'
  },
  {
    id: 'n17',
    headline: 'Nepal parliament approves new constitution amid protests',
    summary: 'Political instability in northern neighbor. India monitors border situation.',
    category: 'analysis',
    country: 'Nepal',
    countryCode: 'NP',
    timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/india/nepal-parliament-constitution-2024'
  },
  {
    id: 'n18',
    headline: 'Indian Navy conducts passing exercise with Japanese MSDF',
    summary: 'Strategic partnership deepens in Indo-Pacific. Malabar exercises follow next month.',
    category: 'update',
    country: 'Japan',
    countryCode: 'JP',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    impact: 3,
    source: 'NDTV',
    url: 'https://www.ndtv.com/india-news/indian-navy-japan-msdf-exercise-5678902'
  },
  {
    id: 'n19',
    headline: 'India-Russia trade settlement shifts to rupee-ruble mechanism',
    summary: 'Bypass Western sanctions. Trade volume expected to grow despite banking challenges.',
    category: 'analysis',
    country: 'Russia',
    countryCode: 'RU',
    timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
    impact: 5,
    source: 'Reuters',
    url: 'https://www.reuters.com/business/finance/india-russia-rupee-ruble-2024'
  },
  {
    id: 'n20',
    headline: 'UAE announces $10 billion investment in Indian infrastructure',
    summary: 'Strategic partnership deepens. Focus on ports, logistics, and renewable energy.',
    category: 'update',
    country: 'UAE',
    countryCode: 'AE',
    timestamp: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'Moneycontrol',
    url: 'https://www.moneycontrol.com/news/business/uae-10-billion-investment-india-4567890.html'
  },
  {
    id: 'n21',
    headline: 'European Union proposes India free trade agreement revival',
    summary: 'FTA negotiations to resume after 18 months. Key sectors in focus include automotive and pharma.',
    category: 'analysis',
    country: 'EU',
    countryCode: 'EU',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    impact: 5,
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/news/eu-india-fta-revival-2024'
  },
  {
    id: 'n22',
    headline: 'Myanmar military junta claims control of border towns',
    summary: 'Insurgent groups retreat. India-Myanmar border security concerns intensify.',
    category: 'urgent',
    country: 'Myanmar',
    countryCode: 'MM',
    timestamp: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
    impact: 6,
    source: 'BBC',
    url: 'https://www.bbc.com/news/world-asia-myanmar-junta-2024'
  },
  {
    id: 'n23',
    headline: 'India\'s solar panel manufacturing capacity crosses 50 GW',
    summary: 'Green energy transition accelerates. Import dependency on Chinese panels reduces.',
    category: 'update',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
    impact: 3,
    source: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/india-solar-capacity-50gw-2024'
  },
  {
    id: 'n24',
    headline: 'US Treasury places India on currency manipulation watchlist',
    summary: 'Rupee volatility flagged. Trade tensions with US expected to increase.',
    category: 'urgent',
    country: 'USA',
    countryCode: 'US',
    timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    impact: 6,
    source: 'Reuters',
    url: 'https://www.reuters.com/markets/currencies/us-treasury-india-currency-watch-2024'
  },
  {
    id: 'n25',
    headline: 'Analysis: India\'s strategic autonomy tested in Ukraine war',
    summary: 'Balancing act between Western partners and Russia. Impact on defense procurement.',
    category: 'analysis',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 64 * 60 * 60 * 1000).toISOString(),
    impact: 5,
    source: 'Business Standard',
    url: 'https://www.business-standard.com/article/economy/india-ukraine-war-strategic-autonomy-124'
  },
  {
    id: 'n26',
    headline: 'BREAKING: Missile test from North Korea triggers Japan evacuation',
    summary: 'ICBM falls in Japanese EEZ. Six-party talks revival unlikely. Regional tensions spike.',
    category: 'breaking',
    country: 'North Korea',
    countryCode: 'KP',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    impact: 7,
    isBreaking: true,
    source: 'NDTV',
    url: 'https://www.ndtv.com/world-news/north-korea-missile-test-japan-5678903'
  },
  {
    id: 'n27',
    headline: 'Sri Lanka economic crisis deepens, India provides $1 billion credit',
    summary: 'Humanitarian assistance continues. Regional stability concerns persist.',
    category: 'analysis',
    country: 'Sri Lanka',
    countryCode: 'LK',
    timestamp: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/sri-lanka-crisis-india-credit-2024'
  },
  {
    id: 'n28',
    headline: 'India unveils ₹3 lakh crore infrastructure spending plan',
    summary: 'Focus on railways, highways, and ports. GDP growth target raised to 7.5%.',
    category: 'update',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'Moneycontrol',
    url: 'https://www.moneycontrol.com/news/business/infrastructure-spending-plan-6789012.html'
  },
  {
    id: 'n29',
    headline: 'Iran releases Indian sailors held for 6 months',
    summary: 'Diplomatic efforts succeed. 16 crew members to return home this week.',
    category: 'update',
    country: 'Iran',
    countryCode: 'IR',
    timestamp: new Date(Date.now() - 78 * 60 * 60 * 1000).toISOString(),
    impact: 3,
    source: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/iran-releases-indian-sailors-2024'
  },
  {
    id: 'n30',
    headline: 'ASEAN summit: India pitches blue economy and digital integration',
    summary: 'Indo-Pacific Economic Framework gains traction. Trade bloc discussions advance.',
    category: 'analysis',
    country: 'India',
    countryCode: 'IN',
    timestamp: new Date(Date.now() - 82 * 60 * 60 * 1000).toISOString(),
    impact: 4,
    source: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/asean-summit-india-pitch-2024'
  },
];

export const CONFLICT_DOTS: ConflictDot[] = [
  { id: 'c1', lat: 34.5, lng: 76.5, intensity: 9, type: 'military', country: 'India-Pakistan', description: 'LOC Fire Exchange', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'c2', lat: 35.2, lng: 77.8, intensity: 7, type: 'military', country: 'India-China', description: ' LAC Standoff', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'c3', lat: 31.5, lng: 34.5, intensity: 8, type: 'political', country: 'Israel-Gaza', description: 'Ongoing Conflict', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: 'c4', lat: 23.7, lng: 121.0, intensity: 6, type: 'military', country: 'Taiwan Strait', description: 'Military Exercises', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
  { id: 'c5', lat: 15.8, lng: 110.5, intensity: 5, type: 'political', country: 'South China Sea', description: 'Maritime Tensions', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
  { id: 'c6', lat: 48.0, lng: 37.0, intensity: 4, type: 'military', country: 'Ukraine', description: 'Active Conflict', timestamp: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString() },
  { id: 'c7', lat: 24.0, lng: 90.5, intensity: 4, type: 'political', country: 'Bangladesh', description: 'Political Unrest', timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString() },
];

export const CAUSE_EFFECT_CHAINS: CauseEffectNode[] = [
  {
    id: 'chain1',
    eventId: '4',
    title: 'Red Sea Crisis',
    type: 'cause',
    impact: 8,
    children: [
      {
        id: 'chain1-1',
        eventId: '4',
        title: 'Shipping Route Diversion',
        type: 'effect',
        impact: 7,
        children: [
          {
            id: 'chain1-1-1',
            eventId: '',
            title: 'Trade Costs ↑',
            type: 'sector',
            sector: 'trade',
            impact: 8,
            children: [
              {
                id: 'chain1-1-1-1',
                eventId: '',
                title: 'Export Revenue ↓',
                type: 'sector',
                sector: 'economy',
                impact: 6,
                children: []
              },
              {
                id: 'chain1-1-1-2',
                eventId: '',
                title: 'Inflation Risk ↑',
                type: 'sector',
                sector: 'economy',
                impact: 7,
                children: []
              }
            ]
          },
          {
            id: 'chain1-1-2',
            eventId: '',
            title: 'Freight Insurance ↑',
            type: 'sector',
            sector: 'trade',
            impact: 6,
            children: []
          }
        ]
      },
      {
        id: 'chain1-2',
        eventId: '',
        title: 'Energy Supply Routes',
        type: 'effect',
        impact: 7,
        children: [
          {
            id: 'chain1-2-1',
            eventId: '',
            title: 'LNG Prices ↑',
            type: 'sector',
            sector: 'energy',
            impact: 8,
            children: [
              {
                id: 'chain1-2-1-1',
                eventId: '',
                title: 'Power Costs ↑',
                type: 'sector',
                sector: 'energy',
                impact: 7,
                children: []
              },
              {
                id: 'chain1-2-1-2',
                eventId: '',
                title: 'Fiscal Deficit ↑',
                type: 'sector',
                sector: 'economy',
                impact: 8,
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'chain2',
    eventId: '2',
    title: 'Pakistan Border Tensions',
    type: 'cause',
    impact: 9,
    children: [
      {
        id: 'chain2-1',
        eventId: '',
        title: 'Military Deployment ↑',
        type: 'sector',
        sector: 'defense',
        impact: 9,
        children: [
          {
            id: 'chain2-1-1',
            eventId: '',
            title: 'Defense Budget ↑',
            type: 'sector',
            sector: 'economy',
            impact: 6,
            children: []
          }
        ]
      },
      {
        id: 'chain2-2',
        eventId: '',
        title: 'Diplomatic Strain',
        type: 'sector',
        sector: 'diplomacy',
        impact: 8,
        children: []
      }
    ]
  }
];

export const SIMULATION_PRESETS = [
  {
    id: 'sim1',
    name: 'Escalation: India-Pakistan Conflict',
    description: 'Simulates impact if border skirmish turns into full conflict',
    severity: 'critical',
    duration: '6 months',
    sectors: ['defense', 'economy', 'diplomacy', 'trade']
  },
  {
    id: 'sim2',
    name: 'Economic: Oil Price Shock',
    description: 'Impact if crude prices hit $120/barrel due to Middle East tensions',
    severity: 'high',
    duration: '12 months',
    sectors: ['energy', 'economy', 'trade']
  },
  {
    id: 'sim3',
    name: 'Security: China-Taiwan Crisis',
    description: 'Cascading effects if China invades Taiwan',
    severity: 'critical',
    duration: '18 months',
    sectors: ['technology', 'trade', 'diplomacy', 'economy']
  },
  {
    id: 'sim4',
    name: 'Climate: Failed Monsoon',
    description: 'Impact if monsoon is 40% below normal for second consecutive year',
    severity: 'high',
    duration: '24 months',
    sectors: ['economy', 'energy', 'diplomacy']
  },
];
