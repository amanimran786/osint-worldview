import { expect, test } from '@playwright/test';

test.describe('Deduct Situation Panel Options', () => {
    test('It successfully requests deduction from the intelligence API', async ({ page }) => {
        if (!process.env.TEST_REAL_LLM) {
            await page.route('**/api/**', async (route) => {
                if (!route.request().url().includes('/api/intelligence/v1/deduct-situation')) {
                    await route.fulfill({ status: 503, json: { error: 'test offline' } });
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, 250));
                const json = {
                    analysis: '### Mocked AI Analysis\n- This is a simulated response.\n- Situation is stable.',
                    model: 'mocked-e2e-model',
                    provider: 'groq',
                };
                await route.fulfill({ json });
            });
        }

        await page.goto('/tests/runtime-harness.html');
        await page.evaluate(async () => {
            const { DeductionPanel } = await import('/src/components/DeductionPanel.ts');
            const panel = new DeductionPanel();
            document.body.appendChild(panel.getElement());
        });

        // Ensure the panel is visible and ready
        const panel = page.locator('.panel[data-panel="deduction"]');
        await expect(panel).toBeVisible();

        // Fill in the text area query
        const textarea = panel.locator('textarea').first();
        await textarea.fill('What is the geopolitical status of the Pacific?');

        // Click analyze
        const analyzeBtn = panel.locator('button', { hasText: 'Analyze' });
        await analyzeBtn.click();

        // Verify loading state
        await expect(panel.locator('text="Analyzing timeline and impact..."')).toBeVisible();

        // Verify the resolved output is rendered
        if (!process.env.TEST_REAL_LLM) {
            await expect(panel.locator('text="Mocked AI Analysis"')).toBeVisible({ timeout: 10000 });
            await expect(panel.locator('text="Situation is stable."')).toBeVisible();
        } else {
            // If testing against a real local LLM or cloud, just expect some markdown output block to appear
            // The API might take a while depending on local hardware / provider limits
            await expect(panel.locator('.deduction-result')).not.toBeEmpty({ timeout: 30000 });
        }
    });
});
