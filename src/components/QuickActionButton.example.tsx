/**
 * Usage example for QuickActionButton component
 * This file shows how to use the component from the Figma design.
 * You can delete this file after reviewing.
 */

import React from 'react';
import QuickActionButton from './QuickActionButton';

/**
 * Example SVG icon (paper plane/send icon from the Figma design)
 * You can replace this with any icon from your icon library
 */
const RedeemIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 2L9 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 2L12 18L9 11L2 8L18 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QuickActionButtonExample: React.FC = () => {
  const handleRedeem = () => {
    console.log('Redeem clicked');
  };

  return (
    <div style={{ display: 'flex', gap: '16px', padding: '20px' }}>
      {/* Example 1: Using with React component icon */}
      <div style={{ width: '80px' }}>
        <QuickActionButton
          label="Redeem"
          icon={<RedeemIcon />}
          onClick={handleRedeem}
        />
      </div>

      {/* Example 2: Using with image URL (from Figma asset) */}
      <div style={{ width: '80px' }}>
        <QuickActionButton
          label="Redeem"
          icon="https://www.figma.com/api/mcp/asset/df0c81c6-23b1-4f2d-bc8a-2367042be579"
          onClick={handleRedeem}
        />
      </div>

      {/* Example 3: Disabled state */}
      <div style={{ width: '80px' }}>
        <QuickActionButton
          label="Redeem"
          icon={<RedeemIcon />}
          disabled
        />
      </div>
    </div>
  );
};

export default QuickActionButtonExample;
