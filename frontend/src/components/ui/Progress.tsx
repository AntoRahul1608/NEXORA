import React from 'react';

interface ProgressProps {
  value: number | string;
  label?: string;
  color?: string;
  className?: string;
}

const parseProgressValue = (value: number | string | undefined): number => {
  if (value === undefined || value === null) {
    return 0;
  }

  let numericValue: number;

  if (typeof value === 'number') {
    numericValue = value;
  } else {
    const normalized = String(value).trim().replace('%', '');
    numericValue = Number(normalized);
  }

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  if (numericValue >= 0 && numericValue <= 1) {
    numericValue *= 100;
  }

  return Math.min(Math.max(numericValue, 0), 100);
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  color,
  className = '',
}) => {
  const percentage = parseProgressValue(value);

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
