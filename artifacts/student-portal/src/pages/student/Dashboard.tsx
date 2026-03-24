import { useStudentProfile, useAttendance, useStudentApplications } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Briefcase, Calendar, Target, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();
  const { data: attendance, isLoading: isAttendanceLoading } = useAttendance();
  const { data: applications, isLoading: isApplicationsLoading } = useStudentApplications();

  const isLoading = isProfileLoading || isAttendanceLoading || isApplicationsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const recentApps = applications?.slice(0, 5) || [];
  const statusColors: Record<string, string> = {
    applied: "bg-blue-100 text-blue-800 border-blue-200",
    shortlisted: "bg-amber-100 text-amber-800 border-amber-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    selected: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Welcome back, {profile?.name}</h1>
            <p className="text-gray-500 mt-2 text-lg">
              {profile?.profile?.branch ? `${profile.profile.branch} | Semester ${profile.profile.semester || '-'}` : "Update your profile to see branch info"}
            </p>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col items-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Current CGPA</span>
            <span className="text-3xl font-display font-bold text-primary">{profile?.profile?.cgpa || "N/A"}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Overall Attendance</CardTitle>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{attendance?.overallPercentage || 0}%</div>
              <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${attendance?.overallPercentage && attendance.overallPercentage < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${attendance?.overallPercentage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Applications</CardTitle>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{applications?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-2">Jobs & Internships applied</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Shortlisted</CardTitle>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Target className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">
                {applications?.filter(a => a.status === 'shortlisted').length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">Awaiting interviews</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Placements</CardTitle>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><GraduationCap className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">
                {applications?.filter(a => a.status === 'selected').length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">Offers received</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications & SGPA Calc Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-sm border border-gray-100">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-display">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {recentApps.length > 0 ? (
                  <div className="space-y-4">
                    {recentApps.map((app) => (
                      <div key={app._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.job?.title}</h4>
                          <p className="text-sm text-gray-500">{app.job?.company}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant="outline" className={`capitalize px-3 py-1 ${statusColors[app.status]}`}>
                            {app.status}
                          </Badge>
                          <span className="text-xs text-gray-400 mt-2">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No applications yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-3xl shadow-sm bg-gradient-to-br from-primary to-blue-700 text-white border-none">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-display text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <ul className="space-y-3">
                  <li>
                    <a href="/student/resume" className="block px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-colors font-medium">
                      Update Resume
                    </a>
                  </li>
                  <li>
                    <a href="/student/jobs" className="block px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-colors font-medium">
                      Find Internships
                    </a>
                  </li>
                  <li>
                    <a href="/student/profile" className="block px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-colors font-medium">
                      Edit Academic Profile
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

      </motion.div>
    </AppLayout>
  );
}
