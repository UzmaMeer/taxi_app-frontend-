import axios from "axios";

// Use VITE_API_URL for production (Vercel), fallback to '/api' for local Vite proxy
const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL, timeout: 15000 });

// Helper to resolve media URLs dynamically
export const getMediaURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  const apiURL = import.meta.env.VITE_API_URL;
  if (apiURL) {
    const base = apiURL.replace(/\/api$/, "");
    return `${base}${path}`;
  }
  return path;
};

/* ─── Auth ─── */
export async function registerUser(fullName, email, password) {
  const { data } = await api.post("/auth/register", { full_name: fullName, email, password });
  return data;
}

export async function loginUser(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

/* ─── MCQs ─── */
export async function fetchAllMCQs() {
  const { data } = await api.get("/mcqs/all");
  return data;
}

export async function fetchMCQsByCategory(category) {
  const { data } = await api.get(`/mcqs/${category}`);
  return data;
}

/* ─── Evaluation ─── */
export async function submitAnswers(userName, answers) {
  const { data } = await api.post("/submit-answers", { user_name: userName, answers });
  return data;
}
