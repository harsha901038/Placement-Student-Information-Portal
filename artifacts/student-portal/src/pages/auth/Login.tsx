import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { DEMO_CREDENTIALS } from "@/lib/api";
import { DEMO_STUDENT_USER, DEMO_ADMIN_USER } from "@/lib/mock-data";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoLoading, setDemoLoading] = useState<"student" | "admin" | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, {
      onError: (err: Error) => {
        toast({
          title: "Login Failed",
          description: err.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    });
  };

  const handleDemoLogin = async (role: "student" | "admin") => {
    setDemoLoading(role);
    localStorage.setItem("demo_mode", "true");
    await new Promise(r => setTimeout(r, 600));
    const user = role === "admin" ? DEMO_ADMIN_USER : DEMO_STUDENT_USER;
    localStorage.setItem("token", `demo-${role}-token`);
    localStorage.setItem("user", JSON.stringify(user));
    setDemoLoading(null);
    toast({ title: `Demo ${role === "admin" ? "Admin" : "Student"} Login`, description: `Welcome, ${user.name}!` });
    setLocation(role === "admin" ? "/admin" : "/student");
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/5 border border-gray-100"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-center text-gray-500 mb-6 text-sm">Sign in to your portal to continue</p>

          {/* Demo Login Buttons */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Try Demo Mode — No backend needed
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-blue-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm font-semibold"
                onClick={() => handleDemoLogin("student")}
                disabled={demoLoading !== null}
              >
                {demoLoading === "student" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <GraduationCap className="w-4 h-4 mr-1" />}
                Student Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-blue-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm font-semibold"
                onClick={() => handleDemoLogin("admin")}
                disabled={demoLoading !== null}
              >
                {demoLoading === "admin" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
                Admin Demo
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign in with account</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                className="rounded-xl px-4 py-6"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                className="rounded-xl px-4 py-6"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
              disabled={login.isPending}
            >
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create one now
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="hidden lg:flex flex-1 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-900 opacity-90 z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white max-w-2xl">
          <h2 className="text-5xl font-bold leading-tight mb-6">Empower Your Academic Journey</h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Track your performance, build your professional resume, and discover career-defining opportunities—all in one unified platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Students", value: "2,400+" },
              { label: "Companies", value: "150+" },
              { label: "Placements", value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
