import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { NewsPanel } from './components/NewsPanel';
import { MapView } from './pages/MapView';
import { Dashboard } from './pages/Dashboard';
import { AIAnalyst } from './pages/AIAnalyst';
import { Scenarios } from './pages/Scenarios';
import { NewsPage } from './pages/NewsPage';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { useDashboardStore } from './store/dashboardStore';

function App() {
  const { activePage, sidebarCollapsed, rightPanelOpen, newsPanelOpen } = useDashboardStore();

  const renderPage = () => {
    switch (activePage) {
      case 'map': return <MapView />;
      case 'dashboard': return <Dashboard />;
      case 'analyst': return <AIAnalyst />;
      case 'scenarios': return <Scenarios />;
      case 'news': return <NewsPage />;
      case 'market': return <MarketIntelligence />;
      default: return <MapView />;
    }
  };

  return (
    <div className="h-screen w-screen bg-bg-primary grid-texture overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        {activePage !== 'market' && <Sidebar collapsed={sidebarCollapsed} />}
        <main className="flex-1 overflow-hidden min-w-0">
          {renderPage()}
        </main>
        {activePage !== 'market' && rightPanelOpen && <RightPanel />}
        {newsPanelOpen && activePage !== 'news' && activePage !== 'market' && <NewsPanel />}
      </div>
    </div>
  );
}

export default App;
