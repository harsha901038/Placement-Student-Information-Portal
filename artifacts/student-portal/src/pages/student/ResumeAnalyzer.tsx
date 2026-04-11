import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [resumeLoaded, setResumeLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await fetch(`https://placement-student-information-portal.onrender.com/api/student/resume?studentId=${user._id}`);
        const data = await res.json();

        if (data && (data.objective || data.skills?.length)) {
          const text = `
Objective: ${data.objective || "None"}
Skills: ${(data.skills || []).join(", ") || "None"}
Experience: ${(data.experience || []).map((e: any) => `${e.role} at ${e.company}: ${e.description}`).join(" | ") || "None"}
Education: ${(data.education || []).map((edu: any) => `${edu.institute} (${edu.year}) - ${edu.score}`).join(" | ") || "None"}
Certifications: ${(data.certifications || []).join(", ") || "None"}
Contact: ${data.email || ""} | ${data.phone || ""}
          `.trim();

          setResumeText(text);
          setResumeLoaded(true);
        }
      } catch (err) {
        console.log("Resume fetch error:", err);
      }
    };

    fetchResume();
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setAiLoading(true);
    setAiFeedback(null);
    setError(null);

    try {
      // ✅ Backend ద్వారా Groq call — CORS problem లేదు
      const response = await fetch("https://placement-student-information-portal.onrender.com/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText })
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Analysis fail అయింది. మళ్ళీ try చేయండి.");
        setAiLoading(false);
        return;
      }

      const parsed = await response.json();
      console.log("AI FEEDBACK:", parsed);
      setAiFeedback(parsed);

    } catch (err) {
      console.log("AI Error:", err);
      setError("Analysis fail అయింది. Server running గా ఉందా check చేయండి.");
    }

    setAiLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200", bar: "#22c55e" };
    if (score >= 50) return { text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", bar: "#eab308" };
    return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "#ef4444" };
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Resume Analyzer</h1>
            <p className="text-gray-500 text-sm mt-1">
              {resumeLoaded
                ? "✅ Resume Builder Loaded"
                : "⚠️ Save the Resume"}
            </p>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAnalyze}
            disabled={aiLoading || !resumeText.trim()}
          >
            {aiLoading ? "Analyzing..." : "🤖 Analyze with AI"}
          </Button>
        </div>

        {/* RESUME PREVIEW */}
        {resumeText && (
          <Card>
            <CardHeader><CardTitle>📄 Loaded Resume</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl font-mono">
                {resumeText}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* NOT LOADED */}
        {!resumeText && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-700 font-medium">Resume లేదు!</p>
            <p className="text-yellow-600 text-sm mt-1">
              Resume Builder లో resume create చేసి Save చేయండి — అప్పుడు ఇక్కడ auto-load అవుతుంది.
            </p>
          </div>
        )}

        {/* AI LOADING */}
        {aiLoading && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-600 font-medium animate-pulse">
            🤖 AI IS ANALYSING YOUR RESUME
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* AI FEEDBACK */}
        {aiFeedback && (
          <div className="space-y-4">

            {/* SCORE SECTION */}
            <div className="grid grid-cols-2 gap-4">

              {/* ATS SCORE */}
              {(() => {
                const score = typeof aiFeedback.atsScore === "number" ? aiFeedback.atsScore : parseInt(aiFeedback.atsScore) || 0;
                const colors = getScoreColor(score);
                const circumference = 2 * Math.PI * 54;
                const offset = circumference - (score / 100) * circumference;

                return (
                  <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5 flex flex-col items-center justify-center`}>
                    <p className="text-gray-500 text-sm font-medium mb-3">ATS Score</p>

                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle
                          cx="60" cy="60" r="54"
                          fill="none"
                          stroke={colors.bar}
                          strokeWidth="10"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                    </div>

                    <p className={`text-sm font-semibold mt-2 ${colors.text}`}>
                      {score >= 75 ? "Excellent ✅" : score >= 50 ? "Average ⚠️" : "Needs Work ❌"}
                    </p>
                  </div>
                );
              })()}

              {/* MISTAKES COUNT */}
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100 flex flex-col items-center justify-center">
                <p className="text-red-600 text-sm font-medium mb-3">Mistakes Found</p>
                <p className="text-6xl font-bold text-red-700">
                  {aiFeedback.mistakes?.length || 0}
                </p>
                <p className="text-xs text-red-400 mt-2">issues detected</p>
              </div>
            </div>

            {/* KEYWORDS + STRENGTHS + IMPROVEMENTS */}
            <Card>
              <CardContent className="pt-5 grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-green-700 mb-2">✅ Keywords Found</p>
                  <div className="flex flex-wrap gap-2">
                    {aiFeedback.keywords?.map((k: string, i: number) => (
                      <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-red-600 mb-2">❌ Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {aiFeedback.missingKeywords?.map((k: string, i: number) => (
                      <span key={i} className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-blue-700 mb-2">💪 Strengths</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {aiFeedback.strengths?.map((s: string, i: number) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-orange-600 mb-2">🔧 Improvements</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {aiFeedback.improvements?.map((s: string, i: number) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* MISTAKES */}
            {aiFeedback.mistakes?.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-red-600">⚠️ Mistakes Found</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {aiFeedback.mistakes.map((m: any, i: number) => (
                    <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        {m.type}
                      </span>
                      <p className="text-sm text-red-700 mt-2">❌ {m.issue}</p>
                      <p className="text-sm text-green-700 mt-1">✅ {m.fix}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* OVERALL FEEDBACK */}
            {aiFeedback.overallFeedback && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="font-semibold text-blue-700 mb-1">📝 Overall Feedback</p>
                <p className="text-sm text-gray-700">{aiFeedback.overallFeedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}