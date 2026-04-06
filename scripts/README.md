# Playwright MCP Authentication Scripts

This folder contains scripts for automatic authentication with Playwright MCP.

## Files

### `playwright-auth-setup.js`
Standalone script that logs into GennyCraft and saves authentication state.

**Usage:**
```bash
node scripts/playwright-auth-setup.js
```

This will:
- Open a browser
- Log in with configured credentials
- Save authentication state to `.playwright-mcp/auth-state.json`
- Close the browser

### `playwright-auth-helper.js`
Helper functions for use with GitHub Copilot + Playwright MCP.

**Usage:**
```bash
# View all available functions
node scripts/playwright-auth-helper.js
```

Then ask GitHub Copilot to run these functions via MCP commands.

## Quick Start

### 1. Setup Authentication (One-time)
```bash
node scripts/playwright-auth-setup.js
```

### 2. Use with GitHub Copilot + MCP

Ask Copilot to run authentication functions:

**Examples:**
- "Log me into the app using Playwright"
- "Check if I'm authenticated"
- "Navigate to transactions page with auth"
- "Log me out"

### 3. Manual Usage with MCP

You can also copy the functions from `playwright-auth-helper.js` and run them directly:

```javascript
// Login example
async (page) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('my@example.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('qwerty654321');
  await page.locator('form').getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard|transactions/, { timeout: 10000 });
  return { success: true, message: 'Logged in successfully' };
}
```

## Configuration

Edit `playwright-auth-setup.js` to change:
- `baseUrl` - Your app URL (default: http://localhost:3000)
- `email` - Test user email (default: my@example.com)
- `password` - Test user password (default: qwerty654321)

## Authentication State Persistence

Playwright MCP automatically persists browser state between sessions in:
- Windows: `%APPDATA%\Local\ms-playwright\mcp-chrome-*`
- macOS/Linux: `~/.playwright-mcp/browser-data/`

Once authenticated, your login will persist across MCP sessions automatically!

## Troubleshooting

### Authentication not persisting
1. Ensure backend server is running: `python manage.py runserver`
2. Verify credentials are correct
3. Check browser console for errors

### Token expired
Tokens expire after a period. Either:
- Run `node scripts/playwright-auth-setup.js` again
- Ask Copilot to "log me in again"

### Backend not responding
Ensure Django is running on http://localhost:8000:
```bash
python manage.py runserver
```
