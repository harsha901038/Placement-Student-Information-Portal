import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { 
  StudentProfile, UpdateProfileRequest, JobsListResponse, 
  Application, ApplicationWithJob, AttendanceResponse, 
  AttendanceUpdateRequest, SemesterResult, AddSemesterResultRequest,
  ResumeData, ResumeScoreResponse
} from "@workspace/api-client-react";

// Profile Hooks
export function useStudentProfile() {
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: () => apiFetch<StudentProfile>("/student/profile"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => apiFetch<StudentProfile>("/student/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-profile"] }),
  });
}

// Jobs & Applications Hooks
export function useStudentJobs(search?: string, page: number = 1) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (page) query.set("page", page.toString());
  
  const queryString = query.toString() ? `?${query.toString()}` : "";
  
  return useQuery({
    queryKey: ["student-jobs", search, page],
    queryFn: () => apiFetch<JobsListResponse>(`/student/jobs${queryString}`),
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => apiFetch<Application>(`/student/apply/${jobId}`, {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
    },
  });
}

export function useStudentApplications() {
  return useQuery({
    queryKey: ["student-applications"],
    queryFn: () => apiFetch<ApplicationWithJob[]>("/student/applications"),
  });
}

// Attendance Hooks
export function useAttendance() {
  return useQuery({
    queryKey: ["student-attendance"],
    queryFn: () => apiFetch<AttendanceResponse>("/student/attendance"),
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceUpdateRequest) => apiFetch<AttendanceResponse>("/student/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-attendance"] }),
  });
}

// Results Hooks
export function useResults() {
  return useQuery({
    queryKey: ["student-results"],
    queryFn: () => apiFetch<SemesterResult[]>("/student/results"),
  });
}

export function useAddResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddSemesterResultRequest) => apiFetch<SemesterResult>("/student/results", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-results"] }),
  });
}

// Resume Hooks
export function useResume() {
  return useQuery({
    queryKey: ["student-resume"],
    queryFn: () => apiFetch<ResumeData>("/student/resume"),
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResumeData) => apiFetch<ResumeData>("/student/resume", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-resume"] }),
  });
}

export function useScoreResume() {
  return useMutation({
    mutationFn: (data: ResumeData) => apiFetch<ResumeScoreResponse>("/student/resume/score", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  });
}
