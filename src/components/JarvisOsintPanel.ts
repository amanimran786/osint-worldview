import { Panel } from './Panel';
import { h, replaceChildren } from '@/utils/dom-utils';
import { sanitizeUrl } from '@/utils/sanitize';
import {
  worldviewScan,
  scanUsernameFootprint,
  getJarvisOsintStatus,
  type JarvisWorldviewResult,
  type JarvisUsernameScanResult,
  type JarvisWhoisResult,
  type JarvisSubdomainResult,
} from '@/services/jarvis-osint';

type Mode = 'domain' | 'username';

const PLACEHOLDER: Record<Mode, string> = {
  domain: 'google.com',
  username: 'johndoe',
};

export class JarvisOsintPanel extends Panel {
  private mode: Mode = 'domain';
  private tabsEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private scanBtn: HTMLButtonElement | null = null;
  private typosCheckbox: HTMLInputElement | null = null;
  private typosLabel: HTMLElement | null = null;
  private _controller: AbortController | null = null;

  constructor() {
    super({
      id: 'jarvis-osint',
      title: 'OSINT Scanner',
      showCount: false,
      trackActivity: false,
      infoTooltip: 'Local OSINT intelligence powered by Jarvis — whois, subdomains, username footprint',
    });
    this.buildShell();
    this.checkStatus();
  }

  private buildShell(): void {
    this.tabsEl = h('div', { className: 'panel-tabs' },
      h('button', {
        className: 'panel-tab active',
        dataset: { mode: 'domain' },
        onClick: () => this.setMode('domain'),
      }, 'Domain'),
      h('button', {
        className: 'panel-tab',
        dataset: { mode: 'username' },
        onClick: () => this.setMode('username'),
      }, 'Username'),
    );
    this.element.insertBefore(this.tabsEl, this.content);

    const checkbox = h('input', { type: 'checkbox' }) as HTMLInputElement;
    this.typosCheckbox = checkbox;

    this.typosLabel = h('label', { className: 'osint-typos-toggle' },
      checkbox,
      'typos',
    );

    const form = h('div', { className: 'osint-search-bar' },
      this.inputEl = h('input', {
        type: 'text',
        className: 'osint-input',
        placeholder: PLACEHOLDER[this.mode],
        onKeydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter') this.runScan();
        },
      }) as HTMLInputElement,
      this.typosLabel,
      this.scanBtn = h('button', {
        className: 'osint-scan-btn',
        onClick: () => this.runScan(),
      }, 'Scan') as HTMLButtonElement,
    );
    this.element.insertBefore(form, this.content);

