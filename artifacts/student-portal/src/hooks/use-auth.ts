import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import type { RegisterRequest, LoginRequest, AuthResponse, UserInfo } from "@workspace/api-client-react";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const userJson = localStorage.getItem("user");

  let user: UserInfo | null = null;

  try {
    if (userJson && userJson !== "undefined") {
      user = JSON.parse(userJson);
    }
  } catch (e) {
    console.error("Invalid user JSON → clearing");
    localStorage.removeItem("user");
  }

  const isAuthenticated = !!localStorage.getItem("token");

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiFetch<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/student");
      }
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiFetch<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setLocation("/student");
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("demo_mode");
    queryClient.clear();
    setLocation("/login");
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout
  };
}