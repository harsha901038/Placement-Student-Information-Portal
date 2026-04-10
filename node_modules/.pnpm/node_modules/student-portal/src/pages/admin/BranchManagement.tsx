import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  Users, GraduationCap, Calendar, ChevronRight,
  Loader2, Search, SlidersHorizontal, Download, ArrowLeft
} from "lucide-react";

const API = "http://localhost:5000";

const BRANCHES = [
  { name: "CSE",   label: "Computer Science",       color: "bg-blue-500",    light: "bg-blue-50 border-blue-200 text-blue-800" },
  { name: "ECE",   label: "Electronics & Comm.",     color: "bg-purple-500",  light: "bg-purple-50 border-purple-200 text-purple-800" },
  { name: "EEE",   label: "Electrical Engg.",         color: "bg-yellow-500",  light: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { name: "AIML",  label: "AI & Machine Learning",   color: "bg-green-500",   light: "bg-green-50 border-green-200 text-green-800" },
  { name: "AI",    label: "Artificial Intelligence", color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { name: "DS",    label: "Data Science",             color: "bg-cyan-500",    light: "bg-cyan-50 border-cyan-200 text-cyan-800" },
  { name: "CIVIL", label: "Civil Engineering",        color: "bg-orange-500",  light: "bg-orange-50 border-orange-200 text-orange-800" },
  { name: "MECH",  label: "Mechanical Engg.",         color: "bg-red-500",     light: "bg-red-50 border-red-200 text-red-800" },
];

export default function BranchManagement() {
  const [, navigate] = useLocation();

  const [stats, setStats]               = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [selectedBranch, setSelectedBranch]     = useState<string | null>(null);
  const [students, setStudents]                 = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents]   = useState(false);

  const [search, setSearch]               = useState("");
  const [minCgpa, setMinCgpa]             = useState("");
  const [maxCgpa, setMaxCgpa]             = useState("");
  const [minAttendance, setMinAttendance] = useState("");

  // ── Load branch stats ──────────────────────────────────────
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res  = await fetch(`${API}/api/admin/branch-stats`);
      const data = await res.json();
      setStats(data);
    } catch {}
    setLoadingStats(false);
  };

  useEffect(() => { fetchStats(); }, []);

  // ── Load students for selected branch ─────────────────────
  const fetchStudents = async (branch: string) => {
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams({ branch });
      if (minCgpa)       params.set("minCgpa",       minCgpa);
      if (maxCgpa)       params.set("maxCgpa",       maxCgpa);
      if (minAttendance) params.set("minAttendance", minAttendance);
      const res  = await fetch(`${API}/api/admin/students-by-branch?${params}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingStudents(false);
  };

  const handleBranchClick = (branch: string) => {
    setSelectedBranch(branch);
    setSearch(""); setMinCgpa(""); setMaxCgpa(""); setMinAttendance("");
    fetchStudents(branch);
  };

  const handleFilter = () => {
    if (selectedBranch) fetchStudents(selectedBranch);
  };

  // ── Download PDF ───────────────────────────────────────────
  const handleDownload = () => {
    const filtered   = students.filter(s =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.profile?.rollNumber || "").toLowerCase().includes(search.toLowerCase())
    );
    const branchInfo = BRANCHES.find(b => b.name === selectedBranch);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>${selectedBranch} Students</title>
      <style>
        body{font-family:Arial;padding:32px;color:#111}
        h1{font-size:20px;margin-bottom:4px}
        .meta{color:#555;font-size:13px;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#1d4ed8;color:#fff;padding:8px 12px;text-align:left}
        td{padding:8px 12px;border-bottom:1px solid #e5e7eb}
        tr:nth-child(even) td{background:#f9fafb}
        .footer{margin-top:20px;font-size:11px;color:#888}
      </style></head><body>
      <h1>${selectedBranch} — ${branchInfo?.label} Students</h1>
      <p class="meta">
        Filters: CGPA ${minCgpa || "Any"}–${maxCgpa || "Any"} |
        Attendance ≥ ${minAttendance || "Any"}% |
        Total: ${filtered.length}
      </p>
      <table>
        <thead><tr>
          <th>#</th><th>Name</th><th>Roll No</th>
          <th>CGPA</th><th>Attendance</th><th>Backlogs</th><th>Skills</th>
        </tr></thead>
        <tbody>
          ${filtered.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.name}</td>
              <td>${s.profile?.rollNumber || "-"}</td>
              <td>${s.profile?.cgpa || "-"}</td>
              <td>${s.profile?.attendance || "-"}%</td>
              <td>${s.profile?.backlogs || 0}</td>
              <td>${s.profile?.skills?.join(", ") || "-"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      <p class="footer">Generated by EduPlacement — ${new Date().toLocaleString()}</p>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const filteredStudents = students.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.profile?.rollNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  const branchMeta = BRANCHES.find(b => b.name === selectedBranch);

  // ══════════════════════════════════════════════════════════
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          {selectedBranch && (
            <button
              onClick={() => setSelectedBranch(null)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Branches
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedBranch ? `${selectedBranch} Students` : "Branch Management"}
          </h1>
          <p className="text-gray-500 mt-1">
            {selectedBranch
              ? `${branchMeta?.label} — ${students.length} total students`
              : "Manage students branch-wise"}
          </p>
        </div>

        {/* ═══ BRANCH HOME VIEW ═══ */}
        {!selectedBranch && (
          <>
            {/* ── 1. Summary bar — Top ── */}
            {stats.length > 0 && (
              <Card className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none shadow-lg">
                <CardContent className="pt-5 pb-5">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-blue-100 text-sm">Total Students</p>
                      <p className="text-3xl font-bold">
                        {stats.reduce((s, b) => s + b.count, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Total Branches</p>
                      <p className="text-3xl font-bold">
                        {stats.filter(b => b.count > 0).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Overall Avg CGPA</p>
                      <p className="text-3xl font-bold">
                        {stats.filter(b => b.count > 0).length > 0
                          ? (
                              stats.filter(b => b.count > 0)
                                .reduce((s, b) => s + parseFloat(b.avgCgpa || "0"), 0) /
                              stats.filter(b => b.count > 0).length
                            ).toFixed(2)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Largest Branch</p>
                      <p className="text-3xl font-bold">
                        {[...stats].sort((a, b) => b.count - a.count)[0]?.branch || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── 2. Branch cards — Bottom ── */}
            {loadingStats ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {BRANCHES.map(branch => {
                  const stat = stats.find(s => s.branch === branch.name);
                  return (
                    <button
                      key={branch.name}
                      onClick={() => handleBranchClick(branch.name)}
                      className="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-blue-200 transition-all group"
                    >
                      <div className={`w-10 h-10 ${branch.color} rounded-xl flex items-center justify-center mb-3`}>
                        <span className="text-white font-bold text-sm">
                          {branch.name.substring(0, 2)}
                        </span>
                      </div>

                      <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {branch.name}
                      </div>
                      <div className="text-xs text-gray-400 mb-3">{branch.label}</div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Students
                          </span>
                          <span className="font-bold text-gray-900">{stat?.count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> Avg CGPA
                          </span>
                          <span className="font-semibold text-blue-600">{stat?.avgCgpa || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Avg Attendance
                          </span>
                          <span className={`font-semibold ${
                            (stat?.avgAttendance || 0) >= 75 ? "text-green-600" : "text-red-500"
                          }`}>
                            {stat?.avgAttendance || "—"}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center text-xs text-blue-500 group-hover:translate-x-1 transition-transform">
                        View Students <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ BRANCH DETAIL VIEW ═══ */}
        {selectedBranch && (
          <>
            {/* Filter bar */}
            <Card className="rounded-2xl">
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search name / roll no"
                      className="pl-9 bg-gray-50"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min CGPA</label>
                    <Input
                      type="number" step="0.1" placeholder="e.g. 6.5"
                      className="bg-gray-50"
                      value={minCgpa}
                      onChange={e => setMinCgpa(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max CGPA</label>
                    <Input
                      type="number" step="0.1" placeholder="e.g. 10"
                      className="bg-gray-50"
                      value={maxCgpa}
                      onChange={e => setMaxCgpa(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total",     value: filteredStudents.length,                                                                                                         color: "text-gray-900"   },
                { label: "Avg CGPA",  value: filteredStudents.length ? (filteredStudents.reduce((s, st) => s + (parseFloat(st.profile?.cgpa) || 0), 0) / filteredStudents.length).toFixed(2) : "—", color: "text-blue-600"   },
                { label: "≥ 7.5 CGPA",value: filteredStudents.filter(s => (s.profile?.cgpa || 0) >= 7.5).length,                                                             color: "text-green-600"  },
                { label: "No Backlogs",value: filteredStudents.filter(s => (s.profile?.backlogs || 0) === 0).length,                                                          color: "text-emerald-600" },
              ].map(stat => (
                <Card key={stat.label} className="rounded-xl">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Students table */}
            <Card className="rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${branchMeta?.color}`} />
                  <span className="font-semibold text-gray-800">{selectedBranch} Students</span>
                  <Badge className="bg-blue-100 text-blue-700 ml-2">{filteredStudents.length}</Badge>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-200"
                >
                  <Download className="w-4 h-4 mr-1" /> Download PDF
                </Button>
              </div>

              {loadingStudents ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No students found for the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Roll No</th>
                        <th className="px-6 py-3">CGPA</th>
                        <th className="px-6 py-3">Attendance</th>
                        <th className="px-6 py-3">Backlogs</th>
                        <th className="px-6 py-3">Skills</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, i) => (
                        <tr
                          key={s._id}
                          className="border-b hover:bg-blue-50/40 cursor-pointer transition-colors"
                          onClick={() => navigate(`/admin/student/${s._id}`)}
                        >
                          <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{s.name}</td>
                          <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                            {s.profile?.rollNumber || "—"}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`font-bold ${
                              (s.profile?.cgpa || 0) >= 8   ? "text-green-600" :
                              (s.profile?.cgpa || 0) >= 6.5 ? "text-blue-600"  : "text-red-500"
                            }`}>
                              {s.profile?.cgpa || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`font-medium ${
                              (s.profile?.attendance || 0) >= 75 ? "text-green-600" : "text-red-500"
                            }`}>
                              {s.profile?.attendance || "—"}%
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`font-medium ${
                              (s.profile?.backlogs || 0) === 0 ? "text-gray-400" : "text-red-500"
                            }`}>
                              {s.profile?.backlogs || 0}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {s.profile?.skills?.slice(0, 3).map((sk: string) => (
                                <span key={sk} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

      </div>
    </AppLayout>
  );
}