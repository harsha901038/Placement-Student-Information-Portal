import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentAttendance from "./pages/student/Attendance";
import StudentResults from "./pages/student/Results";
import StudentJobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import ResumeBuilder from "./pages/student/ResumeBuilder";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/">
        {() => {
          const isAuth = localStorage.getItem("token");
          const user = localStorage.getItem("user");
          if (!isAuth) return <Redirect to="/login" />;
          if (user) {
            const parsed = JSON.parse(user);
            return <Redirect to={parsed.role === "admin" ? "/admin" : "/student"} />;
          }
          return <Redirect to="/login" />;
        }}
      </Route>

      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/attendance" component={StudentAttendance} />
      <Route path="/student/results" component={StudentResults} />
      <Route path="/student/jobs" component={StudentJobs} />
      <Route path="/student/applications" component={StudentApplications} />
      <Route path="/student/resume" component={ResumeBuilder} />

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route path="/admin/applications" component={AdminApplications} />

      <Route path="/:rest*">
        {() => (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">404</h1>
            <p className="text-gray-500 mb-6">Page not found</p>
            <a href="/" className="px-6 py-2 bg-primary text-white rounded-xl shadow-lg">Go Home</a>
          </div>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
