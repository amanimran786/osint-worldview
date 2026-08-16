export interface VariantMeta {
  title: string;
  description: string;
  keywords: string;
  url: string;
  siteName: string;
  shortName: string;
  subject: string;
  classification: string;
  categories: string[];
  features: string[];
}

export const VARIANT_META: { full: VariantMeta; [k: string]: VariantMeta } = {
  full: {
    title: 'WorldView - Global Intelligence Dashboard',
    description: 'Open-source dashboard for exploring global news, geospatial events, infrastructure, markets, and public safety signals.',
    keywords: 'global intelligence dashboard, public-source research, world news, geospatial events, infrastructure, markets, public safety, OSINT',
    url: 'https://osint-worldview-cyan.vercel.app/',
    siteName: 'WorldView',
    shortName: 'WorldView',
    subject: 'Global Intelligence and Situation Awareness',
    classification: 'Intelligence Dashboard, OSINT Tool, News Aggregator',
    categories: ['news', 'productivity'],
    features: [
      'News aggregation',
      'Interactive map and globe views',
      'Configurable public-data layers',
      'Regional dashboard panels',
      'Search and display settings',
      'Source availability indicators',
    ],
  },
  tech: {
    title: 'WorldView Tech - Technology and AI Dashboard',
    description: 'WorldView dashboard for exploring technology news, AI organizations, startup ecosystems, funding rounds, and industry events.',
    keywords: 'tech dashboard, AI industry, startup ecosystem, tech companies, AI labs, venture capital, tech events, tech conferences, cloud infrastructure, datacenters, tech layoffs, funding rounds, unicorns, FAANG, tech HQ, accelerators, Y Combinator, tech news',
    url: 'https://osint-worldview-cyan.vercel.app/?variant=tech',
    siteName: 'WorldView Tech',
    shortName: 'WorldView',
    subject: 'AI, Tech Industry, and Startup Ecosystem Intelligence',
    classification: 'Tech Dashboard, AI Tracker, Startup Intelligence',
    categories: ['news', 'business'],
    features: [
      'Tech news aggregation',
      'Technology organization and event mapping',
      'Configurable source panels',
      'Service-status panels',
      'Search and display settings',
    ],
  },
  happy: {
    title: 'WorldView Good News - Global Progress Dashboard',
    description: 'WorldView dashboard for positive news, public progress data, and constructive stories from around the world.',
    keywords: 'good news, positive news, global progress, happy news, uplifting stories, human achievement, science breakthroughs, conservation wins',
    url: 'https://osint-worldview-cyan.vercel.app/?variant=happy',
    siteName: 'WorldView Good News',
    shortName: 'WorldView',
    subject: 'Good News, Global Progress, and Human Achievement',
    classification: 'Positive News Dashboard, Progress Tracker',
    categories: ['news', 'lifestyle'],
    features: [
      'Curated positive news',
      'Public progress-data panels',
      'Science and conservation stories',
      'Renewable-energy panels',
    ],
  },
  finance: {
    title: 'WorldView Markets - Global Finance Dashboard',
    description: 'WorldView dashboard for global markets, stock exchanges, central banks, commodities, currencies, crypto, and economic indicators.',
    keywords: 'finance dashboard, trading dashboard, stock market, forex, commodities, central banks, crypto, economic indicators, market news, financial centers, stock exchanges, bonds, derivatives, fintech, hedge funds, IPO tracker, market analysis',
    url: 'https://osint-worldview-cyan.vercel.app/?variant=finance',
    siteName: 'WorldView Markets',
    shortName: 'WorldView',
    subject: 'Global Markets, Trading, and Financial Intelligence',
    classification: 'Finance Dashboard, Market Tracker, Trading Intelligence',
    categories: ['finance', 'news'],
    features: [
      'Market and commodity panels',
      'Stock exchange and financial-center mapping',
      'Economic indicator panels',
      'Financial news aggregation',
      'Configurable watchlists and display settings',
    ],
  },
  commodity: {
    title: 'WorldView Commodities - Supply Chain Dashboard',
    description: 'WorldView dashboard for mining sites, processing plants, commodity ports, supply chains, and global trade flows.',
    keywords: 'commodity dashboard, mining sites, processing plants, commodity ports, supply chain, commodity markets, oil, gas, metals, agriculture, mining operations, commodity trade, logistics, infrastructure, resource tracking, commodity prices, futures markets',
    url: 'https://osint-worldview-cyan.vercel.app/?variant=commodity',
    siteName: 'WorldView Commodities',
    shortName: 'WorldView',
    subject: 'Commodity Markets, Mining, and Supply Chain Intelligence',
    classification: 'Commodity Dashboard, Supply Chain Tracker, Resource Intelligence',
    categories: ['finance', 'business'],
    features: [
      'Mining site and processing-plant mapping',
      'Commodity port mapping',
      'Supply chain visualization',
      'Commodity and trade-data panels',
      'Logistics infrastructure mapping',
      'Commodity market news',
    ],
  },
};
