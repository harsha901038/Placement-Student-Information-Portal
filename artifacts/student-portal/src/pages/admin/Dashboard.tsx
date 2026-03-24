import { useAdminDashboard } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, CheckCircle, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  const pieData = [
    { name: "Placed", value: data?.placed || 0, color: "#10b981" },
    { name: "Shortlisted", value: data?.shortlisted || 0, color: "#f59e0b" },
    { name: "In Progress", value: Math.max(0, (data?.totalApplications || 0) - (data?.placed || 0) - (data?.shortlisted || 0)), color: "#3b82f6" }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of placement activities and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-gray-900">{data?.totalStudents || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Jobs</CardTitle>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Briefcase className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-gray-900">{data?.totalJobs || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><FileText className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-gray-900">{data?.totalApplications || 0}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Placed</CardTitle>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-gray-900">{data?.placed || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 rounded-3xl shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 rounded-3xl shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentApplications?.slice(0, 5).map(app => (
                  <div key={app._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900">{app.student?.name}</p>
                      <p className="text-sm text-gray-500">Applied for <span className="font-medium text-primary">{app.job?.title}</span> at {app.job?.company}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-xl border ${
                      app.status === 'selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      app.status === 'shortlisted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
