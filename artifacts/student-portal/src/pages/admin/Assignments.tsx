import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Users, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = "https://placement-student-information-portal.onrender.com";

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: ""
});

export default function AdminAssignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [creating, setCreating] = useState(false);
  const [expandedResults, setExpandedResults] = useState(null);
  const [resultsData, setResultsData] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("Aptitude");

  const [form, setForm] = useState({
    week: "",
    title: "",
    deadline: "",
    questions: Array(20).fill(null).map(emptyQuestion)
  });

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API}/api/admin/assignments`);
      const data = await res.json();
      console.log("ASSIGNMENTS FETCHED:", data);
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  const handleQuestionChange = (qi, field, value) => {
    setForm(prev => {
      const questions = [...prev.questions];
      questions[qi] = { ...questions[qi], [field]: value };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qi, oi, value) => {
    setForm(prev => {
      const questions = [...prev.questions];
      const opts = [...questions[qi].options];
      opts[oi] = value;
      questions[qi] = { ...questions[qi], options: opts };
      return { ...prev, questions };
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/admin/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic })
      });
      const data = await res.json();
      if (data.questions) {
        setForm(prev => ({ ...prev, questions: data.questions }));
        toast({ title: `✅ ${data.questions.length} questions generated!` });
      }
    } catch (err) {
      toast({ title: "Generation failed!", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleCreate = async () => {
  if (!form.week || !form.title) {
    toast({ title: "Week number and title required!", variant: "destructive" });
    return;
  }
  
  const validQuestions = form.questions.filter(q => q.question.trim() !== "");
  if (validQuestions.length === 0) {
    toast({ title: "At least 1 question required!", variant: "destructive" });
    return;
  }

  const res = await fetch(`${API}/api/admin/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, questions: validQuestions })
  });
  
  if (res.ok) {
    toast({ title: "Assignment created ✅" });
    setCreating(false);
    setForm({ week: "", title: "", deadline: "", questions: Array(20).fill(null).map(emptyQuestion) });
    fetchAssignments();
  } else {
    const err = await res.json();
    toast({ title: `Error: ${err.message}`, variant: "destructive" });
  }
};

  const handleDelete = async (id) => {
    await fetch(`${API}/api/admin/assignments/${id}`, { method: "DELETE" });
    fetchAssignments();
  };

  const viewResults = async (id) => {
    if (expandedResults === id) { setExpandedResults(null); return; }
    const res = await fetch(`${API}/api/admin/assignments/${id}/results`);
    const data = await res.json();
    setResultsData(data);
    setExpandedResults(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Weekly Assignments</h1>
          <Button onClick={() => setCreating(!creating)}>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>

        {/* Create Form */}
        {creating && (
          <Card className="rounded-2xl border border-blue-200">
            <CardHeader><CardTitle>Create Weekly Assignment</CardTitle></CardHeader>
            <CardContent className="space-y-4">

              {/* Week / Title / Deadline */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Week Number</label>
                  <Input type="number" placeholder="e.g. 1" value={form.week}
                    onChange={e => setForm(p => ({ ...p, week: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Title</label>
                  <Input placeholder="e.g. Aptitude - Week 1" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Deadline</label>
                  <Input type="datetime-local" value={form.deadline}
                    onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
              </div>

              {/* AI Generate Section */}
              <div className="flex gap-3 items-end p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex-1">
                  <label className="text-sm text-gray-500 mb-1 block">Topic for AI Generation</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={selectedTopic}
                    onChange={e => setSelectedTopic(e.target.value)}
                  >
                    <option>Aptitude</option>
                    <option>Reasoning</option>
                    <option>English</option>
                    <option>Aptitude + Reasoning</option>
                    <option>Verbal Ability</option>
                  </select>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                >
                  {generating ? "⏳ Generating..." : "⚡ Generate with AI"}
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {form.questions.map((q, qi) => (
                  <div key={qi} className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {qi + 1}
                      </span>
                      <Input placeholder="Question" value={q.question}
                        onChange={e => handleQuestionChange(qi, "question", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qi}`}
                            checked={q.correctIndex === oi}
                            onChange={() => handleQuestionChange(qi, "correctIndex", oi)}
                            title="Mark as correct answer"
                          />
                          <Input placeholder={`Option ${oi + 1}`} value={opt}
                            onChange={e => handleOptionChange(qi, oi, e.target.value)}
                            className={q.correctIndex === oi ? "border-green-400 bg-green-50" : ""} />
                        </div>
                      ))}
                    </div>
                    <Input placeholder="Explanation (shown after submission)" value={q.explanation}
                      onChange={e => handleQuestionChange(qi, "explanation", e.target.value)} />
                  </div>
                ))}
              </div>

              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">
                Publish Assignment
              </Button>

            </CardContent>
          </Card>
        )}

        {/* Assignment List */}
        {assignments.map(a => (
          <Card key={a._id} className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-700">Week {a.week}</Badge>
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {a.questions.length} questions · Deadline: {a.deadline ? new Date(a.deadline).toLocaleString() : "None"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => viewResults(a._id)}>
                    <Users className="w-4 h-4 mr-1" />
                    Results
                    {expandedResults === a._id ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(a._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Results Table */}
              {expandedResults === a._id && (
                <div className="mt-4 border-t pt-4">
                  {resultsData.length === 0 ? (
                    <p className="text-sm text-gray-400">No submissions yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="pb-2">Rank</th>
                          <th className="pb-2">Student</th>
                          <th className="pb-2">Roll No</th>
                          <th className="pb-2">Score</th>
                          <th className="pb-2">Percentage</th>
                          <th className="pb-2">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData.map((sub, i) => (
                          <tr key={sub._id} className="border-b last:border-0">
                            <td className="py-2 font-bold text-gray-500">#{i + 1}</td>
                            <td className="py-2">{sub.studentId?.name || "—"}</td>
                            <td className="py-2 text-gray-400">{sub.studentId?.profile?.rollNumber || "—"}</td>
                            <td className="py-2 font-bold">{sub.score}/{a.questions.length}</td>
                            <td className="py-2">
                              <span className={`font-semibold ${Number(sub.percentage) >= 60 ? "text-green-600" : "text-red-500"}`}>
                                {sub.percentage}%
                              </span>
                            </td>
                            <td className="py-2 text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}