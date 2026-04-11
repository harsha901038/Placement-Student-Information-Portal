import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, Phone, Calendar, MapPin, Building2, 
  GraduationCap, Award, Lock, Save, Edit2, X 
} from "lucide-react";

const API = "https://placement-student-information-portal.onrender.com";

const InfoRow = ({ icon: Icon, label, value, isEditing, fieldName, formData, onChange }: any) => (
  <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      {isEditing ? (
        <Input
          value={formData[fieldName] || ""}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="h-8 text-sm"
        />
      ) : (
        <span className="text-sm font-medium text-gray-900 block">{value || "—"}</span>
      )}
    </div>
  </div>
);

export default function StudentProfile() {
  // ✅ localStorage నుండి studentId తీసుకో
  const studentId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user._id;
    } catch {
      return null;
    }
  })();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student-profile", studentId],
    queryFn: async () => {
      const res = await fetch(`${API}/api/student/profile?studentId=${studentId}`);
      return res.json();
    },
    enabled: !!studentId
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API}/api/student/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, ...data })
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully ✅" });
      qc.invalidateQueries({ queryKey: ["student-profile", studentId] });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Update failed ❌", variant: "destructive" });
    }
  });

  const changePassword = useMutation({
    mutationFn: async (newPassword: string) => {
      const res = await fetch(`${API}/api/student/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, newPassword })
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully ✅" });
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirm: "" });
    },
    onError: () => {
      toast({ title: "Password update failed ❌", variant: "destructive" });
    }
  });

  const handleEditClick = () => {
    setFormData({ name: student?.name || "", ...student?.profile });
    setIsEditing(true);
  };

  const handleSave = () => updateProfile.mutate(formData);

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      toast({ title: "Password too short (min 4 chars)", variant: "destructive" });
      return;
    }
    changePassword.mutate(passwordForm.newPassword);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!studentId) {
    return <AppLayout><div className="p-10 text-center text-red-500">Please login again.</div></AppLayout>;
  }

  if (isLoading) {
    return <AppLayout><div className="p-10 text-center">Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Personal and academic information</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEditClick} className="bg-blue-600 hover:bg-blue-700">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden">
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

              {/* Personal */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />Personal Information
                </h3>
                <InfoRow icon={User} label="Full Name" value={student?.name} isEditing={isEditing} fieldName="name" formData={formData} onChange={handleChange} />
                <InfoRow icon={Mail} label="Email" value={student?.email} isEditing={false} fieldName="email" formData={formData} onChange={handleChange} />
                <InfoRow icon={Phone} label="Phone" value={student?.profile?.phone} isEditing={isEditing} fieldName="phone" formData={formData} onChange={handleChange} />
                <InfoRow icon={Phone} label="Alternate Phone" value={student?.profile?.altPhone} isEditing={isEditing} fieldName="altPhone" formData={formData} onChange={handleChange} />
                <InfoRow icon={Calendar} label="Date of Birth" value={student?.profile?.dob} isEditing={isEditing} fieldName="dob" formData={formData} onChange={handleChange} />
                <InfoRow icon={User} label="Gender" value={student?.profile?.gender} isEditing={isEditing} fieldName="gender" formData={formData} onChange={handleChange} />
              </div>

              {/* Academic */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />Academic Information
                </h3>
                <InfoRow icon={Building2} label="Branch" value={student?.profile?.branch} isEditing={false} fieldName="branch" formData={formData} onChange={handleChange} />
                <InfoRow icon={Award} label="CGPA" value={student?.profile?.cgpa} isEditing={false} fieldName="cgpa" formData={formData} onChange={handleChange} />
                <InfoRow icon={Calendar} label="Attendance %" value={student?.profile?.attendance} isEditing={false} fieldName="attendance" formData={formData} onChange={handleChange} />
                <InfoRow icon={Award} label="Backlogs" value={student?.profile?.backlogs} isEditing={false} fieldName="backlogs" formData={formData} onChange={handleChange} />
                <InfoRow icon={Building2} label="College" value={student?.profile?.college} isEditing={isEditing} fieldName="college" formData={formData} onChange={handleChange} />
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />Address Details
                </h3>
                <InfoRow icon={MapPin} label="Address" value={student?.profile?.address} isEditing={isEditing} fieldName="address" formData={formData} onChange={handleChange} />
                <InfoRow icon={MapPin} label="City" value={student?.profile?.city} isEditing={isEditing} fieldName="city" formData={formData} onChange={handleChange} />
                <InfoRow icon={MapPin} label="State" value={student?.profile?.state} isEditing={isEditing} fieldName="state" formData={formData} onChange={handleChange} />
                <InfoRow icon={MapPin} label="Pincode" value={student?.profile?.pincode} isEditing={isEditing} fieldName="pincode" formData={formData} onChange={handleChange} />
              </div>

              {/* Family */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />Family Details
                </h3>
                <InfoRow icon={User} label="Father's Name" value={student?.profile?.fatherName} isEditing={isEditing} fieldName="fatherName" formData={formData} onChange={handleChange} />
                <InfoRow icon={Phone} label="Father's Phone" value={student?.profile?.fatherPhone} isEditing={isEditing} fieldName="fatherPhone" formData={formData} onChange={handleChange} />
                <InfoRow icon={User} label="Mother's Name" value={student?.profile?.motherName} isEditing={isEditing} fieldName="motherName" formData={formData} onChange={handleChange} />
                <InfoRow icon={Phone} label="Mother's Phone" value={student?.profile?.motherPhone} isEditing={isEditing} fieldName="motherPhone" formData={formData} onChange={handleChange} />
              </div>

            </div>

            {/* Skills */}
            {student?.profile?.skills && student.profile.skills.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />Skills
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {student.profile.skills.map((skill: string) => (
                    <Badge key={skill} className="bg-blue-100 text-blue-700 border-blue-200">{skill}</Badge>
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

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
                  <Input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handlePasswordChange} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Update Password
                  </Button>
                  <Button onClick={() => setShowPasswordModal(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </AppLayout>
  );
}