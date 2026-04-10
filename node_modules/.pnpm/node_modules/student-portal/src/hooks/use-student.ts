import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { 
  StudentProfile, UpdateProfileRequest, JobsListResponse, 
  Application, AttendanceResponse, 
  AttendanceUpdateRequest, SemesterResult, AddSemesterResultRequest,
  ResumeData, ResumeScoreResponse
} from "@workspace/api-client-react";

const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined") return JSON.parse(raw);
  } catch {}
  return {};
};

// Profile Hooks
export function useStudentProfile() {
  const user = getUser();
  return useQuery({
    queryKey: ["student-profile", user?._id],
    queryFn: () => apiFetch<StudentProfile>(`/student/profile?studentId=${user._id}`),
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5,      // ✅ 5 minutes cache
    gcTime: 1000 * 60 * 10,         // ✅ 10 minutes memory
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => {
      const user = getUser();
      return apiFetch<StudentProfile>("/student/profile", {
        method: "PUT",
        body: JSON.stringify({ ...data, studentId: user._id }),
      });
    },
    onSuccess: () => {
      const user = getUser();
      queryClient.invalidateQueries({ queryKey: ["student-profile", user?._id] });
    },
  });
}

// Jobs
export function useStudentJobs(search?: string, page: number = 1) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (page) query.set("page", page.toString());
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return useQuery({
    queryKey: ["student-jobs", search, page],
    queryFn: () => apiFetch<JobsListResponse>(`/student/jobs${queryString}`),
    staleTime: 1000 * 60 * 2,
  });
}

// Apply Job
export function useApplyJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; jobTitle: string; company: string }) => {
      return apiFetch<Application>("/student/apply", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      const user = getUser();
      queryClient.invalidateQueries({ queryKey: ["student-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["student-applications", user?._id] });
    },
  });
}

// Applications
export function useStudentApplications() {
  const user = getUser();
  return useQuery({
    queryKey: ["student-applications", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const res = await apiFetch<any>(`/student/applications/${user._id}`);
      return Array.isArray(res) ? res : res?.applications || [];
    },
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

// Attendance
export function useAttendance() {
  const user = getUser();
  return useQuery({
    queryKey: ["student-attendance", user?._id],
    queryFn: () => apiFetch<AttendanceResponse>(`/student/attendance?studentId=${user._id}`),
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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

// Results
export function useResults() {
  const user = getUser();
  return useQuery({
    queryKey: ["student-results", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      return apiFetch<SemesterResult[]>(`/student/results?studentId=${user._id}`);
    },
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAddResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddSemesterResultRequest) => apiFetch<SemesterResult>("/student/results", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      const user = getUser();
      queryClient.invalidateQueries({ queryKey: ["student-results", user?._id] });
    },
  });
}

// Resume
export function useResume() {
  const user = getUser();
  return useQuery({
    queryKey: ["student-resume", user?._id],
    queryFn: () => apiFetch<ResumeData>(`/student/resume?studentId=${user._id}`),
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResumeData) => {
      const user = getUser();
      return apiFetch<ResumeData>("/student/resume", {
        method: "PUT",
        body: JSON.stringify({ ...data, studentId: user._id }),
      });
    },
    onSuccess: () => {
      const user = getUser();
      queryClient.invalidateQueries({ queryKey: ["student-resume", user?._id] });
    },
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