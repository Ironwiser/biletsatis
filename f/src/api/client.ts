import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export function getApiOrigin() {
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api") as string;
  // "http://host:port/api" -> "http://host:port"
  return base.replace(/\/api\/?$/, "");
}

export function setAccessToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

