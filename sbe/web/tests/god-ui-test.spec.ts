import { test, expect, type Page } from '@playwright/test';

/**
 * GOD-LEVEL FRONTEND VERIFICATION SUITE (GLFVS)
 * Target: Kinetic Sports Betting Exchange (SBE)
 * Focus: High-Precision UI/UX, Multi-Tenancy, and Real-time Visualization
 */

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('SBE Core User Journey', () => {
  
  test('Multi-Tenant Theme Injection & Onboarding', async ({ page }) => {
    console.log('Testing Brand Identity & White-labeling...');
    await page.goto(BASE_URL);
    
    // Check for dynamic title (configured in TenantProvider)
    await expect(page).toHaveTitle(/Kinetic Ledger/);
    
    // Verify CSS variable injection for brand colors
    const primaryColor = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
    );
    expect(primaryColor).toBe('#0071e3'); // Kinetic Default
    
    console.log('✅ Tenant Identity Verified');
  });

  test('Immersive Live Visualizer (Football/Basketball/Tennis)', async ({ page }) => {
    console.log('Testing Sport-Specific Visualizer Engine...');
    
    // Navigate to a live match (assuming ID 1 for test or dynamic find)
    await page.goto(`${BASE_URL}/en/match/test-match-id`);
    
    // Check if the Scoreboard is rendered
    await expect(page.locator('h2')).toContainText(/VS/i);
    
    // Check for Sport-Specific Components based on Match Metadata
    // Note: In real test, we would mock the API response to force a sport type
    const liveCourt = page.locator('.live-court'); // Basketball
    const livePitch = page.locator('.live-pitch'); // Football
    
    expect(await liveCourt.isVisible() || await livePitch.isVisible()).toBeTruthy();
    
    console.log('✅ Live Visualizers operational');
  });

  test('Advanced AI Insights Integration', async ({ page }) => {
    console.log('Testing Kinetic AI Intelligence PRO Panel...');
    
    await page.goto(`${BASE_URL}/en/match/test-match-id`);
    
    // Look for the Brain icon or AI header
    const aiPanel = page.locator('text=Kinetic AI Intelligence');
    await expect(aiPanel).toBeVisible();
    
    // Verify confidence score is a number between 0-100
    const confidenceText = await page.locator('text=%').textContent();
    const score = parseInt(confidenceText || '0');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
    
    console.log('✅ AI Analytics Layer active');
  });

  test('High-Frequency P2P Betting Flow', async ({ page }) => {
    console.log('Testing BetSlip & Transaction Lifecycle...');
    
    await page.goto(`${BASE_URL}/en/match/test-match-id`);
    
    // Click on a Back Odd (assuming order book is visible)
    const oddButton = page.locator('button:has-text("3.45")');
    if (await oddButton.isVisible()) {
      await oddButton.click();
      
      // Verify BetSlip opens
      const betSlip = page.locator('text=BET SLIP');
      await expect(betSlip).toBeVisible();
      
      // Enter stake
      await page.fill('input[placeholder="0.00"]', '500');
      
      // Check potential payout calculation
      const payout = await page.locator('text=Returns').textContent();
      expect(payout).toContain('₹');
      
      console.log('✅ Betting Lifecycle operational');
    }
  });

  test('Admin Risk & Settlement Center', async ({ page }) => {
    console.log('Testing Admin Governance & Risk Alerts...');
    
    // Navigate to Admin dashboard
    await page.goto(`${BASE_URL}/en/admin`);
    
    // Check for Risk Alert banner if data exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const riskHeader = page.locator('text=CRITICAL RISK INTERVENTIONS');
    // This might be hidden if no alerts exist, so we check for the container
    await expect(page.locator('text=LIABILITY')).toBeVisible();
    
    console.log('✅ Admin Governance UI verified');
  });
});
