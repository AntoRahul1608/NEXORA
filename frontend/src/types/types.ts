export type ComponentType =
  | 'container' | 'form' | 'card' | 'button' | 'text' | 'markdown'
  | 'input' | 'textarea' | 'number_input' | 'email_input' | 'password_input'
  | 'dropdown' | 'checkbox' | 'radio' | 'date_picker' | 'time_picker'
  | 'table' | 'chart' | 'upload' | 'image' | 'tabs' | 'modal'
  | 'divider' | 'badge' | 'list' | 'progress' | 'accordion';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'heatmap';
export type AgentState = 'collecting_information' | 'waiting_for_user' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ValidationRule {
  min_length?: number;
  max_length?: number;
  min_val?: number;
  max_val?: number;
  pattern?: string;
  custom_message?: string;
}

export interface UIComponent {
  id: string;
  component: ComponentType;
  props?: Record<string, any>;
  children?: UIComponent[];
  validation?: ValidationRule;
}

export interface UIAction {
  id: string;
  label: string;
  action_type: string;
  payload?: Record<string, any>;
}

export interface AgentResponse {
  response: string;
  state: AgentState;
  ui?: UIComponent | null;
  actions: UIAction[];
  memory: Record<string, any>;
}

export interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  ui?: UIComponent | null;
  actions?: UIAction[];
}

export interface ChatRequest {
  session_id?: string | null;
  message: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  state: AgentState;
  ui?: Record<string, any> | null;
  actions: any[];
  memory: Record<string, any>;
}

export interface EventRequest {
  session_id: string;
  event_type: string;
  payload: Record<string, any>;
}

export interface SessionInfo {
  id: string;
  created_at: string;
  updated_at: string;
}
