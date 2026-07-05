import React from 'react';
import { useFormContext } from 'react-hook-form';
import { sendEvent } from '../../api/api';
import { useNexoraStore } from '../../store/store';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  action_id?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  action_id,
  disabled = false,
}) => {
  const sessionId = useNexoraStore((state) => state.sessionId);
  const isLoading = useNexoraStore((state) => state.isLoading);
  const setLoading = useNexoraStore((state) => state.setLoading);
  const setCurrentUI = useNexoraStore((state) => state.setCurrentUI);
  const setAgentState = useNexoraStore((state) => state.setAgentState);
  const setActions = useNexoraStore((state) => state.setActions);

  const methods = useFormContext();
  const isInsideForm = !!methods;

  const handleClick = async (e: React.MouseEvent) => {
    // If inside a form and it's a primary button without a specific non-submit action, let the form handle it natively.
    if (isInsideForm && variant === 'primary' && (!action_id || action_id === 'submit')) {
      return; // form's onSubmit will handle this
    }

    e.preventDefault();
    if (!action_id || !sessionId) return;
    setLoading(true);
    try {
      const response = await sendEvent(sessionId, 'button_click', {
        action_id,
        button_label: label,
      });

      if (response.response) {
        useNexoraStore.getState().addMessage({
          role: 'assistant',
          content: response.response,
          ui: response.ui as any,
          actions: response.actions as any,
        });
      }

      setCurrentUI(response.ui as any);
      setAgentState(response.state);
      setActions(response.actions as any);
    } catch (error) {
      console.error('Error handling button click event:', error);
      useNexoraStore.getState().addMessage({
        role: 'assistant',
        content: `Error invoking action: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:opacity-95 shadow-lg glow-primary active:scale-[0.98]',
    secondary: 'bg-dark-800 border border-dark-600 text-white hover:bg-dark-700 active:scale-[0.98]',
    danger: 'bg-accent-error text-white hover:opacity-90 active:scale-[0.98]',
    ghost: 'bg-transparent text-dark-200 hover:text-white hover:bg-white/5 active:scale-[0.98]',
  };

  const isSubmit = isInsideForm && variant === 'primary' && (!action_id || action_id === 'submit');

  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      onClick={isSubmit ? undefined : handleClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]}`}
    >
      {isLoading && action_id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : null}
      {label}
    </button>
  );
};
