import React from 'react';

interface AddCardButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const AddCardButton: React.FC<AddCardButtonProps> = ({ onClick, disabled = false }) => {
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
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="4"
            width="16"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="2"
            y1="8"
            x2="18"
            y2="8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <span style={styles.label}>Add Card</span>
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12.8px 0.8px',
    backgroundColor: '#ffffff',
    border: '0.8px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  },
  iconContainer: {
    width: '20px',
    height: '20px',
    color: '#0a0a0a',
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#0a0a0a',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default AddCardButton;
