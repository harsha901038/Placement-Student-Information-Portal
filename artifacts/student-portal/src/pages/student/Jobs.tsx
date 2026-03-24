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

  const handleApply = (jobId: string) => {
    applyJob.mutate(jobId, {
      onSuccess: () => toast({ title: "Successfully applied for the role!" }),
      onError: (err: any) => toast({ title: "Application failed", description: err.message, variant: "destructive" })
    });
  };

  const appliedJobIds = new Set(apps?.map(a => a.job?._id));

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="bg-primary rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h1 className="text-4xl font-display font-bold mb-4">Discover Opportunities</h1>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl">Browse the latest internships and full-time placement opportunities matched to your profile.</p>
            
            <div className="relative max-w-2xl flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-gray-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for roles, companies, or skills..." 
                className="w-full pl-14 pr-4 py-8 rounded-2xl bg-white text-gray-900 text-lg border-none shadow-lg focus-visible:ring-4 focus-visible:ring-blue-300"
              />
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {jobsData.jobs.map(job => {
              const isApplied = appliedJobIds.has(job._id);
              
              return (
                <Card key={job._id} className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Info */}
                      <div className="flex-1 p-8 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold font-display text-gray-900 group-hover:text-primary transition-colors">{job.title}</h3>
                            <p className="text-lg text-gray-600 font-medium flex items-center mt-1">
                              <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                              {job.company}
                            </p>
                          </div>
                          <Badge variant="secondary" className="px-4 py-1.5 text-sm uppercase tracking-wider bg-blue-50 text-blue-700 hover:bg-blue-100">
                            {job.type}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                          {job.location && (
                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {job.location}</div>
                          )}
                          {job.salary && (
                            <div className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-gray-400" /> {job.salary}</div>
                          )}
                          {job.minCgpa && (
                            <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2 text-gray-400" /> Min CGPA: {job.minCgpa}</div>
                          )}
                          {job.deadline && (
                            <div className="flex items-center text-amber-600 font-medium">
                              <Clock className="w-4 h-4 mr-2" /> Deadline: {format(new Date(job.deadline), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 leading-relaxed line-clamp-2">{job.description}</p>
                        
                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {job.requiredSkills.map(skill => (
                              <Badge key={skill} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Action */}
                      <div className="w-full md:w-64 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-8 flex flex-col justify-center items-center">
                        {isApplied ? (
                          <Button disabled variant="outline" className="w-full rounded-xl py-6 font-semibold border-green-200 text-green-700 bg-green-50">
                            Already Applied
                          </Button>
                        ) : (
                          <Button 
                            className="w-full rounded-xl py-6 font-semibold shadow-lg shadow-primary/20"
                            onClick={() => handleApply(job._id)}
                            disabled={applyJob.isPending}
                          >
                            {applyJob.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Apply Now"}
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
            <img src={`${import.meta.env.BASE_URL}images/empty-jobs.png`} alt="No jobs" className="w-48 h-48 mx-auto opacity-70 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Opportunities Found</h3>
            <p className="text-gray-500">Check back later or try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
