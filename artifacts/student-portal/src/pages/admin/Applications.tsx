import { useAdminApplications, useUpdateApplication } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminApplications() {
  const { data, isLoading } = useAdminApplications();
  const updateApp = useUpdateApplication();
  const { toast } = useToast();

  const handleStatusChange = (id: string, newStatus: any) => {
    updateApp.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => toast({ title: "Status updated successfully" }),
      onError: () => toast({ title: "Update failed", variant: "destructive" })
    });
  };

  const statusColors: Record<string, string> = {
    applied: "text-blue-700 bg-blue-50",
    shortlisted: "text-amber-700 bg-amber-50",
    rejected: "text-red-700 bg-red-50",
    selected: "text-emerald-700 bg-emerald-50"
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Manage Applications</h1>
          <p className="text-gray-500 mt-1">Review and update student application statuses</p>
        </div>

        <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="py-4 px-6">Student Info</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead className="w-48 text-right px-6">Status Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : data && data.length > 0 ? (
                data.map(app => (
                  <TableRow key={app._id}>
                    <TableCell className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{app.student?.name}</div>
                      <div className="text-sm text-gray-500">CGPA: <span className="font-medium text-primary">{app.student?.profile?.cgpa || 'N/A'}</span></div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-800">{app.job?.title}</div>
                      <div className="text-sm text-gray-500">{app.job?.company}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {app.appliedAt ? format(new Date(app.appliedAt), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Select 
                        defaultValue={app.status} 
                        onValueChange={(v) => handleStatusChange(app._id, v)}
                        disabled={updateApp.isPending}
                      >
                        <SelectTrigger className={`w-full rounded-xl capitalize font-bold ${statusColors[app.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied" className="font-medium text-blue-700">Applied</SelectItem>
                          <SelectItem value="shortlisted" className="font-medium text-amber-700">Shortlisted</SelectItem>
                          <SelectItem value="rejected" className="font-medium text-red-700">Rejected</SelectItem>
                          <SelectItem value="selected" className="font-medium text-emerald-700">Selected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">No applications received yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
