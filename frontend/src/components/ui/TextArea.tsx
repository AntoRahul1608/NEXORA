import React from 'react';
import { useFormContext } from 'react-hook-form';

interface ValidationRule {
  min_length?: number;
  max_length?: number;
  custom_message?: string;
}

interface TextAreaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helper_text?: string;
  default_value?: string;
  rows?: number;
  validation?: ValidationRule;
}

export const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  placeholder,
  required = false,
  helper_text,
  default_value = '',
  rows = 4,
  validation,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[id];

  const validationRules: any = {
    required: required ? (validation?.custom_message || `${label || id} is required`) : false,
  };

  if (validation) {
    if (validation.min_length) {
      validationRules.minLength = {
        value: validation.min_length,
        message: validation.custom_message || `Minimum length is ${validation.min_length}`,
      };
    }
    if (validation.max_length) {
      validationRules.maxLength = {
        value: validation.max_length,
        message: validation.custom_message || `Maximum length is ${validation.max_length}`,
      };
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-200">
          {label} {required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        defaultValue={default_value}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl bg-dark-800/50 border ${
          error ? 'border-accent-error focus:border-accent-error' : 'border-dark-600 focus:border-accent-primary'
        } text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all resize-none`}
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
