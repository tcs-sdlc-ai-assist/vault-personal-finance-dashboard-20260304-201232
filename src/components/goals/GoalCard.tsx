import React from 'react';
import { SavingsGoal, Category } from 'src/types/index';
import { cn } from 'src/lib/utils';
import { formatCurrency, formatDate, formatPercentage } from 'src/lib/formatters';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from 'src/lib/constants';
import ProgressBar from 'src/components/ui/ProgressBar';
import Badge from 'src/components/ui/Badge';
import Button from 'src/components/ui/Button';
import Tooltip from 'src/components/ui/Tooltip';
import { PiggyBank, Calendar, CheckCircle, Archive, Edit, Trash2 } from 'lucide-react';

/************************************************************
 * GoalCard.tsx
 * Vault - Savings goal card for goals page.
 * - Displays goal name, progress, deadline, category, and actions.
 * - Responsive, accessible, and animated.
 ************************************************************/

/**
 * Props for GoalCard component.
 */
export interface GoalCardProps {
  goal: SavingsGoal;
  category?: Category;
  onEdit?: (goal: SavingsGoal) => void;
  onArchive?: (goal: SavingsGoal) => void;
  onDelete?: (goal: SavingsGoal) => void;
  className?: string;
}

/**
 * GoalCard - Savings goal card with progress indicator, deadline, and actions.
 */
const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  category,
  onEdit,
  onArchive,
  onDelete,
  className,
}) => {
  // Progress calculation
  const progress =
    goal.targetAmount > 0
      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
      : 0;

  // Status badge
  const statusBadge = (() => {
    switch (goal.status) {
      case 'active':
        return (
          <Badge color="success" icon={PiggyBank}>
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge color="brand" icon={CheckCircle}>
            Completed
          </Badge>
        );
      case 'archived':
        return (
          <Badge color="neutral" icon={Archive}>
            Archived
          </Badge>
        );
      default:
        return null;
    }
  })();

  // Category color/icon
  const catColor =
    category?.color
      ? CATEGORY_COLOR_MAP[category.id] || category.color
      : CATEGORY_COLOR_MAP['savings'];
  const catIcon =
    category?.icon
      ? CATEGORY_ICON_MAP[category.id] || category.icon
      : 'PiggyBank';

  // Deadline display
  const deadline =
    goal.endDate && goal.endDate !== ''
      ? formatDate(goal.endDate, 'MMM d, yyyy')
      : null;

  // Accessibility: aria-label for actions
  const ariaEdit = `Edit savings goal "${goal.name}"`;
  const ariaArchive = `Archive savings goal "${goal.name}"`;
  const ariaDelete = `Delete savings goal "${goal.name}"`;

  // Card classes
  const cardClasses = cn(
    'glass shadow-md rounded-lg p-4 flex flex-col gap-3 transition-all hover:shadow-lg',
    className
  );

  return (
    <div className={cardClasses} aria-label={`Savings goal card: ${goal.name}`}>
      {/* Header: Name + Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Category icon */}
          <Badge
            color={catColor}
            icon={PiggyBank}
            className="mr-1"
            aria-label={category?.name || 'Savings'}
          />
          <span className="font-heading font-bold text-lg truncate" title={goal.name}>
            {goal.name}
          </span>
        </div>
        {statusBadge}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <ProgressBar
          value={progress}
          color={catColor}
          className="flex-1 h-4"
          aria-label={`Progress: ${formatPercentage(progress)}`}
        />
        <span className="text-sm font-mono text-neutral-500 min-w-[60px] text-right">
          {formatPercentage(progress)}
        </span>
      </div>

      {/* Amounts */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">Saved</span>
          <span className="font-semibold text-success">
            {formatCurrency(goal.currentAmount)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">Target</span>
          <span className="font-semibold text-brand">
            {formatCurrency(goal.targetAmount)}
          </span>
        </div>
      </div>

      {/* Deadline + Category */}
      <div className="flex items-center gap-3 mt-2">
        {deadline && (
          <Tooltip content={`Deadline: ${deadline}`}>
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {deadline}
            </span>
          </Tooltip>
        )}
        {category && (
          <Tooltip content={`Category: ${category.name}`}>
            <span
              className="flex items-center gap-1 text-xs text-neutral-500"
              aria-label={`Category: ${category.name}`}
            >
              {/* Category icon */}
              {catIcon && (
                <span className="inline-block w-4 h-4">
                  {/* Lucide icon dynamic import */}
                  {/* Fallback to PiggyBank if icon not found */}
                  <PiggyBank className="w-4 h-4" aria-hidden="true" />
                </span>
              )}
              {category.name}
            </span>
          </Tooltip>
        )}
      </div>

      {/* Notes */}
      {goal.notes && goal.notes.trim().length > 0 && (
        <div className="mt-2 text-xs text-neutral-600 line-clamp-2" title={goal.notes}>
          {goal.notes}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={ariaEdit}
            onClick={() => onEdit(goal)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}
        {onArchive && goal.status === 'active' && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={ariaArchive}
            onClick={() => onArchive(goal)}
            icon={<Archive className="w-4 h-4" />}
          >
            Archive
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={ariaDelete}
            onClick={() => onDelete(goal)}
            icon={<Trash2 className="w-4 h-4 text-error" />}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoalCard;