/**
 * CashbackCard Component Types
 */

export interface CashbackCardProps {
  /** Total cashback amount */
  totalAmount: number;
  
  /** Percentage change from previous period (can be negative) */
  percentChange: number;
  
  /** Description of the change period (e.g., "this month", "this week") */
  changeDescription?: string;
  
  /** Available cashback amount that can be withdrawn */
  availableAmount: number;
  
  /** Pending cashback amount awaiting confirmation */
  pendingAmount: number;
  
  /** Optional CSS class name for custom styling */
  className?: string;
}
