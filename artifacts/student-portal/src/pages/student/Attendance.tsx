import { useAttendance } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentAttendance() {
  const { data, isLoading } = useAttendance();

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-50 text-green-700 border-green-200";
    if (percentage >= 75) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Attendance Record</h1>
            <p className="text-gray-500 mt-1">Track your classes and maintain eligibility</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Overall</p>
              <p className={`text-3xl font-display font-bold ${
                (data?.overallPercentage || 0) < 75 ? 'text-red-600' : 'text-primary'
              }`}>
                {data?.overallPercentage?.toFixed(1) || 0}%
              </p>
            </div>
            {data?.overallPercentage && data.overallPercentage < 75 && (
              <div className="flex items-center text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 mr-2" /> Action Required
              </div>
            )}
          </div>
        </div>

        <Card className="rounded-3xl shadow-sm border-gray-100 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
            <CardTitle>Subject-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px] px-8 py-4">Subject</TableHead>
                  <TableHead className="text-center py-4">Total Classes</TableHead>
                  <TableHead className="text-center py-4">Attended</TableHead>
                  <TableHead className="text-right px-8 py-4">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.records && data.records.length > 0 ? (
                  data.records.map((record, i) => (
                    <TableRow key={i} className="group">
                      <TableCell className="font-medium px-8 py-5 text-gray-900">{record.subject}</TableCell>
                      <TableCell className="text-center text-gray-600">{record.totalClasses}</TableCell>
                      <TableCell className="text-center font-medium">{record.attendedClasses}</TableCell>
                      <TableCell className="text-right px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl font-bold border ${getStatusColor(record.percentage)}`}>
                          {record.percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </motion.div>
    </AppLayout>
  );
}
