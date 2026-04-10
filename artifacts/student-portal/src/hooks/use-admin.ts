import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { 
  DashboardStats, StudentProfile, Job, CreateJobRequest, 
  ApplicationWithDetails, UpdateApplicationRequest 
} from "@workspace/api-client-react";

// ⚠️ KEEP BASE_URL but DON'T use it for apiFetch (important)
const BASE_URL = "http://localhost:5000";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiFetch<DashboardStats>(`/admin/dashboard`),
  });
}

export function useAdminStudents(filters: { minCgpa?: number; skills?: string; search?: string; minAttendance?: number }) {
  const query = new URLSearchParams();
  if (filters.minCgpa) query.set("minCgpa", filters.minCgpa.toString());
  if (filters.skills) query.set("skills", filters.skills);
  if (filters.search) query.set("search", filters.search);
  if (filters.minAttendance) query.set("minAttendance", filters.minAttendance.toString());
  
  const queryString = query.toString() ? `?${query.toString()}` : "";
  
  return useQuery({
    queryKey: ["admin-students", filters],
    queryFn: () => apiFetch<StudentProfile[]>(`/admin/students${queryString}`),
  });
}

export function useAdminJobs() {
  return useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => apiFetch<Job[]>(`/admin/jobs`),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobRequest) => apiFetch<Job>(`/admin/jobs`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateJobRequest }) => 
      apiFetch<Job>(`/admin/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ message: string }>(`/admin/jobs/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiFetch<ApplicationWithDetails[]>(`/admin/applications`),
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationRequest }) => 
      apiFetch<{ message: string }>(`/admin/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-applications"] }),
  });
}
export function useAdminStudent(studentId: string) {
  const isValid = !!studentId && studentId.length === 24;
  return useQuery({
    queryKey: ["admin-student", studentId],
    queryFn: () => apiFetch(`/admin/student/${studentId}`),
    enabled: isValid   // ✅ 24-char ObjectId అయినప్పుడే call చేయి
  });
}