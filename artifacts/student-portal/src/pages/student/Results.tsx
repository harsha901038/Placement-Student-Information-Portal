import { useState } from "react";
import { useResults, useAddResult } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Calculator, Trash2 } from "lucide-react";

export default function StudentResults() {
  const { data: results, isLoading } = useResults();
  const addResult = useAddResult();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [semester, setSemester] = useState("");
  const [subjects, setSubjects] = useState([{ subject: "", credits: 3, gradePoints: 8, grade: "B" }]);

  const overallCgpa = results && results.length > 0 
    ? (results.reduce((acc, curr) => acc + curr.sgpa, 0) / results.length).toFixed(2)
    : "N/A";

  const handleAddSubject = () => {
    setSubjects([...subjects, { subject: "", credits: 3, gradePoints: 8, grade: "B" }]);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semester) {
      toast({ title: "Please enter semester number", variant: "destructive" });
      return;
    }
    
    addResult.mutate({
      semester: parseInt(semester),
      subjects: subjects.map(s => ({ ...s, credits: Number(s.credits), gradePoints: Number(s.gradePoints) }))
    }, {
      onSuccess: () => {
        toast({ title: "Result added successfully!" });
        setOpen(false);
        setSemester("");
        setSubjects([{ subject: "", credits: 3, gradePoints: 8, grade: "B" }]);
      }
    });
  };

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Academic Results</h1>
            <p className="text-gray-500 mt-1">View semester-wise performance and SGPA</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <span className="text-sm font-semibold text-gray-500 mr-4">CGPA</span>
              <span className="text-3xl font-display font-bold text-primary">{overallCgpa}</span>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl shadow-lg shadow-primary/20 py-6">
                  <Plus className="w-5 h-5 mr-2" /> Add Result
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">Add Semester Result</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Semester Number</label>
                    <Input 
                      type="number" 
                      required min="1" max="8"
                      value={semester} 
                      onChange={e => setSemester(e.target.value)} 
                      className="rounded-xl max-w-[200px]" 
                      placeholder="e.g. 5"
                    />
                  </div>
                  
                  <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead>Subject Name</TableHead>
                          <TableHead className="w-24">Credits</TableHead>
                          <TableHead className="w-24">Points</TableHead>
                          <TableHead className="w-24">Grade</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((sub, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Input 
                                required value={sub.subject} 
                                onChange={e => {
                                  const newSubs = [...subjects];
                                  newSubs[i].subject = e.target.value;
                                  setSubjects(newSubs);
                                }}
                                className="border-0 bg-transparent focus-visible:ring-1"
                                placeholder="Course Name"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" required min="1" max="10"
                                value={sub.credits} 
                                onChange={e => {
                                  const newSubs = [...subjects];
                                  newSubs[i].credits = Number(e.target.value);
                                  setSubjects(newSubs);
                                }}
                                className="border-0 bg-transparent focus-visible:ring-1"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" required min="0" max="10"
                                value={sub.gradePoints} 
                                onChange={e => {
                                  const newSubs = [...subjects];
                                  newSubs[i].gradePoints = Number(e.target.value);
                                  setSubjects(newSubs);
                                }}
                                className="border-0 bg-transparent focus-visible:ring-1"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                required value={sub.grade} 
                                onChange={e => {
                                  const newSubs = [...subjects];
                                  newSubs[i].grade = e.target.value;
                                  setSubjects(newSubs);
                                }}
                                className="border-0 bg-transparent focus-visible:ring-1"
                                placeholder="A"
                              />
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubject(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <Button type="button" variant="outline" size="sm" onClick={handleAddSubject} className="rounded-xl w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Course
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="rounded-xl px-8" disabled={addResult.isPending}>
                      {addResult.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Calculate & Save
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {results && results.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {results.sort((a,b) => b.semester - a.semester).map((result) => (
              <AccordionItem key={result._id} value={result._id} className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden px-2">
                <AccordionTrigger className="px-6 py-6 hover:no-underline hover:bg-gray-50/50 rounded-2xl transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                        <Calculator className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-display font-semibold text-gray-900">Semester {result.semester}</h3>
                        <p className="text-sm text-gray-500">{result.subjects.length} Subjects</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">SGPA</span>
                      <span className="text-2xl font-bold text-primary bg-primary/5 px-4 py-1 rounded-xl">{result.sgpa.toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2">
                  <div className="border border-gray-100 rounded-2xl overflow-hidden mt-4">
                    <Table>
                      <TableHeader className="bg-gray-50/80">
                        <TableRow>
                          <TableHead className="font-semibold py-4">Subject</TableHead>
                          <TableHead className="font-semibold text-center py-4">Credits</TableHead>
                          <TableHead className="font-semibold text-center py-4">Grade</TableHead>
                          <TableHead className="font-semibold text-center py-4">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.subjects.map((sub, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{sub.subject}</TableCell>
                            <TableCell className="text-center text-gray-600">{sub.credits}</TableCell>
                            <TableCell className="text-center font-bold text-gray-900">{sub.grade}</TableCell>
                            <TableCell className="text-center text-primary font-semibold">{sub.gradePoints}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Calculator className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">You haven't added any semester results yet. Add your results to start tracking your SGPA/CGPA.</p>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
