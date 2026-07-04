import React from 'react';
import { useFormContext } from 'react-hook-form';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: DropdownOption[];
  helper_text?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  placeholder = 'Select an option',
  required = false,
  options = [],
  helper_text,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[id];

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-200">
          {label} {required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full px-4 py-3 rounded-xl bg-dark-800/50 border ${
            error ? 'border-accent-error focus:border-accent-error' : 'border-dark-600 focus:border-accent-primary'
          } text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all appearance-none cursor-pointer`}
          {...register(id, { required: required ? `${label || id} is required` : false })}
        >
          <option value="" disabled className="bg-dark-900 text-dark-400">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dark-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-300"></div>
      </div>
      {helper_text && !error && (
        <span className="text-xs text-dark-300">{helper_text}</span>
      )}
      {error && (
        <span className="text-xs text-accent-error">
          {error.message as string}
        </span>
      )}
    </div>
  );
};
