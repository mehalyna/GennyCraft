/**
 * HomePage Component
 * 
 * Main wallet dashboard showing balance card and quick actions.
 * 
 * @figma https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=2-2
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../api/accounts';
import { Layout, BalanceCard, QuickActionsBar } from '../components';
import { colors, spacing, typography } from '../constants/designTokens';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [percentChange] = useState<number>(12.5); // TODO: Calculate from historical data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const summary = await accountsApi.getSummary();
      setTotalBalance(summary.total_balance);
    } catch (err) {
      console.error('Failed to load account data:', err);
      setError('Failed to load your balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionId: string): void => {
    switch (actionId) {
      case 'add-funds':
        // TODO: Open add funds modal or navigate to accounts page
        console.log('Add Funds clicked');
        navigate('/accounts');
        break;
      case 'send':
        // Navigate to create transaction page (expense)
        navigate('/transactions?type=expense');
        break;
      case 'request':
        // Navigate to create transaction page (income)
        navigate('/transactions?type=income');
        break;
      case 'history':
        // Navigate to transactions list
        navigate('/transactions');
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  const handleBalanceVisibility = (isVisible: boolean): void => {
    // Save preference to localStorage or user settings
    localStorage.setItem('showBalance', String(isVisible));
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={styles.loading}>Loading your wallet...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.error}>
          <p>{error}</p>
          <button onClick={loadAccountData} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div style={styles.brandingSection}>
            <div style={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill={colors.neutral.black} />
                <text
                  x="16"
                  y="22"
                  fontSize="18"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  fontFamily={typography.fontFamily.primary}
                >
                  M
                </text>
              </svg>
            </div>
            <h1 style={styles.pageTitle}>MyWallet</h1>
          </div>
          <div style={styles.headerActions}>
            {/* TODO: Add notification bell and profile icons */}
          </div>
        </div>

        {/* Balance Card */}
        <div style={styles.balanceSection}>
          <BalanceCard
            balance={totalBalance}
            percentChange={percentChange}
            onToggleVisibility={handleBalanceVisibility}
            showBalance={localStorage.getItem('showBalance') !== 'false'}
          />
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsSection}>
          <QuickActionsBar onActionClick={handleQuickAction} />
        </div>

        {/* Recent Transactions Section - Placeholder */}
        <div style={styles.transactionsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              style={styles.viewAllButton}
            >
              View All
            </button>
          </div>
          <div style={styles.transactionsPlaceholder}>
            <p style={styles.placeholderText}>
              Transaction list will appear here
            </p>
            <button
              onClick={() => navigate('/transactions')}
              style={styles.primaryButton}
            >
              Go to Transactions
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div style={styles.securitySection}>
          <div style={styles.securityIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 6V12C4 16.5 7 20.5 12 22C17 20.5 20 16.5 20 12V6L12 2Z"
                stroke={colors.neutral.grayDark}
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div style={styles.securityContent}>
            <h3 style={styles.securityTitle}>Secure & Private</h3>
            <p style={styles.securityText}>
              Your financial data is encrypted and secure. We take data privacy seriously
              and never share your information with third parties.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    maxWidth: '840px',
    margin: '0 auto',
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.xl,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  brandingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: spacing.sm,
  },
  balanceSection: {
    width: '100%',
  },
  actionsSection: {
    width: '100%',
  },
  transactionsSection: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    margin: 0,
  },
  viewAllButton: {
    background: 'transparent',
    border: 'none',
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.purple,
    cursor: 'pointer',
    padding: spacing.sm,
  },
  transactionsPlaceholder: {
    background: colors.neutral.white,
    border: `1px solid ${colors.functional.border}`,
    borderRadius: '14px',
    padding: spacing['2xl'],
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: spacing.lg,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.grayDark,
    margin: 0,
  },
  primaryButton: {
    background: colors.primary.gradient,
    color: colors.neutral.white,
    border: 'none',
    borderRadius: '8px',
    padding: `${spacing.md} ${spacing.xl}`,
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
  },
  securitySection: {
    display: 'flex',
    gap: spacing.lg,
    padding: spacing.xl,
    background: colors.neutral.grayLight,
    borderRadius: '14px',
    marginTop: spacing.xl,
  },
  securityIcon: {
    flexShrink: 0,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    margin: `0 0 ${spacing.xs} 0`,
  },
  securityText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.grayDark,
    lineHeight: typography.lineHeight.sm,
    margin: 0,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    color: colors.neutral.grayDark,
  },
  error: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: '400px',
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    color: colors.semantic.error,
  },
  retryButton: {
    background: colors.primary.gradient,
    color: colors.neutral.white,
    border: 'none',
    borderRadius: '8px',
    padding: `${spacing.md} ${spacing.xl}`,
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
  },
};

export default HomePage;
