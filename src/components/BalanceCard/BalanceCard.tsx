/**
 * BalanceCard Component
 * 
 * Displays the total account balance with a growth indicator.
 * Features a dark gradient background and optional visibility toggle.
 * 
 * @figma https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=2-23
 */

import React, { useState } from 'react';
import { colors, spacing, borderRadius, typography } from '../../constants/designTokens';
import { BalanceCardProps } from './BalanceCard.types';

// Icon assets from Figma (valid for 7 days)
const iconEye = "https://www.figma.com/api/mcp/asset/22af6ba6-a547-4822-aab0-a492715c3bb7";
const iconEyeClosed = "https://www.figma.com/api/mcp/asset/ee337a34-653b-42db-9738-146bd5e0b15a";
const iconTrendUp = "https://www.figma.com/api/mcp/asset/1a5eb1ef-224d-45c2-8a60-03eb2762c7e0";

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  percentChange,
  changeDescription = 'from last month',
  onToggleVisibility,
  showBalance = true,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(showBalance);

  const handleToggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    if (onToggleVisibility) {
      onToggleVisibility(newVisibility);
    }
  };

  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const styles = {
    card: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing.lg,
      padding: spacing.xl,
      borderRadius: '16px',
      background: 'linear-gradient(172.31deg, rgb(3, 2, 19) 0%, rgba(3, 2, 19, 0.95) 50%, rgba(3, 2, 19, 0.9) 100%)',
      boxShadow: '0px 10px 15px 0px rgba(0, 0, 0, 0.1), 0px 4px 6px 0px rgba(0, 0, 0, 0.1)',
      width: '100%',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
    },
    balanceSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing.xs,
    },
    label: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.sm,
      color: 'rgba(255, 255, 255, 0.8)',
      margin: 0,
    },
    amount: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight['3xl'],
      color: colors.neutral.white,
      margin: 0,
    },
    amountHidden: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight['3xl'],
      color: colors.neutral.white,
      margin: 0,
      filter: 'blur(8px)',
      userSelect: 'none' as const,
    },
    toggleButton: {
      background: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      transition: 'background-color 0.2s',
    },
    toggleButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    growthIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      height: spacing.xl,
    },
    icon: {
      width: spacing.lg,
      height: spacing.lg,
    },
    growthText: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.sm,
      color: 'rgba(255, 255, 255, 0.9)',
      margin: 0,
    },
  };

  const isPositiveChange = percentChange >= 0;

  return (
    <div style={{ ...styles.card }} className={className} data-node-id="2:23">
      <div style={styles.header}>
        <div style={styles.balanceSection}>
          <p style={styles.label}>Total Balance</p>
          <p style={isVisible ? styles.amount : styles.amountHidden}>
            {isVisible ? formatBalance(balance) : '$••••••'}
          </p>
        </div>
        <button
          style={styles.toggleButton}
          onClick={handleToggleVisibility}
          aria-label={isVisible ? 'Hide balance' : 'Show balance'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <img
            src={isVisible ? iconEye : iconEyeClosed}
            alt=""
            style={{ width: '20px', height: '20px' }}
          />
        </button>
      </div>
      <div style={styles.growthIndicator}>
        <img src={iconTrendUp} alt="" style={styles.icon} />
        <p style={styles.growthText}>
          {isPositiveChange ? '+' : ''}{percentChange}% {changeDescription}
        </p>
      </div>
    </div>
  );
};

export default BalanceCard;
