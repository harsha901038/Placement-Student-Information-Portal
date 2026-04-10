import { useAdminApplications, useUpdateApplication } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function AdminApplications() {
  const [, navigate] = useLocation();
  const { data, isLoading } = useAdminApplications();
  const updateApp = useUpdateApplication();
  const { toast } = useToast();

  const handleStatusChange = (id: string, newStatus: string) => {
    updateApp.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => toast({ title: "Status updated successfully" }),
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const statusColors: Record<string, string> = {
    applied: "bg-blue-50 text-blue-700 border border-blue-200",
    shortlisted: "bg-amber-50 text-amber-700 border border-amber-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    selected: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const applications = Array.isArray(data) ? data : data?.applications || [];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
          <p className="text-gray-500 mt-1">Review and update student application statuses</p>
        </div>

        <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Info</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status Update</TableHead>
                <TableHead>Student Data</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : applications.length > 0 ? (
                applications.map((app: any) => (
                  <TableRow key={app._id} className="hover:bg-gray-50">

                    {/* Student Info */}
                    <TableCell
                      className="py-4 px-6 cursor-pointer"
                      onClick={() => {
                        const id = app.studentId?._id;
                        if (id) navigate(`/admin/student-profile/${id}`);
                      }}
                    >
                      <div className="font-semibold text-blue-600">
                        {app.studentId?.name || app.studentName || "No Name"}
                      </div>
                      <div className="text-sm text-gray-500">
                        CGPA:{" "}
                        <span className="font-medium text-primary">
                          {app.studentId?.profile?.cgpa || app.cgpa || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Job */}
                    <TableCell>
                      <div className="font-semibold text-gray-800">
                        {app.jobTitle || "No Role"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.company || "No Company"}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-gray-600">
                      {app.appliedAt
                        ? format(new Date(app.appliedAt), "MMM dd, yyyy")
                        : app.createdAt
                        ? format(new Date(app.createdAt), "MMM dd, yyyy")
                        : "-"}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-6 text-right">
                      <Select
                        value={app.status || "applied"}
                        onValueChange={(v) => handleStatusChange(app._id, v)}
                        disabled={updateApp.isPending}
                      >
                        <SelectTrigger
                          className={`w-full rounded-xl px-3 py-2 capitalize font-semibold ${statusColors[app.status] || statusColors.applied}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="selected">Selected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Student Data - View Resume + View Profile */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          className="text-blue-600 underline text-sm text-left"
                          onClick={() => {
                            const id = app.studentId?._id;
                            if (id) navigate(`/admin/student/${id}`);
                          }}
                        >
                          View Resume
                        </button>
                        <button
                          className="text-purple-600 underline text-sm text-left"
                          onClick={() => {
                            const id = app.studentId?._id;
                            if (id) navigate(`/admin/student-profile/${id}`);
                          }}
                        >
                          View Profile
                        </button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    No applications received yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

      </div>
    </AppLayout>
  );
}