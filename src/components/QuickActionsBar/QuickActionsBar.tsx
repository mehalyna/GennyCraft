/**
 * QuickActionsBar Component
 * 
 * A horizontal row of action buttons for common wallet operations.
 * Displays icon and label for each action with consistent styling.
 * 
 * @figma https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=2-41
 */

import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../constants/designTokens';
import { QuickActionsBarProps, QuickAction } from './QuickActionsBar.types';

// SVG Icons as inline components for permanent use
const ADD_FUNDS_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SEND_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const REQUEST_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HISTORY_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ 
  actions,
  onActionClick,
  className 
}) => {
  const defaultActions: QuickAction[] = [
    { id: 'add-funds', label: 'Add Funds', icon: ADD_FUNDS_ICON },
    { id: 'send', label: 'Send', icon: SEND_ICON },
    { id: 'request', label: 'Request', icon: REQUEST_ICON },
    { id: 'history', label: 'History', icon: HISTORY_ICON },
  ];

  const actionsToRender = actions || defaultActions;

  const handleClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action.id);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      gap: spacing.md,
      width: '100%',
    },
    button: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: spacing.sm,
      padding: `${spacing.lg} ${spacing.sm}`,
      background: colors.neutral.white,
      border: `0.8px solid ${colors.functional.border}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '85.6px',
    },
    buttonHover: {
      backgroundColor: colors.neutral.grayLight,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    iconContainer: {
      width: spacing.xl,
      height: spacing.xl,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.neutral.black,
    },
    label: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.sm,
      color: colors.neutral.black,
      textAlign: 'center' as const,
      margin: 0,
      whiteSpace: 'nowrap' as const,
    },
  };

  return (
    <div style={{ ...styles.container }} className={className} data-node-id="2:41">
      {actionsToRender.map((action) => (
        <button
          key={action.id}
          style={styles.button}
          onClick={() => handleClick(action)}
          aria-label={action.label}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.buttonHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.neutral.white;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={styles.iconContainer}>
            {typeof action.icon === 'string' ? (
              <img src={action.icon} alt="" style={{ width: '24px', height: '24px' }} />
            ) : (
              action.icon
            )}
          </div>
          <p style={styles.label}>{action.label}</p>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsBar;
