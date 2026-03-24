import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, {
      onError: (err: any) => {
        toast({
          title: "Login Failed",
          description: err.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Left side Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/5 border border-gray-100"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-display font-bold text-center text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-center text-gray-500 mb-8">Sign in to your portal to continue</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                required
                className="rounded-xl px-4 py-6"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                className="rounded-xl px-4 py-6"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-xl py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={login.isPending}
            >
              {login.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create one now
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right side Image (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-900 opacity-90 z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white max-w-2xl">
          <h2 className="text-5xl font-display font-bold leading-tight mb-6">Empower Your Academic Journey</h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Track your performance, build your professional resume, and discover career-defining opportunities—all in one unified platform.
          </p>
        </div>
      </div>
    </div>
  );
}
