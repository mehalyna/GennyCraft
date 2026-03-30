/**
 * Type definitions for BalanceCard component
 */

export interface BalanceCardProps {
  /**
   * The total balance amount to display
   */
  balance: number;

  /**
   * Percentage change from previous period
   * Positive values show growth, negative show decline
   */
  percentChange: number;

  /**
   * Description text for the change indicator
   * @default 'from last month'
   */
  changeDescription?: string;

  /**
   * Callback when visibility toggle is clicked
   */
  onToggleVisibility?: (isVisible: boolean) => void;

  /**
   * Initial visibility state
   * @default true
   */
  showBalance?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;
}
