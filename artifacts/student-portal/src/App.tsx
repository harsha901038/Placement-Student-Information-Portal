import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import StudentDataPage from "@/pages/admin/student-data";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminRollNumbers from "./pages/admin/RollNumbers";

import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentAttendance from "./pages/student/Attendance";
import StudentResults from "./pages/student/Results";
import StudentJobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import ResumeBuilder from "./pages/student/ResumeBuilder";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer";
import StudentProfilePage from "@/pages/admin/StudentProfilePage";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminAssignments from "./pages/admin/Assignments";
import StudentAssignmentPage from "./pages/student/Assignments";
import BranchManagement from "./pages/admin/BranchManagement";

import AdminNews from "./pages/admin/News";
import StudentNewsFeed from "./pages/student/NewsFeed";


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

          if (user && user !== "undefined") {
            try {
              const parsed = JSON.parse(user);
              return <Redirect to={parsed.role === "admin" ? "/admin" : "/student"} />;
            } catch (e) {
              console.error("Invalid user JSON → clearing");
              localStorage.removeItem("user");
            }
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
      <Route path="/student/resume-analyzer" component={ResumeAnalyzer} />
      <Route path="/admin/assignments" component={AdminAssignments} />
      <Route path="/student/assignments" component={StudentAssignmentPage} />
      <Route path="/admin/student-profile/:id" component={StudentProfilePage} />

      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/roll-numbers" component={AdminRollNumbers} />  {/* ✅ ADD */}

      <Route path="/admin/news" component={AdminNews} />
      <Route path="/student/news" component={StudentNewsFeed} />
      <Route path="/admin/branches" component={BranchManagement} />

      {/* 🔥 IMPORTANT */}
      <Route path="/admin/student/:id" component={StudentDataPage} />

      {/* 🔥 ALWAYS LAST */}
      <Route path="/admin" component={AdminDashboard} />
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