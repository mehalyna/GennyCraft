import React from 'react';

/**
 * QuickActionButton component
 * A compact button with an icon and label, styled for quick action interfaces.
 * Based on Figma design: MyWallet - Button (node-id: 6:223)
 */

interface QuickActionButtonProps {
  /** The text label to display below the icon */
  label: string;
  /** The icon to display (React node or image URL) */
  icon: React.ReactNode | string;
  /** Click handler */
  onClick?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
}) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <img
          src={icon}
          alt=""
          style={styles.iconImage}
        />
      );
    }
    return icon;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.button,
        ...(disabled ? styles.disabled : {}),
      }}
    >
      <div style={styles.iconContainer}>
        {renderIcon()}
      </div>
      <div style={styles.labelContainer}>
        <p style={styles.label}>{label}</p>
      </div>
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    backgroundColor: '#ffffff',
    border: '0.8px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12.8px 0.8px',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    transition: 'all 0.2s ease',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  iconContainer: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: '100%',
    height: '100%',
    display: 'block',
    maxWidth: 'none',
  },
  labelContainer: {
    height: '15.988px',
    width: '44.15px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    color: '#0a0a0a',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    margin: 0,
  },
};

export default QuickActionButton;
