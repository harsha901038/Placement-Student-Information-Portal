import {
  mockProfile, mockAttendance, mockResults, mockJobs, mockApplications,
  mockResume, mockResumeScore, mockDashboard, mockAdminStudents,
  mockAdminJobs, mockAdminApplications, DEMO_STUDENT_USER, DEMO_ADMIN_USER
} from "./mock-data";

const API_BASE = "/api";

export const DEMO_CREDENTIALS = {
  student: { email: "student@demo.com", password: "demo1234" },
  admin:   { email: "admin@demo.com",   password: "demo1234" },
};

function isDemoMode(): boolean {
  return localStorage.getItem("demo_mode") === "true";
}

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mockHandler(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  await delay();
  const method = options.method?.toUpperCase() || "GET";

  // AUTH
  if (endpoint === "/auth/login" && method === "POST") {
    const body = JSON.parse(options.body as string);
    if (body.email === DEMO_CREDENTIALS.admin.email) {
      return { token: "demo-admin-token", user: DEMO_ADMIN_USER };
    }
    return { token: "demo-student-token", user: DEMO_STUDENT_USER };
  }
  if (endpoint === "/auth/register" && method === "POST") {
    return { token: "demo-student-token", user: DEMO_STUDENT_USER };
  }

  // STUDENT
  if (endpoint === "/student/profile") {
    if (method === "PUT") return { ...mockProfile, ...JSON.parse(options.body as string) };
    return mockProfile;
  }
  if (endpoint.startsWith("/student/jobs")) return mockJobs;
  if (endpoint.startsWith("/student/apply/") && method === "POST") {
    return { _id: "new-app", studentId: "demo-student-001", jobId: endpoint.split("/")[3], status: "applied", appliedAt: new Date().toISOString() };
  }
  if (endpoint === "/student/applications") return mockApplications;
  if (endpoint === "/student/attendance") {
    if (method === "POST") return mockAttendance;
    return mockAttendance;
  }
  if (endpoint === "/student/results") {
    if (method === "POST") return { ...JSON.parse(options.body as string), _id: "new-sem", sgpa: 8.5, cgpa: 8.7 };
    return mockResults;
  }
  if (endpoint === "/student/resume") {
    if (method === "PUT") return JSON.parse(options.body as string);
    return mockResume;
  }
  if (endpoint === "/student/resume/score" && method === "POST") return mockResumeScore;

  // ADMIN
  if (endpoint === "/admin/dashboard") return mockDashboard;
  if (endpoint.startsWith("/admin/students")) return mockAdminStudents;
  if (endpoint === "/admin/jobs") {
    if (method === "POST") {
      const body = JSON.parse(options.body as string);
      return { ...body, _id: `job-${Date.now()}`, createdAt: new Date().toISOString() };
    }
    return mockAdminJobs;
  }
  if (endpoint.startsWith("/admin/jobs/")) {
    if (method === "DELETE") return { message: "Job deleted successfully" };
    if (method === "PUT") return { ...JSON.parse(options.body as string), _id: endpoint.split("/")[3] };
  }
  if (endpoint === "/admin/applications") return mockAdminApplications;
  if (endpoint.startsWith("/admin/applications/") && method === "PUT") {
    return { message: "Application status updated" };
  }

  return {};
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isDemoMode()) {
    return mockHandler(endpoint, options) as Promise<T>;
  }

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
      // ignore
    }
    throw new Error(errorMsg);
  }

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return text as unknown as T;
  }
}
