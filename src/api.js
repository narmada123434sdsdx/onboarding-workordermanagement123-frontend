// Detect if the build is production or development
import axios from "axios";
axios.defaults.withCredentials = true;
const isProduction = import.meta.env.MODE === "production";

/**
 * MAIN BACKEND URLS
 * - One for regular module (provider/contractor)
 * - One for admin module
 */
export const BASE_URLS = {
  user: isProduction
    ? "https://your-production-user-api.com"   // 🌍 production user API
    : "http://localhost:5000",                 // 💻 local dev user API

  admin: isProduction
    ? "https://your-production-admin-api.com"  // 🌍 production admin API
    : "http://localhost:5000",                 // 💻 local dev admin API
};

export const BASE_URL = "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    mode: "cors",
    headers: {
      "ngrok-skip-browser-warning": "true",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });

  // Read body safely once
  const raw = await res.text();
  const tryJson = () => {
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  };
  const data = tryJson();

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      raw ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  // 204/empty body: return null
  return data ?? null;
}

export function apiGet(path) {
  return apiFetch(path, { method: "GET" });
}
export function apiPost(path, body) {
  return apiFetch(path, { method: "POST", body: JSON.stringify(body) });
}
export function apiPut(path, body) {
  return apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
}
export function apiDelete(path) {
  return apiFetch(path, { method: "DELETE" });
}