import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rollNumber || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter roll number and password",
        variant: "destructive"
      });
      return;
    }

    login.mutate(
      { rollNumber, password },
      {
        onSuccess: (data: any) => {
          if (data.user?.role === "admin") {
            setLocation("/admin");
          } else {
            setLocation("/student");
          }
        },
        onError: (err: Error) => {
          toast({
            title: "Login Failed",
            description: err.message || "Invalid credentials",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-blue-600 rounded-3xl p-8 sm:p-10 shadow-2xl border border-blue-500"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-1">
            Welcome
          </h1>
          <p className="text-center text-blue-100 mb-6 text-sm">
            Sign in using your Roll Number
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* ROLL NUMBER */}
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-white">
                Roll Number
              </Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="Enter Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="rounded-xl px-4 py-6 bg-white/10 border-blue-400 text-white placeholder:text-blue-200 focus:bg-white/20"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl px-4 py-6 bg-white/10 border-blue-400 text-white placeholder:text-blue-200 focus:bg-white/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-blue-100">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-white hover:underline">
              Create one now
            </Link>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden lg:flex flex-1 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-900 opacity-90 z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}