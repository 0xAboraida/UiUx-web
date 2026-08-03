/**
 * Zad API Service
 * =================
 * Extracted from the Flutter mobile app and adapted for web.
 * Base URL: https://abourida-zad-backend.hf.space/
 */

const API_BASE_URL = 'https://abourida-zad-backend.hf.space';

// ─── Types ───────────────────────────────────────────────────

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserModel {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserModel;
}

// Chat
export interface ChatRequest {
  session_id: number;
  query: string;
  domain: number;
}

export interface CitationDTO {
  book_title: string;
  madhhab: string;
  author: string;
  author_death: string;
  total_parts: number;
  part: string;
  page_id: number;
  hierarchy: string;
  source_url: string;
}

export interface ChatResponseDTO {
  answer: string;
  citations: Record<string, CitationDTO>;
}

// Sessions
export interface ChatSessionDTO {
  id: number | null;
  name: string | null;
  createdAt: string | null;
  messageCount: number | null;
}

export interface HistoryCitationDTO {
  bookTitle: string;
  madhhab: string;
  author: string;
  authorDeath: string;
  totalParts: number;
  part: string;
  pageId: number;
  hierarchy: string;
  sourceUrl: string;
}

export interface HistoryMessageDTO {
  id: number;
  question: string;
  answer: string;
  citations: HistoryCitationDTO[];
  createdAt: string;
}

export interface ChatHistoryResponseDTO {
  session: ChatSessionDTO;
  messages: HistoryMessageDTO[];
}

// ─── Token Management ────────────────────────────────────────

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('zad-auth-token', token);
  } else {
    localStorage.removeItem('zad-auth-token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('zad-auth-token');
  }
  return authToken;
}

function getHeaders(includeAuth = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/plain',
  };
  const token = getAuthToken();
  if (includeAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── API Calls ───────────────────────────────────────────────

// ── Auth ──

/** POST api/Auth/register */
export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/Auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Register failed: ${res.status}`);
  return res.json();
}

/** POST api/Auth/login */
export async function login(body: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

// ── Chat Sessions ──

/** POST api/Chat/sessions — Create a new session */
export async function createSession(body: { name?: string }): Promise<ChatSessionDTO> {
  const res = await fetch(`${API_BASE_URL}/api/Chat/sessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create session failed: ${res.status}`);
  return res.json();
}

/** GET api/Chat/sessions — List all sessions */
export async function getSessions(): Promise<ChatSessionDTO[]> {
  const res = await fetch(`${API_BASE_URL}/api/Chat/sessions`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Get sessions failed: ${res.status}`);
  return res.json();
}

/** GET api/Chat/sessions/:id — Get session history */
export async function getSessionHistory(sessionId: number): Promise<ChatHistoryResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/api/Chat/sessions/${sessionId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Get history failed: ${res.status}`);
  return res.json();
}

/** POST api/Chat/sessions/:id/messages — Send message within a session */
export async function sendSessionMessage(
  sessionId: number,
  body: { query: string; domain?: number }
): Promise<HistoryMessageDTO> {
  const res = await fetch(`${API_BASE_URL}/api/Chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Send message failed: ${res.status}`);
  return res.json();
}

// ── Chat (Direct / Legacy) ──

/** POST api/v1/chat/ask — Ask the RAG chatbot directly */
export async function askChat(body: ChatRequest): Promise<ChatResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat/ask`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ask chat failed: ${res.status}`);
  return res.json();
}
