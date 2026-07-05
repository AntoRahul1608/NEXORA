import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { sendEvent } from '../../api/api';
import { useNexoraStore } from '../../store/store';
import { Loader2 } from 'lucide-react';

interface FormProps {
  id: string;
  submit_label?: string;
  hide_submit_button?: boolean;
  children?: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ id, submit_label = 'Submit', hide_submit_button = false, children }) => {
  const methods = useForm();
  const sessionId = useNexoraStore((state) => state.sessionId);
  const setLoading = useNexoraStore((state) => state.setLoading);
  const isLoading = useNexoraStore((state) => state.isLoading);
  const setCurrentUI = useNexoraStore((state) => state.setCurrentUI);
  const setAgentState = useNexoraStore((state) => state.setAgentState);
  const setActions = useNexoraStore((state) => state.setActions);

  // If the dynamic schema explicitly includes a button component, we hide the default one
  const childrenArray = React.Children.toArray(children);
  const hasButtonChild = childrenArray.some(
    (child) => React.isValidElement(child) && (child.props as any)?.node?.component === 'button'
  );

  const showSubmit = !hide_submit_button && !hasButtonChild;

  const onSubmit = async (data: any) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      // Append a user-visible assistant note indicating submission
      // But we primarily submit via /event endpoint
      const response = await sendEvent(sessionId, 'form_submit', {
        form_id: id,
        ...data,
      });

      // Update state with result
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
      console.error('Error submitting dynamic form:', error);
      useNexoraStore.getState().addMessage({
        role: 'assistant',
        content: `Error submitting form: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {children}
        </div>
        {showSubmit && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg glow-primary"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              submit_label
            )}
          </button>
        )}
      </form>
    </FormProvider>
  );
};
