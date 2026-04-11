/**
 * Standalone settings window: panel toggles only.
 * Loaded when the app is opened with ?settings=1 (e.g. from the main window's Settings button).
 */
import type { PanelConfig } from '@/types';
import { DEFAULT_PANELS, STORAGE_KEYS } from '@/config';
import { loadFromStorage, saveToStorage } from '@/utils';
import { t } from '@/services/i18n';
import { escapeHtml } from '@/utils/sanitize';
import { isDesktopRuntime } from '@/services/runtime';

function getLocalizedPanelName(panelKey: string, fallback: string): string {
  if (panelKey === 'runtime-config') {
    return t('modals.runtimeConfig.title');
  }
  const key = panelKey.replace(/-([a-z])/g, (_match, group: string) => group.toUpperCase());
  const lookup = `panels.${key}`;
  const localized = t(lookup);
  return localized === lookup ? fallback : localized;
}

export function initSettingsWindow(): void {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  // This window shows only "which panels to display" (panel display settings).
  document.title = `${t('header.settings')} - WorldView`;

  let panelSettings = loadFromStorage<Record<string, PanelConfig>>(
    STORAGE_KEYS.panels,
    DEFAULT_PANELS
  );

  const isDesktopApp = isDesktopRuntime();

  function render(): void {
    const panelEntries = Object.entries(panelSettings).filter(
      ([key]) => key !== 'runtime-config' || isDesktopApp
    );
    const panelHtml = panelEntries
      .map(
        ([key, panel]) => `
        <button type="button" class="panel-toggle-item ${panel.enabled ? 'active' : ''}" data-panel="${key}" aria-pressed="${panel.enabled}" aria-label="${escapeHtml(getLocalizedPanelName(key, panel.name))}: ${panel.enabled ? 'enabled' : 'disabled'}">
          <div class="panel-toggle-checkbox">${panel.enabled ? '✓' : ''}</div>
          <span class="panel-toggle-label">${getLocalizedPanelName(key, panel.name)}</span>
        </button>
      `
      )
      .join('');

    const grid = document.getElementById('panelToggles');
    if (grid) {
      grid.innerHTML = panelHtml;
      grid.querySelectorAll<HTMLButtonElement>('.panel-toggle-item').forEach((item) => {
        item.addEventListener('click', () => {
          const panelKey = item.dataset.panel!;
          const config = panelSettings[panelKey];
          if (config) {
            config.enabled = !config.enabled;
            saveToStorage(STORAGE_KEYS.panels, panelSettings);
            render();
          }
        });
      });
    }
  }

  appEl.innerHTML = `
    <main class="settings-window-shell" role="main">
      <div class="settings-window-header" role="banner">
        <div class="settings-window-header-text">
          <span class="settings-window-title">${escapeHtml(t('header.settings'))}</span>
          <p class="settings-window-caption">${escapeHtml(t('header.panelDisplayCaption'))}</p>
        </div>
        <button type="button" class="modal-close" id="settingsWindowClose" aria-label="Close settings">×</button>
      </div>
      <div class="panel-toggle-grid" id="panelToggles" role="group" aria-label="Panel visibility toggles"></div>
    </main>
  `;

  document.getElementById('settingsWindowClose')?.addEventListener('click', () => {
    window.close();
  });

  render();
}
