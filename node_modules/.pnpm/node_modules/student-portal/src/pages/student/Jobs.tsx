import { useState } from "react";
import { useStudentJobs, useApplyJob, useStudentApplications } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign, Loader2, Briefcase, GraduationCap, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function StudentJobs() {
  const [search, setSearch] = useState("");
  const { data: jobsData, isLoading } = useStudentJobs(search);
  const { data: apps } = useStudentApplications();
  const applyJob = useApplyJob();
  const { toast } = useToast();

  // ✅ FIX 1: SAFE USER PARSE (no crash)
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw && raw !== "undefined") {
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  };

  const handleApply = (job: any) => {

    const user = getUser(); // 🔥 SAFE
    const studentId = user?._id;

    console.log("STUDENT ID:", studentId);

    if (!studentId) {
      toast({
        title: "Error",
        description: "Student not logged in",
        variant: "destructive"
      });
      return;
    }

    applyJob.mutate(
      {
        studentId,
        jobTitle: job.title,
        company: job.company
      },
      {
        onSuccess: () => {
          console.log("✅ APPLY SUCCESS");
          toast({ title: "Successfully applied!" });
        },
        onError: (err: any) => {
          console.log("❌ APPLY ERROR:", err);
          toast({
            title: "Application failed",
            description: err.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  // ✅ FIX 2: SAFE APPLIED CHECK (supports both formats)
  const appliedJobIds = new Set(
    apps?.map((a: any) => a.job?.title || a.jobTitle)
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">
              Discover Opportunities
            </h1>

            <p className="text-blue-100 text-lg mb-8 max-w-2xl">
              Browse internships and full-time placements matched to your profile.
            </p>

            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for roles, companies, or skills..."
                className="pl-12 pr-4 py-6 rounded-2xl bg-white text-gray-900 border-none shadow-lg focus-visible:ring-4 focus-visible:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : jobsData?.jobs?.length > 0 ? (

          <div className="grid gap-6">

            {jobsData.jobs.map((job: any) => {
              const isApplied = appliedJobIds.has(job.title);

              return (
                <Card key={job._id} className="rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden">
                  <CardContent className="p-0">

                    <div className="flex flex-col md:flex-row">

                      <div className="flex-1 p-8 space-y-4">

                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
                              {job.title}
                            </h3>

                            <p className="text-gray-600 flex items-center mt-1">
                              <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                              {job.company}
                            </p>
                          </div>

                          <Badge className="bg-blue-50 text-blue-700">
                            {job.type}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-5 text-sm text-gray-600">

                          {job.location && (
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </span>
                          )}

                          {job.salary && (
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {job.salary}
                            </span>
                          )}

                          {job.minCgpa && (
                            <span className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-1" />
                              CGPA: {job.minCgpa}
                            </span>
                          )}

                          {job.deadline && (
                            <span className="flex items-center text-orange-600 font-medium">
                              <Clock className="w-4 h-4 mr-1" />
                              {format(new Date(job.deadline), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600">{job.description}</p>

                      </div>

                      <div className="w-full md:w-64 bg-gray-50 p-8 flex items-center justify-center border-l">

                        {isApplied ? (
                          <Button disabled className="w-full bg-green-100 text-green-700 border border-green-200">
                            Already Applied
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApply(job)}
                            className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                          >
                            {applyJob.isPending
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : "Apply Now"}
                          </Button>
                        )}

                      </div>

                    </div>

                  </CardContent>
                </Card>
              );
            })}

          </div>

        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold">No jobs found</h3>
            <p className="text-gray-500">Try different search</p>
          </div>
        )}

      </div>
    </AppLayout>
  );
}