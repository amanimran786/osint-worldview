/**
 * OSINT Bible 2026 — Complete Tool & Resource Directory
 * Source: https://github.com/frangelbarrera/OSINT-BIBLE
 * 32 Categories · 600+ Tools · Methodologies · Techniques
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
    icon: '📖',
    color: '#f0a030',
    description: 'Core OSINT concepts: Intelligence Cycle, OPSEC, PII, source classification.',
    tools: [
      { name: 'OSINT Framework', url: 'https://osintframework.com', description: 'Collection of OSINT tools sorted by category', tags: ['framework', 'directory'], free: true },
      { name: 'IntelTechniques', url: 'https://inteltechniques.com/tools', description: 'Michael Bazzell OSINT tools and methodology', tags: ['framework', 'training'], free: true },
      { name: 'Hunchly', url: 'https://hunch.ly', description: 'Web capture tool for OSINT investigations', tags: ['capture', 'evidence'], free: false },
    ],
    methodology: [
      'OSINT = Intelligence from public sources without violating access',
      'OPSEC: VPN → VM → alias → metadata strip',
      'Intelligence Cycle: Direction → Collection → Processing → Analysis → Dissemination',
      'PII: email, phone, RFC, CURP, IP, IMEI, MAC',
      'Primary Source: Original publication (tweet, PDF, photo EXIF)',
      'Secondary Source: Article citing the primary — always validate',
    ],
  },

  /* ───────────────────────── 2. METHODOLOGY ───────────────────────── */
  {
    id: 'methodology',
    number: 2,
    title: '4-Step Methodology',
    icon: '🧭',
    color: '#22c55e',
    description: 'Define question → Identify sources → Collect → Validate & document.',
    tools: [
      { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Username search across 500+ platforms', tags: ['username', 'recon'], free: true },
      { name: 'HIBP', url: 'https://haveibeenpwned.com', description: 'Check if email was in a data breach', tags: ['email', 'breach'], free: true },
      { name: 'Infobel', url: 'https://www.infobel.com', description: 'International phone directory search', tags: ['phone', 'directory'], free: true },
      { name: 'Snoop', url: 'https://github.com/snooppr/snoop', description: 'Username search with Russian/CIS emphasis', tags: ['username', 'recon'], free: true },
      { name: 'Exiftool', url: 'https://exiftool.org', description: 'Read/write metadata in files', tags: ['metadata', 'photo'], free: true },
    ],
    methodology: [
      '1. Define question → What do I want to know?',
      '2. Identify sources → Match data type to tool',
      '3. Collect → Manual + automation',
      '4. Validate and document → Screenshots, hash, date, URL, archive.org',
    ],
  },

  /* ───────────────────────── 3. SEARCH ───────────────────────── */
  {
    id: 'search',
    number: 3,
    title: 'Internet Search',
    icon: '🔍',
    color: '#60a5fa',
    description: 'Google Dorks, 200+ alternative search engines, archives & snapshots.',
    tools: [
      { name: 'Google Dorks', url: 'https://www.google.com/advanced_search', description: 'Advanced Google search operators', tags: ['search', 'dorks'], free: true },
      { name: 'Shodan', url: 'https://shodan.io', description: 'IoT and internet-connected device search engine', tags: ['iot', 'scan'], free: true },
      { name: 'Censys', url: 'https://censys.io', description: 'Internet-wide scanning platform', tags: ['scan', 'certificates'], free: true },
      { name: 'ZoomEye', url: 'https://www.zoomeye.org', description: 'Chinese cyberspace search engine', tags: ['scan', 'iot'], free: true },
      { name: 'FOFA', url: 'https://fofa.info', description: 'Cyberspace search engine', tags: ['scan', 'china'], free: true },
      { name: 'FullHunt', url: 'https://fullhunt.io', description: 'Attack surface management', tags: ['scan', 'attack-surface'], free: true },
      { name: 'Netlas', url: 'https://netlas.io', description: 'Internet intelligence search', tags: ['scan', 'dns'], free: true },
      { name: 'CriminalIP', url: 'https://www.criminalip.io', description: 'Connected internet search', tags: ['scan', 'threat'], free: true },
      { name: 'GreyNoise', url: 'https://www.greynoise.io', description: 'Internet noise analyzer', tags: ['noise', 'scan'], free: true },
      { name: 'VirusTotal', url: 'https://virustotal.com', description: 'File/URL analysis platform', tags: ['malware', 'scan'], free: true },
      { name: 'SearchCode', url: 'https://searchcode.com', description: 'Search across 75B lines of source code', tags: ['code', 'search'], free: true },
      { name: 'Wayback Machine', url: 'https://web.archive.org', description: 'Internet archive historical snapshots', tags: ['archive', 'history'], free: true },
      { name: 'Archive.today', url: 'https://archive.ph', description: 'Webpage snapshot preservation', tags: ['archive', 'snapshot'], free: true },
      { name: 'DNSDumpster', url: 'https://dnsdumpster.com', description: 'Free DNS enumeration tool', tags: ['dns', 'recon'], free: true },
      { name: 'Qdorks', url: 'https://qdorks.com', description: 'Google dork generator', tags: ['dorks', 'search'], free: true },
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', description: 'Breach verification', tags: ['breach', 'email'], free: true },
    ],
    methodology: [
      'site:*.target.com filetype:pdf',
      'intitle:"index of" password',
      'inurl:admin intext:login',
      'filetype:env "DB_PASSWORD"',
      'site:pastebin.com "target.com"',
    ],
  },

  /* ───────────────────────── 4. SOCIAL NETWORKS ───────────────────────── */
  {
    id: 'social',
    number: 4,
    title: 'Social Networks',
    icon: '👥',
    color: '#a855f7',
    description: '17 platform-specific tools: Twitter/X, Instagram, LinkedIn, Facebook, Reddit, GitHub, TikTok, Telegram, Discord.',
    tools: [
      // Twitter/X
      { name: 'Twint', url: 'https://github.com/twintproject/twint', description: 'Twitter scraping without API', tags: ['twitter', 'scrape'], free: true },
      { name: 'Deleted Tweet Finder', url: 'https://deletedtweetfinder.com', description: 'Find deleted tweets', tags: ['twitter', 'deleted'], free: true },
      { name: 'Sentiment140', url: 'http://sentiment140.com', description: 'Twitter sentiment analysis CSV bulk', tags: ['twitter', 'sentiment'], free: true },
      { name: 'BirdHunt', url: 'https://birdhunt.huntintel.io', description: 'Find social posts around a location', tags: ['twitter', 'geo'], free: true },
      { name: 'TweetBeaver', url: 'https://tweetbeaver.com', description: 'Twitter analytics & lookup', tags: ['twitter', 'analytics'], free: true },
      // Instagram
      { name: 'Instaloader', url: 'https://github.com/instaloader/instaloader', description: 'Download Instagram profiles/posts/stories', tags: ['instagram', 'download'], free: true },
      { name: 'Osintgram', url: 'https://github.com/Datalux/Osintgram', description: 'Instagram OSINT recon tool', tags: ['instagram', 'recon'], free: true },
      // LinkedIn
      { name: 'LinkedIn2Username', url: 'https://github.com/initstring/linkedin2username', description: 'Generate usernames from LinkedIn company', tags: ['linkedin', 'username'], free: true },
      { name: 'CrossLinked', url: 'https://github.com/m8sec/CrossLinked', description: 'LinkedIn enumeration tool', tags: ['linkedin', 'enum'], free: true },
      // Reddit
      { name: 'Reddective', url: 'https://www.redective.com', description: 'Reddit user investigation', tags: ['reddit', 'user'], free: true },
      { name: 'ReSavr', url: 'https://www.resavr.com', description: 'Retrieve deleted Reddit comments', tags: ['reddit', 'deleted'], free: true },
      // Facebook
      { name: 'Lookup-ID', url: 'https://lookup-id.com', description: 'Find Facebook profile IDs', tags: ['facebook', 'id'], free: true },
      { name: 'Facebook Matrix', url: 'https://plessas.net/facebookmatrix', description: 'Facebook URL tricks matrix', tags: ['facebook', 'urls'], free: true },
      // GitHub
      { name: 'GitDorker', url: 'https://github.com/obheda12/GitDorker', description: 'GitHub dork scanner', tags: ['github', 'dorks'], free: true },
      { name: 'TruffleHog', url: 'https://github.com/trufflesecurity/trufflehog', description: 'Find leaked credentials in repos', tags: ['github', 'secrets'], free: true },
      // TikTok
      { name: 'Mavekite', url: 'https://mavekite.com', description: 'TikTok username profile search', tags: ['tiktok', 'profile'], free: true },
      { name: 'Exolyt', url: 'https://exolyt.com', description: 'TikTok analytics & insights', tags: ['tiktok', 'analytics'], free: true },
      // Telegram
      { name: 'Telepathy', url: 'https://github.com/jordanwildon/Telepathy', description: 'Telegram group analytics', tags: ['telegram', 'group'], free: true },
      { name: 'TGStat', url: 'https://tgstat.com', description: 'Telegram channel analytics', tags: ['telegram', 'stats'], free: true },
      // Discord
      { name: 'DiscordLeaks', url: 'https://discordleaks.unicornriot.ninja', description: 'Leaked Discord chat search', tags: ['discord', 'leak'], free: true },
    ],
  },

  /* ───────────────────────── 5. GEOINT & IMAGES ───────────────────────── */
  {
    id: 'geoint',
    number: 5,
    title: 'GEOINT & Images',
    icon: '🌍',
    color: '#06b6d4',
    description: 'Geolocation, satellite imagery, shadow analysis, webcams, reverse image search.',
    tools: [
      { name: 'Google Earth Pro', url: 'https://earth.google.com', description: 'Historical satellite imagery & temporal displacement', tags: ['satellite', 'geo'], free: true },
      { name: 'SunCalc', url: 'https://suncalc.org', description: 'Shadow analysis for time estimation', tags: ['shadow', 'time'], free: true },
      { name: 'Overpass-turbo', url: 'https://overpass-turbo.eu', description: 'OpenStreetMap POI queries within radius', tags: ['osm', 'poi'], free: true },
      { name: 'Sentinel Hub', url: 'https://apps.sentinel-hub.com', description: '10m resolution satellite imagery, free', tags: ['satellite', 'imagery'], free: true },
      { name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov', description: 'Real-time fire monitoring', tags: ['fire', 'satellite'], free: true },
      { name: 'Zoom Earth', url: 'https://zoom.earth', description: 'Live weather & satellite with METAR overlay', tags: ['weather', 'satellite'], free: true },
      { name: 'FlightRadar24', url: 'https://www.flightradar24.com', description: 'Live global flight tracking', tags: ['aviation', 'tracking'], free: true },
      { name: 'MarineTraffic', url: 'https://www.marinetraffic.com', description: 'Global AIS vessel tracking', tags: ['maritime', 'tracking'], free: true },
      { name: 'VesselFinder', url: 'https://www.vesselfinder.com', description: 'Free ship tracking alternative', tags: ['maritime', 'tracking'], free: true },
      { name: 'WiGLE', url: 'https://wigle.net', description: 'Geolocated WiFi/cell database', tags: ['wifi', 'geo'], free: true },
      { name: 'OpenCelliD', url: 'https://www.opencellid.org', description: 'Cell tower geolocation database', tags: ['cell', 'geo'], free: true },
      { name: 'ADS-B Exchange', url: 'https://globe.adsbexchange.com', description: 'No-filter aircraft tracking', tags: ['aviation', 'adsb'], free: true },
      { name: 'Picarta', url: 'https://picarta.ai', description: 'AI photo location prediction', tags: ['ai', 'geo'], free: true },
      { name: 'Labs TIB Geoestimation', url: 'https://labs.tib.eu/geoestimation', description: 'Geographic estimation from images', tags: ['geo', 'ai'], free: true },
      { name: 'PiAware', url: 'https://flightaware.com/adsb/piaware', description: 'Build your own ADS-B receiver', tags: ['aviation', 'diy'], free: true },
    ],
  },

  /* ───────────────────────── 6. DOMAIN / IP / DNS ───────────────────────── */
  {
    id: 'domain-ip',
    number: 6,
    title: 'Domain / IP / DNS',
    icon: '🌐',
    color: '#ef4444',
    description: '100+ threat intel feeds, passive DNS, subdomain enumeration, reputation scoring.',
    tools: [
      { name: 'Amass', url: 'https://github.com/owasp-amass/amass', description: 'In-depth attack surface mapping', tags: ['subdomain', 'enum'], free: true },
      { name: 'CRT.sh', url: 'https://crt.sh', description: 'Certificate transparency log search', tags: ['ssl', 'cert'], free: true },
      { name: 'SecurityTrails', url: 'https://securitytrails.com', description: 'Historical DNS data, free API 50/month', tags: ['dns', 'history'], free: true },
      { name: 'BGP.he.net', url: 'https://bgp.he.net', description: 'BGP/ASN/CIDR lookup', tags: ['bgp', 'network'], free: true },
      { name: 'VirusTotal', url: 'https://virustotal.com', description: 'Domain/IP reputation check', tags: ['reputation', 'malware'], free: true },
      { name: 'AlienVault OTX', url: 'https://otx.alienvault.com', description: 'Open threat exchange platform', tags: ['threat', 'ioc'], free: true },
      { name: 'Talos Intelligence', url: 'https://www.talosintelligence.com', description: 'IP/domain reputation by Cisco', tags: ['reputation', 'cisco'], free: true },
      { name: 'Spamhaus', url: 'https://www.spamhaus.org', description: 'IP/domain blacklists', tags: ['blacklist', 'spam'], free: true },
      { name: 'AbuseIPDB', url: 'https://www.abuseipdb.com', description: 'IP abuse reporting & lookup', tags: ['abuse', 'ip'], free: true },
      { name: 'Cloudflare Radar', url: 'https://radar.cloudflare.com/traffic', description: 'Internet traffic trends', tags: ['traffic', 'analytics'], free: true },
      { name: 'Subdomain Center', url: 'https://www.subdomain.center', description: 'Subdomain discovery', tags: ['subdomain', 'enum'], free: true },
      { name: 'SubdomainRadar', url: 'https://www.subdomainradar.io', description: 'Real-time subdomain monitoring', tags: ['subdomain', 'monitor'], free: true },
      { name: 'CertStream', url: 'https://certstream.calidog.io', description: 'Real-time certificate transparency stream', tags: ['ssl', 'stream'], free: true },
      { name: 'GreyNoise', url: 'https://www.greynoise.io', description: 'Internet background noise analytics', tags: ['noise', 'ip'], free: true },
      { name: 'Spur', url: 'https://spur.us', description: 'VPN/proxy detection', tags: ['vpn', 'proxy'], free: false },
    ],
    methodology: [
      'site:*.target.com filetype:pdf',
      'site:*.target.com intitle:"dashboard"',
      'site:*.target.com intext:"confidential"',
    ],
  },

  /* ───────────────────────── 7. DEEP & DARK WEB ───────────────────────── */
  {
    id: 'deep-dark',
    number: 7,
    title: 'Deep & Dark Web',
    icon: '🕳️',
    color: '#6366f1',
    description: 'Onion search, dark web monitoring, hidden service scanning.',
    tools: [
      { name: 'Ahmia', url: 'https://ahmia.fi', description: '.onion search engine (clearnet accessible)', tags: ['tor', 'search'], free: true },
      { name: 'OnionScan', url: 'https://github.com/s-rah/onionscan', description: 'Hidden service scanner', tags: ['tor', 'scan'], free: true },
      { name: 'Dark.fail', url: 'https://dark.fail', description: 'Verified dark web directory', tags: ['tor', 'directory'], free: true },
      { name: 'DarkDump', url: 'https://github.com/josh0xA/darkdump', description: 'Onion site scraper', tags: ['tor', 'scrape'], free: true },
    ],
    methodology: [
      '1. Operating system: Tails OS (amnesic)',
      '2. Never use VPN + Tor (traffic correlation)',
      '3. Use bridges if Tor is blocked',
      '4. NoScript to max',
      '5. No window resizing',
      '6. No downloading to persistent disk',
    ],
  },

  /* ───────────────────────── 8. AUTOMATION ───────────────────────── */
  {
    id: 'automation',
    number: 8,
    title: 'Automation (Python)',
    icon: '🤖',
    color: '#f97316',
    description: 'Python OSINT stack, Recon-ng workflows, SpiderFoot, scripting templates.',
    tools: [
      { name: 'Recon-ng', url: 'https://github.com/lanmaster53/recon-ng', description: 'Full-featured web reconnaissance framework', tags: ['recon', 'framework'], free: true },
      { name: 'SpiderFoot', url: 'https://github.com/smicallef/spiderfoot', description: 'OSINT automation tool with 200+ modules', tags: ['automation', 'framework'], free: true },
      { name: 'Photon', url: 'https://github.com/s0md3v/Photon', description: 'Incredibly fast crawler for OSINT', tags: ['crawler', 'recon'], free: true },
      { name: 'theHarvester', url: 'https://github.com/laramies/theHarvester', description: 'Email, subdomain, name harvester', tags: ['harvest', 'email'], free: true },
      { name: 'Twint-fork', url: 'https://github.com/twintproject/twint', description: 'Twitter intelligence tool', tags: ['twitter', 'scrape'], free: true },
      { name: 'Selenium', url: 'https://selenium.dev', description: 'Browser automation for scraping', tags: ['browser', 'scrape'], free: true },
      { name: 'Beautiful Soup', url: 'https://www.crummy.com/software/BeautifulSoup', description: 'HTML/XML parsing library', tags: ['parser', 'scrape'], free: true },
    ],
    methodology: [
      'python -m venv osint-env && source osint-env/bin/activate',
      'pip install twint-fork recon-ng selenium requests beautifulsoup4 shodan',
      'Recon-ng: marketplace install all → workspaces add target',
      'Use SpiderFoot for automated recon of targets',
    ],
  },

  /* ───────────────────────── 9. REPORT TEMPLATES ───────────────────────── */
  {
    id: 'reports',
    number: 9,
    title: 'Report Templates',
    icon: '📄',
    color: '#84cc16',
    description: 'YAML front-matter reports, executive summaries, evidence chain documentation.',
    tools: [
      { name: 'CherryTree', url: 'https://www.giuspen.com/cherrytree', description: 'Hierarchical note-taking for investigations', tags: ['notes', 'report'], free: true },
      { name: 'Obsidian', url: 'https://obsidian.md', description: 'Markdown knowledge base & link graph', tags: ['notes', 'graph'], free: true },
    ],
    methodology: [
      'YAML front-matter: investigator, date, objective, scope, status',
      'Executive Summary (5 lines)',
      'Primary Sources: URL | date | capture hash',
      'Chronology of events',
      'Annexes: Screenshots, CSV extracts',
    ],
  },

  /* ───────────────────────── 10. AI INTELLIGENCE ───────────────────────── */
  {
    id: 'ai-intel',
    number: 10,
    title: 'AI Intelligence',
    icon: '🧠',
    color: '#ec4899',
    description: 'AI-powered OSINT: multilingual analysis, predictive analytics, deepfake detection.',
    tools: [
      { name: 'BabelX', url: 'https://www.babelstreet.com', description: 'Multilingual OSINT platform — text analysis in 200+ languages', tags: ['ai', 'multilingual'], free: false },
      { name: 'Fivecast', url: 'https://www.fivecast.com', description: 'Predictive analysis with ML, real-time threat detection', tags: ['ai', 'threat'], free: false },
      { name: 'ShadowDragon', url: 'https://shadowdragon.io', description: 'Social/dark intel with AI behavior analysis', tags: ['ai', 'social'], free: false },
      { name: 'Talkwalker', url: 'https://www.talkwalker.com', description: 'Media monitoring with advanced AI sentiment', tags: ['ai', 'media'], free: false },
      { name: 'HyperVerge', url: 'https://hyperverge.co', description: 'AI deepfake detection & biometric verification', tags: ['ai', 'deepfake'], free: false },
      { name: 'ChatPDF', url: 'https://www.chatpdf.com', description: 'Ask questions to PDF documents', tags: ['ai', 'pdf'], free: true },
      { name: 'AI Toolkit (Journalists)', url: 'https://huggingface.co/spaces/JournalistsonHF/ai-toolkit', description: 'Essential AI toolkit for journalists', tags: ['ai', 'journalism'], free: true },
    ],
  },

  /* ───────────────────────── 11. FACIAL RECOGNITION ───────────────────────── */
  {
    id: 'facial-rec',
    number: 11,
    title: 'Facial Recognition',
    icon: '👤',
    color: '#f43f5e',
    description: 'Face search engines, reverse image matching, biometric analysis.',
    tools: [
      { name: 'PimEyes', url: 'https://pimeyes.com', description: 'Facial recognition search engine', tags: ['face', 'search'], free: false },
      { name: 'FaceCheck.ID', url: 'https://facecheck.id', description: 'Reverse face search', tags: ['face', 'search'], free: true },
      { name: 'Search4Faces', url: 'https://search4faces.com', description: 'Search faces in VK/OK social networks', tags: ['face', 'vk'], free: true },
      { name: 'TinEye', url: 'https://tineye.com', description: 'Reverse image search engine', tags: ['image', 'reverse'], free: true },
      { name: 'Google Lens', url: 'https://lens.google.com', description: 'Visual search by Google', tags: ['image', 'search'], free: true },
      { name: 'Yandex Images', url: 'https://yandex.com/images', description: 'Powerful reverse image search', tags: ['image', 'reverse'], free: true },
    ],
  },

  /* ───────────────────────── 12. EMAIL/PHONE ───────────────────────── */
  {
    id: 'email-phone',
    number: 12,
    title: 'Email/Phone Investigation',
    icon: '📧',
    color: '#14b8a6',
    description: 'Email account discovery, phone number OSINT, breach lookup, reverse search.',
    tools: [
      { name: 'Holehe', url: 'https://github.com/megadose/holehe', description: 'Find accounts associated with an email', tags: ['email', 'accounts'], free: true },
      { name: 'GHunt', url: 'https://github.com/mxrch/GHunt', description: 'Investigate Google accounts', tags: ['email', 'google'], free: true },
      { name: 'Epieos', url: 'https://epieos.com', description: 'Email + phone reverse lookup', tags: ['email', 'phone'], free: true },
      { name: 'h8mail', url: 'https://github.com/khast3x/h8mail', description: 'Search in data breaches by email', tags: ['email', 'breach'], free: true },
      { name: 'Hunter.io', url: 'https://hunter.io', description: 'Find corporate emails by domain', tags: ['email', 'corporate'], free: true },
      { name: 'EmailHippo', url: 'https://tools.emailhippo.com', description: 'Email verification tool', tags: ['email', 'verify'], free: true },
      { name: 'Phoneinfoga', url: 'https://github.com/sundowndev/phoneinfoga', description: 'Phone number investigation framework', tags: ['phone', 'recon'], free: true },
      { name: 'Truecaller', url: 'https://www.truecaller.com', description: 'Caller identification service', tags: ['phone', 'id'], free: true },
      { name: 'Numverify', url: 'https://numverify.com', description: 'Phone number validation API', tags: ['phone', 'api'], free: true },
    ],
  },

  /* ───────────────────────── 13. BLOCKCHAIN / CRYPTO ───────────────────────── */
  {
    id: 'blockchain',
    number: 13,
    title: 'Blockchain / Crypto',
    icon: '⛓️',
    color: '#f59e0b',
    description: 'Wallet analysis, transaction tracing, entity mapping, on-chain analytics.',
    tools: [
      { name: 'Chainalysis Reactor', url: 'https://www.chainalysis.com', description: 'Professional forensic blockchain analysis', tags: ['forensic', 'multi-chain'], free: false },
      { name: 'Arkham Intelligence', url: 'https://www.arkhamintelligence.com', description: 'Entity mapping with AI', tags: ['ai', 'entity'], free: true },
      { name: 'Glassnode', url: 'https://glassnode.com', description: 'Advanced on-chain metrics', tags: ['analytics', 'metrics'], free: true },
      { name: 'Etherscan', url: 'https://etherscan.io', description: 'Ethereum blockchain explorer', tags: ['ethereum', 'explorer'], free: true },
      { name: 'Blockchain.info', url: 'https://www.blockchain.com/explorer', description: 'Bitcoin blockchain explorer', tags: ['bitcoin', 'explorer'], free: true },
      { name: 'BlockCypher', url: 'https://www.blockcypher.com', description: 'Multi-chain API & explorer', tags: ['api', 'multi-chain'], free: true },
      { name: 'Wallet Explorer', url: 'https://www.walletexplorer.com', description: 'Bitcoin wallet analysis', tags: ['bitcoin', 'wallet'], free: true },
    ],
    methodology: [
      '1. Identify wallet address',
      '2. Analyze transaction patterns',
      '3. Map entity connections',
      '4. Trace fund flows',
      '5. Correlate with off-chain data',
    ],
  },

  /* ───────────────────────── 14. TRANSPORT OSINT ───────────────────────── */
  {
    id: 'transport',
    number: 14,
    title: 'Transport OSINT',
    icon: '✈️',
    color: '#0ea5e9',
    description: 'Vehicle investigation, aviation ADS-B tracking, maritime AIS tracking.',
    tools: [
      // Vehicles
      { name: 'VINCheck', url: 'https://www.vehiclehistory.com', description: 'Free VIN decoder', tags: ['vehicle', 'vin'], free: true },
      { name: 'OpenALPR', url: 'https://github.com/openalpr/openalpr', description: 'License plate recognition (ALPR)', tags: ['vehicle', 'plate'], free: true },
      { name: 'Carfax', url: 'https://www.carfax.com', description: 'Vehicle history reports (US)', tags: ['vehicle', 'history'], free: false },
      // Aviation
      { name: 'FlightRadar24', url: 'https://www.flightradar24.com', description: 'Live global flight tracking', tags: ['aviation', 'live'], free: true },
      { name: 'ADS-B Exchange', url: 'https://globe.adsbexchange.com', description: 'No military filters — raw ADS-B data', tags: ['aviation', 'adsb'], free: true },
      { name: 'FlightAware', url: 'https://flightaware.com', description: 'Flight history & tracking', tags: ['aviation', 'history'], free: true },
      { name: 'PiAware', url: 'https://flightaware.com/adsb/piaware', description: 'Build your own ADS-B receiver with Raspberry Pi', tags: ['aviation', 'diy'], free: true },
      { name: 'AviationStack', url: 'https://aviationstack.com', description: 'Aviation data API', tags: ['aviation', 'api'], free: true },
      // Maritime
      { name: 'MarineTraffic', url: 'https://www.marinetraffic.com', description: 'Global AIS vessel tracking', tags: ['maritime', 'ais'], free: true },
      { name: 'VesselFinder', url: 'https://www.vesselfinder.com', description: 'Free alternative ship tracking', tags: ['maritime', 'ais'], free: true },
      { name: 'FleetMon', url: 'https://www.fleetmon.com', description: 'Fleet monitoring platform', tags: ['maritime', 'fleet'], free: true },
      { name: 'ShipSpotting', url: 'http://www.shipspotting.com', description: 'Ship photo database', tags: ['maritime', 'photo'], free: true },
    ],
  },

  /* ───────────────────────── 15. WIFI / WARDRIVING ───────────────────────── */
  {
    id: 'wifi',
    number: 15,
    title: 'WiFi / Wardriving',
    icon: '📡',
    color: '#8b5cf6',
    description: 'WiFi network mapping, SSID geolocation, Bluetooth detection.',
    tools: [
      { name: 'WiGLE', url: 'https://wigle.net', description: 'Global WiFi/Bluetooth/cell tower database', tags: ['wifi', 'database'], free: true },
      { name: 'Kismet', url: 'https://www.kismetwireless.net', description: 'WiFi/Bluetooth passive detector & sniffer', tags: ['wifi', 'sniffer'], free: true },
      { name: 'Aircrack-ng', url: 'https://www.aircrack-ng.org', description: 'WiFi security audit suite', tags: ['wifi', 'audit'], free: true },
    ],
    methodology: [
      '1. Search unique SSID in WiGLE',
      '2. Find approximate router location',
      '3. Correlate with other geolocation data',
      '4. Identify movements/locations of target',
    ],
  },

  /* ───────────────────────── 16. CONTENT VERIFICATION ───────────────────────── */
  {
    id: 'verification',
    number: 16,
    title: 'Content Verification',
    icon: '✅',
    color: '#10b981',
    description: 'Fact-checking, deepfake detection, image forensics, video verification.',
    tools: [
      { name: 'InVID & WeVerify', url: 'https://weverify.eu/verification-plugin', description: 'Video verification browser plugin', tags: ['video', 'verify'], free: true },
      { name: 'FotoForensics', url: 'https://fotoforensics.com', description: 'Error Level Analysis (ELA) for images', tags: ['image', 'forensics'], free: true },
      { name: 'Forensically', url: 'https://29a.ch/photo-forensics', description: 'Visual forensic analysis suite', tags: ['image', 'forensics'], free: true },
      { name: 'Sensity AI', url: 'https://sensity.ai', description: 'Professional deepfake detection', tags: ['deepfake', 'ai'], free: false },
      { name: 'Content Authenticity Initiative', url: 'https://contentauthenticity.org', description: 'Origin verification standard', tags: ['verify', 'standard'], free: true },
    ],
    methodology: [
      '1. Extract metadata with ExifTool',
      '2. Analyze with FotoForensics (ELA)',
      '3. Check consistencies with Forensically',
      '4. For video: use InVID for keyframes',
      '5. Reverse image search (Google, Yandex, TinEye)',
      '6. Check EXIF GPS vs claimed location',
    ],
  },

  /* ───────────────────────── 17. USERNAME ENUMERATION ───────────────────────── */
  {
    id: 'username',
    number: 17,
    title: 'Username Enumeration',
    icon: '🔎',
    color: '#f472b6',
    description: 'Cross-platform username search across 600+ sites.',
    tools: [
      { name: 'Sherlock', url: 'https://github.com/sherlock-project/sherlock', description: 'Hunt usernames across 400+ social networks', tags: ['username', 'fast'], free: true },
      { name: 'Maigret', url: 'https://github.com/soxoj/maigret', description: 'Most precise — 500+ platforms', tags: ['username', 'precise'], free: true },
      { name: 'WhatsMyName', url: 'https://github.com/WebBreacher/WhatsMyName', description: 'Most complete — 600+ platforms', tags: ['username', 'complete'], free: true },
      { name: 'Snoop', url: 'https://github.com/snooppr/snoop', description: '320+ platforms with Russian/CIS emphasis', tags: ['username', 'russia'], free: true },
      { name: 'Blackbird', url: 'https://github.com/p1ngul1n0/blackbird', description: '200+ platforms with PDF report export', tags: ['username', 'report'], free: true },
      { name: 'UserSearch', url: 'https://usersearch.org', description: 'Largest reverse user search (600+ platforms)', tags: ['username', 'reverse'], free: true },
    ],
  },

  /* ───────────────────────── 18. WEB SCRAPING ───────────────────────── */
  {
    id: 'scraping',
    number: 18,
    title: 'Web Scraping',
    icon: '🕸️',
    color: '#78716c',
    description: 'Browser automation, headless scraping, anti-bot bypass, data extraction.',
    tools: [
      { name: 'Scrapy', url: 'https://scrapy.org', description: 'Fast, powerful web scraping framework', tags: ['python', 'crawler'], free: true },
      { name: 'Puppeteer', url: 'https://pptr.dev', description: 'Headless Chrome Node.js API', tags: ['node', 'headless'], free: true },
      { name: 'Playwright', url: 'https://playwright.dev', description: 'Cross-browser automation', tags: ['browser', 'automation'], free: true },
      { name: 'Selenium', url: 'https://selenium.dev', description: 'Browser automation for web apps', tags: ['browser', 'automation'], free: true },
      { name: 'Beautiful Soup', url: 'https://www.crummy.com/software/BeautifulSoup', description: 'Python HTML/XML parser', tags: ['python', 'parser'], free: true },
    ],
  },

  /* ───────────────────────── 19. METADATA EXTRACTION ───────────────────────── */
  {
    id: 'metadata',
    number: 19,
    title: 'Metadata Extraction',
    icon: '🔬',
    color: '#a3e635',
    description: 'Extract and analyze metadata from images, PDFs, Office docs.',
    tools: [
      { name: 'ExifTool', url: 'https://exiftool.org', description: 'Read/write metadata in images, PDF, Office', tags: ['metadata', 'cli'], free: true },
      { name: 'FOCA', url: 'https://github.com/ElevenPaths/FOCA', description: 'Metadata extraction from public documents (GUI)', tags: ['metadata', 'gui'], free: true },
      { name: 'Metagoofil', url: 'https://github.com/laramies/metagoofil', description: 'Extract metadata from public docs', tags: ['metadata', 'cli'], free: true },
      { name: 'MAT2', url: 'https://0xacab.org/jvoisin/mat2', description: 'Metadata cleaner / anonymizer', tags: ['metadata', 'clean'], free: true },
    ],
    methodology: [
      '1. exiftool -a -u -g1 document.pdf > metadata.txt',
      '2. grep -i "author|creator|email|gps" metadata.txt',
      '3. mat2 --inplace clean_document.pdf',
    ],
  },

  /* ───────────────────────── 20. NETWORK SCANNING ───────────────────────── */
  {
    id: 'network',
    number: 20,
    title: 'Network Scanning',
    icon: '📡',
    color: '#fb923c',
    description: 'Port scanning, service enumeration, vulnerability assessment.',
    tools: [
      { name: 'Nmap', url: 'https://nmap.org', description: 'The network mapper — port/service scanner', tags: ['port', 'scan'], free: true },
      { name: 'Masscan', url: 'https://github.com/robertdavidgraham/masscan', description: 'Fastest port scanner (10M pps)', tags: ['port', 'fast'], free: true },
      { name: 'RustScan', url: 'https://github.com/RustScan/RustScan', description: 'Modern port scanner (Nmap companion)', tags: ['port', 'fast'], free: true },
      { name: 'Nuclei', url: 'https://github.com/projectdiscovery/nuclei', description: 'Template-based vulnerability scanner', tags: ['vuln', 'scan'], free: true },
    ],
  },

  /* ───────────────────────── 21. DARK WEB ───────────────────────── */
  {
    id: 'darkweb',
    number: 21,
    title: 'Dark Web',
    icon: '🌑',
    color: '#4b5563',
    description: 'Specialized dark web search, monitoring, and analysis tools.',
    tools: [
      { name: 'Ahmia', url: 'https://ahmia.fi', description: '.onion search engine', tags: ['tor', 'search'], free: true },
      { name: 'OnionScan', url: 'https://github.com/s-rah/onionscan', description: 'Scan hidden services', tags: ['tor', 'scan'], free: true },
      { name: 'Dark.fail', url: 'https://dark.fail', description: 'Verified dark web link directory', tags: ['tor', 'directory'], free: true },
      { name: 'DarkDump', url: 'https://github.com/josh0xA/darkdump', description: 'Onion site content scraper', tags: ['tor', 'scrape'], free: true },
    ],
    methodology: [
      '1. Use Tails OS (amnesic)',
      '2. Never VPN + Tor together',
      '3. Use Tor bridges if blocked',
      '4. NoScript at maximum',
      '5. Never resize browser window',
      '6. No persistent downloads',
    ],
  },

  /* ───────────────────────── 22. ALL-IN-ONE FRAMEWORKS ───────────────────────── */
  {
    id: 'frameworks',
    number: 22,
    title: 'All-in-One Frameworks',
    icon: '🛠️',
    color: '#d97706',
    description: 'Comprehensive OSINT platforms combining multiple capabilities.',
    tools: [
      { name: 'Maltego', url: 'https://www.maltego.com', description: 'Visual link analysis platform', tags: ['framework', 'graph'], free: false },
      { name: 'SpiderFoot', url: 'https://github.com/smicallef/spiderfoot', description: '200+ module OSINT automation', tags: ['framework', 'automation'], free: true },
      { name: 'Recon-ng', url: 'https://github.com/lanmaster53/recon-ng', description: 'Web reconnaissance framework', tags: ['framework', 'recon'], free: true },
      { name: 'OSINT Framework', url: 'https://osintframework.com', description: 'Categorized collection of tools', tags: ['framework', 'directory'], free: true },
      { name: 'Buscador OSINT VM', url: 'https://inteltechniques.com/buscador', description: 'Pre-configured OSINT virtual machine', tags: ['framework', 'vm'], free: true },
      { name: 'Trace Labs OSINT VM', url: 'https://www.tracelabs.org/initiatives/osint-vm', description: 'VM for missing person CTF events', tags: ['framework', 'vm'], free: true },
    ],
  },

  /* ───────────────────────── 23. MALTEGO ───────────────────────── */
  {
    id: 'maltego',
    number: 23,
    title: 'Advanced Maltego',
    icon: '🕸️',
    color: '#3b82f6',
    description: 'Essential Maltego transforms, plugins, and custom transform development.',
    tools: [
      { name: 'Standard Transforms', url: 'https://www.maltego.com', description: '150+ official transforms (free)', tags: ['maltego', 'transforms'], free: true },
      { name: 'Shodan Transform', url: 'https://www.maltego.com/transform-hub', description: 'Shodan integration for Maltego', tags: ['maltego', 'shodan'], free: false },
      { name: 'VirusTotal Transform', url: 'https://www.maltego.com/transform-hub', description: 'VT malware/URL analysis in Maltego', tags: ['maltego', 'vt'], free: false },
      { name: 'Netlas Transform', url: 'https://netlas.io', description: 'Shodan alternative for Maltego', tags: ['maltego', 'netlas'], free: true },
      { name: 'Hunter.io Transform', url: 'https://hunter.io', description: 'Email discovery in Maltego', tags: ['maltego', 'email'], free: true },
    ],
  },

  /* ───────────────────────── 24. PROFESSIONAL METHODOLOGIES ───────────────────────── */
  {
    id: 'pro-methods',
    number: 24,
    title: 'Professional Methodologies',
    icon: '📋',
    color: '#0284c7',
    description: 'Bellingcat methodology, professional OSINT cycle, academic frameworks.',
    tools: [
      { name: 'Bellingcat', url: 'https://www.bellingcat.com', description: 'Investigative journalism collective', tags: ['methodology', 'journalism'], free: true },
      { name: 'Bellingcat Online Toolkit', url: 'https://docs.google.com/spreadsheets/d/18rtqh8EG2q1xBo2cLNyhIDuK9jrPGwYr9DI2UncoqJQ', description: 'Comprehensive tool spreadsheet', tags: ['methodology', 'tools'], free: true },
      { name: 'OSINT Curious', url: 'https://osintcurio.us', description: 'OSINT community and resources', tags: ['community', 'learning'], free: true },
    ],
    methodology: [
      'BELLINGCAT METHOD:',
      '1. Identification: What are we investigating?',
      '2. Preservation: Archive EVERYTHING (archive.is, wayback)',
      '3. Verification: Triangulate with 3+ sources',
      '4. Contextualization: Complete chronology',
      '5. Documentation: Screenshots + hash + timestamp',
      '6. Validation: Peer review before publishing',
      '',
      'PROFESSIONAL OSINT CYCLE:',
      '1. Planning & Requirements',
      '2. Collection',
      '3. Processing & Exploitation',
      '4. Analysis & Production',
      '5. Dissemination & Feedback',
    ],
  },

  /* ───────────────────────── 25. GOOGLE DORKS ───────────────────────── */
  {
    id: 'google-dorks',
    number: 25,
    title: 'Advanced Google Dorks',
    icon: '🔓',
    color: '#dc2626',
    description: 'Advanced search operators for reconnaissance, sensitive data discovery.',
    tools: [
      { name: 'Google Hacking Database', url: 'https://www.exploit-db.com/google-hacking-database', description: 'Pre-built Google dork collection', tags: ['dorks', 'database'], free: true },
      { name: 'Qdorks', url: 'https://qdorks.com', description: 'Visual dork query builder', tags: ['dorks', 'generator'], free: true },
      { name: 'DorkSearch', url: 'https://dorksearch.com', description: 'Google dork search interface', tags: ['dorks', 'search'], free: true },
    ],
    methodology: [
      'site:target.com filetype:pdf',
      'site:target.com intitle:"index of"',
      'site:target.com intext:"password"',
      'site:target.com ext:sql | ext:db | ext:log',
      'site:pastebin.com "target.com"',
      '"target.com" site:github.com password|secret|token',
      'intitle:"webcam" inurl:view.shtml',
      'filetype:env "DB_PASSWORD" | "API_KEY"',
    ],
  },

  /* ───────────────────────── 26. LEARNING RESOURCES ───────────────────────── */
  {
    id: 'learning',
    number: 26,
    title: 'Learning Resources',
    icon: '🎓',
    color: '#7c3aed',
    description: 'Courses, CTFs, communities, conferences for OSINT skills development.',
    tools: [
      { name: 'SANS SEC497', url: 'https://www.sans.org/course/open-source-intelligence-gathering', description: 'SANS OSINT training course', tags: ['course', 'paid'], free: false },
      { name: 'Trace Labs', url: 'https://www.tracelabs.org', description: 'Missing person OSINT CTF events', tags: ['ctf', 'practice'], free: true },
      { name: 'OSINT Dojo', url: 'https://www.osintdojo.com', description: 'Free OSINT training resources', tags: ['course', 'free'], free: true },
      { name: 'Geoguessr', url: 'https://www.geoguessr.com', description: 'Geolocation skills practice game', tags: ['geo', 'practice'], free: true },
      { name: 'OSINT Curious', url: 'https://osintcurio.us', description: 'Weekly OSINT tips and webcasts', tags: ['community', 'tips'], free: true },
      { name: 'Sector035 OSINT Newsletter', url: 'https://sector035.nl', description: 'Week in OSINT newsletter', tags: ['newsletter', 'weekly'], free: true },
    ],
  },

  /* ───────────────────────── 27. PEOPLE INVESTIGATIONS ───────────────────────── */
  {
    id: 'people',
    number: 27,
    title: 'People Investigations',
    icon: '🔍',
    color: '#0d9488',
    description: 'People search engines, background checks, public records lookup.',
    tools: [
      { name: 'Pipl', url: 'https://pipl.com', description: 'People search engine', tags: ['people', 'search'], free: false },
      { name: 'Spokeo', url: 'https://www.spokeo.com', description: 'Background checks & people search', tags: ['people', 'background'], free: false },
      { name: 'BeenVerified', url: 'https://www.beenverified.com', description: 'Public records search', tags: ['people', 'records'], free: false },
      { name: 'Whitepages', url: 'https://www.whitepages.com', description: 'Phone and address lookup', tags: ['people', 'phone'], free: true },
      { name: 'ZabaSearch', url: 'https://www.zabasearch.com', description: 'Free people search', tags: ['people', 'free'], free: true },
      { name: 'TruthFinder', url: 'https://www.truthfinder.com', description: 'Public records search', tags: ['people', 'records'], free: false },
      { name: 'Instant Checkmate', url: 'https://www.instantcheckmate.com', description: 'Background report generation', tags: ['people', 'background'], free: false },
    ],
  },

  /* ───────────────────────── 28. COMPANY RESEARCH ───────────────────────── */
  {
    id: 'company',
    number: 28,
    title: 'Company Research',
    icon: '🏢',
    color: '#475569',
    description: 'Corporate intelligence, business records, ownership, financial analysis.',
    tools: [
      { name: 'OpenCorporates', url: 'https://opencorporates.com', description: 'Largest open database of companies', tags: ['company', 'database'], free: true },
      { name: 'Crunchbase', url: 'https://www.crunchbase.com', description: 'Startup & company intelligence', tags: ['company', 'startup'], free: true },
      { name: 'SEC EDGAR', url: 'https://www.sec.gov/cgi-bin/browse-edgar', description: 'US SEC corporate filings', tags: ['company', 'sec'], free: true },
      { name: 'Companies House', url: 'https://www.gov.uk/government/organisations/companies-house', description: 'UK company registry', tags: ['company', 'uk'], free: true },
      { name: 'OCCRP', url: 'https://www.occrp.org', description: 'Organized crime & corruption reporting', tags: ['investigation', 'crime'], free: true },
      { name: 'BuiltWith', url: 'https://builtwith.com', description: 'Technology profiling for websites', tags: ['company', 'tech'], free: true },
      { name: 'Glassdoor', url: 'https://www.glassdoor.com', description: 'Company reviews & salary data', tags: ['company', 'reviews'], free: true },
    ],
  },

  /* ───────────────────────── 29. DATA BREACHES ───────────────────────── */
  {
    id: 'breaches',
    number: 29,
    title: 'Data Breaches',
    icon: '💀',
    color: '#b91c1c',
    description: 'Breach databases, leaked credential search, exposure monitoring.',
    tools: [
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', description: 'Check if email is in known breaches', tags: ['breach', 'email'], free: true },
      { name: 'DeHashed', url: 'https://dehashed.com', description: 'Breach data search engine', tags: ['breach', 'search'], free: false },
      { name: 'IntelX', url: 'https://intelx.io', description: 'Intelligence search engine (breaches, leaks)', tags: ['breach', 'intel'], free: true },
      { name: 'Breach Directory', url: 'https://breachdirectory.org', description: 'Breach data search', tags: ['breach', 'directory'], free: true },
      { name: 'Snusbase', url: 'https://snusbase.com', description: 'Database leak search', tags: ['breach', 'search'], free: false },
    ],
  },

  /* ───────────────────────── 30. LEGAL ───────────────────────── */
  {
    id: 'legal',
    number: 30,
    title: 'Legal Considerations',
    icon: '⚖️',
    color: '#64748b',
    description: 'GDPR, CCPA, CFAA compliance, ethical boundaries, legal frameworks.',
    tools: [
      { name: 'GDPR Info', url: 'https://gdpr-info.eu', description: 'Complete GDPR text and guidance', tags: ['legal', 'gdpr'], free: true },
      { name: 'CCPA Overview', url: 'https://oag.ca.gov/privacy/ccpa', description: 'California Consumer Privacy Act', tags: ['legal', 'ccpa'], free: true },
    ],
    methodology: [
      'Always verify legality in YOUR jurisdiction',
      'GDPR applies to EU data regardless of your location',
      'Never bypass authentication or access controls',
      'Document your methodology for legal defensibility',
      'Use only publicly accessible information',
      'Respect robots.txt and rate limits',
    ],
  },

  /* ───────────────────────── 31. THREAT INTEL FEEDS ───────────────────────── */
  {
    id: 'threat-feeds',
    number: 31,
    title: 'Threat Intel Feeds',
    icon: '🚨',
    color: '#e11d48',
    description: '100+ threat intelligence feeds for IOCs, malware, botnets, phishing.',
    tools: [
      { name: 'AlienVault OTX', url: 'https://otx.alienvault.com', description: 'Open threat exchange — community IOCs', tags: ['ioc', 'community'], free: true },
      { name: 'Abuse.ch', url: 'https://abuse.ch', description: 'MalwareBazaar, URLhaus, Feodo tracker, SSL blacklist', tags: ['malware', 'tracker'], free: true },
      { name: 'PhishTank', url: 'https://www.phishtank.com', description: 'Community phishing URL database', tags: ['phishing', 'urls'], free: true },
      { name: 'ThreatFox', url: 'https://threatfox.abuse.ch', description: 'IOC sharing platform', tags: ['ioc', 'share'], free: true },
      { name: 'PulseDive', url: 'https://pulsedive.com', description: 'Free threat intelligence platform', tags: ['threat', 'search'], free: true },
      { name: 'MISP', url: 'https://www.misp-project.org', description: 'Malware Information Sharing Platform', tags: ['share', 'platform'], free: true },
      { name: 'VirusTotal', url: 'https://virustotal.com', description: 'Multi-engine malware scanner', tags: ['malware', 'scan'], free: true },
      { name: 'Shodan', url: 'https://shodan.io', description: 'Internet device search engine', tags: ['iot', 'search'], free: true },
      { name: 'ExploitDB', url: 'https://www.exploit-db.com', description: 'Exploit database', tags: ['exploit', 'vuln'], free: true },
      { name: 'YARAify', url: 'https://yaraify.abuse.ch', description: 'YARA rule sharing', tags: ['yara', 'rules'], free: true },
      { name: 'FireHOL', url: 'https://iplists.firehol.org', description: 'Aggregated IP blocklists', tags: ['ip', 'blocklist'], free: true },
      { name: 'Talos Intelligence', url: 'https://www.talosintelligence.com', description: 'Cisco threat intelligence', tags: ['threat', 'cisco'], free: true },
    ],
  },

  /* ───────────────────────── 32. EXTRA RESOURCES ───────────────────────── */
  {
    id: 'extras',
    number: 32,
    title: 'Extra Resources',
    icon: '📚',
    color: '#737373',
    description: 'Webcams, news, geopolitics, conflict tracking, public datasets.',
    tools: [
      { name: 'WorldCam', url: 'https://worldcam.eu', description: 'World webcam directory', tags: ['webcam', 'live'], free: true },
      { name: 'Skyline Webcams', url: 'https://www.skylinewebcams.com', description: 'HD skyline webcams worldwide', tags: ['webcam', 'hd'], free: true },
      { name: 'Broadcastify', url: 'https://www.broadcastify.com', description: 'Police/fire/EMS audio feeds', tags: ['radio', 'scanner'], free: true },
      { name: 'Radio Garden', url: 'https://radio.garden', description: 'Live radio stations on a globe', tags: ['radio', 'global'], free: true },
      { name: 'Ventusky', url: 'https://www.ventusky.com', description: 'Interactive weather maps', tags: ['weather', 'map'], free: true },
      { name: 'OCCRP', url: 'https://www.occrp.org', description: 'Organized crime & corruption reporting', tags: ['journalism', 'crime'], free: true },
      { name: 'Transparency International', url: 'https://www.transparency.org', description: 'Anti-corruption research', tags: ['corruption', 'research'], free: true },
      { name: 'Crisis24', url: 'https://crisis24.garda.com', description: 'Global security risk management', tags: ['security', 'risk'], free: true },
    ],
  },
];

/** Total tool count across all categories */
export const TOTAL_TOOLS = OSINT_CATEGORIES.reduce((sum, cat) => sum + cat.tools.length, 0);

/** All unique tags across all tools */
export const ALL_TAGS = Array.from(
  new Set(OSINT_CATEGORIES.flatMap(cat => cat.tools.flatMap(t => t.tags ?? [])))
).sort();
