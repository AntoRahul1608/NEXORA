import type { ChatResponse, EventRequest, SessionInfo, Message } from '../types/types';

const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText} — ${errorBody}`,
      response.status
    );
  }

  if (response.status === 204) {
    return null as any;
  }

  return response.json() as Promise<T>;
}

export async function sendMessage(
  sessionId: string | null,
  message: string
): Promise<ChatResponse> {
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  });
}

export async function sendEvent(
  sessionId: string,
  eventType: string,
  payload: Record<string, any>
): Promise<ChatResponse> {
  const body: EventRequest = {
    session_id: sessionId,
    event_type: eventType,
    payload,
  };
  return request<ChatResponse>('/event', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createSession(): Promise<SessionInfo> {
  return request<SessionInfo>('/session', {
    method: 'POST',
  });
}

export async function getSessions(): Promise<SessionInfo[]> {
  return request<SessionInfo[]>('/sessions');
}

export async function getHistory(sessionId: string): Promise<Message[]> {
  return request<Message[]>(`/chat/${sessionId}/history`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await request<void>(`/session/${sessionId}`, {
    method: 'DELETE',
  });
}

export async function uploadFile(
  sessionId: string,
  file: File
): Promise<{ filename: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Upload failed');
    throw new ApiError(
      `Upload failed: ${response.status} ${response.statusText} — ${errorBody}`,
      response.status
    );
  }

  return response.json();
}
