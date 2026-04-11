import { useState, useRef } from "react";
import { useAdminStudents } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Search, SlidersHorizontal, Building2, Download, Share2, CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminStudents() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: "", minCgpa: "", skills: "", minAttendance: ""
  });

  const [companyMode, setCompanyMode] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    minCgpa: "",
    branches: "",
    minAttendance: "",
    allowBacklogs: "no",
    skills: ""
  });

  const printRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useAdminStudents({
    search: filters.search,
    minCgpa: filters.minCgpa ? parseFloat(filters.minCgpa) : undefined,
    skills: filters.skills,
    minAttendance: filters.minAttendance ? parseFloat(filters.minAttendance) : undefined as any
  });

  // Delete Student
  const deleteStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`http://https://placement-student-information-portal.onrender.com/api/admin/students/${studentId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Student deleted successfully",
        description: `Roll number ${data.rollNumber} is now available for registration`
      });
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete student",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (studentId: string, studentName: string, rollNumber: string) => {
    const confirm = window.confirm(
      `⚠️ Are you sure you want to delete?\n\nStudent: ${studentName}\nRoll: ${rollNumber}\n\nThis will delete all student data (Results, Attendance, Applications, Resume)`
    );
    if (confirm) {
      deleteStudent.mutate(studentId);
    }
  };

  // Eligible students for company mode
  const eligibleStudents = (() => {
    if (!companyMode || !data) return [];
    return data.filter((s: any) => {
      const cgpa = parseFloat(s.profile?.cgpa) || 0;
      const attendance = parseFloat(s.profile?.attendance) || 0;
      const backlogs = parseInt(s.profile?.backlogs) || 0;
      const branch = s.profile?.branch || "";

      if (companyForm.minCgpa && cgpa < parseFloat(companyForm.minCgpa)) return false;
      if (companyForm.minAttendance && attendance < parseFloat(companyForm.minAttendance)) return false;
      if (companyForm.allowBacklogs === "no" && backlogs > 0) return false;

      if (companyForm.branches.trim()) {
        const allowed = companyForm.branches.split(",").map(b => b.trim().toLowerCase());
        if (!allowed.includes(branch.toLowerCase())) return false;
      }

      if (companyForm.skills.trim()) {
        const requiredSkills = companyForm.skills.split(",").map(s => s.trim().toLowerCase());
        const studentSkills = (s.profile?.skills || []).map((sk: string) => sk.toLowerCase());
        const hasAll = requiredSkills.every(rs => studentSkills.includes(rs));
        if (!hasAll) return false;
      }

      return true;
    });
  })();

  // Download PDF
  const handleDownloadPDF = () => {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`
      <html>
        <head>
          <title>Eligible Students - ${companyForm.companyName || "Company"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background: #1d4ed8; color: #fff; padding: 8px 12px; text-align: left; }
            td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) td { background: #f9fafb; }
            .footer { margin-top: 24px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const lines = [
      `*${companyForm.companyName || "Company"} — Eligible Students*`,
      `Min CGPA: ${companyForm.minCgpa || "Any"} | Attendance: ${companyForm.minAttendance || "Any"}%`,
      `Branches: ${companyForm.branches || "All"} | Backlogs: ${companyForm.allowBacklogs === "no" ? "Not allowed" : "Allowed"}`,
      `Total eligible: ${eligibleStudents.length}`,
      "",
      ...eligibleStudents.map((s: any, i: number) =>
        `${i + 1}. ${s.name} | ${s.profile?.branch || "-"} | CGPA: ${s.profile?.cgpa || "-"} | ${s.email}`
      )
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Database</h1>
            <p className="text-gray-500 mt-1">View, filter, and find eligible students for companies</p>
          </div>
          <Button
            onClick={() => setCompanyMode(!companyMode)}
            className={companyMode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"}
          >
            <Building2 className="w-4 h-4 mr-2" />
            {companyMode ? "✓ Company Filter ON" : "Company Eligibility Filter"}
          </Button>
        </div>

        {/* Company Filter Panel */}
        {companyMode && (
          <Card className="rounded-2xl border-2 border-blue-200 bg-blue-50/40">
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Company Name"
                  value={companyForm.companyName}
                  onChange={e => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Min CGPA"
                  type="number"
                  step="0.1"
                  value={companyForm.minCgpa}
                  onChange={e => setCompanyForm({ ...companyForm, minCgpa: e.target.value })}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Min Attendance %"
                  type="number"
                  value={companyForm.minAttendance}
                  onChange={e => setCompanyForm({ ...companyForm, minAttendance: e.target.value })}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Branches (e.g. CSE, ECE)"
                  value={companyForm.branches}
                  onChange={e => setCompanyForm({ ...companyForm, branches: e.target.value })}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Required Skills (e.g. React, Python)"
                  value={companyForm.skills}
                  onChange={e => setCompanyForm({ ...companyForm, skills: e.target.value })}
                  className="rounded-xl"
                />
                <select
                  value={companyForm.allowBacklogs}
                  onChange={e => setCompanyForm({ ...companyForm, allowBacklogs: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="no">No Backlogs Allowed</option>
                  <option value="yes">Backlogs Allowed</option>
                </select>
              </div>

              {companyMode && eligibleStudents.length > 0 && (
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF ({eligibleStudents.length})
                  </Button>
                  <Button onClick={handleShareWhatsApp} className="bg-green-600 hover:bg-green-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share WhatsApp
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Student Table */}
        <Card className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white">

          {!companyMode && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email"
                  className="pl-10 rounded-xl bg-gray-50"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="number" step="0.1"
                  placeholder="Min CGPA"
                  className="pl-10 rounded-xl bg-gray-50"
                  value={filters.minCgpa}
                  onChange={e => setFilters({ ...filters, minCgpa: e.target.value })}
                />
              </div>
              <Input
                type="number"
                placeholder="Min Attendance %"
                className="rounded-xl bg-gray-50"
                value={filters.minAttendance}
                onChange={e => setFilters({ ...filters, minAttendance: e.target.value })}
              />
              <Input
                placeholder="Filter by skill (e.g. React)"
                className="rounded-xl bg-gray-50"
                value={filters.skills}
                onChange={e => setFilters({ ...filters, skills: e.target.value })}
              />
            </div>
          )}

          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="py-4">Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Top Skills</TableHead>
                  {companyMode && <TableHead>Eligible</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </TableCell>
                  </TableRow>
                ) : data && data.length > 0 ? (
                  data.map((student: any) => {
                    const isEligible = companyMode
                      ? eligibleStudents.some((e: any) => e._id === student._id)
                      : true;

                    return (
                      <TableRow
                        key={student._id}
                        className={`transition-colors ${
                          companyMode
                            ? isEligible
                              ? "hover:bg-green-50/50 bg-green-50/20"
                              : "hover:bg-gray-50 opacity-50"
                            : "hover:bg-blue-50/50"
                        }`}
                      >
                        {/* Student Name + Roll */}
                        <TableCell
                          className="py-4 cursor-pointer"
                          onClick={() => navigate(`/admin/student-profile/${student._id}`)}
                        >
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-gray-900">{student.name}</span>
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {student.profile?.rollNumber || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Branch */}
                        <TableCell
                          onClick={() => navigate(`/admin/student-profile/${student._id}`)}
                          className="cursor-pointer"
                        >
                          {student.profile?.branch || '-'}
                        </TableCell>

                        {/* CGPA */}
                        <TableCell
                          onClick={() => navigate(`/admin/student-profile/${student._id}`)}
                          className="cursor-pointer"
                        >
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold">
                            {student.profile?.cgpa || 'N/A'}
                          </Badge>
                        </TableCell>

                        {/* Attendance */}
                        <TableCell
                          onClick={() => navigate(`/admin/student-profile/${student._id}`)}
                          className="cursor-pointer"
                        >
                          <Badge className={`font-bold ${
                            (student.profile?.attendance || 0) >= 75
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}>
                            {student.profile?.attendance ?? 'N/A'}%
                          </Badge>
                        </TableCell>

                        {/* Skills */}
                        <TableCell
                          onClick={() => navigate(`/admin/student-profile/${student._id}`)}
                          className="cursor-pointer"
                        >
                          <div className="flex gap-1 flex-wrap">
                            {student.profile?.skills?.slice(0, 3).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                            {(student.profile?.skills?.length || 0) > 3 && (
                              <span className="text-xs text-gray-400">
                                +{student.profile.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Eligible column (company mode only) */}
                        {companyMode && (
                          <TableCell
                            onClick={() => navigate(`/admin/student-profile/${student._id}`)}
                            className="cursor-pointer"
                          >
                            {isEligible
                              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                              : <XCircle className="w-5 h-5 text-red-400" />
                            }
                          </TableCell>
                        )}

                        {/* Delete Button */}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                student._id,
                                student.name,
                                student.profile?.rollNumber || "Unknown"
                              );
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>

                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Hidden Print Area */}
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <h1>{companyForm.companyName || "Company"} — Eligible Students</h1>
            <p className="meta">
              Min CGPA: {companyForm.minCgpa || "Any"} | 
              Attendance: {companyForm.minAttendance || "Any"}% | 
              Branches: {companyForm.branches || "All"} | 
              Backlogs: {companyForm.allowBacklogs === "no" ? "Not allowed" : "Allowed"}
            </p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Attendance</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {eligibleStudents.map((s: any, i: number) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.profile?.rollNumber || "-"}</td>
                    <td>{s.profile?.branch || "-"}</td>
                    <td>{s.profile?.cgpa || "-"}</td>
                    <td>{s.profile?.attendance || "-"}%</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="footer">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}