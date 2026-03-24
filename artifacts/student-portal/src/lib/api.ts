const API_BASE = "/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch (e) {
      // Ignore JSON parse error if response isn't JSON
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;
  
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return text as unknown as T;
  }
}
