import { expect, test, type Route } from '@playwright/test';

const OFF_PURPOSE_COPY = /DEFCON|PizzINT|Pentagon Pizza|TOP SECRET|NOFORN|ASTRAL INTEL|2M\+ people|Upgrade to WorldView|join.*waitlist/i;

test.describe('WorldView dashboard controls', () => {
  test.beforeEach(async ({ page }) => {
    const unavailable = (route: Route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"test offline"}' });
    await page.route('**/api/**', unavailable);
    await page.route('**/rss/**', unavailable);
  });

  test('desktop controls open real surfaces and navigate sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-shell')).toBeVisible();

    await expect(page.locator('body')).not.toContainText(OFF_PURPOSE_COPY);
    await expect(page.locator('#commandSearchInput')).toHaveAttribute('readonly', '');

    await page.locator('#commandSearchInput').click();
    await expect(page.locator('.search-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.search-overlay')).toHaveCount(0);

    await page.locator('#unifiedSettingsBtn').click();
    await expect(page.locator('#unifiedSettingsModal')).toHaveClass(/active/);
    await page.locator('.unified-settings-close').click();
    await expect(page.locator('#unifiedSettingsModal')).not.toHaveClass(/active/);

    const mapTab = page.locator('.command-tab[data-target="mapSection"]');
    await mapTab.click();
    await expect(mapTab).toHaveClass(/active/);
    await expect(mapTab).toHaveAttribute('aria-current', 'page');

    const signalsTab = page.locator('.command-tab[data-target="panelsGrid"]');
    await signalsTab.click();
    await expect(signalsTab).toHaveClass(/active/);
    await expect(page.locator('#panelsGrid')).toBeAttached();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('mobile menu, search, and map collapse are operational', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.app-shell')).toBeVisible();

    await page.locator('#hamburgerBtn').click();
    await expect(page.locator('#mobileMenu')).toHaveClass(/open/);
    await page.locator('#mobileMenuClose').click();
    await expect(page.locator('#mobileMenu')).not.toHaveClass(/open/);

    await page.locator('#searchMobileFab').click();
    await expect(page.locator('.search-overlay.search-mobile')).toBeVisible();
    await page.locator('.search-sheet-cancel').click();
    await expect(page.locator('.search-overlay')).toHaveCount(0);

    const collapse = page.locator('.map-collapse-btn');
    await expect(collapse).toBeVisible();
    await collapse.click();
    await expect(page.locator('#mapSection')).toHaveClass(/collapsed/);
    await collapse.click();
    await expect(page.locator('#mapSection')).not.toHaveClass(/collapsed/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
