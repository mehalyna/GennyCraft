/**
 * Type definitions for QuickActionsBar component
 */

import { ReactNode } from 'react';

export interface QuickAction {
  /**
   * Unique identifier for the action
   */
  id: string;

  /**
   * Display label for the action
   */
  label: string;

  /**
   * Icon to display (can be URL or React element)
   */
  icon: string | ReactNode;

  /**
   * Optional badge count to display
   */
  badge?: number;

  /**
   * Whether the action is disabled
   */
  disabled?: boolean;
}

export interface QuickActionsBarProps {
  /**
   * Array of actions to display
   * If not provided, default actions will be shown: Add Funds, Send, Request, History
   */
  actions?: QuickAction[];

  /**
   * Callback when an action is clicked
   */
  onActionClick?: (actionId: string) => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}
