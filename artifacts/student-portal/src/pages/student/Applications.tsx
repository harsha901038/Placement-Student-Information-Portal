import { useStudentApplications } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Building2, MapPin, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function StudentApplications() {
  const { data, isLoading } = useStudentApplications();

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  const statusColors: Record<string, string> = {
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    shortlisted: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    selected: "bg-emerald-50 text-emerald-700 border-emerald-200"
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">Track the status of your job and internship applications</p>
        </div>

        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {data.map((app) => (
              <Card key={app._id} className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  <div className="flex items-start gap-6 flex-1">
                    <div className="hidden sm:flex bg-primary/10 p-4 rounded-2xl items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display text-gray-900 mb-1">{app.job?.title}</h3>
                      <p className="text-lg text-primary font-medium">{app.job?.company}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                        {app.job?.location && (
                          <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {app.job.location}</div>
                        )}
                        {app.appliedAt && (
                          <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-1.5" /> Applied on {format(new Date(app.appliedAt), 'MMM dd, yyyy')}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Current Status</span>
                    <Badge variant="outline" className={`px-4 py-2 text-sm font-bold uppercase tracking-wider ${statusColors[app.status]}`}>
                      {app.status}
                    </Badge>
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">Start browsing the jobs section and apply to roles that match your profile.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
