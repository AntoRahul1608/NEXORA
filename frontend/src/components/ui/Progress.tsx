import React from 'react';

interface ProgressProps {
  value: number;
  label?: string;
  color?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  color,
  className = '',
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  const barColor = color || 'bg-gradient-to-r from-accent-primary to-accent-secondary';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {(label || value !== undefined) && (
        <div className="flex justify-between items-center text-xs font-semibold text-dark-200">
          {label && <span>{label}</span>}
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden border border-dark-600">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            color ? '' : barColor
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color ? color : undefined,
          }}
        />
      </div>
    </div>
  );
};
