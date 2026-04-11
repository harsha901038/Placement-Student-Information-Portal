import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAdminStudent } from "@/hooks/use-admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "http://https://placement-student-information-portal.onrender.com";

const ResumeSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
      letterSpacing: 1.5, borderBottom: "1.5px solid #111827",
      paddingBottom: 4, marginBottom: 8
    }}>{title}</div>
    {children}
  </div>
);

export default function StudentDataPage() {
  const [openSemesters, setOpenSemesters] = useState<Set<string>>(new Set());
  const [editingAtt, setEditingAtt] = useState<any>(null);
  const [attForm, setAttForm] = useState({ attendedClasses: 0, totalClasses: 0 });
  const qc = useQueryClient();

  const toggleSemester = (id: string) => {
    setOpenSemesters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [location] = useLocation();
  const parts = location.split("/");
  const id = parts[parts.length - 1];

  const { data, isLoading } = useAdminStudent(id?.length === 24 ? id : "");

  // Attendance fetch
  const { data: attData, isLoading: attLoading } = useQuery({
    queryKey: ["admin-attendance", id],
    queryFn: async () => {
      const r = await fetch(`${API}/api/admin/attendance/${id}`);
      return r.json();
    },
    enabled: !!id && id.length === 24
  });

  // Attendance update
  const updateAtt = useMutation({
    mutationFn: async ({ recId, attended, total }: any) => {
      const r = await fetch(`${API}/api/admin/attendance/${recId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendedClasses: attended, totalClasses: total })
      });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-attendance", id] });
      setEditingAtt(null);
    }
  });

  const resume = (data as any)?.resume;
  const results = (data as any)?.results || [];

  const cgpa = (() => {
    if (!results || results.length === 0) return null;
    const totalCredits = results.reduce((sum: number, r: any) =>
      sum + r.subjects.reduce((s: number, sub: any) => s + sub.credits, 0), 0);
    const totalPoints = results.reduce((sum: number, r: any) =>
      sum + r.subjects.reduce((s: number, sub: any) => s + (sub.credits * sub.gradePoints), 0), 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  })();

  const getAttColor = (p: number) => {
    if (p >= 85) return { bar: "#16a34a", text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" };
    if (p >= 75) return { bar: "#d97706", text: "#b45309", bg: "#fffbeb", border: "#fde68a" };
    return { bar: "#dc2626", text: "#b91c1c", bg: "#fef2f2", border: "#fecaca" };
  };

  if (isLoading) {
    return <AppLayout><div className="p-10 text-center">Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">

        <h1 className="text-2xl font-bold">Student Profile</h1>

        {/* ── RESUME + RESULTS ── */}
        <div className="flex gap-6 items-start">

          {/* LEFT - Resume */}
          <div style={{
            flex: 1, background: "#fff", borderRadius: 16,
            border: "1px solid #e5e7eb", padding: "32px 40px",
            fontFamily: "Arial, sans-serif", fontSize: 13,
            color: "#111827", lineHeight: 1.65,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
          }}>
            <div style={{ textAlign: "center", borderBottom: "2px solid #111827", paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                {resume?.name || (data as any)?.student?.name || "—"}
              </div>
              <div style={{ marginTop: 5, fontSize: 12.5, color: "#374151" }}>
                {[resume?.email, resume?.phone, resume?.address].filter(Boolean).join("   |   ")}
              </div>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                {resume?.linkedin && <a href={resume.linkedin} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>LinkedIn</a>}
                {resume?.github && <a href={resume.github} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>GitHub</a>}
                {resume?.hackerrank && <a href={resume.hackerrank} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>HackerRank</a>}
                {resume?.leetcode && <a href={resume.leetcode} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>LeetCode</a>}
              </div>
            </div>

            {resume?.objective && <ResumeSection title="Objective"><p style={{ margin: 0 }}>{resume.objective}</p></ResumeSection>}
            {resume?.professionalSummary && <ResumeSection title="Professional Summary"><p style={{ margin: 0 }}>{resume.professionalSummary}</p></ResumeSection>}

            {resume?.education?.length > 0 && (
              <ResumeSection title="Education">
                {resume.education.map((e: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span><b>{e.institute}</b>{e.score ? ` — ${e.score}` : ""}</span>
                    <span style={{ color: "#6b7280" }}>{e.year}</span>
                  </div>
                ))}
              </ResumeSection>
            )}

            {resume?.skills?.length > 0 && (
              <ResumeSection title="Skills">
                <p style={{ margin: 0 }}>{resume.skills.join(", ")}</p>
              </ResumeSection>
            )}

            {resume?.experience?.length > 0 && (
              <ResumeSection title="Experience">
                {resume.experience.map((e: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <b>{e.role}</b><span style={{ color: "#6b7280" }}>{e.company}</span>
                    </div>
                    {e.description && <p style={{ margin: "3px 0 0", color: "#374151" }}>{e.description}</p>}
                  </div>
                ))}
              </ResumeSection>
            )}

            {resume?.projects?.length > 0 && (
              <ResumeSection title="Projects">
                {resume.projects.map((p: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <b>{p.name}</b>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", fontSize: 12 }}>{p.link}</a>}
                    </div>
                    {p.description && <p style={{ margin: "3px 0 0", color: "#374151" }}>{p.description}</p>}
                  </div>
                ))}
              </ResumeSection>
            )}

            {resume?.achievements?.length > 0 && (
              <ResumeSection title="Achievements">
                {resume.achievements.map((a: any, i: number) => (
                  <div key={i} style={{ marginBottom: 5 }}>
                    <b>{a.title}</b>
                    {a.description && <span style={{ color: "#374151" }}> — {a.description}</span>}
                  </div>
                ))}
              </ResumeSection>
            )}

            {resume?.certifications?.length > 0 && (
              <ResumeSection title="Certifications">
                {resume.certifications.map((c: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{typeof c === "string" ? c : c.name}</span>
                    {c.driveLink && <a href={c.driveLink} style={{ color: "#1d4ed8", fontSize: 12 }}>View</a>}
                  </div>
                ))}
              </ResumeSection>
            )}

            {resume?.languages?.length > 0 && (
              <ResumeSection title="Languages">
                <p style={{ margin: 0 }}>{resume.languages.join(", ")}</p>
              </ResumeSection>
            )}

            {resume?.hobbies?.length > 0 && (
              <ResumeSection title="Hobbies & Interests">
                <p style={{ margin: 0 }}>{resume.hobbies.join(", ")}</p>
              </ResumeSection>
            )}

            {!resume && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                Resume not submitted yet
              </div>
            )}
          </div>

          {/* RIGHT - Results */}
          <div className="w-[380px] space-y-4">
            {cgpa && (
              <div className="bg-blue-600 text-white rounded-2xl px-6 py-4 shadow-lg">
                <p className="text-sm opacity-80">Overall CGPA</p>
                <p className="text-4xl font-bold mt-1">{cgpa}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-gray-700 font-bold text-sm uppercase tracking-wide">Semester Results</h2>
                {results.map((r: any) => (
                  <div key={r._id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div
                      className="flex justify-between items-center px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSemester(r._id)}
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Semester {r.semester}</p>
                        <p className="text-xs text-gray-500">{r.subjects?.length || 0} subjects</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">SGPA</p>
                          <p className="text-blue-600 font-bold">{r.sgpa}</p>
                        </div>
                        <span className="text-gray-400 text-sm">{openSemesters.has(r._id) ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {openSemesters.has(r._id) && r.subjects?.length > 0 && (
                      <table className="w-full text-xs">
                        <thead className="bg-white border-t">
                          <tr className="text-gray-500 text-left">
                            <th className="px-4 py-2 font-medium">Subject</th>
                            <th className="px-4 py-2 font-medium">Credits</th>
                            <th className="px-4 py-2 font-medium">Grade</th>
                            <th className="px-4 py-2 font-medium">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.subjects.map((s: any, i: number) => (
                            <tr key={i} className="border-t">
                              <td className="px-4 py-2 text-gray-800">{s.subject}</td>
                              <td className="px-4 py-2 text-gray-600">{s.credits}</td>
                              <td className="px-4 py-2 text-gray-600">{s.grade}</td>
                              <td className="px-4 py-2 text-gray-600">{s.gradePoints}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ATTENDANCE SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Attendance Record</h2>
              <p className="text-sm text-gray-500">Semester-wise — click Edit to update</p>
            </div>
            {attData?.overallPercentage && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Overall</p>
                <p className="text-2xl font-bold text-blue-600">{attData.overallPercentage}%</p>
              </div>
            )}
          </div>

          {attLoading ? (
            <div className="text-center py-8 text-gray-400">Loading attendance...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {attData?.records?.map((rec: any) => {
                const c = getAttColor(rec.percentage);
                const isEditing = editingAtt?._id === rec._id;
                return (
                  <div key={rec._id} style={{
                    background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: 12, padding: "14px 16px"
                  }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800 text-sm">Sem {rec.semester}</span>
                      <span style={{ color: c.text, fontWeight: 800, fontSize: 16 }}>
                        {rec.percentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ background: "#e5e7eb", borderRadius: 99, height: 5, marginBottom: 8, overflow: "hidden" }}>
                      <div style={{ width: `${rec.percentage}%`, height: "100%", background: c.bar, borderRadius: 99 }} />
                    </div>

                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          type="number"
                          value={attForm.attendedClasses}
                          onChange={e => setAttForm(p => ({ ...p, attendedClasses: +e.target.value }))}
                          placeholder="Attended"
                          className="w-full border rounded px-2 py-1 text-xs"
                        />
                        <input
                          type="number"
                          value={attForm.totalClasses}
                          onChange={e => setAttForm(p => ({ ...p, totalClasses: +e.target.value }))}
                          placeholder="Total"
                          className="w-full border rounded px-2 py-1 text-xs"
                        />
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => updateAtt.mutate({ recId: rec._id, attended: attForm.attendedClasses, total: attForm.totalClasses })}
                            className="flex-1 bg-blue-600 text-white text-xs rounded py-1 font-medium"
                          >Save</button>
                          <button
                            onClick={() => setEditingAtt(null)}
                            className="flex-1 bg-gray-200 text-gray-700 text-xs rounded py-1"
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500">{rec.attendedClasses} / {rec.totalClasses} classes</p>
                        <button
                          onClick={() => { setEditingAtt(rec); setAttForm({ attendedClasses: rec.attendedClasses, totalClasses: rec.totalClasses }); }}
                          className="mt-2 w-full text-xs border border-gray-300 rounded py-1 text-gray-600 hover:bg-white transition"
                        > Edit</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}