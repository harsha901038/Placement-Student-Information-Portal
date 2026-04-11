import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ChevronRight, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = "https://placement-student-information-portal.onrender.com";

export default function StudentAssignments() {
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user._id;

  const [assignments, setAssignments] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);

  useEffect(() => { fetchAssignments(); }, []);

  // 👇 BROWSER BACK BUTTON BLOCK (quiz active అయినప్పుడు)
  useEffect(() => {
    if (activeQuiz) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Quiz in progress! Are you sure you want to leave?";
      };

      const handlePopState = async () => {
        const confirm = window.confirm(
          "⚠️ Quiz in progress!\n\nIf you go back, your quiz will be auto-submitted.\n\nDo you want to continue?"
        );
        
        if (confirm) {
          // Auto-submit quiz
          await submitQuizSilently();
        } else {
          // Stay on page
          window.history.pushState(null, "", window.location.href);
        }
      };

      // Push state to history
      window.history.pushState(null, "", window.location.href);
      
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [activeQuiz, answers]);

  const fetchAssignments = async () => {
    const res = await fetch(`${API}/api/student/assignments?studentId=${studentId}`);
    const data = await res.json();
    setAssignments(data);
  };

  const startQuiz = async (id) => {
    const res = await fetch(`${API}/api/student/assignments/${id}?studentId=${studentId}`);
    if (!res.ok) {
      toast({ title: "Already submitted!", variant: "destructive" });
      return;
    }
    const data = await res.json();
    setActiveQuiz(data);
    setAnswers({});
    setResult(null);
  };

  const viewResult = async (id) => {
    const res = await fetch(`${API}/api/student/assignments/${id}/result?studentId=${studentId}`);
    const data = await res.json();
    setViewingResult(data);
  };

  const submitQuizSilently = async () => {
    if (!activeQuiz) return;

    const answersArray = activeQuiz.questions.map((_, i) => answers[i] ?? -1);

    const res = await fetch(`${API}/api/student/assignments/${activeQuiz._id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, answers: answersArray })
    });

    const data = await res.json();
    setResult(data);
    setActiveQuiz(null);
    fetchAssignments();
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < activeQuiz.questions.length) {
      toast({ title: "Please answer all questions!", variant: "destructive" });
      return;
    }

    const answersArray = activeQuiz.questions.map((_, i) => answers[i] ?? -1);

    const res = await fetch(`${API}/api/student/assignments/${activeQuiz._id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, answers: answersArray })
    });

    const data = await res.json();
    setResult(data);
    setActiveQuiz(null);
    fetchAssignments();
  };

  // --- RESULT VIEW ---
  if (viewingResult) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Result</h2>
            <Button variant="outline" onClick={() => setViewingResult(null)}>← Back</Button>
          </div>
          <Card className="rounded-2xl text-center p-6">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <div className="text-4xl font-bold text-blue-700">{viewingResult.score}/{viewingResult.total}</div>
            <div className={`text-xl font-semibold mt-1 ${Number(viewingResult.percentage) >= 60 ? "text-green-600" : "text-red-500"}`}>
              {viewingResult.percentage}%
            </div>
          </Card>
          {viewingResult.detailed.map((q, i) => (
            <Card key={i} className={`rounded-xl border-l-4 ${q.isCorrect ? "border-green-400" : "border-red-400"}`}>
              <CardContent className="pt-4">
                <p className="font-medium mb-2">{i + 1}. {q.question}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`text-sm p-2 rounded-lg ${
                      oi === q.correctAnswer ? "bg-green-100 text-green-800 font-semibold" :
                      oi === q.studentAnswer && !q.isCorrect ? "bg-red-100 text-red-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-sm text-blue-700 bg-blue-50 rounded-lg p-2">
                    💡 {q.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  // --- AFTER SUBMISSION RESULT ---
  if (result) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-center">Quiz Submitted!</h2>
          <Card className="rounded-2xl text-center p-6">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <div className="text-4xl font-bold text-blue-700">{result.score}/{result.total}</div>
            <div className={`text-xl font-semibold mt-1 ${Number(result.percentage) >= 60 ? "text-green-600" : "text-red-500"}`}>
              {result.percentage}%
            </div>
          </Card>
          {result.detailed.map((q, i) => (
            <Card key={i} className={`rounded-xl border-l-4 ${q.isCorrect ? "border-green-400" : "border-red-400"}`}>
              <CardContent className="pt-4">
                <p className="font-medium mb-2">{i + 1}. {q.question}</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`text-sm p-2 rounded-lg ${
                      oi === q.correctAnswer ? "bg-green-100 text-green-800 font-semibold" :
                      oi === q.studentAnswer && !q.isCorrect ? "bg-red-100 text-red-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-sm text-blue-700 bg-blue-50 rounded-lg p-2">
                    💡 {q.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          <Button className="w-full" onClick={() => setResult(null)}>← Back to Assignments</Button>
        </div>
      </AppLayout>
    );
  }

  // --- ACTIVE QUIZ ---
  if (activeQuiz) {
    const answered = Object.keys(answers).length;
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* ⚠️ WARNING BANNER */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Quiz in Progress</p>
              <p className="text-sm text-yellow-700">If you leave this page, your quiz will be auto-submitted with current answers!</p>
            </div>
          </div>

          <div className="flex justify-between items-center sticky top-0 bg-white py-3 z-10 border-b">
            <h2 className="font-bold text-lg">{activeQuiz.title}</h2>
            <span className="text-sm text-gray-500">{answered}/{activeQuiz.questions.length} answered</span>
          </div>
          {activeQuiz.questions.map((q, i) => (
            <Card key={i} className={`rounded-xl ${answers[i] !== undefined ? "border-blue-200" : ""}`}>
              <CardContent className="pt-4">
                <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                      answers[i] === oi ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                    }`}>
                      <input type="radio" name={`q-${i}`} value={oi}
                        checked={answers[i] === oi}
                        onChange={() => setAnswers(prev => ({ ...prev, [i]: oi }))} />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg" onClick={submitQuiz}>
            Submit Quiz
          </Button>
        </div>
      </AppLayout>
    );
  }

  // --- ASSIGNMENT LIST ---
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Weekly Assignments</h1>
        {assignments.length === 0 && (
          <p className="text-gray-400 text-center py-12">No assignments yet. Check back later!</p>
        )}
        {assignments.map(a => (
          <Card key={a._id} className="rounded-2xl hover:shadow-md transition-all">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge className="bg-blue-100 text-blue-700">Week {a.week}</Badge>
                  {a.submitted && <Badge className="bg-green-100 text-green-700">Submitted</Badge>}
                </div>
                <h3 className="font-semibold text-gray-800">{a.title}</h3>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {a.deadline ? `Due: ${new Date(a.deadline).toLocaleString()}` : "No deadline"}
                  · {a.questionCount} questions
                </p>
              </div>
              {a.submitted ? (
                <Button variant="outline" onClick={() => viewResult(a._id)}>
                  View Result <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => startQuiz(a._id)}>
                  Start Quiz <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}