    replaceChildren(this.content,
      h('div', { className: 'empty-state' }, 'Enter a domain or username to scan'),
    );
  }

  private setMode(mode: Mode): void {
    if (mode === this.mode) return;
    this._controller?.abort();
    if (this.scanBtn) this.scanBtn.textContent = 'Scan';
    this.mode = mode;
    this.tabsEl?.querySelectorAll('.panel-tab').forEach(tab => {
      tab.classList.toggle('active', (tab as HTMLElement).dataset.mode === mode);
    });
    if (this.inputEl) {
      this.inputEl.value = '';
      this.inputEl.placeholder = PLACEHOLDER[mode];
    }
    if (this.typosLabel) {
      this.typosLabel.style.display = mode === 'domain' ? '' : 'none';
    }
    this.setCount(0);
    replaceChildren(this.content,
      h('div', { className: 'empty-state' }, 'Enter a ' + mode + ' to scan'),
    );
  }

  private async checkStatus(): Promise<void> {
    try {
      await getJarvisOsintStatus();
    } catch {
      replaceChildren(this.content,
        h('div', { className: 'empty-state osint-error' },
          h('strong', {}, 'Jarvis API unavailable'),
          h('p', {}, 'Start Jarvis and set JARVIS_API_URL to enable OSINT scanning'),
        ),
      );
    }
  }

  private async runScan(): Promise<void> {
    const target = this.inputEl?.value.trim() ?? '';
    if (!target) return;

    // Cancel any in-flight scan and start fresh
    this._controller?.abort();
    this._controller = new AbortController();
    const { signal } = this._controller;

    if (this.scanBtn) this.scanBtn.textContent = 'Cancel';
    this.showLoading('Scanning ' + target + '…');

    try {
      if (this.mode === 'domain') {
        const result = await worldviewScan(target, {
          timeoutSeconds: 60,
          maxResultsPerTool: 50,
          includeTypos: this.typosCheckbox?.checked ?? false,
          signal,
        });
        this.renderDomainResult(result);
      } else {
        const result = await scanUsernameFootprint(target, {
          timeoutSeconds: 45,
          maxResults: 30,
          signal,
        });
        this.renderUsernameResult(result);
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      this.showError(
        'Scan failed: ' + (err instanceof Error ? err.message : String(err)),
        () => this.runScan(),
      );
    } finally {
      if (this.scanBtn) this.scanBtn.textContent = 'Scan';
    }
  }

  private renderDomainResult(result: JarvisWorldviewResult): void {
    if (!result.ok) {
      this.showError(result.error ?? result.message ?? 'Scan failed', () => this.runScan());
      return;
    }

    const intel = result.intelligence ?? {};
    const elapsed = result.elapsed_seconds != null ? ` (${result.elapsed_seconds}s)` : '';
    const sections: HTMLElement[] = [];

    sections.push(h('div', { className: 'osint-meta' },
      h('span', { className: 'osint-target' }, result.target ?? ''),
      h('span', { className: 'osint-elapsed' }, elapsed),
      h('span', { className: 'osint-tools' },
        'Tools: ' + ((result.tools_run ?? []).join(', ') || 'none'),
      ),
    ));

    const subCount = intel.subdomains?.count ?? 0;
    this.setCount(subCount);

    if (intel.whois) sections.push(this.renderWhois(intel.whois));
    if (intel.subdomains) sections.push(this.renderSubdomains(intel.subdomains));

    if (!intel.whois && !intel.subdomains) {
      sections.push(h('div', { className: 'empty-state' }, 'No intelligence data returned'));
    }

    replaceChildren(this.content, ...sections);
  }

  private renderWhois(whois: JarvisWhoisResult): HTMLElement {
    const rows: HTMLElement[] = [];

    const addRow = (label: string, value: string | null | undefined) => {
      if (!value) return;
      rows.push(h('div', { className: 'osint-row' },
        h('span', { className: 'osint-label' }, label),
        h('span', { className: 'osint-value' }, value),
      ));
    };

    addRow('Registrar', whois.registrar);
    addRow('Org', whois.registrant_org);
    addRow('Created', whois.created ? whois.created.slice(0, 10) : null);
    addRow('Expires', whois.expires ? whois.expires.slice(0, 10) : null);

    if (whois.name_servers?.length) {
      rows.push(h('div', { className: 'osint-row' },
        h('span', { className: 'osint-label' }, 'Nameservers'),
        h('span', { className: 'osint-value' }, [...new Set(whois.name_servers.map(s => s.toLowerCase()))].join(', ')),
      ));
    }

    return h('div', { className: 'osint-section' },
      h('div', { className: 'osint-section-title' }, 'WHOIS'),
      rows.length ? h('div', { className: 'osint-rows' }, ...rows) : h('div', { className: 'osint-empty' }, 'No WHOIS data'),
    );
  }

  private renderSubdomains(sub: JarvisSubdomainResult): HTMLElement {
    const hosts = sub.subdomains ?? [];
    const totalCount = sub.count ?? hosts.length;

    const filterInput = h('input', {
      type: 'text',
      className: 'osint-filter-input',
      placeholder: `Filter ${totalCount} subdomains…`,
    }) as HTMLInputElement;

    const listEl = h('div', { className: 'osint-subdomain-list' }) as HTMLElement;

    const render = (query: string) => {
      const q = query.toLowerCase();
      const visible = q ? hosts.filter(s => s.host.includes(q)) : hosts;
      replaceChildren(listEl,
        ...visible.slice(0, 200).map(s =>
          h('div', { className: 'osint-subdomain' },
            h('code', {}, s.host),
            s.source ? h('span', { className: 'osint-sub-source' }, s.source) : null,
          ),
        ),
      );
    };

    filterInput.addEventListener('input', () => render(filterInput.value));
    render('');

    const header = h('div', { className: 'osint-section-title' },
      `Subdomains (${totalCount})`,
    );

    return h('div', { className: 'osint-section' },
      header,
      hosts.length ? h('div', { className: 'osint-filter-bar' }, filterInput) : null,
      hosts.length
        ? listEl
        : h('div', { className: 'osint-empty' }, 'No subdomains found'),
    );
  }

  private renderUsernameResult(result: JarvisUsernameScanResult): void {
    if (!result.ok) {
      this.showError(result.error ?? result.message ?? 'Scan failed', () => this.runScan());
      return;
    }

    const profiles = result.profiles ?? [];
    const found = profiles.filter(p => p.status === 'found' || p.status === 'claimed');
    this.setCount(found.length);

    const header = h('div', { className: 'osint-meta' },
      h('span', { className: 'osint-target' }, result.username ?? ''),
      h('span', { className: 'osint-elapsed' }, ` — ${result.found_count ?? found.length} profiles found`),
    );

    const items = found.map(p =>
      h('div', { className: 'osint-profile' },
        h('span', { className: 'osint-profile-site' }, p.site),
        h('a', { className: 'osint-profile-url', href: sanitizeUrl(p.url), target: '_blank', rel: 'noopener noreferrer' }, p.url),
      ),
    );

    replaceChildren(this.content,
      header,
      h('div', { className: 'osint-section' },
        h('div', { className: 'osint-section-title' }, 'Profiles'),
        items.length
          ? h('div', { className: 'osint-profile-list' }, ...items)
          : h('div', { className: 'osint-empty' }, 'No profiles found'),
      ),
    );
  }
}
