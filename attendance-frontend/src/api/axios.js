import axios from "axios";

// withCredentials: true is required so the httpOnly JWT cookie set by the
// backend is sent automatically with every request — the token itself is
// never touched or stored by frontend JS.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

export default api;
