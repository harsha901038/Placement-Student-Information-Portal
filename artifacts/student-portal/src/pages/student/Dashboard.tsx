import { useStudentProfile, useAttendance, useStudentApplications, useResults } from "@/hooks/use-student";
import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Briefcase, Calendar, Target, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();
  const { data: attendance, isLoading: isAttendanceLoading } = useAttendance();
  const { data: applications, isLoading: isApplicationsLoading } = useStudentApplications();
  const { data: results } = useResults();

const cgpa = useMemo(() => {
  if (!results?.length) return profile?.profile?.cgpa || "N/A";
  const allSubjects = results.flatMap(r => r.subjects || []);
  const totalCredits = allSubjects.reduce((s, sub) => s + sub.credits, 0);
  const totalPoints = allSubjects.reduce((s, sub) => s + sub.credits * sub.gradePoints, 0);
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";
}, [results, profile]);

  const isLoading = isProfileLoading || isAttendanceLoading || isApplicationsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  const recentApps = applications?.slice(0, 5) || [];

  const statusColors: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700 border-blue-200",
    shortlisted: "bg-amber-100 text-amber-800 border-amber-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    selected: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

        {/* HEADER */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.name}
            </h1>

            {/* ✅ FIXED (removed semester issue) */}
            <p className="text-gray-500 mt-2 text-lg">
              {profile?.profile?.branch
                ? `${profile.profile.branch}`
                : "Update your profile"}
            </p>
          </div>

          {/* CGPA BOX */}
          <div className="mt-4 md:mt-0 px-6 py-3 bg-blue-100 rounded-2xl border border-blue-200 flex flex-col items-center">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Current CGPA
            </span>
            <span className="text-3xl font-bold text-blue-700">
              {cgpa}
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">Attendance</CardTitle>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attendance?.overallPercentage || 0}%</div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    attendance?.overallPercentage < 75 ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${attendance?.overallPercentage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">Applications</CardTitle>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Briefcase className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{applications?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">Shortlisted</CardTitle>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Target className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {/* ✅ SAFE FIX */}
              <div className="text-3xl font-bold">
                {applications?.filter(a => a?.status === "shortlisted").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-gray-500">Placements</CardTitle>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {/* ✅ SAFE FIX */}
              <div className="text-3xl font-bold">
                {applications?.filter(a => a?.status === "selected").length || 0}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* APPLICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>

                {recentApps.map(app => (
                  <div key={app._id} className="flex justify-between p-4 bg-gray-50 rounded-xl mb-3">
                    <div>

                      {/* ✅ SAFE FIX (job fallback) */}
                      <h4 className="font-semibold">
                        {app.job?.title || app.jobTitle}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {app.job?.company || app.company}
                      </p>
                    </div>

                    <Badge className={statusColors[app.status]}>
                      {app.status}
                    </Badge>
                  </div>
                ))}

              </CardContent>
            </Card>
          </div>

          {/* QUICK LINKS */}
          <div>
            <Card className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
              <CardHeader>
                <CardTitle className="text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">

                <a href="/student/resume" className="block p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                  Update Resume
                </a>

                <a href="/student/jobs" className="block p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                  Find Jobs
                </a>

                <a href="/student/profile" className="block p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                  Edit Profile
                </a>

              </CardContent>
            </Card>
          </div>

        </div>

      </motion.div>
    </AppLayout>
  );
}