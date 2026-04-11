const API_BASE = import.meta.env.VITE_API_URL || "https://placement-student-information-portal.onrender.com";// ✅ FIXED (removed /api)

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

  // 🔥 AUTO FIX: prevent missing slash
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  // 🔥 FINAL FIX: ensure /api prefix exists
  if (!endpoint.startsWith("/api")) {
    endpoint = "/api" + endpoint;
  }

  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 🔥 DEBUG LOG (VERY IMPORTANT)
  console.log("🌐 API CALL:", `${API_BASE}${endpoint}`);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";

    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch (e) {}

    console.error("❌ API ERROR:", errorMsg);

    throw new Error(errorMsg);
  }

  const text = await response.text();

  // ✅ HANDLE EMPTY RESPONSE
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return text as unknown as T;
  }
}