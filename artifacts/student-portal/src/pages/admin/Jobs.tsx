import { useState } from "react";
import { useAdminJobs, useCreateJob, useDeleteJob } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CreateJobRequest } from "@workspace/api-client-react";

export default function AdminJobs() {
  const { data, isLoading } = useAdminJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateJobRequest>({
    title: "", company: "", description: "", type: "placement", minCgpa: 0, location: "", salary: "", deadline: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Job created successfully" });
        setOpen(false);
        setFormData({ title: "", company: "", description: "", type: "placement", minCgpa: 0, location: "", salary: "", deadline: "" });
      },
      onError: (err: any) => toast({ title: "Failed to create", description: err.message, variant: "destructive" })
    });
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this job?")) {
      deleteJob.mutate(id, {
        onSuccess: () => toast({ title: "Deleted successfully" })
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-500 mt-1">Manage active internships and placements</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 py-6">
                <Plus className="w-5 h-5 mr-2" /> Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Create Job Posting</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title *</Label>
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placement">Placement</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum CGPA</Label>
                    <Input type="number" step="0.1" value={formData.minCgpa} onChange={e => setFormData({...formData, minCgpa: Number(e.target.value)})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary/Stipend</Label>
                    <Input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="rounded-xl" placeholder="e.g. 12 LPA" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl resize-none" />
                </div>
                <Button type="submit" className="w-full rounded-xl py-6" disabled={createJob.isPending}>
                  {createJob.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Publish Job"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="py-4">Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : data && data.length > 0 ? (
                data.map(job => (
                  <TableRow key={job._id} className="group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg hidden sm:block"><Building2 className="w-5 h-5 text-gray-500" /></div>
                        <div>
                          <div className="font-semibold text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.company} • {job.location || 'Remote'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">{job.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-600">CGPA ≥ {job.minCgpa || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(job._id)} disabled={deleteJob.isPending} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">No jobs posted yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
