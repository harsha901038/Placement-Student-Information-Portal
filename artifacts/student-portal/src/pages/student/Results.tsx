import { useState } from "react";
import { useResults, useAddResult } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// ✅ COMPLETELY OUTSIDE - fixes focus loss on every keystroke
function SubjectRows({
  subs,
  setSubs,
}: {
  subs: any[];
  setSubs: (s: any[]) => void;
}) {
  return (
    <div className="space-y-2">
      {subs.map((sub, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Subject name"
            value={sub.subject}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              const n = subs.map((s, idx) => idx === i ? { ...s, subject: e.target.value } : s);
              setSubs(n);
            }}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fff",
              color: "#111",
              outline: "none",
            }}
          />
          <input
            type="number"
            placeholder="Credits"
            value={sub.credits}
            autoComplete="off"
            onChange={(e) => {
              const n = subs.map((s, idx) => idx === i ? { ...s, credits: Number(e.target.value) } : s);
              setSubs(n);
            }}
            style={{
              width: "80px",
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fff",
              color: "#111",
              outline: "none",
            }}
          />
          <input
            type="number"
            placeholder="Grade Pts"
            value={sub.gradePoints}
            autoComplete="off"
            onChange={(e) => {
              const n = subs.map((s, idx) => idx === i ? { ...s, gradePoints: Number(e.target.value) } : s);
              setSubs(n);
            }}
            style={{
              width: "90px",
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "#fff",
              color: "#111",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setSubs(subs.filter((_, idx) => idx !== i))}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function StudentResults() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { data: results, isLoading } = useResults(user._id);
  const addResult = useAddResult();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [openSem, setOpenSem] = useState<number | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [editSubjects, setEditSubjects] = useState<any[]>([]);
  const [editBacklogs, setEditBacklogs] = useState(0);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([
    { subject: "", credits: 3, gradePoints: 8, grade: "B" }
  ]);
  const [backlogs, setBacklogs] = useState(0);

  const overallCgpa = (() => {
    if (!results || results.length === 0) return "N/A";
    const unique = Array.from(new Map(results.map((r: any) => [r.semester, r])).values());
    const totalCredits = unique.reduce((sum: number, r: any) =>
      sum + r.subjects.reduce((s: number, sub: any) => s + sub.credits, 0), 0);
    const totalPoints = unique.reduce((sum: number, r: any) =>
      sum + r.subjects.reduce((s: number, sub: any) => s + (sub.credits * sub.gradePoints), 0), 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";
  })();

  const handleDelete = async (resultId: string) => {
    if (!confirm("ఈ semester result delete చేయాలా?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/student/results/${resultId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Result deleted successfully!" });
        queryClient.invalidateQueries({ queryKey: ["results", user._id] });
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  const handleEditOpen = (r: any) => {
    setEditingResult(r);
    setEditSubjects(r.subjects.map((s: any) => ({ ...s })));
    setEditBacklogs(r.backlogs || 0);
    setEditOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/student/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user._id,
          semester: editingResult.semester,
          subjects: editSubjects,
          backlogs: editBacklogs
        })
      });
      if (res.ok) {
        toast({ title: "Result updated successfully!" });
        setEditOpen(false);
        queryClient.invalidateQueries({ queryKey: ["results", user._id] });
      } else {
        toast({ title: "Update failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error updating", variant: "destructive" });
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addResult.mutate(
      { studentId: user._id, semester: parseInt(semester), backlogs, subjects },
      {
        onSuccess: () => {
          toast({ title: "Result added successfully!" });
          setOpen(false);
          setSemester("");
          setSubjects([{ subject: "", credits: 3, gradePoints: 8, grade: "B" }]);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Academic Results</h1>
            <p className="text-gray-500">View semester-wise performance</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-xl shadow border">
              CGPA: <span className="text-xl font-bold text-blue-600">{overallCgpa}</span>
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2" /> Add Result
            </Button>
          </div>
        </div>

        {/* ADD MODAL */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div
              className="relative z-10 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: "#111" }}>Add Result</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="number"
                  placeholder="Semester (1-8)"
                  value={semester}
                  autoComplete="off"
                  onChange={(e) => setSemester(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    color: "#111",
                    outline: "none",
                  }}
                />

                <SubjectRows subs={subjects} setSubs={setSubjects} />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (subjects.length >= 10) {
                        toast({ title: "Max 10 subjects only", variant: "destructive" });
                        return;
                      }
                      setSubjects([...subjects, { subject: "", credits: 3, gradePoints: 8, grade: "B" }]);
                    }}
                  >
                    + Add Subject
                  </Button>
                  <Button type="submit" disabled={addResult.isPending}>
                    {addResult.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
            <div
              className="relative z-10 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: "#111" }}>
                  Edit Semester {editingResult?.semester} Result
                </h2>
                <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="space-y-4">
                <SubjectRows subs={editSubjects} setSubs={setEditSubjects} />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (editSubjects.length >= 10) {
                        toast({ title: "Max 10 subjects only", variant: "destructive" });
                        return;
                      }
                      setEditSubjects([...editSubjects, { subject: "", credits: 3, gradePoints: 8, grade: "B" }]);
                    }}
                  >
                    + Add Subject
                  </Button>
                  <Button type="submit" disabled={isEditSaving}>
                    {isEditSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RESULTS LIST */}
        {Array.from(new Map(results?.map((r: any) => [r.semester, r])).values())
          .sort((a: any, b: any) => b.semester - a.semester)
          .map((r: any) => (
            <div key={r._id} className="bg-white border rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setOpenSem(openSem === r.semester ? null : r.semester)}
                >
                  <h2 className="font-bold">Semester {r.semester}</h2>
                  <p className="text-sm text-gray-500">{r.subjects.length} subjects</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">SGPA</p>
                    <p className="font-bold text-blue-600">{r.sgpa.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleEditOpen(r)}
                    className="text-blue-400 hover:text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 rounded-lg px-3 py-1 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <span
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setOpenSem(openSem === r.semester ? null : r.semester)}
                  >
                    {openSem === r.semester ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {openSem === r.semester && (
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {r.subjects.map((s: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{s.subject}</TableCell>
                          <TableCell>{s.credits}</TableCell>
                          <TableCell>{s.grade}</TableCell>
                          <TableCell>{s.gradePoints}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}

      </div>
    </AppLayout>
  );
}