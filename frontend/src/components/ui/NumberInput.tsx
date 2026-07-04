import React from 'react';
import { useFormContext } from 'react-hook-form';

interface ValidationRule {
  min_val?: number;
  max_val?: number;
  custom_message?: string;
}

interface NumberInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helper_text?: string;
  default_value?: number;
  min?: number;
  max?: number;
  step?: number;
  validation?: ValidationRule;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  placeholder,
  required = false,
  helper_text,
  default_value,
  min,
  max,
  step = 1,
  validation,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[id];

  const validationRules: any = {
    required: required ? (validation?.custom_message || `${label || id} is required`) : false,
    valueAsNumber: true,
  };

  const finalMin = min !== undefined ? min : validation?.min_val;
  const finalMax = max !== undefined ? max : validation?.max_val;

  if (finalMin !== undefined) {
    validationRules.min = {
      value: finalMin,
      message: validation?.custom_message || `Value must be at least ${finalMin}`,
    };
  }
  if (finalMax !== undefined) {
    validationRules.max = {
      value: finalMax,
      message: validation?.custom_message || `Value must be at most ${finalMax}`,
    };
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-200">
          {label} {required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <input
        type="number"
        id={id}
        placeholder={placeholder}
        defaultValue={default_value}
        step={step}
        className={`w-full px-4 py-3 rounded-xl bg-dark-800/50 border ${
          error ? 'border-accent-error focus:border-accent-error' : 'border-dark-600 focus:border-accent-primary'
        } text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all`}
        {...register(id, validationRules)}
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
