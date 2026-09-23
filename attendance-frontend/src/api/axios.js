import axios from "axios";

// withCredentials: true keeps the cookie-based flow working for same-site
// / local dev. In production (Vercel frontend + Render backend), browsers
// increasingly block that cross-site cookie outright (Chrome's third-party
// cookie restrictions), so we also attach the token as an Authorization
// header — see the interceptor below. The backend accepts either.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;