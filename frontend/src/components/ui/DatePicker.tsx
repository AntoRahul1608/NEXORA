import React from 'react';
import { useFormContext } from 'react-hook-form';

interface DatePickerProps {
  id: string;
  label?: string;
  required?: boolean;
  helper_text?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  required = false,
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
      <input
        type="date"
        id={id}
        className={`w-full px-4 py-3 rounded-xl bg-dark-800/50 border ${
          error ? 'border-accent-error focus:border-accent-error' : 'border-dark-600 focus:border-accent-primary'
        } text-white focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all cursor-pointer`}
        {...register(id, { required: required ? `${label || id} is required` : false })}
      />
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
