// src/components/ui/EmptyState.tsx
import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[300px]">
      {icon && <div className="mb-4">{icon}</div>}
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-base text-textLight mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onClick={onAction}
          variant="primary"
          className="min-w-[200px]"
        />
      )}
    </div>
  );
};

export default EmptyState;