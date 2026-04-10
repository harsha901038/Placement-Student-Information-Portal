import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ name, email, password, rollNumber, role: "student" }, {
      onError: (err: any) => {
        toast({
          title: "Registration Failed",
          description: err.message || "An error occurred",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-blue-600 rounded-3xl p-8 sm:p-12 shadow-2xl border border-blue-500"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">Create Account</h1>
          <p className="text-center text-blue-100 mb-8">Join the student placement portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input
                id="name"
                required
                className="rounded-xl px-4 py-6 bg-white/10 border-blue-400 text-white placeholder:text-blue-200"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                className="rounded-xl px-4 py-6 bg-white/10 border-blue-400 text-white placeholder:text-blue-200"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="rounded-xl px-4 py-6 bg-white/10 border-blue-400 text-white placeholder:text-blue-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-white">Roll Number</Label>
              <Input
                id="rollNumber"
                required
                className="rounded-xl px-4 py-6 bg-white/10 border-blue-400 text-white placeholder:text-blue-200"
                placeholder="21B01A0501"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all mt-4"
              disabled={register.isPending}
            >
              {register.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Sign Up
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-blue-100">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-white hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-900 opacity-90 z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white max-w-2xl">
          <h2 className="text-5xl font-bold leading-tight mb-6">Your Future Starts Here</h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Create an account to gain access to premium placement opportunities, track your academic performance, and build a resume that stands out.
          </p>
        </div>
      </div>
    </div>
  );
}