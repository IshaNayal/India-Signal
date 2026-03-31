import { create } from 'zustand';
import type { AppState, GlobalEvent, EventType, ChatMessage, NewsItem } from '../types';
import { MOCK_EVENTS, NEWS_ITEMS } from '../data/mockData';

interface DashboardStore extends AppState {
  events: GlobalEvent[];
  filteredEvents: GlobalEvent[];
  chatMessages: ChatMessage[];
  news: NewsItem[];
  selectedNews: NewsItem | null;
  lastNewsUpdate: Date;
  newsRefreshInterval: number;
  setActivePage: (page: AppState['activePage']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setNewsPanelOpen: (open: boolean) => void;
  setSelectedCountry: (country: string | null) => void;
  setSelectedEvent: (event: GlobalEvent | null) => void;
  setSelectedNews: (news: NewsItem | null) => void;
  setEventTypeFilter: (type: EventType | 'all') => void;
  setTimeFilter: (filter: AppState['timeFilter']) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  applyFilters: () => void;
  refreshNews: () => void;
  setNewsRefreshInterval: (interval: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  activePage: 'dashboard',
  sidebarCollapsed: false,
  rightPanelOpen: true,
  newsPanelOpen: false,
  selectedCountry: null,
  selectedEvent: null,
  selectedNews: null,
  searchQuery: '',
  eventTypeFilter: 'all',
  timeFilter: 'all',
  events: MOCK_EVENTS,
  filteredEvents: MOCK_EVENTS,
  chatMessages: [],
  news: NEWS_ITEMS,
  lastNewsUpdate: new Date(),
  newsRefreshInterval: 300000,

  setActivePage: (page) => set({ activePage: page }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setNewsPanelOpen: (open) => set({ newsPanelOpen: open }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedNews: (news) => set({ selectedNews: news }),
  setEventTypeFilter: (type) => {
    set({ eventTypeFilter: type });
    get().applyFilters();
  },
  setTimeFilter: (filter) => {
    set({ timeFilter: filter });
    get().applyFilters();
  },

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),

  clearChat: () => set({ chatMessages: [] }),

  refreshNews: () => {
    const updatedNews = NEWS_ITEMS.map((item, idx) => ({
      ...item,
      timestamp: new Date(Date.now() - (idx * 5 + Math.random() * 10) * 60 * 1000).toISOString(),
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    set({ news: updatedNews, lastNewsUpdate: new Date() });
  },

  setNewsRefreshInterval: (interval) => set({ newsRefreshInterval: interval }),

  applyFilters: () => {
    const { events, eventTypeFilter, timeFilter } = get();
    let filtered = [...events];

    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(e => e.eventType === eventTypeFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(e => {
        const eventDate = new Date(e.timestamp);
        if (timeFilter === 'today') {
          return eventDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (timeFilter === 'week') {
          return eventDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeFilter === 'month') {
          return eventDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        return true;
      });
    }

    set({ filteredEvents: filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )});
  },
}));
