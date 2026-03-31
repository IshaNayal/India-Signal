# 📡 India Signal: Intelligence & Strategic Analysis Dashboard

**India Signal** is a high-fidelity, real-time geopolitical intelligence platform designed for policy analysts, researchers, and strategic decision-makers. It aggregates global and domestic news, performing AI-powered impact analysis to visualize strategic shifts across the Indian subcontinent.

![India Signal Header](https://raw.githubusercontent.com/placeholder-logo.png)

## 🌟 Key Features

- **🗺️ Interactive Geopolitical Map**: A custom D3-powered SVG map of India providing real-time state-level intelligence overlays and heatmaps.
- **🤖 AI-Powered Analysis**: Integrated LLM classification (Claude) that assesses news impact scores, sentiment, and sector-specific implications (Defense, Economy, Energy, etc.).
- **📰 Intelligence Feed**: A glass-morphic, multi-source news aggregator with automated deduplication and regional tagging.
- **📈 Strategic Trend Tracking**: 24-hour rolling impact scores and volatility metrics to track national security and economic trends.
- **🔮 Scenario Modeling**: Dedicated module for analyzing "What If" geopolitical scenarios and their ripple effects on the Indian economy.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (Custom Dark Terminal Theme)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Visualization**: [D3.js](https://d3js.org/), [React Simple Maps](https://www.react-simple-maps.io/), [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Analysis**: Custom Proxy-based Market Data & GNews API Integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/GutsMater/India-Signal.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Deployment

The project is optimized for high-performance rendering. To create a production build:
```bash
npm run build
```

---

> [!NOTE]
> This platform uses real-time financial and news data. Ensure API keys for data providers are configured in your `.env` file for live production environments.

