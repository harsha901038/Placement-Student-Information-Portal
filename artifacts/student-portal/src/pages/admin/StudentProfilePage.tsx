import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, MapPin, Building2, GraduationCap, Award } from "lucide-react";

const API = "https://placement-student-information-portal.onrender.com";

const InfoRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <span className="text-sm font-medium text-gray-900 block">{value || "—"}</span>
    </div>
  </div>
);

export default function StudentProfilePage() {
  const [location] = useLocation();
  const parts = location.split("/");
  const id = parts[parts.length - 1];

  const { data: student, isLoading } = useQuery({
    queryKey: ["admin-student-profile", id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/student/profile?studentId=${id}`);
      return res.json();
    },
    enabled: !!id && id.length === 24
  });

  if (isLoading) {
    return <AppLayout><div className="p-10 text-center">Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-500 mt-1">Personal and academic information</p>
        </div>

        {/* Profile Card */}
        <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden">

          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {(student?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student?.name || "Student Name"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/20 text-white border-0">
                    {student?.profile?.rollNumber || "Roll Number"}
                  </Badge>
                  <span>•</span>
                  <span className="text-blue-100">{student?.profile?.branch || "Branch"}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <InfoRow icon={User} label="Full Name" value={student?.name} />
                <InfoRow icon={Mail} label="Email" value={student?.email} />
                <InfoRow icon={Phone} label="Phone" value={student?.profile?.phone} />
                <InfoRow icon={Phone} label="Alternate Phone" value={student?.profile?.altPhone} />
                <InfoRow icon={Calendar} label="Date of Birth" value={student?.profile?.dob} />
                <InfoRow icon={User} label="Gender" value={student?.profile?.gender} />
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Academic Information
                </h3>
                <InfoRow icon={Building2} label="Branch" value={student?.profile?.branch} />
                <InfoRow icon={Award} label="CGPA" value={student?.profile?.cgpa} />
                <InfoRow icon={Calendar} label="Attendance %" value={student?.profile?.attendance} />
                <InfoRow icon={Award} label="Backlogs" value={student?.profile?.backlogs} />
                <InfoRow icon={Building2} label="College" value={student?.profile?.college} />
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Address Details
                </h3>
                <InfoRow icon={MapPin} label="Address" value={student?.profile?.address} />
                <InfoRow icon={MapPin} label="City" value={student?.profile?.city} />
                <InfoRow icon={MapPin} label="State" value={student?.profile?.state} />
                <InfoRow icon={MapPin} label="Pincode" value={student?.profile?.pincode} />
              </div>

              {/* Family */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Family Details
                </h3>
                <InfoRow icon={User} label="Father's Name" value={student?.profile?.fatherName} />
                <InfoRow icon={Phone} label="Father's Phone" value={student?.profile?.fatherPhone} />
                <InfoRow icon={User} label="Mother's Name" value={student?.profile?.motherName} />
                <InfoRow icon={Phone} label="Mother's Phone" value={student?.profile?.motherPhone} />
              </div>

            </div>

            {/* Skills */}
            {student?.profile?.skills && student.profile.skills.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Skills
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {student.profile.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-blue-100 text-blue-700 border-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            {student?.profile?.about && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{student.profile.about}</p>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}