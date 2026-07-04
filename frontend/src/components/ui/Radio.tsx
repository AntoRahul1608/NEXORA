import React from 'react';
import { useFormContext } from 'react-hook-form';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioProps {
  id: string;
  label?: string;
  options?: RadioOption[];
  required?: boolean;
  helper_text?: string;
}

export const Radio: React.FC<RadioProps> = ({
  id,
  label,
  options = [],
  required = false,
  helper_text,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[id];

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <span className="text-sm font-medium text-dark-200">
          {label} {required && <span className="text-accent-error">*</span>}
        </span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              value={opt.value}
              className="h-4 w-4 border-dark-600 bg-dark-800/50 text-accent-primary focus:ring-accent-primary cursor-pointer"
              {...register(id, { required: required ? 'Please select an option' : false })}
            />
            <span className="text-sm text-dark-200 group-hover:text-white transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      {helper_text && !error && (
        <span className="text-xs text-dark-300 mt-1">{helper_text}</span>
      )}
      {error && (
        <span className="text-xs text-accent-error mt-1">
          {error.message as string}
        </span>
      )}
    </div>
  );
};
