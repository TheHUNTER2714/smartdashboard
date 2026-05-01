// Custom backend client. Set VITE_API_URL to your deployed Express server.
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
const TOKEN_KEY = "sd_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  course: string;
  college: string | null;
  phone: string | null;
  roll_no: string | null;
  location: string | null;
  age: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type StudentInput = Omit<Student, "id" | "user_id" | "created_at" | "updated_at">;

export const api = {
  signup: (body: { email: string; password: string; fullName: string }) =>
    request<{ token: string; user: AppUser }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  signin: (body: { email: string; password: string }) =>
    request<{ token: string; user: AppUser }>("/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<{ user: AppUser }>("/auth/me"),
  forgotPassword: (email: string) =>
    request<{ ok: true; resetUrl?: string; devNote?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ ok: true }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  listStudents: () => request<Student[]>("/students"),
  getStudent: (id: string) => request<Student>(`/students/${id}`),
  createStudent: (body: StudentInput) => request<Student>("/students", { method: "POST", body: JSON.stringify(body) }),
  updateStudent: (id: string, body: StudentInput) =>
    request<Student>(`/students/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteStudent: (id: string) => request<{ ok: true }>(`/students/${id}`, { method: "DELETE" }),
};

export { API_URL };
