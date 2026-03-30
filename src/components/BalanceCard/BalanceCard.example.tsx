/**
 * BalanceCard Usage Example
 * 
 * Demonstrates how to use the BalanceCard component
 * in your pages with real account data.
 */

import React from 'react';
import { BalanceCard } from './BalanceCard';

// Example: Simple usage with static data
export const BasicExample = () => (
  <BalanceCard
    balance={2847.65}
    percentChange={12.5}
  />
);

// Example: With custom description
export const CustomDescriptionExample = () => (
  <BalanceCard
    balance={1523.40}
    percentChange={-3.2}
    changeDescription="from last week"
  />
);

// Example: With visibility callback
export const WithCallbackExample = () => {
  const handleVisibilityChange = (isVisible: boolean) => {
    console.log('Balance visibility:', isVisible);
    // You could track this in analytics or save to user preferences
  };

  return (
    <BalanceCard
      balance={2847.65}
      percentChange={12.5}
      onToggleVisibility={handleVisibilityChange}
    />
  );
};

// Example: Initially hidden balance
export const InitiallyHiddenExample = () => (
  <BalanceCard
    balance={2847.65}
    percentChange={12.5}
    showBalance={false}
  />
);

// Example: Integration with Dashboard (pseudo-code)
export const DashboardIntegration = () => {
  // Fetch balance from API
  const [accountData, setAccountData] = React.useState({
    balance: 0,
    percentChange: 0,
  });

  React.useEffect(() => {
    // Replace with your actual API call
    fetch('/api/accounts/summary')
      .then(res => res.json())
      .then(data => {
        setAccountData({
          balance: data.total_balance,
          percentChange: data.month_change_percent,
        });
      });
  }, []);

  return (
    <div style={{ maxWidth: '1024px', padding: '24px' }}>
      <BalanceCard
        balance={accountData.balance}
        percentChange={accountData.percentChange}
      />
    </div>
  );
};
