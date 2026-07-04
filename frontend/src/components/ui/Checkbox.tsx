import React from 'react';
import { useFormContext } from 'react-hook-form';

interface CheckboxProps {
  id: string;
  label: string;
  required?: boolean;
  helper_text?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  required = false,
  helper_text,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[id];

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          id={id}
          className={`mt-1 h-5 w-5 rounded border bg-dark-800/50 text-accent-primary focus:ring-accent-primary border-dark-600 transition-all cursor-pointer`}
          {...register(id, { required: required ? 'This checkbox is required' : false })}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">
            {label} {required && <span className="text-accent-error">*</span>}
          </span>
          {helper_text && !error && (
            <span className="text-xs text-dark-300">{helper_text}</span>
          )}
        </div>
      </label>
      {error && (
        <span className="text-xs text-accent-error mt-1">
          {error.message as string}
        </span>
      )}
    </div>
  );
};
