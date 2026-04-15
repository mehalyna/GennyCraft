import { test, expect } from '@playwright/test';

/**
 * E2E Tests for GennyCraft Transactions Page
 * 
 * Test Coverage:
 * 1. Authenticated user sees their transactions list
 * 2. Category filter shows only matching transactions
 * 3. Date range filter works correctly
 * 4. Creating a new transaction appears in the list
 * 5. Deleting a transaction removes it from the list
 */

// Authentication credentials
const TEST_USER = {
  email: 'my@example.com',
  password: 'qwerty654321',
};

// Test data for new transactions
const NEW_TRANSACTION = {
  type: 'Expense',
  amount: '50',
  currency: 'USD',
  category: '🛒 Groceries',
  title: 'Weekly Shopping',
  note: 'Test transaction for E2E',
};

const INCOME_TRANSACTION = {
  type: 'Income',
  amount: '500',
  currency: 'USD',
  category: '💼 Salary',
  title: 'Bonus Payment',
  note: 'Test income transaction',
};

/**
 * Helper function to log in before each test
 */
async function login(page) {
  await page.goto('http://localhost:3000/login');
  
  // Fill in credentials
  await page.getByRole('textbox', { name: 'you@example.com' }).fill(TEST_USER.email);
  await page.getByRole('textbox', { name: '••••••••' }).fill(TEST_USER.password);
  
  // Submit login form
  await page.locator('form').getByRole('button', { name: 'Login' }).click();
  
  // Wait for successful login (redirects to dashboard or transactions)
  await page.waitForURL(/dashboard|transactions/, { timeout: 10000 });
  
  // Navigate to transactions page if not already there
  if (!page.url().includes('transactions')) {
    await page.goto('http://localhost:3000/transactions');
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Helper function to create a new transaction
 */
async function createTransaction(page, transaction) {
  // Click Add Transaction button
  await page.getByRole('button', { name: '+ Add Transaction' }).click();
  
  // Wait for form to appear
  await expect(page.getByRole('heading', { name: 'Add Transaction' })).toBeVisible();
  
  // Fill in transaction details
  await page.locator('select').filter({ hasText: 'ExpenseIncome' }).selectOption(transaction.type);
  await page.getByRole('spinbutton').fill(transaction.amount);
  await page.getByRole('textbox', { name: 'USD' }).fill(transaction.currency);
  
  // Select category
  const categorySelect = page.locator('select').filter({ hasText: 'Select category' });
  await categorySelect.selectOption(transaction.category);
  
  // Fill in title and note
  await page.getByRole('textbox', { name: 'e.g., Grocery shopping' }).fill(transaction.title);
  await page.getByRole('textbox', { name: 'Optional notes...' }).fill(transaction.note);
  
  // Save transaction
  await page.getByRole('button', { name: 'Save Transaction' }).click();
  
  // Wait for form to close and transaction list to update
  await expect(page.getByRole('heading', { name: 'Add Transaction' })).not.toBeVisible();
  await page.waitForTimeout(1000); // Allow time for list to refresh
}

/**
 * Helper function to count transactions in the list
 */
async function getTransactionCount(page) {
  // Count transaction items (each has Edit and Delete buttons)
  const editButtons = await page.getByRole('button', { name: 'Edit' }).count();
  return editButtons;
}

/**
 * Helper function to find a transaction by title
 */
async function findTransactionByTitle(page, title: string) {
  return page.locator(`text="${title}"`);
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('Transactions Page - Authenticated User', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  /**
   * Test 1: Authenticated user sees their transactions list
   */
  test('should display transactions list for authenticated user', async ({ page }) => {
    // Verify page loaded
    await expect(page).toHaveTitle('Home Wallet');
    await expect(page.getByRole('heading', { name: 'Transactions', level: 1 })).toBeVisible();
    
    // Verify navigation is visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Transactions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    
    // Verify transaction controls are visible
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Add Transaction' })).toBeVisible();
    
    // Verify filters section is visible
    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();
    
    // Verify at least one transaction exists (from test data)
    const transactionCount = await getTransactionCount(page);
    expect(transactionCount).toBeGreaterThan(0);
    
    // Verify transaction details are displayed
    await expect(page.getByText('Genny Craft')).toBeVisible();
    await expect(page.getByText('Freelance')).toBeVisible();
    await expect(page.getByText('+$100.00')).toBeVisible();
  });

  /**
   * Test 2: Category filter shows only matching transactions
   */
  test('should filter transactions by category', async ({ page }) => {
    // Get initial transaction count
    const initialCount = await getTransactionCount(page);
    expect(initialCount).toBeGreaterThan(0);
    
    // Apply Freelance category filter
    const categoryFilter = page.locator('select').filter({ hasText: 'All Categories' });
    await categoryFilter.selectOption('💻 Freelance');
    
    // Wait for filtering to complete
    await page.waitForTimeout(1000);
    
    // Verify only Freelance transactions are shown
    await expect(page.getByText('Genny Craft')).toBeVisible();
    await expect(page.getByText('Freelance')).toBeVisible();
    
    // Verify other category transactions are not visible
    await expect(page.getByText('Grocery')).not.toBeVisible();
    
    // Apply Gift category filter
    await categoryFilter.selectOption('🎁 Gift');
    await page.waitForTimeout(1000);
    
    // Verify only Gift transactions are shown
    await expect(page.getByText('Grandma')).toBeVisible();
    await expect(page.getByText('Gift')).toBeVisible();
    await expect(page.getByText('+$20.00')).toBeVisible();
    
    // Clear filters
    await page.getByRole('button', { name: 'Clear Filters' }).click();
    await page.waitForTimeout(1000);
    
    // Verify all transactions are shown again
    const finalCount = await getTransactionCount(page);
    expect(finalCount).toBe(initialCount);
  });

  /**
   * Test 3: Date range filter works correctly
   */
  test('should filter transactions by date range', async ({ page }) => {
    // Get initial transaction count
    const initialCount = await getTransactionCount(page);
    expect(initialCount).toBeGreaterThan(0);
    
    // Set date range to only show April 2026 transactions
    const fromDateInput = page.locator('input[type="date"]').first();
    const toDateInput = page.locator('input[type="date"]').last();
    
    await fromDateInput.fill('2026-04-01');
    await toDateInput.fill('2026-04-01');
    
    // Wait for filtering to complete
    await page.waitForTimeout(1000);
    
    // Verify only April 1, 2026 transactions are shown
    await expect(page.getByText('Genny Craft')).toBeVisible();
    await expect(page.getByText('Apr 1, 2026')).toBeVisible();
    
    // Verify March transactions are not visible
    await expect(page.getByText('Grandma')).not.toBeVisible();
    await expect(page.getByText('Grocery')).not.toBeVisible();
    
    // Change to show only March 2026 transactions
    await fromDateInput.fill('2026-03-01');
    await toDateInput.fill('2026-03-31');
    await page.waitForTimeout(1000);
    
    // Verify only March transactions are shown
    await expect(page.getByText('Grandma')).toBeVisible();
    await expect(page.getByText('Grocery')).toBeVisible();
    await expect(page.getByText('Mar 30, 2026')).toBeVisible();
    
    // Verify April transaction is not visible
    await expect(page.getByText('Genny Craft')).not.toBeVisible();
    
    // Clear filters
    await page.getByRole('button', { name: 'Clear Filters' }).click();
    await page.waitForTimeout(1000);
    
    // Verify all transactions are shown again
    const finalCount = await getTransactionCount(page);
    expect(finalCount).toBe(initialCount);
  });

  /**
   * Test 4: Creating a new transaction appears in the list
   */
  test('should create a new transaction and display it in the list', async ({ page }) => {
    // Get initial transaction count
    const initialCount = await getTransactionCount(page);
    
    // Create new expense transaction
    await createTransaction(page, NEW_TRANSACTION);
    
    // Verify transaction appears in the list
    await expect(findTransactionByTitle(page, NEW_TRANSACTION.title)).toBeVisible();
    await expect(page.getByText(NEW_TRANSACTION.category.replace('🛒 ', ''))).toBeVisible();
    await expect(page.getByText(`-$${NEW_TRANSACTION.amount}.00`)).toBeVisible();
    
    // Verify transaction count increased
    const newCount = await getTransactionCount(page);
    expect(newCount).toBe(initialCount + 1);
    
    // Create new income transaction
    await createTransaction(page, INCOME_TRANSACTION);
    
    // Verify income transaction appears in the list
    await expect(findTransactionByTitle(page, INCOME_TRANSACTION.title)).toBeVisible();
    await expect(page.getByText(INCOME_TRANSACTION.category.replace('💼 ', ''))).toBeVisible();
    await expect(page.getByText(`+$${INCOME_TRANSACTION.amount}.00`)).toBeVisible();
    
    // Verify transaction count increased again
    const finalCount = await getTransactionCount(page);
    expect(finalCount).toBe(initialCount + 2);
  });

  /**
   * Test 5: Deleting a transaction removes it from the list
   */
  test('should delete a transaction and remove it from the list', async ({ page }) => {
    // First, create a transaction to delete
    const testTransaction = {
      ...NEW_TRANSACTION,
      title: 'Transaction to Delete',
      note: 'This will be deleted in the test',
    };
    
    await createTransaction(page, testTransaction);
    
    // Verify transaction was created
    await expect(findTransactionByTitle(page, testTransaction.title)).toBeVisible();
    const countBeforeDelete = await getTransactionCount(page);
    
    // Find the transaction row and click Delete button
    const transactionRow = page.locator(`text="${testTransaction.title}"`).locator('../..');
    const deleteButton = transactionRow.getByRole('button', { name: 'Delete' });
    
    // Click delete button
    await deleteButton.click();
    
    // Handle confirmation dialog if present
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000);
    
    // Verify transaction is no longer in the list
    await expect(findTransactionByTitle(page, testTransaction.title)).not.toBeVisible();
    
    // Verify transaction count decreased
    const countAfterDelete = await getTransactionCount(page);
    expect(countAfterDelete).toBe(countBeforeDelete - 1);
  });

  /**
   * Test 6: Type filter (Income/Expense) works correctly
   */
  test('should filter transactions by type (Income/Expense)', async ({ page }) => {
    const initialCount = await getTransactionCount(page);
    expect(initialCount).toBeGreaterThan(0);
    
    // Filter by Income only
    const typeFilter = page.locator('select').filter({ hasText: 'All' }).first();
    await typeFilter.selectOption('Income');
    await page.waitForTimeout(1000);
    
    // Verify only income transactions are shown (positive amounts)
    await expect(page.getByText('+$100.00')).toBeVisible();
    await expect(page.getByText('+$20.00')).toBeVisible();
    await expect(page.getByText('-$10.00')).not.toBeVisible();
    
    // Filter by Expense only
    await typeFilter.selectOption('Expense');
    await page.waitForTimeout(1000);
    
    // Verify only expense transactions are shown (negative amounts)
    await expect(page.getByText('-$10.00')).toBeVisible();
    await expect(page.getByText('+$100.00')).not.toBeVisible();
    await expect(page.getByText('+$20.00')).not.toBeVisible();
    
    // Clear filters
    await page.getByRole('button', { name: 'Clear Filters' }).click();
    await page.waitForTimeout(1000);
    
    // Verify all transactions are shown again
    const finalCount = await getTransactionCount(page);
    expect(finalCount).toBe(initialCount);
  });

  /**
   * Test 7: Search filter works correctly
   */
  test('should filter transactions by search term', async ({ page }) => {
    const initialCount = await getTransactionCount(page);
    expect(initialCount).toBeGreaterThan(0);
    
    // Search for "Genny"
    const searchInput = page.getByRole('textbox', { name: 'Search title or notes...' });
    await searchInput.fill('Genny');
    await page.waitForTimeout(1000);
    
    // Verify only matching transaction is shown
    await expect(page.getByText('Genny Craft')).toBeVisible();
    await expect(page.getByText('Grandma')).not.toBeVisible();
    await expect(page.getByText('Grocery')).not.toBeVisible();
    
    // Search for "Grandma"
    await searchInput.clear();
    await searchInput.fill('Grandma');
    await page.waitForTimeout(1000);
    
    // Verify only Grandma transaction is shown
    await expect(page.getByText('Grandma')).toBeVisible();
    await expect(page.getByText('Genny Craft')).not.toBeVisible();
    await expect(page.getByText('Grocery')).not.toBeVisible();
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    
    // Verify all transactions are shown again
    const finalCount = await getTransactionCount(page);
    expect(finalCount).toBe(initialCount);
  });

  /**
   * Test 8: Export CSV button is functional
   */
  test('should have a functional Export CSV button', async ({ page }) => {
    // Verify Export CSV button is visible and enabled
    const exportButton = page.getByRole('button', { name: 'Export CSV' });
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
    
    // Note: Actual file download testing would require additional setup
    // This test verifies the button exists and is clickable
  });

  /**
   * Test 9: Cancel button closes Add Transaction form without saving
   */
  test('should cancel adding a transaction without saving', async ({ page }) => {
    const initialCount = await getTransactionCount(page);
    
    // Click Add Transaction button
    await page.getByRole('button', { name: '+ Add Transaction' }).click();
    await expect(page.getByRole('heading', { name: 'Add Transaction' })).toBeVisible();
    
    // Fill in some transaction details
    await page.getByRole('spinbutton').fill('75');
    await page.getByRole('textbox', { name: 'e.g., Grocery shopping' }).fill('Should Not Save');
    
    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify form is closed
    await expect(page.getByRole('heading', { name: 'Add Transaction' })).not.toBeVisible();
    
    // Verify transaction was not added
    const finalCount = await getTransactionCount(page);
    expect(finalCount).toBe(initialCount);
    await expect(page.getByText('Should Not Save')).not.toBeVisible();
  });
});

/**
 * Test Suite: Unauthenticated Access
 */
test.describe('Transactions Page - Unauthenticated User', () => {
  /**
   * Test: Unauthenticated users are redirected to login
   */
  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Attempt to access transactions page without logging in
    await page.goto('http://localhost:3000/transactions');
    
    // Verify redirect to login page
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'Home Wallet' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
