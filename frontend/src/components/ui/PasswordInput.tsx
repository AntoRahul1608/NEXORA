import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

interface ValidationRule {
  min_length?: number;
  custom_message?: string;
}

interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helper_text?: string;
  validation?: ValidationRule;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  placeholder,
  required = false,
  helper_text,
  validation,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors } } = useFormContext();
  const error = errors[id];

  const validationRules: any = {
    required: required ? (validation?.custom_message || `${label || id} is required`) : false,
  };

  if (validation?.min_length) {
    validationRules.minLength = {
      value: validation.min_length,
      message: validation.custom_message || `Password must be at least ${validation.min_length} characters`,
    };
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-200">
          {label} {required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          placeholder={placeholder}
          className={`w-full pl-4 pr-12 py-3 rounded-xl bg-dark-800/50 border ${
            error ? 'border-accent-error focus:border-accent-error' : 'border-dark-600 focus:border-accent-primary'
          } text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-all`}
          {...register(id, validationRules)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
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
