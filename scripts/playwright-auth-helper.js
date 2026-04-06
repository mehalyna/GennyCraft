/**
 * Playwright MCP Authentication Helper
 * 
 * Helper functions to use with Playwright MCP browser_run_code
 * Copy and paste these functions when working with Copilot + MCP
 */

/**
 * LOGIN FUNCTION
 * Use this to log in via Copilot MCP
 * 
 * Usage: Ask Copilot to "run the login function with MCP"
 */
const loginFunction = `async (page) => {
  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Fill credentials
    await page.getByRole('textbox', { name: 'you@example.com' }).fill('my@example.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('qwerty654321');
    
    // Click login
    await page.locator('form').getByRole('button', { name: 'Login' }).click();
    
    // Wait for redirect
    await page.waitForURL(/dashboard|transactions/, { timeout: 10000 });
    
    return { success: true, message: 'Logged in successfully', url: page.url() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}`;

/**
 * CHECK AUTH STATUS
 * Use this to verify if user is logged in
 */
const checkAuthFunction = `async (page) => {
  const authState = await page.evaluate(() => {
    return {
      hasAccessToken: !!localStorage.getItem('access_token'),
      hasRefreshToken: !!localStorage.getItem('refresh_token'),
      currentUrl: window.location.href,
      isOnLoginPage: window.location.pathname === '/login'
    };
  });
  return authState;
}`;

/**
 * SET AUTH TOKENS DIRECTLY
 * Use this to inject tokens without logging in
 * (useful if you have valid tokens from another source)
 */
const setAuthTokensFunction = `async (page) => {
  await page.evaluate(({ accessToken, refreshToken }) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, {
    accessToken: 'YOUR_ACCESS_TOKEN_HERE',
    refreshToken: 'YOUR_REFRESH_TOKEN_HERE'
  });
  return { success: true, message: 'Tokens set successfully' };
}`;

/**
 * LOGOUT FUNCTION
 * Use this to clear authentication
 */
const logoutFunction = `async (page) => {
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('http://localhost:3000/login');
  return { success: true, message: 'Logged out successfully' };
}`;

/**
 * NAVIGATE WITH AUTH CHECK
 * Navigate to a page and verify authentication
 */
const navigateWithAuthFunction = `async (page) => {
  const targetUrl = 'http://localhost:3000/transactions';
  
  // Check if logged in
  const hasToken = await page.evaluate(() => !!localStorage.getItem('access_token'));
  
  if (!hasToken) {
    return { success: false, error: 'Not authenticated. Please log in first.' };
  }
  
  await page.goto(targetUrl);
  await page.waitForLoadState('networkidle');
  
  // Verify we didn't get redirected to login
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    return { success: false, error: 'Authentication expired or invalid' };
  }
  
  return { success: true, url: currentUrl };
}`;

// Export all functions
module.exports = {
  loginFunction,
  checkAuthFunction,
  setAuthTokensFunction,
  logoutFunction,
  navigateWithAuthFunction,
};

// Print functions if run directly
if (require.main === module) {
  console.log('=== Playwright MCP Authentication Helper Functions ===\n');
  console.log('📋 Copy these functions to use with GitHub Copilot + MCP:\n');
  console.log('1️⃣  LOGIN:');
  console.log(loginFunction);
  console.log('\n2️⃣  CHECK AUTH:');
  console.log(checkAuthFunction);
  console.log('\n3️⃣  SET TOKENS:');
  console.log(setAuthTokensFunction);
  console.log('\n4️⃣  LOGOUT:');
  console.log(logoutFunction);
  console.log('\n5️⃣  NAVIGATE WITH AUTH CHECK:');
  console.log(navigateWithAuthFunction);
}
