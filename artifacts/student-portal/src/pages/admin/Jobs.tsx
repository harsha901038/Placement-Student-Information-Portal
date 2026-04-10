import { useState } from "react";
import { useAdminJobs, useCreateJob, useDeleteJob } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Building2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CreateJobRequest } from "@workspace/api-client-react";

const inputStyle = {
  backgroundColor: "#ffffff",
  color: "#111111",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
};

export default function AdminJobs() {
  const { data, isLoading } = useAdminJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateJobRequest>({
    title: "",
    company: "",
    description: "",
    type: "placement",
    minCgpa: 0,
    location: "",
    salary: "",
    deadline: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Job created successfully" });
        setOpen(false);
        setFormData({ title: "", company: "", description: "", type: "placement", minCgpa: 0, location: "", salary: "", deadline: "" });
      },
      onError: (err: any) =>
        toast({ title: "Failed to create", description: err.message, variant: "destructive" })
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJob.mutate(id, {
        onSuccess: () => toast({ title: "Deleted successfully" })
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Job Postings</h1>
            <p className="text-gray-500 mt-1">Manage active internships and placements</p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg px-6 py-3 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Post New Job
          </Button>
        </div>

        {/* ✅ CUSTOM WHITE MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

            {/* Modal */}
            <div
              className="relative z-10 rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "#ffffff" }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#1d4ed8" }}>
                  Create Job Posting
                </h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-1">
                    <Label style={{ color: "#374151" }}>Job Title *</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label style={{ color: "#374151" }}>Company Name *</Label>
                    <Input
                      required
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. TCS, Infosys"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label style={{ color: "#374151" }}>Job Type</Label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      style={{ ...inputStyle, padding: "8px 12px", width: "100%", fontSize: "14px" }}
                    >
                      <option value="placement">Placement</option>
                      <option value="internship">Internship</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label style={{ color: "#374151" }}>Minimum CGPA</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.minCgpa}
                      onChange={e => setFormData({ ...formData, minCgpa: Number(e.target.value) })}
                      style={inputStyle}
                      placeholder="e.g. 7.0"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label style={{ color: "#374151" }}>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. Hyderabad"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label style={{ color: "#374151" }}>Salary / Stipend</Label>
                    <Input
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. 12 LPA"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label style={{ color: "#374151" }}>Description *</Label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Job description..."
                    style={{
                      ...inputStyle,
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "14px",
                      resize: "none",
                      outline: "none",
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-6 text-base font-semibold"
                  disabled={createJob.isPending}
                >
                  {createJob.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Publish Job"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* TABLE */}
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
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : data && data.length > 0 ? (
                data.map(job => (
                  <TableRow key={job._id} className="group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg hidden sm:block">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">
                            {job.company} • {job.location || "Remote"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                        {job.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-600">
                        CGPA ≥ {job.minCgpa || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                    No jobs posted yet.
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