import axios from "axios";

// Use VITE_API_URL for production (Vercel), fallback to '/api' for local proxy
const fallbackURL = "/api";
const baseURL = import.meta.env.VITE_API_URL || fallbackURL;
const api = axios.create({ baseURL, timeout: 15000 });

// Helper to resolve media URLs dynamically
export const getMediaURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  const apiURL = import.meta.env.VITE_API_URL || fallbackURL;
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
  try {
    // Always fetch fresh data from the backend (never serve stale cache as primary)
    const { data } = await api.get("/mcqs/all");
    // After a successful fetch, clear any old cache so it never gets served as stale
    try {
      localStorage.removeItem("driveiq_mcqs_cache");
    } catch (e) {
      // ignore
    }
    return data;
  } catch (err) {
    // ONLY use cache as fallback when genuinely offline / backend is down
    console.warn("[DriveIQ] Backend unreachable — falling back to cached MCQs:", err?.message);
    const cached = localStorage.getItem("driveiq_mcqs_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.warn("[DriveIQ] Serving", parsed.length, "MCQs from offline cache.");
          return parsed;
        }
      } catch (e) {
        // ignore malformed cache
      }
    }
    throw err;
  }
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

export async function fetchUserHistory(userName) {
  try {
    const { data } = await api.get(`/results/history/${userName}`);
    return data;
  } catch (err) {
    return [];
  }
}

export async function fetchLatestResult(userName) {
  try {
    const { data } = await api.get(`/result/${userName}`);
    return data;
  } catch (err) {
    return null;
  }
}

/* ─── Admin API Calls ─── */
export async function adminFetchAllMCQs(token) {
  const { data } = await api.get("/admin/mcqs", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function adminCreateMCQ(mcqData, token) {
  const { data } = await api.post("/admin/mcqs", mcqData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function adminUpdateMCQ(category, id, mcqData, token) {
  const { data } = await api.put(`/admin/mcqs/${category}/${id}`, mcqData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function adminDeleteMCQ(category, id, token) {
  const { data } = await api.delete(`/admin/mcqs/${category}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function adminUploadFile(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/admin/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
}

export async function adminImportMCQs(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/admin/mcqs/import", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
}

export async function adminFetchResults(token) {
  const { data } = await api.get("/admin/results", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function adminDeleteResult(resultId, token) {
  const { data } = await api.delete(`/admin/results/${resultId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}



