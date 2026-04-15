/**
 * CashbackCard Component
 * 
 * Displays total cashback with breakdown of available and pending amounts.
 * Features a gradient background with percentage change indicator.
 * 
 * @figma https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=6-183
 */

import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../constants/designTokens';
import { CashbackCardProps } from './CashbackCard.types';

// SVG Icons as inline components
const GiftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 12V22H4V12M2 7H22V12H2V7ZM12 22V7M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7ZM12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M8 12V4M4 8L8 4L12 8" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CashbackCard: React.FC<CashbackCardProps> = ({
  totalAmount,
  percentChange,
  changeDescription = 'this month',
  availableAmount,
  pendingAmount,
  className,
}) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (percent: number): string => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent}%`;
  };

  return (
    <div style={styles.card} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <GiftIcon />
        </div>
        <p style={styles.headerText}>Total Cashback</p>
      </div>

      {/* Main Amount */}
      <div style={styles.mainSection}>
        <p style={styles.totalAmount}>{formatCurrency(totalAmount)}</p>
        
        {/* Change Indicator */}
        <div style={styles.changeIndicator}>
          <div style={styles.arrowIcon}>
            <ArrowUpIcon />
          </div>
          <p style={styles.changeText}>
            {formatPercentage(percentChange)} {changeDescription}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div style={styles.breakdown}>
        <div style={styles.breakdownCard}>
          <p style={styles.breakdownLabel}>Available</p>
          <p style={styles.breakdownAmount}>{formatCurrency(availableAmount)}</p>
        </div>
        <div style={styles.breakdownCard}>
          <p style={styles.breakdownLabel}>Pending</p>
          <p style={styles.breakdownAmount}>{formatCurrency(pendingAmount)}</p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: colors.primary.gradient,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: '64px', // 88px from top - 24px padding = 64px
  },
  iconContainer: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral.white,
    opacity: 0.9,
    margin: 0,
  },
  mainSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    marginBottom: '48px', // Space to breakdown section
  },
  totalAmount: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight['3xl'],
    color: colors.neutral.white,
    margin: 0,
  },
  changeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.9,
  },
  arrowIcon: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral.white,
    margin: 0,
  },
  breakdown: {
    display: 'flex',
    gap: '16px',
  },
  breakdownCard: {
    background: colors.functional.overlay,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  breakdownLabel: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.xs,
    color: colors.neutral.white,
    opacity: 0.9,
    margin: 0,
  },
  breakdownAmount: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.xl,
    color: colors.neutral.white,
    margin: 0,
  },
};

export default CashbackCard;
