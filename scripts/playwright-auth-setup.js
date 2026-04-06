/**
 * Playwright MCP Authentication Setup Script
 * 
 * This script logs into GennyCraft and saves the authentication state
 * for use with Playwright MCP sessions.
 * 
 * Usage:
 *   node scripts/playwright-auth-setup.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  email: 'my@example.com',
  password: 'qwerty654321',
  storageStatePath: path.join(__dirname, '..', '.playwright-mcp', 'auth-state.json'),
};

async function setupAuth() {
  console.log('🚀 Starting authentication setup...');
  
  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for headless operation
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login page
    console.log('📄 Navigating to login page...');
    await page.goto(`${CONFIG.baseUrl}/login`);
    
    // Fill in login credentials
    console.log('🔑 Filling in credentials...');
    await page.getByRole('textbox', { name: 'you@example.com' }).fill(CONFIG.email);
    await page.getByRole('textbox', { name: '••••••••' }).fill(CONFIG.password);
    
    // Click login button
    console.log('🔐 Logging in...');
    await page.locator('form').getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard|transactions/, { timeout: 10000 });
    console.log('✅ Login successful!');
    
    // Get authentication tokens from localStorage
    const authState = await page.evaluate(() => {
      return {
        localStorage: {
          access_token: localStorage.getItem('access_token'),
          refresh_token: localStorage.getItem('refresh_token'),
        },
        cookies: document.cookie,
      };
    });
    
    // Save storage state
    console.log('💾 Saving authentication state...');
    await context.storageState({ path: CONFIG.storageStatePath });
    
    console.log('🎉 Authentication setup complete!');
    console.log(`📁 Auth state saved to: ${CONFIG.storageStatePath}`);
    console.log('\n📋 Tokens retrieved:');
    console.log(`   Access Token: ${authState.localStorage.access_token ? '✓ Present' : '✗ Missing'}`);
    console.log(`   Refresh Token: ${authState.localStorage.refresh_token ? '✓ Present' : '✗ Missing'}`);
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if executed directly
if (require.main === module) {
  setupAuth()
    .then(() => {
      console.log('\n✨ You can now use Playwright MCP with authentication!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupAuth, CONFIG };
