import { useState, useEffect } from "react";
import { useResume, useUpdateResume, useScoreResume } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Award, FileCheck, BrainCircuit } from "lucide-react";
import type { ResumeData } from "@workspace/api-client-react";

export default function ResumeBuilder() {
  const { data, isLoading } = useResume();
  const updateResume = useUpdateResume();
  const scoreResume = useScoreResume();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ResumeData>({
    objective: "",
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: []
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleSave = () => {
    updateResume.mutate(formData, {
      onSuccess: () => toast({ title: "Resume saved successfully" }),
      onError: (err: any) => toast({ title: "Failed to save", description: err.message, variant: "destructive" })
    });
  };

  const handleScore = () => {
    scoreResume.mutate(formData, {
      onSuccess: () => toast({ title: "Resume scored successfully" })
    });
  };

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-500 mt-1">Create, preview, and optimize your professional resume</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Button variant="outline" onClick={handleScore} disabled={scoreResume.isPending} className="rounded-xl border-primary text-primary hover:bg-primary/5">
              {scoreResume.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
              AI Score Check
            </Button>
            <Button onClick={handleSave} disabled={updateResume.isPending} className="rounded-xl shadow-lg shadow-primary/20">
              {updateResume.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Resume
            </Button>
          </div>
        </div>

        {scoreResume.data && (
          <Card className="rounded-3xl border-primary/20 bg-primary/5 overflow-hidden">
            <CardHeader className="bg-primary/10 pb-4">
              <CardTitle className="flex items-center text-primary">
                <Award className="w-6 h-6 mr-3" />
                Resume Score: {scoreResume.data.score}/{scoreResume.data.maxScore}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">Score Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(scoreResume.data.breakdown || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="capitalize text-gray-600">{key}</span>
                        <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(val as number / 20) * 100}%` }} />
                        </div>
                        <span className="font-semibold text-gray-900">{val as number}/20</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">Suggestions for Improvement</h4>
                  <ul className="space-y-2 list-disc list-inside text-sm text-gray-600 pl-4">
                    {scoreResume.data.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
            <TabsTrigger value="editor" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">Editor</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader><CardTitle>Objective</CardTitle></CardHeader>
              <CardContent>
                <Textarea 
                  rows={4}
                  value={formData.objective || ""}
                  onChange={e => setFormData({...formData, objective: e.target.value})}
                  placeholder="Professional summary..."
                  className="rounded-xl bg-gray-50 resize-none"
                />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setFormData({...formData, education: [...(formData.education||[]), { degree: "", institution: "" }]})}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.education?.map((edu, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div><Label>Degree</Label><Input value={edu.degree} onChange={e => { const n=[...(formData.education||[])]; n[i].degree=e.target.value; setFormData({...formData, education: n}) }} className="bg-white" /></div>
                      <div><Label>Institution</Label><Input value={edu.institution} onChange={e => { const n=[...(formData.education||[])]; n[i].institution=e.target.value; setFormData({...formData, education: n}) }} className="bg-white" /></div>
                      <div><Label>Year</Label><Input value={edu.year||""} onChange={e => { const n=[...(formData.education||[])]; n[i].year=e.target.value; setFormData({...formData, education: n}) }} className="bg-white" /></div>
                      <div><Label>CGPA/Score</Label><Input value={edu.cgpa||""} onChange={e => { const n=[...(formData.education||[])]; n[i].cgpa=e.target.value; setFormData({...formData, education: n}) }} className="bg-white" /></div>
                    </div>
                    <Button variant="ghost" className="text-red-500" onClick={() => { const n=[...(formData.education||[])]; n.splice(i,1); setFormData({...formData, education: n}) }}><Trash2 className="w-5 h-5"/></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setFormData({...formData, projects: [...(formData.projects||[]), { name: "", description: "" }]})}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.projects?.map((proj, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="grid grid-cols-1 gap-4 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Project Name</Label><Input value={proj.name} onChange={e => { const n=[...(formData.projects||[])]; n[i].name=e.target.value; setFormData({...formData, projects: n}) }} className="bg-white" /></div>
                        <div><Label>Link/URL</Label><Input value={proj.link||""} onChange={e => { const n=[...(formData.projects||[])]; n[i].link=e.target.value; setFormData({...formData, projects: n}) }} className="bg-white" /></div>
                      </div>
                      <div><Label>Description</Label><Textarea value={proj.description} onChange={e => { const n=[...(formData.projects||[])]; n[i].description=e.target.value; setFormData({...formData, projects: n}) }} className="bg-white" /></div>
                    </div>
                    <Button variant="ghost" className="text-red-500" onClick={() => { const n=[...(formData.projects||[])]; n.splice(i,1); setFormData({...formData, projects: n}) }}><Trash2 className="w-5 h-5"/></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-gray-100 shadow-sm">
              <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter') { e.preventDefault(); if(skillInput.trim()){ setFormData({...formData, skills: [...(formData.skills||[]), skillInput.trim()]}); setSkillInput(''); }}}} className="bg-gray-50 max-w-sm" placeholder="Add skill and press enter" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.skills?.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm flex items-center">
                      {s} <button onClick={() => { const n=[...(formData.skills||[])]; n.splice(i,1); setFormData({...formData, skills: n}); }} className="ml-2 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="p-12 min-h-[800px] border-none shadow-xl bg-white mx-auto max-w-[850px] font-sans">
              {/* Minimal styling for a typical resume look */}
              <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide">Your Name</h1>
                <p className="text-gray-600 mt-2">{formData.objective}</p>
              </div>

              <div className="space-y-8">
                {formData.education && formData.education.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest border-b border-gray-200 mb-4 pb-1">Education</h2>
                    <div className="space-y-4">
                      {formData.education.map((e,i) => (
                        <div key={i} className="flex justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{e.degree}</div>
                            <div className="text-gray-700 italic">{e.institution}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-600">{e.year}</div>
                            <div className="text-sm text-gray-500">Score: {e.cgpa}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {formData.projects && formData.projects.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest border-b border-gray-200 mb-4 pb-1">Projects</h2>
                    <div className="space-y-4">
                      {formData.projects.map((p,i) => (
                        <div key={i}>
                          <div className="flex justify-between">
                            <div className="font-bold text-gray-900">{p.name}</div>
                            {p.link && <a href={p.link} className="text-sm text-blue-600 hover:underline">{p.link}</a>}
                          </div>
                          <p className="text-gray-700 mt-1 text-sm">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {formData.skills && formData.skills.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-primary uppercase tracking-widest border-b border-gray-200 mb-4 pb-1">Skills</h2>
                    <p className="text-gray-700 font-medium">{formData.skills.join(" • ")}</p>
                  </section>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
