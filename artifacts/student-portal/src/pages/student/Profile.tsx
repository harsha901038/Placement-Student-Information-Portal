import { useState, useEffect } from "react";
import { useStudentProfile, useUpdateProfile } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

export default function StudentProfile() {
  const { data, isLoading } = useStudentProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    college: "",
    rollNumber: "",
    phone: "",
    about: "",
    linkedIn: "",
    github: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        branch: data.profile?.branch || "",
        college: data.profile?.college || "",
        rollNumber: data.profile?.rollNumber || "",
        phone: data.profile?.phone || "",
        about: data.profile?.about || "",
        linkedIn: data.profile?.linkedIn || "",
        github: data.profile?.github || "",
      });
      setSkills(data.profile?.skills || []);
    }
  }, [data]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter(skill => skill !== s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: formData.name,
      profile: {
        branch: formData.branch,
        college: formData.college,
        rollNumber: formData.rollNumber,
        phone: formData.phone,
        about: formData.about,
        linkedIn: formData.linkedIn,
        github: formData.github,
        skills,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully" });
      },
      onError: (err: any) => {
        toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) return <AppLayout><div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-500 mt-1">Manage your academic and personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="px-8 pt-8 border-b border-gray-50 pb-6">
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email (Read Only)</Label>
                  <Input value={data?.email || ""} disabled className="rounded-xl bg-gray-100 text-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input 
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>College / Institution</Label>
                  <Input 
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch / Course</Label>
                  <Input 
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>About / Bio</Label>
                <Textarea 
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({...formData, about: e.target.value})}
                  className="rounded-xl bg-gray-50/50 resize-none"
                  placeholder="Tell us about your career goals..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-gray-100 shadow-sm">
            <CardHeader className="px-8 pt-8 border-b border-gray-50 pb-6">
              <CardTitle>Links & Skills</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>LinkedIn Profile</Label>
                  <Input 
                    value={formData.linkedIn}
                    onChange={(e) => setFormData({...formData, linkedIn: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub Profile</Label>
                  <Input 
                    value={formData.github}
                    onChange={(e) => setFormData({...formData, github: e.target.value})}
                    className="rounded-xl bg-gray-50/50"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input 
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    className="rounded-xl bg-gray-50/50 flex-1"
                    placeholder="Add a skill (e.g. React, Python)"
                  />
                  <Button type="button" onClick={handleAddSkill} variant="secondary" className="rounded-xl px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {skills.map(s => (
                    <div key={s} className="flex items-center px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium">
                      {s}
                      <button type="button" onClick={() => handleRemoveSkill(s)} className="ml-2 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="rounded-xl px-10 py-6 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
