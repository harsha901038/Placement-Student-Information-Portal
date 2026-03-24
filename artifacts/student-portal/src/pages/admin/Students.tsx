import { useState } from "react";
import { useAdminStudents } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, SlidersHorizontal, User } from "lucide-react";
import type { StudentProfile } from "@workspace/api-client-react";

export default function AdminStudents() {
  const [filters, setFilters] = useState({ search: "", minCgpa: "", skills: "" });
  // Debounce logic omitted for brevity, passing directly in simple app
  const { data, isLoading } = useAdminStudents({ 
    search: filters.search, 
    minCgpa: filters.minCgpa ? parseFloat(filters.minCgpa) : undefined,
    skills: filters.skills 
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Student Database</h1>
            <p className="text-gray-500 mt-1">View and filter student profiles</p>
          </div>
        </div>

        <Card className="rounded-3xl border-gray-100 shadow-sm p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search by name or email" 
                className="pl-10 rounded-xl bg-gray-50"
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input 
                type="number" step="0.1"
                placeholder="Min CGPA" 
                className="pl-10 rounded-xl bg-gray-50"
                value={filters.minCgpa}
                onChange={e => setFilters({...filters, minCgpa: e.target.value})}
              />
            </div>
            <Input 
              placeholder="Filter by skill (e.g. React)" 
              className="rounded-xl bg-gray-50"
              value={filters.skills}
              onChange={e => setFilters({...filters, skills: e.target.value})}
            />
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="py-4">Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Top Skills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                ) : data && data.length > 0 ? (
                  data.map(student => (
                    <TableRow 
                      key={student._id} 
                      className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell className="py-4">
                        <div className="font-semibold text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </TableCell>
                      <TableCell>{student.profile?.branch || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">{student.profile?.cgpa || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {student.profile?.skills?.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          {(student.profile?.skills?.length || 0) > 3 && <span className="text-xs text-gray-400">+{student.profile!.skills!.length - 3}</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-gray-500">No students found matching criteria.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-3xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3"><User className="w-6 h-6 text-primary" /></div>
                Student Profile
              </DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-lg">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-lg">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Branch & College</p>
                    <p className="font-semibold">{selectedStudent.profile?.branch || '-'}, {selectedStudent.profile?.college || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CGPA</p>
                    <p className="font-semibold text-primary text-xl">{selectedStudent.profile?.cgpa || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.profile?.skills?.map(s => <Badge key={s} className="bg-primary/10 text-primary hover:bg-primary/20">{s}</Badge>)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">About</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedStudent.profile?.about || 'No bio provided.'}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AppLayout>
  );
}
