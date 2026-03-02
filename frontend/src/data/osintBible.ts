/**
 * OSINT Bible 2026 — Ultimate Tool & Resource Directory
 * Sources: frangelbarrera/OSINT-BIBLE, JambaAcademy/OSINT, osintambition/Social-Media-OSINT-Tools-Collection,
 *          Astrosp/Awesome-OSINT-For-Everything, apurvsinghgautam/dark-web-osint-tools,
 *          daprofiler/DaProfiler, hueristiq/xurlfind3r, iudicium/pryingdeep,
 *          Lucksi/Mr.Holmes, kaifcodec/user-scanner, termuxhackers-id/INSTAHACK
 * 42 Categories · 850+ Tools · Methodologies · Techniques
 */

export interface OSINTTool {
  name: string;
  url: string;
  description: string;
  tags?: string[];
  free?: boolean;
}

export interface OSINTCategory {
  id: string;
  number: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  tools: OSINTTool[];
  methodology?: string[];
}

export const OSINT_CATEGORIES: OSINTCategory[] = [
  /* ───────────────────────── 1. FUNDAMENTALS ───────────────────────── */
  {
    id: 'fundamentals',
    number: 1,
    title: 'Fundamentals',
    icon: '\u{1F4D6}',
    color: '#f0a030',
    description: 'Core OSINT concepts: Intelligence Cycle, OPSEC, PII, source classification.',
    tools: [
      { name: 'OSINT Framework', url: 'https://osintframework.com', description: 'Collection of OSINT tools sorted by category', tags: ['framework', 'directory'], free: true },
      { name: 'IntelTechniques', url: 'https://inteltechniques.com/tools', description: 'Michael Bazzell OSINT tools and methodology', tags: ['framework', 'training'], free: true },
      { name: 'Hunchly', url: 'https://hunch.ly', description: 'Web capture tool for OSINT investigations', tags: ['capture', 'evidence'], free: false },
      { name: 'MetaOSINT', url: 'https://metaosint.github.io', description: 'Quickly identify relevant publicly-available OSINT tools and resources', tags: ['directory', 'meta'], free: true },
      { name: 'OSINT Combine', url: 'https://osintcombine.com', description: 'Combined OSINT tools and tradecraft training platform', tags: ['framework', 'training'], free: true },
      { name: 'Lampyre', url: 'https://lampyre.io', description: 'Data analysis and OSINT tool for obtaining, visualizing and analyzing data', tags: ['analysis', 'visualization'], free: false },
      { name: 'The OSINT Vault', url: 'https://theosintvault.io', description: 'Curated collection of OSINT resources and tools', tags: ['directory'], free: true },
      { name: 'cipher387 OSINT Collection', url: 'https://cipher387.github.io/osint_stuff_tool_collection', description: 'Services, techniques, tricks and notes about OSINT', tags: ['directory', 'collection'], free: true },
      { name: 'Technisette', url: 'https://www.technisette.com/p/home', description: 'Tutorials, tools, databases, addons and search engines for OSINT', tags: ['directory', 'training'], free: true },
      { name: 'Osint.support', url: 'https://osint.support', description: 'Collection and analysis of information gathered from public sources', tags: ['directory'], free: true },
    ],
    methodology: [
      'OSINT = Intelligence from public sources without violating access',
      'OPSEC: VPN, VM, alias, metadata strip',
      'Intelligence Cycle: Direction, Collection, Processing, Analysis, Dissemination',
      'PII: email, phone, RFC, CURP, IP, IMEI, MAC',
      'Primary Source: Original publication (tweet, PDF, photo EXIF)',
      'Secondary Source: Article citing the primary -- always validate',
    ],
  },

  /* ───────────────────────── 2. METHODOLOGY ───────────────────────── */
  {
    id: 'methodology',
    number: 2,
    title: 'Methodology & Workflow',
    icon: '\u{1F9E9}',
    color: '#60a0f0',
    description: 'Planning, pivoting, and documenting OSINT investigations systematically.',
    tools: [
      { name: 'Maltego CE', url: 'https://maltego.com', description: 'Visual link analysis for investigations and data mining', tags: ['graph', 'link-analysis'], free: true },
      { name: 'SpiderFoot', url: 'https://spiderfoot.net', description: 'Automated OSINT collection framework with 200+ modules', tags: ['automation', 'recon'], free: true },
      { name: 'Obsidian', url: 'https://obsidian.md', description: 'Knowledge base for investigation notes and link graphs', tags: ['notes', 'graph'], free: true },
      { name: 'CyberChef', url: 'https://gchq.github.io/CyberChef', description: 'Web app for encoding, decoding, encryption and data analysis', tags: ['data', 'analysis'], free: true },
      { name: 'pywhat', url: 'https://github.com/bee-san/pywhat', description: 'Identify anything -- emails, IPs, hashes, crypto addresses and more', tags: ['identification', 'analysis'], free: true },
      { name: 'Seekr', url: 'https://github.com/seekr-osint/seekr', description: 'Multi-purpose OSINT toolkit for gathering and managing data', tags: ['toolkit', 'management'], free: true },
      { name: 'mitaka', url: 'https://github.com/ninoseki/mitaka', description: 'Browser extension for OSINT search across multiple engines', tags: ['browser', 'extension'], free: true },
      { name: 'Recon-ng', url: 'https://github.com/lanmaster53/recon-ng', description: 'Full-featured reconnaissance framework with modular design', tags: ['recon', 'framework'], free: true },
    ],
    methodology: [
      'Start with what you know: one seed (email, handle, domain)',
      'Pivot: email -> breach DB -> password pattern -> other accounts',
      'Timeline: sort data chronologically for behavioral patterns',
      'Always screenshot and archive (Wayback Machine, archive.today)',
      'Document chain of evidence for legal admissibility',
    ],
  },

  /* ───────────────────────── 3. SEARCH ENGINES ───────────────────────── */
  {
    id: 'search',
    number: 3,
    title: 'Search Engines & Dorking',
    icon: '\u{1F50D}',
    color: '#50d070',
    description: 'Advanced operators, specialized engines, and Google dorking for precision recon.',
    tools: [
      { name: 'Google Dorking', url: 'https://www.google.com/advanced_search', description: 'Advanced operators: site:, filetype:, inurl:, intitle:', tags: ['dork', 'google'], free: true },
      { name: 'Google Hacking DB', url: 'https://www.exploit-db.com/google-hacking-database', description: 'Archive of Google dorks for finding sensitive info', tags: ['dork', 'database'], free: true },
      { name: 'Bing', url: 'https://www.bing.com', description: 'Microsoft search engine with unique dork operators', tags: ['search'], free: true },
      { name: 'DuckDuckGo', url: 'https://duckduckgo.com', description: 'Privacy-focused search engine with !bang shortcuts', tags: ['search', 'privacy'], free: true },
      { name: 'Yandex', url: 'https://yandex.com', description: 'Russian search engine -- excellent for reverse image search', tags: ['search', 'images'], free: true },
      { name: 'Baidu', url: 'https://www.baidu.com', description: 'Chinese search engine for Asia-Pacific OSINT', tags: ['search', 'china'], free: true },
      { name: 'Brave Search', url: 'https://search.brave.com', description: 'Independent search engine with privacy focus', tags: ['search', 'privacy'], free: true },
      { name: 'Startpage', url: 'https://startpage.com', description: 'Google results without tracking or personal data collection', tags: ['search', 'privacy'], free: true },
      { name: 'Qwant', url: 'https://www.qwant.com', description: 'European privacy-respecting search engine', tags: ['search', 'privacy'], free: true },
      { name: 'Mojeek', url: 'https://www.mojeek.com', description: 'Independent crawler-based search engine with no tracking', tags: ['search', 'privacy'], free: true },
      { name: 'Carrot2', url: 'https://search.carrot2.org', description: 'Organizes search results into topics and clusters', tags: ['search', 'clustering'], free: true },
      { name: 'Swisscows', url: 'https://swisscows.com', description: 'Anonymous search engine that protects privacy', tags: ['search', 'privacy'], free: true },
      { name: 'Dogpile', url: 'https://www.dogpile.com', description: 'Metasearch engine fetching results from multiple engines', tags: ['search', 'meta'], free: true },
      { name: 'Million Short', url: 'https://millionshort.com', description: 'Discover sites that dont make top search results', tags: ['search', 'discovery'], free: true },
      { name: 'Presearch', url: 'https://engine.presearch.org', description: 'Decentralized community-powered search engine', tags: ['search', 'decentralized'], free: true },
      { name: 'SearXNG', url: 'https://searxng.org', description: 'Free metasearch engine aggregating results from 70+ engines', tags: ['search', 'meta', 'self-hosted'], free: true },
      { name: 'Google Scholar', url: 'https://scholar.google.com', description: 'Search scholarly literature across disciplines', tags: ['search', 'academic'], free: true },
      { name: 'Crossref', url: 'https://search.crossref.org', description: 'Search metadata of journal articles, books, standards and datasets', tags: ['search', 'academic'], free: true },
      { name: 'PublicWWW', url: 'https://publicwww.com', description: 'Source code search engine for marketing and research', tags: ['search', 'source-code'], free: true },
      { name: 'SearchTempest', url: 'https://www.searchtempest.com', description: 'Search all of Facebook Marketplace and Craigslist at once', tags: ['search', 'marketplace'], free: true },
    ],
    methodology: [
      'site:target.com filetype:pdf OR filetype:xlsx confidential',
      'inurl:admin intitle:"index of" password',
      'Use Yandex for face matching -- often better than Google',
      'Combine engines: Google + Bing + DuckDuckGo for full coverage',
    ],
  },

  /* ───────────────────────── 4. SOCIAL MEDIA ───────────────────────── */
  {
    id: 'social',
    number: 4,
    title: 'Social Media Intelligence',
    icon: '\u{1F4F1}',
    color: '#e050a0',
    description: 'SOCMINT across Facebook, Twitter/X, Instagram, LinkedIn, TikTok, Reddit and more.',
    tools: [
      { name: 'Social Searcher', url: 'https://www.social-searcher.com', description: 'Monitor public social mentions across all major platforms', tags: ['monitor', 'social'], free: true },
      { name: 'Social Analyzer', url: 'https://github.com/qeeqbox/social-analyzer', description: 'Find social media profiles using name, email, phone or username', tags: ['profile', 'search'], free: true },
      { name: 'WhoPostedWhat', url: 'https://whopostedwhat.com', description: 'Facebook keyword search on specific dates', tags: ['facebook', 'search'], free: true },
      { name: 'CrowdTangle', url: 'https://apps.crowdtangle.com/chrome-extension', description: 'Shows Facebook/Instagram posts and tweets mentioning a link', tags: ['facebook', 'instagram', 'extension'], free: true },
      { name: 'StalkFace', url: 'https://stalkface.com', description: 'Toolkit to search Facebook for posts, people and photos', tags: ['facebook', 'search'], free: true },
      { name: 'Search Is Back', url: 'https://searchisback.com', description: 'Find people and events on Facebook by location and relationships', tags: ['facebook', 'search'], free: true },
      { name: 'DumpItBlue+', url: 'https://chrome.google.com/webstore/detail/dumpitblue%2B/igmgknoioooacbcpcfgjigbaajpelbfe', description: 'Dump Facebook data for analysis or reporting', tags: ['facebook', 'extension'], free: true },
      { name: 'AnalyzeID', url: 'https://analyzeid.com', description: 'Find sites with the same owner including Facebook App ID match', tags: ['facebook', 'correlation'], free: true },
      { name: 'FollowerWonk', url: 'https://followerwonk.com/bio', description: 'Find Twitter accounts by bio keywords and analyze followers', tags: ['twitter', 'analytics'], free: true },
      { name: 'Tinfoleak', url: 'https://tinfoleak.com', description: 'Search for Twitter user leaks and metadata', tags: ['twitter', 'leaks'], free: true },
      { name: 'TweetDeck', url: 'https://tweetdeck.twitter.com', description: 'View multiple Twitter timelines in one interface', tags: ['twitter', 'monitor'], free: true },
      { name: 'Wayback Tweets', url: 'https://waybacktweets.streamlit.app', description: 'Display archived tweets from Wayback Machine', tags: ['twitter', 'archive'], free: true },
      { name: 'Social Bearing', url: 'https://socialbearing.com', description: 'Insights and analytics for tweets and timelines', tags: ['twitter', 'analytics'], free: true },
      { name: 'SocialData API', url: 'https://socialdata.tools', description: 'Unofficial Twitter API for scraping tweets and profiles', tags: ['twitter', 'api'], free: false },
      { name: 'Thread Reader', url: 'https://threadreaderapp.com', description: 'Read and share Twitter threads easily', tags: ['twitter', 'threads'], free: true },
      { name: 'memory.lol', url: 'https://memory.lol/app', description: 'Historical information about Twitter users and name changes', tags: ['twitter', 'history'], free: true },
      { name: 'Nitter', url: 'https://github.com/zedeus/nitter', description: 'Alternative Twitter front-end with no tracking', tags: ['twitter', 'privacy'], free: true },
      { name: 'Osintgram', url: 'https://github.com/Datalux/Osintgram', description: 'OSINT tool for Instagram account reconnaissance', tags: ['instagram', 'recon'], free: true },
      { name: 'Toutatis', url: 'https://github.com/megadose/toutatis', description: 'Extract phone, email and more from Instagram accounts via API', tags: ['instagram', 'extraction'], free: true },
      { name: 'Instaloader', url: 'https://github.com/instaloader/instaloader', description: 'Download Instagram pictures, videos, captions and metadata', tags: ['instagram', 'download'], free: true },
      { name: 'InstaHunt', url: 'https://instahunt.co', description: 'Find Instagram places and posts near a geographic location', tags: ['instagram', 'geolocation'], free: true },
      { name: 'Picuki', url: 'https://www.picuki.com', description: 'Browse public Instagram content without logging in', tags: ['instagram', 'viewer'], free: true },
      { name: 'SnapInsta', url: 'https://snapinsta.app', description: 'Download photos, videos and IGTV from public Instagram', tags: ['instagram', 'download'], free: true },
      { name: 'Exportgram', url: 'https://exportgram.net', description: 'Export Instagram comments to Excel, CSV and JSON', tags: ['instagram', 'export'], free: true },
      { name: 'Profile Analyzer', url: 'https://inflact.com/tools/profile-analyzer', description: 'Analyze any public Instagram profile with precise statistics', tags: ['instagram', 'analytics'], free: true },
      { name: 'RecruitEm', url: 'https://recruitin.net', description: 'Create Google boolean strings to search LinkedIn profiles', tags: ['linkedin', 'search'], free: true },
      { name: 'RocketReach', url: 'https://rocketreach.co', description: 'Search and lookup contact info for 700M+ professionals', tags: ['linkedin', 'contacts'], free: false },
      { name: 'PhantomBuster', url: 'https://phantombuster.com', description: 'Automation tool for LinkedIn data extraction', tags: ['linkedin', 'automation'], free: false },
      { name: 'CrossLinked', url: 'https://github.com/m8sec/CrossLinked', description: 'LinkedIn enumeration via search engine scraping', tags: ['linkedin', 'enumeration'], free: true },
      { name: 'InSpy', url: 'https://github.com/jobroche/InSpy', description: 'Python-based LinkedIn enumeration tool', tags: ['linkedin', 'enumeration'], free: true },
      { name: 'ReverseContact', url: 'https://www.reversecontact.com', description: 'Find LinkedIn profiles associated with any email', tags: ['linkedin', 'email'], free: true },
      { name: 'Mavekite', url: 'https://mavekite.com', description: 'TikTok profile search and analysis by username', tags: ['tiktok', 'search'], free: true },
      { name: 'Exolyt', url: 'https://exolyt.com', description: 'TikTok analytics and insights tool', tags: ['tiktok', 'analytics'], free: true },
      { name: 'Snap Map', url: 'https://map.snapchat.com', description: 'View Snapchat stories from around the world on a map', tags: ['snapchat', 'geolocation'], free: true },
      { name: 'SnapIntel', url: 'https://github.com/Kr0wZ/SnapIntel', description: 'Python tool providing information about Snapchat users', tags: ['snapchat', 'recon'], free: true },
      { name: 'Export Comments', url: 'https://exportcomments.com', description: 'Export comments from social media posts to Excel', tags: ['social', 'export'], free: true },
      { name: 'SOCMINT Start.me', url: 'https://start.me/p/Wp1kpe/socmint', description: 'Curated collection of social media OSINT tools', tags: ['social', 'directory'], free: true },
    ],
    methodology: [
      'Cross-reference username variations across platforms',
      'Archive profiles before they are deleted: archive.today + screenshots',
      'Use geolocation features on Snap Map, Instagram Places, Twitter geo',
      'Monitor for real-time mentions with Social Searcher or Talkwalker',
    ],
  },

  /* ───────────────────────── 5. GEOINT / GEOLOCATION ───────────────────────── */
  {
    id: 'geoint',
    number: 5,
    title: 'Geospatial Intelligence',
    icon: '\u{1F30D}',
    color: '#40c090',
    description: 'GEOINT: satellite imagery, mapping, GPS analysis and geolocation verification.',
    tools: [
      { name: 'Google Earth Pro', url: 'https://earth.google.com', description: 'Satellite imagery with historical timeline', tags: ['satellite', 'maps'], free: true },
      { name: 'Google Maps', url: 'https://maps.google.com', description: 'Street View and mapping for location verification', tags: ['maps', 'streetview'], free: true },
      { name: 'Sentinel Hub', url: 'https://www.sentinel-hub.com', description: 'Copernicus satellite imagery browser', tags: ['satellite', 'imagery'], free: true },
      { name: 'Mapillary', url: 'https://www.mapillary.com', description: 'Street-level imagery platform for geolocation', tags: ['streetview', 'crowdsourced'], free: true },
      { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org', description: 'Open-source mapping with community edits', tags: ['maps', 'open-source'], free: true },
      { name: 'Wikimapia', url: 'https://wikimapia.org', description: 'Collaborative mapping with tagged locations', tags: ['maps', 'collaborative'], free: true },
      { name: 'SunCalc', url: 'https://www.suncalc.org', description: 'Sun position and shadow analysis for geolocation', tags: ['geolocation', 'shadows'], free: true },
      { name: 'GeoGuessr', url: 'https://www.geoguessr.com', description: 'Geographic guessing game for OSINT practice', tags: ['training', 'geolocation'], free: true },
      { name: 'KartaView', url: 'https://kartaview.org', description: 'OpenStreetCam street-level imagery', tags: ['streetview', 'open-source'], free: true },
      { name: 'Overpass Turbo', url: 'https://overpass-turbo.eu', description: 'Query OpenStreetMap data with Overpass API', tags: ['maps', 'query'], free: true },
      { name: 'Pic2Map', url: 'https://www.pic2map.com', description: 'Extract GPS data from photos and show on map', tags: ['geolocation', 'exif'], free: true },
      { name: 'Where Is This Photo', url: 'https://www.whereisthisphoto.com', description: 'AI-powered photo geolocation identification', tags: ['geolocation', 'ai'], free: true },
      { name: 'picarta.ai', url: 'https://www.picarta.ai', description: 'Find where a photo was taken using AI analysis', tags: ['geolocation', 'ai'], free: true },
      { name: 'os-surveillance', url: 'https://os-surveillance.io', description: 'Real-time intelligence from social media, cameras, IoT, traffic', tags: ['surveillance', 'real-time'], free: true },
      { name: 'BirdHunt', url: 'https://birdhunt.co', description: 'Show all tweets within a chosen geographic location', tags: ['twitter', 'geolocation'], free: true },
    ],
    methodology: [
      'Shadow analysis: use SunCalc to determine time/location from shadows',
      'Match architectural styles, vegetation, road markings to narrow region',
      'Cross-reference satellite timeline for changes over time',
      'Use Street View to verify on-the-ground details',
    ],
  },

  /* ───────────────────────── 6. DOMAIN / IP / DNS ───────────────────────── */
  {
    id: 'domain-ip',
    number: 6,
    title: 'Domain, IP & DNS',
    icon: '\u{1F310}',
    color: '#3090e0',
    description: 'Infrastructure recon: WHOIS, DNS records, subdomains, certificates and hosting analysis.',
    tools: [
      { name: 'Shodan', url: 'https://shodan.io', description: 'Search engine for Internet-connected devices and services', tags: ['iot', 'scanning'], free: true },
      { name: 'Censys', url: 'https://censys.io', description: 'Internet-wide asset discovery and attack surface management', tags: ['scanning', 'certificates'], free: true },
      { name: 'VirusTotal', url: 'https://www.virustotal.com', description: 'Analyze files, domains, IPs and URLs for malware', tags: ['malware', 'scanning'], free: true },
      { name: 'SecurityTrails', url: 'https://securitytrails.com', description: 'Complete DNS and domain intelligence with historical data', tags: ['dns', 'history'], free: true },
      { name: 'DNSDumpster', url: 'https://dnsdumpster.com', description: 'Free domain research tool for discovering hosts', tags: ['dns', 'recon'], free: true },
      { name: 'crt.sh', url: 'https://crt.sh', description: 'Certificate transparency log search', tags: ['certificates', 'ssl'], free: true },
      { name: 'ViewDNS.info', url: 'https://viewdns.info', description: 'Reverse IP, WHOIS, DNS records, port scanning', tags: ['dns', 'reverse-ip'], free: true },
      { name: 'WHOIS', url: 'https://who.is', description: 'Domain registration data lookup', tags: ['whois', 'domain'], free: true },
      { name: 'Whoxy', url: 'https://www.whoxy.com', description: 'WHOIS domain search engine with reverse lookup', tags: ['whois', 'reverse'], free: true },
      { name: 'BuiltWith', url: 'https://builtwith.com', description: 'Technology stack lookup for any website', tags: ['technology', 'profiling'], free: true },
      { name: 'Wappalyzer', url: 'https://www.wappalyzer.com', description: 'Identify technology stack of any website', tags: ['technology', 'profiling'], free: true },
      { name: 'urlscan.io', url: 'https://urlscan.io', description: 'Scan and analyze websites -- screenshots, DOM, requests', tags: ['scanning', 'analysis'], free: true },
      { name: 'Robtex', url: 'https://www.robtex.com', description: 'Research IP numbers, domain names and network info', tags: ['dns', 'network'], free: true },
      { name: 'ONYPHE', url: 'https://www.onyphe.io', description: 'Cyber defense search engine for exposed assets and dark web', tags: ['scanning', 'attack-surface'], free: true },
      { name: 'ZoomEye', url: 'https://www.zoomeye.org', description: 'Cyberspace search engine for security assessment', tags: ['scanning', 'iot'], free: true },
      { name: 'FOFA', url: 'https://en.fofa.info', description: 'Cyberspace search engine for finding assets', tags: ['scanning', 'china'], free: true },
      { name: 'Criminal IP', url: 'https://www.criminalip.io', description: 'Cyber threat intelligence search engine', tags: ['threat-intel', 'scanning'], free: true },
      { name: 'FullHunt', url: 'https://fullhunt.io', description: 'Attack surface discovery and security assessment', tags: ['attack-surface', 'discovery'], free: true },
      { name: 'Netlas.io', url: 'https://netlas.io', description: 'Internet intelligence for domains, IPs and certificates', tags: ['scanning', 'discovery'], free: true },
      { name: 'Hunter.how', url: 'https://hunter.how', description: 'Internet asset search and discovery platform', tags: ['scanning', 'discovery'], free: true },
      { name: 'Quake', url: 'https://quake.360.net', description: 'Cyberspace mapping by 360 Security', tags: ['scanning', 'china'], free: true },
      { name: 'BinaryEdge', url: 'https://www.binaryedge.io', description: 'Cybersecurity data platform and internet scanner', tags: ['scanning', 'data'], free: true },
      { name: 'GreyNoise', url: 'https://www.greynoise.io', description: 'Identify internet scanners and common business activity', tags: ['noise', 'filtering'], free: true },
      { name: 'dnslytics', url: 'https://dnslytics.com', description: 'Search for domain, IPv4, IPv6 or provider info', tags: ['dns', 'analytics'], free: true },
      { name: 'dnstwist', url: 'https://dnstwist.it', description: 'Scan for phishing domains and typosquatting', tags: ['dns', 'phishing'], free: true },
      { name: 'SubDomainRadar', url: 'https://subdomainradar.io', description: '50+ data sources for subdomain discovery, port and vuln scans', tags: ['subdomain', 'discovery'], free: true },
      { name: 'domain digger', url: 'https://digger.tools', description: 'Find all DNS records, WHOIS, SSL history and subdomains', tags: ['dns', 'all-in-one'], free: true },
      { name: 'web-check', url: 'https://github.com/Lissy93/web-check', description: 'All-in-one OSINT tool for analyzing any website', tags: ['analysis', 'all-in-one'], free: true },
      { name: 'SimilarWeb', url: 'https://www.similarweb.com', description: 'Website traffic analysis and competitor intelligence', tags: ['analytics', 'traffic'], free: true },
      { name: 'OSINT.SH', url: 'https://osint.sh', description: 'All-in-one information gathering tools suite', tags: ['all-in-one', 'recon'], free: true },
      { name: 'IPinfo', url: 'https://ipinfo.io', description: 'IP address data and geolocation API', tags: ['ip', 'geolocation'], free: true },
      { name: 'Cloudflare Radar Scan', url: 'https://radar.cloudflare.com/scan', description: 'URL scanner by Cloudflare for security analysis', tags: ['scanning', 'analysis'], free: true },
    ],
    methodology: [
      'Start with WHOIS + DNS records to map infrastructure',
      'Use crt.sh for certificate transparency to find subdomains',
      'Cross-reference Shodan + Censys + ZoomEye for full coverage',
      'Check historical DNS with SecurityTrails for ownership changes',
    ],
  },

  /* ───────────────────────── 7. DEEP & DARK WEB ───────────────────────── */
  {
    id: 'deep-dark',
    number: 7,
    title: 'Deep & Dark Web',
    icon: '\u{1F573}\u{FE0F}',
    color: '#8040d0',
    description: 'Tor hidden services, dark web search engines, crawlers and monitoring tools.',
    tools: [
      { name: 'Ahmia', url: 'https://ahmia.fi', description: 'Search engine for Tor hidden services', tags: ['tor', 'search'], free: true },
      { name: 'OnionSearch', url: 'https://github.com/megadose/OnionSearch', description: 'Script that scrapes URLs on different .onion search engines', tags: ['tor', 'scraping'], free: true },
      { name: 'Darkdump', url: 'https://github.com/josh0xA/darkdump', description: 'Search the deep web directly from terminal', tags: ['tor', 'search'], free: true },
      { name: 'TorBot', url: 'https://github.com/DedSecInside/TorBot', description: 'Dark web OSINT tool for crawling and analyzing Tor network', tags: ['tor', 'crawler'], free: true },
      { name: 'TorCrawl', url: 'https://github.com/MikeMeliz/TorCrawl.py', description: 'Python tool to crawl and extract data from Tor sites', tags: ['tor', 'crawler'], free: true },
      { name: 'PryingDeep', url: 'https://github.com/iudicium/pryingdeep', description: 'Deep/dark web crawler with crypto, email, phone extraction via Tor', tags: ['tor', 'crawler', 'extraction'], free: true },
      { name: 'OnionScan', url: 'https://github.com/s-rah/onionscan', description: 'Investigate and scan onion services for security issues', tags: ['tor', 'scanning'], free: true },
      { name: 'Katana', url: 'https://github.com/adnane-X-tebbaa/Katana', description: 'Dark web search engine tool', tags: ['tor', 'search'], free: true },
      { name: 'Darkus', url: 'https://github.com/Lucksi/Darkus', description: 'Dark web search and OSINT tool', tags: ['tor', 'search'], free: true },
      { name: 'IACA Dark Web Tools', url: 'https://iaca-darkweb-tools.com', description: 'International dark web investigation support tools', tags: ['tor', 'investigation'], free: true },
      { name: 'VigilantOnion', url: 'https://github.com/andreyglauzer/VigilantOnion', description: 'Monitor and analyze dark web onion services', tags: ['tor', 'monitor'], free: true },
      { name: 'OnionIngestor', url: 'https://github.com/danieleperera/OnionIngestor', description: 'Ingest and index data from onion services', tags: ['tor', 'indexing'], free: true },
      { name: 'robin', url: 'https://github.com/AudreyFelwororth/robin', description: 'AI-powered dark web OSINT tool for investigation', tags: ['tor', 'ai'], free: true },
      { name: 'OnionLand', url: 'https://onionland.io', description: 'Search engine for hidden onion sites', tags: ['tor', 'search'], free: true },
      { name: 'DeepDarkCTI', url: 'https://github.com/fastfire/deepdarkCTI', description: 'Deep and dark web cyber threat intelligence resources', tags: ['tor', 'threat-intel'], free: true },
      { name: 'ransomwatch', url: 'https://ransomwatch.telemetry.ltd', description: 'Transparent ransomware claim tracker', tags: ['ransomware', 'monitor'], free: true },
      { name: 'OnionLinksV3', url: 'https://github.com/01Kevin01/OnionLinksV3', description: 'List of onion sites -- forums, chats, markets', tags: ['tor', 'directory'], free: true },
      { name: 'Intelligence X', url: 'https://intelx.io', description: 'Search engine for the dark web, leaks and public data', tags: ['search', 'leaks'], free: true },
    ],
    methodology: [
      'Always use Tor Browser in a VM with VPN for dark web access',
      'Never provide personal information on hidden services',
      'Use OnionScan to check hidden service OPSEC before deeper investigation',
      'Monitor ransomware groups via ransomwatch for threat intel',
    ],
  },

  /* ───────────────────────── 8. AUTOMATION & FRAMEWORKS ───────────────────────── */
  {
    id: 'automation',
    number: 8,
    title: 'Automation & Frameworks',
    icon: '\u{1F916}',
    color: '#f06040',
    description: 'OSINT automation, scripting frameworks, data processing and pipeline tools.',
    tools: [
      { name: 'theHarvester', url: 'https://github.com/laramies/theHarvester', description: 'Gather emails, subdomains, hosts, names, ports from public sources', tags: ['recon', 'enumeration'], free: true },
      { name: 'Amass', url: 'https://github.com/owasp-amass/amass', description: 'In-depth attack surface mapping and asset discovery', tags: ['subdomain', 'enumeration'], free: true },
      { name: 'Subfinder', url: 'https://github.com/projectdiscovery/subfinder', description: 'Fast passive subdomain enumeration tool', tags: ['subdomain', 'discovery'], free: true },
      { name: 'Photon', url: 'https://github.com/s0md3v/Photon', description: 'Incredibly fast crawler designed for OSINT', tags: ['crawler', 'extraction'], free: true },
      { name: 'xurlfind3r', url: 'https://github.com/hueristiq/xurlfind3r', description: 'Find URLs from multiple passive sources (Wayback, CommonCrawl, VirusTotal)', tags: ['url', 'discovery'], free: true },
      { name: 'Osmedeus', url: 'https://github.com/j3ssie/osmedeus', description: 'Workflow engine for offensive security and OSINT automation', tags: ['automation', 'workflow'], free: true },
      { name: 'Raccoon', url: 'https://github.com/evyatarmeged/Raccoon', description: 'High-performance recon and vulnerability scanning tool', tags: ['recon', 'scanning'], free: true },
      { name: 'metabigor', url: 'https://github.com/j3ssie/metabigor', description: 'OSINT tools without API key requirement', tags: ['recon', 'no-api'], free: true },
      { name: 'FOCA', url: 'https://github.com/ElevenPaths/FOCA', description: 'Find metadata and hidden info in documents', tags: ['metadata', 'documents'], free: true },
      { name: 'Nmap', url: 'https://nmap.org', description: 'Network discovery and security auditing tool', tags: ['network', 'scanning'], free: true },
      { name: 'Masscan', url: 'https://github.com/robertdavidgraham/masscan', description: 'Internet-scale port scanner at 10M packets/sec', tags: ['network', 'scanning'], free: true },
      { name: 'Wireshark', url: 'https://www.wireshark.org', description: 'Network protocol analyzer for packet capture', tags: ['network', 'packets'], free: true },
    ],
    methodology: [
      'Chain tools: theHarvester -> Subfinder -> Amass for max coverage',
      'Use Photon for crawling and xurlfind3r for passive URL discovery',
      'Automate with Osmedeus workflows for repeatable recon',
    ],
  },

  /* ───────────────────────── 9. REPORTING ───────────────────────── */
  {
    id: 'reports',
    number: 9,
    title: 'Reporting & Archiving',
    icon: '\u{1F4CB}',
    color: '#70b0f0',
    description: 'Evidence documentation, archiving, timeline creation and investigation reporting.',
    tools: [
      { name: 'Wayback Machine', url: 'https://web.archive.org', description: 'Archive and retrieve historical web pages', tags: ['archive', 'history'], free: true },
      { name: 'archive.today', url: 'https://archive.today', description: 'Snapshot any web page permanently', tags: ['archive', 'snapshot'], free: true },
      { name: 'CachedViews', url: 'https://cachedviews.com', description: 'Cached view of any page through multiple cached sources', tags: ['archive', 'cache'], free: true },
      { name: 'Gephi', url: 'https://gephi.org', description: 'Open-source graph visualization and analysis', tags: ['visualization', 'graph'], free: true },
      { name: 'Cytoscape', url: 'https://cytoscape.org', description: 'Network data integration and visualization platform', tags: ['visualization', 'network'], free: true },
      { name: 'Neo4j', url: 'https://neo4j.com', description: 'Graph database for relationship analysis', tags: ['database', 'graph'], free: true },
    ],
    methodology: [
      'Archive every page you visit: Wayback + archive.today',
      'Create timelines with screenshots and timestamps',
      'Use graph tools (Gephi, Maltego) for relationship mapping',
    ],
  },

  /* ───────────────────────── 10. AI INTELLIGENCE ───────────────────────── */
  {
    id: 'ai-intel',
    number: 10,
    title: 'AI-Powered Intelligence',
    icon: '\u{1F9E0}',
    color: '#d050f0',
    description: 'AI and machine learning tools for pattern recognition, NLP, and automated analysis.',
    tools: [
      { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'AI assistant for analysis, summarization and research', tags: ['ai', 'nlp'], free: true },
      { name: 'Babel X', url: 'https://babelx.com', description: 'AI-powered multilingual social media intelligence', tags: ['ai', 'social', 'multilingual'], free: false },
      { name: 'Recorded Future', url: 'https://recordedfuture.com', description: 'AI-driven threat intelligence platform', tags: ['ai', 'threat-intel'], free: false },
      { name: 'Social Links', url: 'https://sociallinks.io', description: 'AI-enhanced OSINT platform for investigations', tags: ['ai', 'social'], free: false },
      { name: 'Palantir Gotham', url: 'https://palantir.com', description: 'Enterprise data fusion and intelligence analysis', tags: ['ai', 'enterprise'], free: false },
      { name: 'Hoaxy', url: 'https://hoaxy.osome.iu.edu', description: 'Visualize the spread of information and claims on Twitter', tags: ['ai', 'misinformation'], free: true },
    ],
  },

  /* ───────────────────────── 11. FACIAL RECOGNITION ───────────────────────── */
  {
    id: 'facial-rec',
    number: 11,
    title: 'Facial Recognition & Images',
    icon: '\u{1F464}',
    color: '#f0c040',
    description: 'Reverse image search, face matching, EXIF analysis and visual intelligence.',
    tools: [
      { name: 'PimEyes', url: 'https://pimeyes.com', description: 'Face recognition search engine', tags: ['face', 'search'], free: false },
      { name: 'FaceCheck', url: 'https://facecheck.id', description: 'Upload a face to discover social media profiles and appearances', tags: ['face', 'search'], free: true },
      { name: 'Search4Faces', url: 'https://search4faces.com', description: 'Reverse face search in social networks', tags: ['face', 'social'], free: true },
      { name: 'TinEye', url: 'https://tineye.com', description: 'Reverse image search -- find where images appear online', tags: ['reverse-image', 'search'], free: true },
      { name: 'Yandex Images', url: 'https://yandex.com/images', description: 'Best reverse image search for faces', tags: ['reverse-image', 'face'], free: true },
      { name: 'Google Lens', url: 'https://lens.google.com', description: 'Visual search and object recognition by Google', tags: ['reverse-image', 'ai'], free: true },
      { name: 'Jeffrey EXIF Viewer', url: 'http://exif.regex.info/exif.cgi', description: 'Online EXIF data viewer for photo metadata', tags: ['exif', 'metadata'], free: true },
      { name: 'ExifTool', url: 'https://exiftool.org', description: 'Command-line tool for reading/writing metadata in files', tags: ['exif', 'metadata'], free: true },
      { name: 'FotoForensics', url: 'https://fotoforensics.com', description: 'Photo forensics and Error Level Analysis', tags: ['forensics', 'ela'], free: true },
      { name: 'InVID', url: 'https://www.invid-project.eu', description: 'Video/image verification plugin for fact-checking', tags: ['verification', 'video'], free: true },
      { name: 'FindClone', url: 'https://findclone.ru', description: 'Find your lookalike using facial recognition', tags: ['face', 'search'], free: true },
      { name: 'Lenso.ai', url: 'https://lenso.ai', description: 'AI image search engine for finding similar images', tags: ['reverse-image', 'ai'], free: true },
      { name: 'SurfFace', url: 'https://surfface.com', description: 'Face search engine across the web', tags: ['face', 'search'], free: true },
      { name: 'FaceSeek', url: 'https://faceseek.online', description: 'Online face search and recognition tool', tags: ['face', 'search'], free: true },
      { name: 'Reversly.ai', url: 'https://reversly.ai', description: 'AI-powered reverse image search', tags: ['reverse-image', 'ai'], free: true },
    ],
    methodology: [
      'Use Yandex Images for best face matching results',
      'Always check EXIF data for GPS coordinates and camera info',
      'Use FotoForensics ELA to detect image manipulation',
      'Cross-reference with TinEye + Google Lens + PimEyes',
    ],
  },

  /* ───────────────────────── 12. EMAIL & PHONE ───────────────────────── */
  {
    id: 'email-phone',
    number: 12,
    title: 'Email & Phone Investigation',
    icon: '\u{1F4E7}',
    color: '#60d0a0',
    description: 'Email verification, phone lookup, OSINT from email addresses and phone numbers.',
    tools: [
      { name: 'Hunter.io', url: 'https://hunter.io', description: 'Find professional email addresses for any domain', tags: ['email', 'discovery'], free: true },
      { name: 'Epieos', url: 'https://epieos.com', description: 'Find accounts linked to an email address', tags: ['email', 'lookup'], free: true },
      { name: 'holehe', url: 'https://github.com/megadose/holehe', description: 'Check if email is registered on various sites', tags: ['email', 'enumeration'], free: true },
      { name: 'Phonebook.cz', url: 'https://phonebook.cz', description: 'Search engine for emails, domains and URLs from IntelX', tags: ['email', 'search'], free: true },
      { name: 'h8mail', url: 'https://github.com/khast3x/h8mail', description: 'Email OSINT and breach hunting tool', tags: ['email', 'breaches'], free: true },
      { name: 'GHunt', url: 'https://github.com/mxrch/GHunt', description: 'Investigate Google accounts with email', tags: ['email', 'google'], free: true },
      { name: 'Mailcat', url: 'https://github.com/sharsil/mailcat', description: 'Find existing email addresses by nickname', tags: ['email', 'discovery'], free: true },
      { name: 'EmailRep', url: 'https://emailrep.io', description: 'Email reputation and risk scoring', tags: ['email', 'reputation'], free: true },
      { name: 'MXToolbox', url: 'https://mxtoolbox.com', description: 'Email deliverability and DNS diagnostics', tags: ['email', 'dns'], free: true },
      { name: 'Snov.io', url: 'https://snov.io', description: 'Email finder and verification platform', tags: ['email', 'verification'], free: true },
      { name: 'Voila Norbert', url: 'https://www.voilanorbert.com', description: 'Find corporate email addresses', tags: ['email', 'corporate'], free: true },
      { name: 'Skymem', url: 'https://www.skymem.info', description: 'Find email addresses from domain names', tags: ['email', 'discovery'], free: true },
      { name: 'PhoneInfoga', url: 'https://github.com/sundowndev/phoneinfoga', description: 'Advanced phone number information gathering', tags: ['phone', 'lookup'], free: true },
      { name: 'Phonerator', url: 'https://phonerator.com', description: 'Generate valid phone number formats for research', tags: ['phone', 'generation'], free: true },
      { name: 'Nuwber', url: 'https://nuwber.com', description: 'People search by phone number or name', tags: ['phone', 'people'], free: true },
      { name: 'CallSpy', url: 'https://callspy.net', description: 'Phone number research and caller identification', tags: ['phone', 'lookup'], free: true },
      { name: 'User Scanner', url: 'https://github.com/kaifcodec/user-scanner', description: 'Email OSINT tool checking registration across 100+ sites', tags: ['email', 'enumeration'], free: true },
    ],
    methodology: [
      'Use holehe + Epieos to find accounts linked to an email',
      'Check h8mail for email appearances in breach databases',
      'PhoneInfoga for carrier, location and line type from phone numbers',
      'Hunter.io + Snov.io for corporate email pattern discovery',
    ],
  },

  /* ───────────────────────── 13. BLOCKCHAIN ───────────────────────── */
  {
    id: 'blockchain',
    number: 13,
    title: 'Blockchain & Cryptocurrency',
    icon: '\u{20BF}',
    color: '#f0a020',
    description: 'Blockchain analysis, wallet tracking, transaction tracing and crypto investigations.',
    tools: [
      { name: 'Blockchain Explorer', url: 'https://www.blockchain.com/explorer', description: 'Bitcoin blockchain explorer and wallet tracker', tags: ['bitcoin', 'explorer'], free: true },
      { name: 'Etherscan', url: 'https://etherscan.io', description: 'Ethereum blockchain explorer', tags: ['ethereum', 'explorer'], free: true },
      { name: 'Chainalysis', url: 'https://www.chainalysis.com', description: 'Blockchain data platform for investigators', tags: ['analysis', 'enterprise'], free: false },
      { name: 'Elliptic', url: 'https://www.elliptic.co', description: 'Crypto compliance and investigation tools', tags: ['compliance', 'aml'], free: false },
      { name: 'Crystal Blockchain', url: 'https://crystalblockchain.com', description: 'Blockchain analytics platform', tags: ['analytics'], free: false },
      { name: 'OXT.me', url: 'https://oxt.me', description: 'Bitcoin blockchain explorer with analysis tools', tags: ['bitcoin', 'analysis'], free: true },
      { name: 'WalletExplorer', url: 'https://www.walletexplorer.com', description: 'Bitcoin wallet tracking and cluster analysis', tags: ['bitcoin', 'tracking'], free: true },
      { name: 'Breadcrumbs', url: 'https://www.breadcrumbs.app', description: 'Blockchain investigation platform', tags: ['investigation'], free: true },
      { name: 'Arkham Intelligence', url: 'https://www.arkhamintelligence.com', description: 'Crypto intelligence and entity tracking', tags: ['intelligence', 'tracking'], free: true },
      { name: 'Nansen', url: 'https://www.nansen.ai', description: 'Blockchain analytics with wallet labels', tags: ['analytics', 'labels'], free: false },
      { name: 'Chainabuse', url: 'https://www.chainabuse.com', description: 'Report and search crypto scam addresses', tags: ['scams', 'reporting'], free: true },
      { name: 'Blockcypher', url: 'https://live.blockcypher.com', description: 'Multi-blockchain explorer for BTC, ETH, LTC, DOGE', tags: ['multi-chain', 'explorer'], free: true },
      { name: 'Ethplorer', url: 'https://ethplorer.io', description: 'Ethereum token and wallet explorer', tags: ['ethereum', 'tokens'], free: true },
      { name: 'Solscan', url: 'https://solscan.io', description: 'Solana blockchain explorer', tags: ['solana', 'explorer'], free: true },
      { name: 'BSCScan', url: 'https://bscscan.com', description: 'Binance Smart Chain explorer', tags: ['bsc', 'explorer'], free: true },
      { name: 'On-Chain Investigation Tools', url: 'https://github.com/OffcierCia/On-Chain-Investigations-Tools-List', description: 'Comprehensive list of tools for investigating crypto incidents', tags: ['investigation', 'directory'], free: true },
    ],
    methodology: [
      'Trace transaction flows to identify wallet clusters',
      'Use Arkham + Nansen for entity labeling',
      'Check Chainabuse for reported scam addresses',
      'Cross-chain analysis: BTC -> ETH -> BSC bridges',
    ],
  },

  /* ───────────────────────── 14. TRANSPORT ───────────────────────── */
  {
    id: 'transport',
    number: 14,
    title: 'Transport & Vehicle Intelligence',
    icon: '\u{2708}\u{FE0F}',
    color: '#50a0e0',
    description: 'Aircraft tracking, vessel monitoring, vehicle registration and transport OSINT.',
    tools: [
      { name: 'FlightRadar24', url: 'https://www.flightradar24.com', description: 'Real-time global flight tracking', tags: ['aviation', 'tracking'], free: true },
      { name: 'FlightAware', url: 'https://flightaware.com', description: 'Flight tracking and airport information', tags: ['aviation', 'tracking'], free: true },
      { name: 'ADS-B Exchange', url: 'https://globe.adsbexchange.com', description: 'Unfiltered flight tracking with military aircraft', tags: ['aviation', 'unfiltered'], free: true },
      { name: 'MarineTraffic', url: 'https://www.marinetraffic.com', description: 'Global ship tracking with AIS data', tags: ['maritime', 'ais'], free: true },
      { name: 'VesselFinder', url: 'https://www.vesselfinder.com', description: 'Live vessel tracking and ship databases', tags: ['maritime', 'tracking'], free: true },
      { name: 'OpenRailwayMap', url: 'https://www.openrailwaymap.org', description: 'Railway infrastructure mapping worldwide', tags: ['railway', 'maps'], free: true },
    ],
    methodology: [
      'Track private jets for corporate and political intelligence',
      'Use ADS-B Exchange for unfiltered military/government flights',
      'MarineTraffic for vessel patterns and port activity',
    ],
  },

  /* ───────────────────────── 15. WIFI & WIRELESS ───────────────────────── */
  {
    id: 'wifi',
    number: 15,
    title: 'WiFi & Wireless Intelligence',
    icon: '\u{1F4E1}',
    color: '#a060e0',
    description: 'Wireless network mapping, WiFi positioning and signal intelligence.',
    tools: [
      { name: 'WiGLE', url: 'https://wigle.net', description: 'Wireless network mapping and statistics', tags: ['wifi', 'mapping'], free: true },
      { name: 'MAC Address Lookup', url: 'https://maclookup.app', description: 'Find vendor name from OUI or MAC address', tags: ['mac', 'lookup'], free: true },
    ],
    methodology: [
      'WiGLE maps WiFi networks by BSSID and location',
      'MAC prefix identifies device manufacturer and model',
    ],
  },

  /* ───────────────────────── 16. VERIFICATION ───────────────────────── */
  {
    id: 'verification',
    number: 16,
    title: 'Verification & Fact-Checking',
    icon: '\u{2705}',
    color: '#40d0c0',
    description: 'Media verification, fact-checking, reverse image search and deepfake detection.',
    tools: [
      { name: 'Bellingcat Toolkit', url: 'https://docs.google.com/spreadsheets/d/18rtqh8EG2q1xBo2cLNyhIDuK9jrPGwYr9DI2UncoqJQ', description: 'Online investigation toolkit for verification', tags: ['verification', 'toolkit'], free: true },
      { name: 'Snopes', url: 'https://www.snopes.com', description: 'Definitive fact-checking site for rumors and misinformation', tags: ['fact-check', 'debunking'], free: true },
      { name: 'ReviewMeta', url: 'https://reviewmeta.com', description: 'Analyze Amazon product reviews for authenticity', tags: ['reviews', 'analysis'], free: true },
      { name: 'Bot Sentinel', url: 'https://botsentinel.com', description: 'Detect inauthentic accounts and bot activity on Twitter', tags: ['bots', 'detection'], free: true },
      { name: 'Botometer', url: 'https://botometer.osome.iu.edu', description: 'Check if a Twitter account is a bot', tags: ['bots', 'detection'], free: true },
      { name: 'FollowerAudit', url: 'https://www.followeraudit.com', description: 'Check fake followers on Twitter/X accounts', tags: ['twitter', 'fake-followers'], free: true },
      { name: 'dangerzone', url: 'https://github.com/freedomofpress/dangerzone', description: 'Convert potentially dangerous documents to safe PDFs', tags: ['documents', 'safety'], free: true },
    ],
    methodology: [
      'Reverse image search everything: TinEye + Yandex + Google Lens',
      'Check ELA (Error Level Analysis) for photo manipulation',
      'Cross-reference claims across multiple independent sources',
    ],
  },

  /* ───────────────────────── 17. USERNAME ENUMERATION ───────────────────────── */
  {
    id: 'username',
    number: 17,
    title: 'Username Enumeration',
    icon: '\u{1F50E}',
    color: '#e070a0',
    description: 'Find accounts by username across hundreds of platforms simultaneously.',
    tools: [
      { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Hunt down social media accounts by username across 400+ sites', tags: ['username', 'search'], free: true },
      { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Collect dossier on a person by username -- checks 3000+ sites', tags: ['username', 'dossier'], free: true },
      { name: 'Namechk', url: 'https://namechk.com', description: 'Check username and domain availability across platforms', tags: ['username', 'availability'], free: true },
      { name: 'KnowEm', url: 'https://knowem.com', description: 'Search 500+ social networks for username availability', tags: ['username', 'availability'], free: true },
      { name: 'WhatsMyName', url: 'https://whatsmyname.app', description: 'Enumerate usernames across many websites', tags: ['username', 'enumeration'], free: true },
      { name: 'Blackbird', url: 'https://github.com/p1ngul1n0/blackbird', description: 'OSINT tool to search accounts by username across social networks', tags: ['username', 'search'], free: true },
      { name: 'Snoop', url: 'https://github.com/snooppr/snoop', description: 'Search for nicknames over 4000+ sites -- one of the best', tags: ['username', 'search'], free: true },
      { name: 'Nexfil', url: 'https://github.com/thewhiteh4t/nexfil', description: 'OSINT tool for finding profiles by username', tags: ['username', 'search'], free: true },
      { name: 'Detective', url: 'https://detective.run', description: 'Search for usernames across multiple platforms', tags: ['username', 'search'], free: true },
      { name: 'Social Catfish', url: 'https://socialcatfish.com', description: 'Reverse search by name, email, phone, username or image', tags: ['username', 'reverse'], free: false },
      { name: 'IDCrawl', url: 'https://www.idcrawl.com/username', description: 'Uncover social media profiles behind a username', tags: ['username', 'social'], free: true },
      { name: 'UserRecon', url: 'https://github.com/thelinuxchoice/userrecon', description: 'Find usernames across 75+ social networks', tags: ['username', 'search'], free: true },
      { name: 'Profil3r', url: 'https://github.com/Rog3rSm1th/Profil3r', description: 'Find profiles across social networks by username', tags: ['username', 'search'], free: true },
      { name: 'Instant Username', url: 'https://instantusername.com', description: 'Check username availability across 100+ sites', tags: ['username', 'availability'], free: true },
      { name: 'Namecheckr', url: 'https://www.namecheckr.com', description: 'Check username and domain availability', tags: ['username', 'availability'], free: true },
      { name: 'socialscan', url: 'https://github.com/iojw/socialscan', description: 'Accurate checks for email and username usage on platforms', tags: ['username', 'email'], free: true },
      { name: 'Usersearch.org', url: 'https://usersearch.org', description: 'Find someone by username across 600+ sites', tags: ['username', 'search'], free: true },
      { name: 'Mr.Holmes', url: 'https://github.com/Lucksi/Mr.Holmes', description: 'OSINT tool for username, email, phone and website investigation', tags: ['username', 'multi-tool'], free: true },
      { name: 'DaProfiler', url: 'https://github.com/daprofiler/DaProfiler', description: 'OSINT profiler -- search LinkedIn, Instagram, Facebook, Twitter by name', tags: ['name', 'profiler'], free: true },
    ],
    methodology: [
      'Start with Sherlock + Maigret for broadest username coverage',
      'Use Snoop for Russian and CIS platform coverage',
      'Cross-reference found accounts for behavioral patterns',
      'Check username variations: handle, handle_, _handle, handle123',
    ],
  },

  /* ───────────────────────── 18. SCRAPING & DATA ───────────────────────── */
  {
    id: 'scraping',
    number: 18,
    title: 'Scraping & Data Extraction',
    icon: '\u{1F577}\u{FE0F}',
    color: '#d0a040',
    description: 'Web scraping, data extraction, API harvesting and content collection.',
    tools: [
      { name: 'Scrapy', url: 'https://scrapy.org', description: 'Python web crawling and scraping framework', tags: ['scraping', 'python'], free: true },
      { name: 'BeautifulSoup', url: 'https://www.crummy.com/software/BeautifulSoup', description: 'Python library for parsing HTML and XML', tags: ['scraping', 'python'], free: true },
      { name: 'Selenium', url: 'https://www.selenium.dev', description: 'Browser automation for dynamic content scraping', tags: ['scraping', 'automation'], free: true },
      { name: 'NerdyData', url: 'https://www.nerdydata.com', description: 'Find which websites use certain technologies', tags: ['technology', 'search'], free: true },
      { name: 'shhgit', url: 'https://github.com/eth0izzle/shhgit', description: 'Find secrets in GitHub, GitLab and Bitbucket repos', tags: ['secrets', 'git'], free: true },
      { name: 'git-hound', url: 'https://github.com/tillson/git-hound', description: 'Find exposed API keys across all of GitHub', tags: ['secrets', 'git'], free: true },
      { name: 'GitGot', url: 'https://github.com/BishopFox/GitGot', description: 'Semi-automated tool for auditing Git repositories', tags: ['secrets', 'audit'], free: true },
      { name: 'gitGraber', url: 'https://github.com/hisxo/gitGraber', description: 'Search for sensitive information in GitHub repos', tags: ['secrets', 'git'], free: true },
      { name: 'trape', url: 'https://github.com/jofpin/trape', description: 'People tracker -- OSINT analysis and research tool', tags: ['tracking', 'social'], free: true },
    ],
  },

  /* ───────────────────────── 19. METADATA & FORENSICS ───────────────────────── */
  {
    id: 'metadata',
    number: 19,
    title: 'Metadata & Digital Forensics',
    icon: '\u{1F52C}',
    color: '#40b0d0',
    description: 'File metadata extraction, steganography, document analysis and digital forensics.',
    tools: [
      { name: 'ExifTool', url: 'https://exiftool.org', description: 'Read, write and edit metadata in image, video, audio and PDF files', tags: ['metadata', 'exif'], free: true },
      { name: 'Metagoofil', url: 'https://github.com/laramies/metagoofil', description: 'Extract metadata from public documents on a domain', tags: ['metadata', 'documents'], free: true },
      { name: 'mat2', url: 'https://0xacab.org/jfroco/mat2', description: 'Metadata anonymization toolkit', tags: ['metadata', 'privacy'], free: true },
      { name: '4n6img', url: 'https://4n6img.com', description: 'Forensic image analysis and verification tool', tags: ['forensics', 'images'], free: true },
      { name: 'PicDetective', url: 'https://picdetective.com', description: 'Reverse image search and photo analysis tool', tags: ['forensics', 'images'], free: true },
    ],
  },

  /* ───────────────────────── 20. NETWORK ANALYSIS ───────────────────────── */
  {
    id: 'network',
    number: 20,
    title: 'Network & Infrastructure',
    icon: '\u{1F5A7}',
    color: '#6080d0',
    description: 'Network scanning, packet analysis, infrastructure mapping and service enumeration.',
    tools: [
      { name: 'Shodan CLI', url: 'https://cli.shodan.io', description: 'Command-line interface for Shodan searches', tags: ['scanning', 'cli'], free: true },
      { name: 'httpx', url: 'https://github.com/projectdiscovery/httpx', description: 'Fast multi-purpose HTTP toolkit for probing', tags: ['http', 'probing'], free: true },
      { name: 'Gobuster', url: 'https://github.com/OJ/gobuster', description: 'Directory/file and DNS busting tool', tags: ['brute-force', 'directories'], free: true },
      { name: 'ffuf', url: 'https://github.com/ffuf/ffuf', description: 'Fast web fuzzer for content and parameter discovery', tags: ['fuzzing', 'discovery'], free: true },
      { name: 'Feroxbuster', url: 'https://github.com/epi052/feroxbuster', description: 'Recursive content discovery tool', tags: ['discovery', 'brute-force'], free: true },
      { name: 'ivre', url: 'https://github.com/ivre/ivre', description: 'Network recon framework -- build alternatives to Shodan', tags: ['framework', 'scanning'], free: true },
      { name: 'LeakIX', url: 'https://leakix.net', description: 'Index of services found scanning the internet', tags: ['scanning', 'leaks'], free: true },
      { name: 'PulseDive', url: 'https://pulsedive.com', description: 'Free threat intelligence with IOCs and risk scoring', tags: ['threat-intel', 'iocs'], free: true },
    ],
  },

  /* ───────────────────────── 21. GOOGLE DORKS ───────────────────────── */
  {
    id: 'google-dorks',
    number: 21,
    title: 'Google Dorks Collection',
    icon: '\u{1F3AF}',
    color: '#e06050',
    description: 'Curated Google dork queries for finding sensitive information and exposed data.',
    tools: [
      { name: 'Google Hacking DB', url: 'https://www.exploit-db.com/google-hacking-database', description: 'Largest archive of Google dork queries', tags: ['dork', 'database'], free: true },
      { name: 'DorkSearch', url: 'https://dorksearch.com', description: 'Google dork search made easy with categories', tags: ['dork', 'search'], free: true },
      { name: 'Google Dorking Guide', url: 'https://one-plus.github.io/GoogleBing', description: 'Google library of search operators for research', tags: ['dork', 'guide'], free: true },
      { name: 'Github Dorks', url: 'https://github.com/techgaun/github-dorks', description: 'Collection of GitHub dorks for finding sensitive info in repos', tags: ['dork', 'github'], free: true },
    ],
    methodology: [
      'site:target.com filetype:pdf "confidential"',
      'intitle:"index of" /backup/ site:target.com',
      'inurl:admin inurl:login site:target.com',
      'site:pastebin.com "target.com" password',
    ],
  },

  /* ───────────────────────── 22. LEARNING & TRAINING ───────────────────────── */
  {
    id: 'learning',
    number: 22,
    title: 'Learning & Training',
    icon: '\u{1F393}',
    color: '#50c0e0',
    description: 'OSINT courses, certifications, CTF challenges and skill development resources.',
    tools: [
      { name: 'SANS OSINT', url: 'https://www.sans.org/cyber-security-courses/open-source-intelligence-gathering', description: 'Professional OSINT training courses (SEC497)', tags: ['training', 'certification'], free: false },
      { name: 'TCM Security OSINT', url: 'https://academy.tcm-sec.com/p/osint-fundamentals', description: 'OSINT fundamentals course by TCM Security', tags: ['training', 'beginner'], free: false },
      { name: 'OSINT Dojo', url: 'https://www.osintdojo.com', description: 'Free OSINT training resources and challenges', tags: ['training', 'challenges'], free: true },
      { name: 'Trace Labs', url: 'https://www.tracelabs.org', description: 'Crowdsourced OSINT for missing persons', tags: ['training', 'humanitarian'], free: true },
      { name: 'Sector035 Quiz', url: 'https://quiz.sector035.nl', description: 'Test your OSINT skills with weekly quizzes', tags: ['quiz', 'practice'], free: true },
      { name: 'Sourcing Games', url: 'https://sourcing.games', description: 'OSINT challenges and puzzles for practice', tags: ['challenges', 'practice'], free: true },
      { name: 'HackTheBox', url: 'https://www.hackthebox.com', description: 'OSINT challenges in CTF format', tags: ['ctf', 'practice'], free: true },
      { name: 'TryHackMe', url: 'https://tryhackme.com', description: 'Guided OSINT learning rooms and paths', tags: ['training', 'guided'], free: true },
      { name: 'CyberDefenders', url: 'https://cyberdefenders.org', description: 'Blue team challenges including OSINT scenarios', tags: ['ctf', 'blue-team'], free: true },
      { name: 'Sofia Santos Exercises', url: 'https://gralhix.com/list-of-osint-exercises', description: 'Collection of OSINT practice exercises', tags: ['exercises', 'practice'], free: true },
      { name: 'OSINT Games', url: 'https://osintgames.com', description: 'Interactive OSINT challenges and games', tags: ['challenges', 'games'], free: true },
      { name: 'Week in OSINT', url: 'https://sector035.nl/articles/category:week-in-osint', description: 'Weekly roundup of OSINT news and techniques', tags: ['newsletter', 'updates'], free: true },
    ],
  },

  /* ───────────────────────── 23. PEOPLE SEARCH ───────────────────────── */
  {
    id: 'people',
    number: 23,
    title: 'People Search & Records',
    icon: '\u{1F465}',
    color: '#c070e0',
    description: 'People search engines, public records, background checks and identity verification.',
    tools: [
      { name: 'Pipl', url: 'https://pipl.com', description: 'People search engine aggregating identity data', tags: ['people', 'aggregator'], free: false },
      { name: 'WhitePages', url: 'https://www.whitepages.com', description: 'Find people, contact info and background checks', tags: ['people', 'us'], free: true },
      { name: 'TruePeopleSearch', url: 'https://www.truepeoplesearch.com', description: 'Free people search with phone, address and associates', tags: ['people', 'us'], free: true },
      { name: 'FastPeopleSearch', url: 'https://www.fastpeoplesearch.com', description: 'Fast free people search engine', tags: ['people', 'us'], free: true },
      { name: 'Spokeo', url: 'https://www.spokeo.com', description: 'People search by name, email, phone or address', tags: ['people', 'aggregator'], free: false },
      { name: 'BeenVerified', url: 'https://www.beenverified.com', description: 'Background checks and people search', tags: ['people', 'background'], free: false },
      { name: 'TruthFinder', url: 'https://www.truthfinder.com', description: 'Social media, photos, police records, background checks', tags: ['people', 'background'], free: false },
      { name: 'PeekYou', url: 'https://www.peekyou.com', description: 'Free people search engine finding online presence', tags: ['people', 'social'], free: true },
      { name: 'Radaris', url: 'https://radaris.com', description: 'Find people by name, phone or address', tags: ['people', 'search'], free: true },
      { name: 'ThatsThem', url: 'https://thatsthem.com', description: 'Free people search with phone and address lookup', tags: ['people', 'free'], free: true },
      { name: 'xlek', url: 'https://xlek.com', description: 'People finder and public records search', tags: ['people', 'records'], free: true },
      { name: 'Infobel', url: 'https://www.infobel.com', description: 'Find businesses and individuals worldwide', tags: ['people', 'international'], free: true },
      { name: '192.com', url: 'https://www.192.com', description: 'Search for people, businesses and places in the UK', tags: ['people', 'uk'], free: true },
      { name: 'Canada411', url: 'https://www.canada411.ca', description: 'People search for Canada', tags: ['people', 'canada'], free: true },
    ],
    methodology: [
      'Start with free sources before paid services',
      'Cross-reference multiple people search engines for accuracy',
      'Check social media profiles linked to real names',
    ],
  },

  /* ───────────────────────── 24. COMPANY INTELLIGENCE ───────────────────────── */
  {
    id: 'company',
    number: 24,
    title: 'Company & Corporate Intel',
    icon: '\u{1F3E2}',
    color: '#4090d0',
    description: 'Corporate investigation, business records, financial analysis and competitor intelligence.',
    tools: [
      { name: 'OpenCorporates', url: 'https://opencorporates.com', description: 'Largest open database of companies in the world', tags: ['corporate', 'registry'], free: true },
      { name: 'Crunchbase', url: 'https://crunchbase.com', description: 'Business information about startups and companies', tags: ['corporate', 'startups'], free: true },
      { name: 'SEC EDGAR', url: 'https://www.sec.gov/cgi-bin/browse-edgar', description: 'US Securities and Exchange Commission filings', tags: ['corporate', 'sec', 'us'], free: true },
      { name: 'Companies House', url: 'https://www.gov.uk/government/organisations/companies-house', description: 'UK company register and filings', tags: ['corporate', 'uk'], free: true },
      { name: 'ICIJ Offshore Leaks', url: 'https://offshoreleaks.icij.org', description: 'Search offshore companies, foundations and trusts', tags: ['corporate', 'offshore'], free: true },
      { name: 'Dun & Bradstreet', url: 'https://www.dnb.com', description: 'Commercial database of business records', tags: ['corporate', 'database'], free: false },
      { name: 'Brownbook', url: 'https://www.brownbook.net', description: 'Global business listing directory', tags: ['corporate', 'directory'], free: true },
      { name: 'Greylist Trace', url: 'https://greylisttrace.com', description: 'Enterprise risk management and asset tracing', tags: ['corporate', 'risk'], free: false },
      { name: 'Tradint', url: 'https://tradint.io', description: 'Trade intelligence investigation tool', tags: ['corporate', 'trade'], free: true },
    ],
  },

  /* ───────────────────────── 25. BREACHES & LEAKS ───────────────────────── */
  {
    id: 'breaches',
    number: 25,
    title: 'Breaches & Leaked Data',
    icon: '\u{1F513}',
    color: '#e04040',
    description: 'Data breach search, credential leak monitoring and exposure assessment.',
    tools: [
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', description: 'Check if your email or phone was in a data breach', tags: ['breach', 'email'], free: true },
      { name: 'DeHashed', url: 'https://dehashed.com', description: 'Deep-web scans and credential leak protection', tags: ['breach', 'search'], free: false },
      { name: 'Snusbase', url: 'https://www.snusbase.com', description: 'Monitor exposure of online identities in breaches', tags: ['breach', 'monitor'], free: false },
      { name: 'LeakPeek', url: 'https://leakpeek.com', description: 'Search for leaked credentials and data', tags: ['breach', 'search'], free: true },
      { name: 'Leaked.domains', url: 'https://leaked.domains', description: 'Search domain-related leaked credentials', tags: ['breach', 'domain'], free: true },
      { name: 'PSBDMP', url: 'https://psbdmp.ws', description: 'Pastebin dump search and monitoring', tags: ['paste', 'monitor'], free: true },
      { name: 'Scylla.so', url: 'https://scylla.so', description: 'Community-driven breach search engine', tags: ['breach', 'community'], free: true },
      { name: 'WhiteIntel', url: 'https://whiteintel.io', description: 'Dark web data leak search engine', tags: ['breach', 'darkweb'], free: true },
      { name: 'CyberNews Leak Checker', url: 'https://cybernews.com/personal-data-leak-check', description: 'Check if your data has been leaked', tags: ['breach', 'check'], free: true },
      { name: 'COMB', url: 'https://www.proxynova.com/tools/comb', description: 'Largest dataset of leaked credentials search', tags: ['breach', 'database'], free: true },
      { name: 'DDoSecrets', url: 'https://ddosecrets.com', description: 'Non-profit publishing leaked datasets of public interest', tags: ['leaks', 'journalism'], free: true },
      { name: 'HudsonRock', url: 'https://cavalier.hudsonrock.com', description: 'Free cybercrime intelligence from infostealer infections', tags: ['breach', 'infostealer'], free: true },
    ],
    methodology: [
      'Start with HIBP for initial breach exposure check',
      'Use h8mail to automate breach hunting for email addresses',
      'Check PSBDMP for paste dumps containing credentials',
      'Monitor HudsonRock for infostealer-related compromises',
    ],
  },

  /* ───────────────────────── 26. LEGAL & COMPLIANCE ───────────────────────── */
  {
    id: 'legal',
    number: 26,
    title: 'Legal & Compliance',
    icon: '\u{2696}\u{FE0F}',
    color: '#b0a060',
    description: 'Legal frameworks, sanctions, compliance checking and regulatory databases.',
    tools: [
      { name: 'OFAC Sanctions', url: 'https://sanctionssearch.ofac.treas.gov', description: 'US Treasury OFAC sanctions list search', tags: ['sanctions', 'us'], free: true },
      { name: 'FBI Most Wanted', url: 'https://www.fbi.gov/wanted', description: 'FBI most wanted fugitives database', tags: ['law-enforcement', 'us'], free: true },
      { name: 'Interpol Wanted', url: 'https://www.interpol.int/en/How-we-work/Notices/View-Red-Notices', description: 'Interpol red notices and wanted persons', tags: ['law-enforcement', 'international'], free: true },
      { name: 'Wikileaks', url: 'https://wikileaks.org', description: 'Publication of censored or restricted official materials', tags: ['leaks', 'government'], free: true },
      { name: 'EFF Atlas of Surveillance', url: 'https://atlasofsurveillance.org', description: 'Database of police surveillance technology in the US', tags: ['surveillance', 'police'], free: true },
      { name: 'Global Terrorism Database', url: 'https://www.start.umd.edu/gtd/access', description: '200,000+ terrorist events from 1970 to 2020', tags: ['terrorism', 'database'], free: true },
    ],
  },

  /* ───────────────────────── 27. THREAT INTELLIGENCE ───────────────────────── */
  {
    id: 'threat-feeds',
    number: 27,
    title: 'Threat Intelligence',
    icon: '\u{1F6E1}\u{FE0F}',
    color: '#d06050',
    description: 'Threat feeds, IOC sharing, malware analysis and cyber threat intelligence platforms.',
    tools: [
      { name: 'AlienVault OTX', url: 'https://otx.alienvault.com', description: 'Open threat exchange with community-contributed IOCs', tags: ['threat-intel', 'iocs'], free: true },
      { name: 'MITRE ATT&CK', url: 'https://attack.mitre.org', description: 'Knowledge base of adversary tactics and techniques', tags: ['framework', 'ttp'], free: true },
      { name: 'Abuse.ch', url: 'https://abuse.ch', description: 'Fighting malware and botnets with open threat intel', tags: ['malware', 'botnet'], free: true },
      { name: 'IntelOwl', url: 'https://github.com/intelowlproject/IntelOwl', description: 'Manage threat intelligence at scale', tags: ['threat-intel', 'management'], free: true },
      { name: 'ThreatMiner', url: 'https://www.threatminer.org', description: 'Threat intelligence portal for analyst research', tags: ['threat-intel', 'research'], free: true },
      { name: 'Hunt.io', url: 'https://www.hunt.io', description: 'Threat hunting with counter intelligence and IOC detection', tags: ['threat-hunting', 'iocs'], free: true },
      { name: 'Malpedia', url: 'https://malpedia.caad.fkie.fraunhofer.de', description: 'Resource for rapid identification of malware', tags: ['malware', 'database'], free: true },
      { name: 'Any.Run', url: 'https://app.any.run', description: 'Interactive online malware analysis sandbox', tags: ['malware', 'sandbox'], free: true },
      { name: 'Hybrid Analysis', url: 'https://hybrid-analysis.com', description: 'Free malware analysis service with hybrid technology', tags: ['malware', 'analysis'], free: true },
      { name: 'FortiGuard', url: 'https://www.fortiguard.com', description: 'Threat intelligence from Fortinet', tags: ['threat-intel', 'vendor'], free: true },
      { name: 'Maltiverse', url: 'https://maltiverse.com', description: 'Threat intelligence for quality IOC management', tags: ['threat-intel', 'iocs'], free: true },
      { name: 'vx-underground', url: 'https://vx-underground.org', description: 'Largest online repository of malware for research', tags: ['malware', 'research'], free: true },
      { name: 'IPQualityScore', url: 'https://www.ipqualityscore.com', description: 'Fraud detection and IP reputation scoring', tags: ['fraud', 'ip'], free: true },
      { name: 'ThreatCrowd', url: 'https://www.threatcrowd.org', description: 'Open source threat intelligence search engine', tags: ['threat-intel', 'search'], free: true },
    ],
    methodology: [
      'Use MITRE ATT&CK to map adversary behavior to techniques',
      'Monitor AlienVault OTX + Abuse.ch for emerging IOCs',
      'Submit suspicious files to Any.Run or Hybrid Analysis',
    ],
  },

  /* ───────────────────────── 28. REDDIT OSINT ───────────────────────── */
  {
    id: 'reddit',
    number: 28,
    title: 'Reddit Intelligence',
    icon: '\u{1F534}',
    color: '#ff4500',
    description: 'Reddit-specific OSINT tools for post analysis, user profiling and content monitoring.',
    tools: [
      { name: 'F5BOT', url: 'https://f5bot.com', description: 'Get notifications for Reddit posts matching keywords', tags: ['reddit', 'monitor'], free: true },
      { name: 'Reveddit', url: 'https://www.reveddit.com', description: 'Reveal secretly removed Reddit content', tags: ['reddit', 'deleted'], free: true },
      { name: 'Reddit User Analyser', url: 'https://atomiks.github.io/reddit-user-analyser', description: 'Analyze and visualize Reddit user activity', tags: ['reddit', 'analysis'], free: true },
      { name: 'Reddit Comment Search', url: 'https://redditcommentsearch.com', description: 'Search through comments of any Reddit user', tags: ['reddit', 'search'], free: true },
      { name: 'Redective', url: 'http://redective.com', description: 'Investigate Reddit users by post history', tags: ['reddit', 'investigation'], free: true },
      { name: 'Universal Reddit Scraper', url: 'https://github.com/JosephLai241/URS', description: 'Python tool for scraping Reddit data', tags: ['reddit', 'scraping'], free: true },
      { name: 'SocialGrep', url: 'https://www.socialgrep.com', description: 'Search Reddit posts with advanced filters', tags: ['reddit', 'search'], free: true },
      { name: 'Vizit', url: 'https://redditstuff.github.io/sna/vizit', description: 'Visualize relationships between Reddit users and subreddits', tags: ['reddit', 'visualization'], free: true },
      { name: 'Vapor', url: 'https://vapor.selva.ee', description: 'Get Reddit profile data by username', tags: ['reddit', 'profile'], free: true },
    ],
  },

  /* ───────────────────────── 29. TELEGRAM OSINT ───────────────────────── */
  {
    id: 'telegram',
    number: 29,
    title: 'Telegram Intelligence',
    icon: '\u{2708}\u{FE0F}',
    color: '#0088cc',
    description: 'Telegram-specific OSINT for channel monitoring, group analysis and user investigation.',
    tools: [
      { name: 'TGStat', url: 'https://tgstat.com', description: 'Comprehensive platform for analyzing Telegram channels and groups', tags: ['telegram', 'analytics'], free: true },
      { name: 'Telegago', url: 'https://cse.google.com/cse?&cx=006368593537057042503:efxu7xprihg', description: 'Custom Google search engine for Telegram content', tags: ['telegram', 'search'], free: true },
      { name: 'Lyzem', url: 'https://lyzem.com', description: 'Search and find Telegram groups and channels', tags: ['telegram', 'search'], free: true },
      { name: 'informer', url: 'https://github.com/paulpierre/informer', description: 'Python library for Telegram channel and user info', tags: ['telegram', 'library'], free: true },
      { name: 'Telegram-osint-lib', url: 'https://github.com/Postuf/telegram-osint-lib', description: 'Python OSINT library for Telegram investigation', tags: ['telegram', 'library'], free: true },
      { name: 'Telegram Scraper', url: 'https://github.com/th3unkn0n/TeleGram-Scraper', description: 'Scraping tool for Telegram user info and media', tags: ['telegram', 'scraping'], free: true },
      { name: 'TelegramDB', url: 'https://telegramdb.org', description: 'Search for Telegram channels, groups and members', tags: ['telegram', 'database'], free: true },
      { name: 'telegram-history-dump', url: 'https://github.com/tvdstaaij/telegram-history-dump', description: 'Dump chat history into a SQLite database', tags: ['telegram', 'export'], free: true },
      { name: 'maltego-telegram', url: 'https://github.com/vognik/maltego-telegram', description: 'Maltego transforms for Telegram investigation', tags: ['telegram', 'maltego'], free: true },
    ],
  },

  /* ───────────────────────── 30. DISCORD OSINT ───────────────────────── */
  {
    id: 'discord',
    number: 30,
    title: 'Discord Intelligence',
    icon: '\u{1F4AC}',
    color: '#5865f2',
    description: 'Discord-specific OSINT for server discovery, user lookup and history tracking.',
    tools: [
      { name: 'DiscordOSINT', url: 'https://github.com/husseinmuhaisen/DiscordOSINT', description: 'Resources for conducting research on Discord', tags: ['discord', 'resources'], free: true },
      { name: 'Discord.id', url: 'https://discord.id', description: 'Unofficial Discord profile lookup by user ID', tags: ['discord', 'lookup'], free: true },
      { name: 'Discord.name', url: 'https://discord.name', description: 'Discord profile lookup using user ID', tags: ['discord', 'lookup'], free: true },
      { name: 'Lookupguru', url: 'https://lookup.guru', description: 'Discord profile lookup using user ID', tags: ['discord', 'lookup'], free: true },
      { name: 'Discord History Tracker', url: 'https://dht.chylex.com', description: 'Save chat history in servers, groups and DMs', tags: ['discord', 'history'], free: true },
      { name: 'Top.gg', url: 'https://top.gg', description: 'Explore millions of Discord bots and servers', tags: ['discord', 'directory'], free: true },
      { name: 'Disboard', url: 'https://disboard.org', description: 'Find and list Discord servers', tags: ['discord', 'directory'], free: true },
    ],
  },

  /* ───────────────────────── 31. GITHUB OSINT ───────────────────────── */
  {
    id: 'github',
    number: 31,
    title: 'GitHub & Source Code Intel',
    icon: '\u{1F4BB}',
    color: '#24292e',
    description: 'GitHub-specific OSINT for developer profiling, code analysis and secret discovery.',
    tools: [
      { name: 'CoderStats', url: 'https://coderstats.net', description: 'Track developer coding activity from GitHub', tags: ['github', 'analytics'], free: true },
      { name: 'Commit-stream', url: 'https://github.com/x1sec/commit-stream', description: 'Monitor and collect GitHub commits in real-time', tags: ['github', 'monitor'], free: true },
      { name: 'GH Archive', url: 'http://www.gharchive.org', description: 'Public dataset of GitHub activity events', tags: ['github', 'data'], free: true },
      { name: 'Git-Awards', url: 'http://git-awards.com', description: 'Rank GitHub users by contributions and popularity', tags: ['github', 'ranking'], free: true },
      { name: 'GitHub Dorks', url: 'https://github.com/techgaun/github-dorks', description: 'Find sensitive information in GitHub repositories', tags: ['github', 'dorks'], free: true },
      { name: 'GitHut', url: 'https://githut.info', description: 'Programming language statistics on GitHub', tags: ['github', 'statistics'], free: true },
      { name: 'GitHub Code Search', url: 'https://github.com/search', description: 'Search code across all public repositories', tags: ['github', 'search'], free: true },
      { name: 'GitDB', url: 'https://gitdb.net', description: 'Search engine for Git repositories and code', tags: ['git', 'search'], free: true },
    ],
  },

  /* ───────────────────────── 32. WHATSAPP & MESSAGING ───────────────────────── */
  {
    id: 'messaging',
    number: 32,
    title: 'WhatsApp & Messaging',
    icon: '\u{1F4AC}',
    color: '#25d366',
    description: 'OSINT tools for WhatsApp, Skype and other messaging platforms.',
    tools: [
      { name: 'checkwa', url: 'https://checkwa.online', description: 'Check status and availability of WhatsApp numbers', tags: ['whatsapp', 'check'], free: true },
      { name: 'WhatsApp Monitor', url: 'https://github.com/ErikTschierschke/WhatsappMonitor', description: 'Monitor and analyze WhatsApp activities', tags: ['whatsapp', 'monitor'], free: true },
      { name: 'whatsfoto', url: 'https://github.com/zoutepopcorn/whatsfoto', description: 'Download profile pictures from WhatsApp contacts', tags: ['whatsapp', 'photos'], free: true },
      { name: 'Skypli', url: 'https://www.skypli.com', description: 'Discover and connect with Skype contacts', tags: ['skype', 'search'], free: true },
    ],
  },

  /* ───────────────────────── 33. ONLYFANS OSINT ───────────────────────── */
  {
    id: 'onlyfans',
    number: 33,
    title: 'OnlyFans Intelligence',
    icon: '\u{1F51E}',
    color: '#00aff0',
    description: 'OnlyFans-specific search engines and creator discovery tools.',
    tools: [
      { name: 'OnlyFinder', url: 'https://onlyfinder.com', description: 'OnlyFans search engine and account finder', tags: ['onlyfans', 'search'], free: true },
      { name: 'OnlySearch', url: 'https://onlysearch.co', description: 'Find OnlyFans profiles by keywords', tags: ['onlyfans', 'search'], free: true },
      { name: 'Fansmetrics', url: 'https://fansmetrics.com', description: 'Search in 3M+ OnlyFans accounts', tags: ['onlyfans', 'search'], free: true },
      { name: 'Findr.fans', url: 'https://findr.fans', description: 'OnlyFans search tool', tags: ['onlyfans', 'search'], free: true },
      { name: 'Hubite', url: 'https://hubite.com/en/onlyfans-search', description: 'Advanced OnlyFans search engine', tags: ['onlyfans', 'search'], free: true },
      { name: 'SecretFans', url: 'https://secretfans.net', description: 'Search engine for discovering OnlyFans creators', tags: ['onlyfans', 'search'], free: true },
      { name: 'GirlFindr', url: 'https://girlfindr.com', description: 'Explore and locate OnlyFans creators', tags: ['onlyfans', 'search'], free: true },
    ],
  },

  /* ───────────────────────── 34. IoT & WEBCAMS ───────────────────────── */
  {
    id: 'iot',
    number: 34,
    title: 'IoT & Webcam Intelligence',
    icon: '\u{1F4F9}',
    color: '#70c050',
    description: 'Internet of Things devices, public webcams, and connected device intelligence.',
    tools: [
      { name: 'Insecam', url: 'https://www.insecam.org', description: 'Directory of unsecured public webcams worldwide', tags: ['webcam', 'directory'], free: true },
      { name: 'EarthCam', url: 'https://www.earthcam.com', description: 'Live public webcams from around the world', tags: ['webcam', 'live'], free: true },
      { name: 'Airport Webcams', url: 'https://airportwebcams.net', description: 'Live webcams from airports worldwide', tags: ['webcam', 'aviation'], free: true },
      { name: 'Camhacker', url: 'https://camhacker.com', description: 'Search for public webcams and IP cameras', tags: ['webcam', 'search'], free: true },
      { name: 'thingful', url: 'https://www.thingful.net', description: 'Search engine for the Internet of Things', tags: ['iot', 'search'], free: true },
      { name: 'BeVigil', url: 'https://bevigil.com', description: 'Security search engine for mobile apps', tags: ['mobile', 'security'], free: true },
    ],
  },

  /* ───────────────────────── 35. NEWS & MEDIA ───────────────────────── */
  {
    id: 'news-media',
    number: 35,
    title: 'News & Media Monitoring',
    icon: '\u{1F4F0}',
    color: '#a0c040',
    description: 'News monitoring, media bias analysis and alerts for real-time intelligence.',
    tools: [
      { name: 'Google News', url: 'https://news.google.com', description: 'Aggregated news from thousands of sources', tags: ['news', 'aggregator'], free: true },
      { name: 'Google Alerts', url: 'https://www.google.com/alerts', description: 'Monitor the web for new content on any topic', tags: ['alerts', 'monitor'], free: true },
      { name: 'Talkwalker Alerts', url: 'https://www.talkwalker.com/alerts', description: 'Free alternative to Google Alerts across news and social', tags: ['alerts', 'social'], free: true },
      { name: 'AllSides', url: 'https://www.allsides.com', description: 'News with media bias ratings and balanced coverage', tags: ['news', 'bias'], free: true },
      { name: 'Media Bias/Fact Check', url: 'https://mediabiasfactcheck.com', description: 'Independent media bias and factual reporting ratings', tags: ['news', 'bias'], free: true },
      { name: 'NewsNow', url: 'https://www.newsnow.co.uk', description: 'Independent news discovery platform', tags: ['news', 'aggregator'], free: true },
      { name: 'Newspapers.com', url: 'https://www.newspapers.com', description: 'Largest online newspaper archive since 2012', tags: ['news', 'archive'], free: false },
      { name: 'GoodGopher', url: 'https://goodgopher.com', description: 'Privacy-protected news search engine', tags: ['news', 'privacy'], free: true },
    ],
  },

  /* ───────────────────────── 36. UNIFIED SEARCH ───────────────────────── */
  {
    id: 'unified-search',
    number: 36,
    title: 'Unified Search & Identity',
    icon: '\u{1F517}',
    color: '#9060c0',
    description: 'Multi-source identity resolution, unified OSINT search and aggregation platforms.',
    tools: [
      { name: 'SynapsInt', url: 'https://synapsint.com', description: 'Unified OSINT search across multiple data sources', tags: ['unified', 'search'], free: true },
      { name: 'InfoTracer', url: 'https://infotracer.com', description: 'Public records search -- contacts, criminal records, assets', tags: ['records', 'background'], free: false },
      { name: 'MetaDefender', url: 'https://metadefender.opswat.com', description: 'Find threats in files, URLs, IPs and hashes', tags: ['scanning', 'multi-engine'], free: true },
      { name: 'SpyTox', url: 'https://www.spytox.com', description: 'Find people, personal info and phone numbers', tags: ['people', 'search'], free: true },
      { name: 'Effect Group', url: 'https://effectgroup.io', description: 'Open source research platform for journalists and investigators', tags: ['research', 'platform'], free: true },
      { name: 'osrframework', url: 'https://pypi.org/project/osrframework', description: 'Open Sources Research Framework with OSINT APIs and tools', tags: ['framework', 'python'], free: true },
      { name: 'LinkScope', url: 'https://github.com/AccentuSoft/LinkScope', description: 'Cross-platform OSINT graphical link analysis tool', tags: ['link-analysis', 'graph'], free: true },
      { name: 'Chiasmodon', url: 'https://github.com/chiasmod0n/chiasmodon', description: 'Gather domain emails, credentials, CIDRs, ASNs and subdomains', tags: ['recon', 'domain'], free: true },
    ],
  },

  /* ───────────────────────── 37. EXTREMIST & POLITICAL ───────────────────────── */
  {
    id: 'extremist',
    number: 37,
    title: 'Extremist & Political Intel',
    icon: '\u{26A0}\u{FE0F}',
    color: '#c04040',
    description: 'Far-right monitoring, extremist database tracking and political intelligence.',
    tools: [
      { name: 'Unicorn Riot Discord Leaks', url: 'https://discordleaks.unicornriot.ninja/discord', description: 'Leaked white supremacist Discord chat messages', tags: ['extremist', 'discord'], free: true },
      { name: 'DDoSecrets Search', url: 'https://search.ddosecrets.com', description: 'Search leaked datasets of public interest', tags: ['leaks', 'search'], free: true },
      { name: 'SPLC Extremist Files', url: 'https://www.splcenter.org/fighting-hate/extremist-files/individual', description: 'Database of extremist individuals and organizations', tags: ['extremist', 'profiles'], free: true },
      { name: 'NSATT Database', url: 'https://www.nsatt.org', description: 'Database of suspected terrorists', tags: ['terrorism', 'database'], free: true },
      { name: 'TSA No-Fly List', url: 'https://www.no-fly-list.com', description: 'TSA no-fly list information', tags: ['aviation', 'security'], free: true },
      { name: 'INFORMNAPALM', url: 'https://informnapalm.org/db/russian-aggression', description: 'Database mapping Russian aggression -- 2000+ OSINT investigations', tags: ['conflict', 'intelligence'], free: true },
      { name: 'gogettr', url: 'https://pypi.org/project/gogettr', description: 'Extraction tool for GETTR social network', tags: ['social', 'extraction'], free: true },
      { name: 'Trump Twitter Archive', url: 'https://www.thetrumparchive.com', description: 'Archive of Trump tweets', tags: ['archive', 'political'], free: true },
    ],
  },

  /* ───────────────────────── 38. INSTAGRAM SPECIALIZED ───────────────────────── */
  {
    id: 'instagram-tools',
    number: 38,
    title: 'Instagram Deep Dive',
    icon: '\u{1F4F7}',
    color: '#e1306c',
    description: 'Specialized Instagram OSINT tools for account analysis, scraping and investigation.',
    tools: [
      { name: 'Osintgram', url: 'https://github.com/Datalux/Osintgram', description: 'OSINT tool for Instagram account reconnaissance and analysis', tags: ['instagram', 'recon'], free: true },
      { name: 'Toutatis', url: 'https://github.com/megadose/toutatis', description: 'Extract phone, email and more from Instagram via API', tags: ['instagram', 'extraction'], free: true },
      { name: 'SoIG', url: 'https://github.com/yezz123/SoIG', description: 'Get range of information from any Instagram account', tags: ['instagram', 'osint'], free: true },
      { name: 'instalooter', url: 'https://pypi.org/project/instalooter', description: 'Download pictures and videos from Instagram without API', tags: ['instagram', 'download'], free: true },
      { name: 'yesitsme', url: 'https://github.com/blackeko/yesitsme', description: 'Find Instagram profiles by name and email/phone', tags: ['instagram', 'search'], free: true },
      { name: 'osi.ig', url: 'https://github.com/th3unkn0n/osi.ig', description: 'Information gathering tool for Instagram', tags: ['instagram', 'recon'], free: true },
      { name: 'InstaHack', url: 'https://github.com/termuxhackers-id/instahack', description: 'Instagram OSINT and account investigation tool', tags: ['instagram', 'investigation'], free: true },
      { name: 'Toolzu', url: 'https://toolzu.com/search-instagram-profiles', description: 'Search Instagram profiles by username or name', tags: ['instagram', 'search'], free: true },
    ],
  },

  /* ───────────────────────── 39. PUBLIC RECORDS ───────────────────────── */
  {
    id: 'public-records',
    number: 39,
    title: 'Public Records & Government',
    icon: '\u{1F3DB}\u{FE0F}',
    color: '#7090b0',
    description: 'Government databases, court records, property records and public document access.',
    tools: [
      { name: 'PACER', url: 'https://pacer.uscourts.gov', description: 'US federal court records access', tags: ['court', 'us'], free: false },
      { name: 'Plain View Project', url: 'https://www.plainviewproject.org/data', description: 'Police officers Facebook posts database', tags: ['police', 'social'], free: true },
      { name: 'Fatal Encounters', url: 'https://fatalencounters.org/people-search', description: 'Database of people killed in police interactions since 2000', tags: ['police', 'database'], free: true },
      { name: 'Police Crime Database', url: 'https://policecrime.bgsu.edu', description: 'Henry A. Wallace Police Crime Database', tags: ['police', 'database'], free: true },
      { name: 'Citizens Police Data Project', url: 'https://beta.cpdp.co', description: 'Police misconduct data for Chicago', tags: ['police', 'misconduct'], free: true },
      { name: 'WhosaRat', url: 'https://whosarat.com', description: 'Database of police informants and corrupt officers', tags: ['informants', 'database'], free: true },
    ],
  },

  /* ───────────────────────── 40. DATA VISUALIZATION ───────────────────────── */
  {
    id: 'visualization',
    number: 40,
    title: 'Data Visualization & Analysis',
    icon: '\u{1F4CA}',
    color: '#e0a060',
    description: 'Link analysis, network diagrams, timeline creation and data visualization tools.',
    tools: [
      { name: 'Gephi', url: 'https://gephi.org', description: 'Open-source network analysis and visualization', tags: ['graph', 'visualization'], free: true },
      { name: 'Maltego', url: 'https://maltego.com', description: 'Visual link analysis for OSINT investigations', tags: ['graph', 'link-analysis'], free: true },
      { name: 'Neo4j', url: 'https://neo4j.com', description: 'Graph database for complex relationship mapping', tags: ['database', 'graph'], free: true },
      { name: 'Cytoscape', url: 'https://cytoscape.org', description: 'Network visualization and analysis platform', tags: ['network', 'visualization'], free: true },
      { name: 'TimelineJS', url: 'https://timeline.knightlab.com', description: 'Create interactive timelines for investigations', tags: ['timeline', 'interactive'], free: true },
      { name: 'Trendsmap', url: 'https://www.trendsmap.com', description: 'Twitter trends worldwide with visualization', tags: ['twitter', 'trends'], free: true },
    ],
  },

  /* ───────────────────────── 41. PINTEREST & MISC SOCIAL ───────────────────────── */
  {
    id: 'misc-social',
    number: 41,
    title: 'Pinterest, Twitch & More',
    icon: '\u{1F4CC}',
    color: '#bd081c',
    description: 'Pinterest, Twitch, Clubhouse, Steam and other platform-specific OSINT tools.',
    tools: [
      { name: 'Pingroupie', url: 'http://pingroupie.com', description: 'Meta search engine for Pinterest boards and influencers', tags: ['pinterest', 'search'], free: true },
      { name: 'DownAlbum', url: 'https://chrome.google.com/webstore/detail/downalbum/cgjnhhjpfcdhbhlcmmjppicjmgfkppok', description: 'Download albums from Pinterest, Facebook and more', tags: ['download', 'extension'], free: true },
      { name: 'TikTok Hashtag Analysis', url: 'https://github.com/bellingcat/tiktok-hashtag-analysis', description: 'Bellingcat tool for downloading TikTok posts by hashtag', tags: ['tiktok', 'analysis'], free: true },
      { name: 'Tikbuddy', url: 'https://tikbuddy.com', description: 'Analyze TikTok profiles and content', tags: ['tiktok', 'analytics'], free: true },
      { name: 'Alfred OSINT', url: 'https://github.com/Alfredredbird/alfred', description: 'Open-source tool for discovering social media accounts', tags: ['social', 'discovery'], free: true },
      { name: 'Tookie-osint', url: 'https://github.com/alfredredbird/tookie-osint', description: 'Advanced OSINT tool for finding social media accounts', tags: ['social', 'search'], free: true },
    ],
  },

  /* ───────────────────────── 42. BUG BOUNTY & SECURITY ───────────────────────── */
  {
    id: 'security-research',
    number: 42,
    title: 'Security Research & Recon',
    icon: '\u{1F510}',
    color: '#404040',
    description: 'Bug bounty recon tools, vulnerability scanning and attack surface discovery.',
    tools: [
      { name: 'Burp Suite', url: 'https://portswigger.net/burp', description: 'Industry-standard web application security testing', tags: ['web-security', 'proxy'], free: true },
      { name: 'OWASP ZAP', url: 'https://www.zaproxy.org', description: 'Open-source web application security scanner', tags: ['web-security', 'scanner'], free: true },
      { name: 'SQLMap', url: 'https://sqlmap.org', description: 'Automatic SQL injection and database takeover', tags: ['sqli', 'automation'], free: true },
      { name: 'XSStrike', url: 'https://github.com/s0md3v/XSStrike', description: 'Advanced XSS detection and exploitation suite', tags: ['xss', 'detection'], free: true },
      { name: 'Nuclei', url: 'https://github.com/projectdiscovery/nuclei', description: 'Fast vulnerability scanner with community templates', tags: ['vulnerability', 'scanner'], free: true },
      { name: 'Assetfinder', url: 'https://github.com/tomnomnom/assetfinder', description: 'Find domains and subdomains related to a domain', tags: ['subdomain', 'discovery'], free: true },
      { name: 'Sublist3r', url: 'https://github.com/aboul3la/Sublist3r', description: 'Fast subdomain enumeration tool', tags: ['subdomain', 'enumeration'], free: true },
      { name: 'DNSRecon', url: 'https://github.com/darkoperator/dnsrecon', description: 'DNS enumeration and scanning tool', tags: ['dns', 'enumeration'], free: true },
      { name: 'Shuffledns', url: 'https://github.com/projectdiscovery/shuffledns', description: 'Wrapper around massdns for subdomain bruteforcing', tags: ['subdomain', 'brute-force'], free: true },
      { name: 'sploitus', url: 'https://sploitus.com', description: 'Search for exploits and security tools', tags: ['exploits', 'search'], free: true },
      { name: 'Vulmon', url: 'https://vulmon.com', description: 'Vulnerability and exploit search engine', tags: ['vulnerability', 'search'], free: true },
      { name: 'Public Buckets', url: 'https://buckets.grayhatwarfare.com', description: 'Search public AWS S3 and Azure Blob storage', tags: ['cloud', 'exposure'], free: true },
    ],
  },
];

/* ─────────────── Computed exports ─────────────── */

export const TOTAL_TOOLS = OSINT_CATEGORIES.reduce(
  (sum, cat) => sum + cat.tools.length,
  0,
);

export const ALL_TAGS: string[] = Array.from(
  new Set(
    OSINT_CATEGORIES.flatMap((c) =>
      c.tools.flatMap((t) => t.tags ?? []),
    ),
  ),
).sort();
