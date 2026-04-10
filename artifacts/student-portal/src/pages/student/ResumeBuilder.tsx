import { useState, useEffect } from "react";
import { useResume, useUpdateResume } from "@/hooks/use-student";
import { AppLayout } from "@/components/layout/AppLayout";

// ============================================================
// ✅ CONSTANTS & SMALL COMPONENTS — function బయట define చేశాం
//    ఇవి లోపల ఉంటే ప్రతి keystroke కి re-create అవుతాయి
//    focus పోతుంది — ఇప్పుడు fix అయింది
// ============================================================

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: "1px solid #d1d5db", fontSize: 13.5, color: "#111827",
  background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit"
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4
};
const cardStyle: React.CSSProperties = {
  background: "#f9fafb", borderRadius: 8, padding: 14,
  marginBottom: 12, border: "1px solid #e5e7eb", position: "relative"
};
const rmBtn: React.CSSProperties = {
  position: "absolute", top: 10, right: 10, background: "#fee2e2",
  color: "#dc2626", border: "none", borderRadius: 6,
  padding: "2px 10px", cursor: "pointer", fontWeight: 600, fontSize: 12
};
const dashed: React.CSSProperties = {
  width: "100%", padding: 9, borderRadius: 7,
  border: "1.5px dashed #d1d5db", background: "transparent",
  color: "#6b7280", fontWeight: 600, cursor: "pointer", fontSize: 13
};

// ✅ Input field component
const F = ({
  label, value, onChange, placeholder
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div style={{ marginBottom: 11 }}>
    {label && <label style={lbl}>{label}</label>}
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inp}
      autoComplete="off"
    />
  </div>
);

// ✅ Textarea component
const T = ({
  label, value, onChange, placeholder, rows = 3
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div style={{ marginBottom: 11 }}>
    {label && <label style={lbl}>{label}</label>}
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inp, resize: "vertical" } as React.CSSProperties}
    />
  </div>
);

// ✅ Section wrapper component
const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{
    background: "#fff", borderRadius: 9, border: "1px solid #e5e7eb",
    marginBottom: 14, overflow: "hidden"
  }}>
    <div style={{ padding: "11px 16px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
      <span style={{ fontWeight: 700, fontSize: 13.5, color: "#111827" }}>{title}</span>
    </div>
    <div style={{ padding: "14px 16px" }}>{children}</div>
  </div>
);

// ============================================================
// ✅ EMPTY ITEM HELPERS
// ============================================================
const emptyEdu = () => ({ institute: "", year: "", score: "" });
const emptyExp = () => ({ company: "", role: "", description: "" });
const emptyProject = () => ({ name: "", description: "", link: "" });
const emptyAchievement = () => ({ title: "", description: "" });
const emptyCert = () => ({ name: "", driveLink: "" });

// ============================================================
// ✅ MAIN COMPONENT
// ============================================================
export default function ResumeBuilder() {
  const { data } = useResume();
  const updateResume = useUpdateResume();

  const [tab, setTab] = useState("editor");
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [hobbyInput, setHobbyInput] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    objective: "", professionalSummary: "",
    education: [] as any[],
    skills: [] as string[],
    experience: [] as any[],
    projects: [] as any[],
    achievements: [] as any[],
    certifications: [] as any[],
    languages: [] as string[],
    hobbies: [] as string[],
    linkedin: "", github: "", hackerrank: "", leetcode: "",
  });

  // ✅ Load saved data once
  useEffect(() => {
    if (!initialized && data && data.email !== undefined) {
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        objective: data.objective || "",
        professionalSummary: data.professionalSummary || "",
        education: data.education || [],
        skills: data.skills || [],
        experience: data.experience || [],
        projects: data.projects || [],
        achievements: data.achievements || [],
        certifications: data.certifications || [],
        languages: data.languages || [],
        hobbies: data.hobbies || [],
        linkedin: data.linkedin || "",
        github: data.github || "",
        hackerrank: data.hackerrank || "",
        leetcode: data.leetcode || "",
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  // ✅ Helpers
  const set = (field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value }));

  const addTag = (field: string, input: string, setInput: (v: string) => void) => {
    if (input.trim()) {
      set(field, [...(form[field as keyof typeof form] as string[]), input.trim()]);
      setInput("");
    }
  };

  const removeTag = (field: string, i: number) =>
    set(field, (form[field as keyof typeof form] as any[]).filter((_: any, j: number) => j !== i));

  const addItem = (field: string, empty: () => any) =>
    set(field, [...(form[field as keyof typeof form] as any[]), empty()]);

  const removeItem = (field: string, i: number) =>
    set(field, (form[field as keyof typeof form] as any[]).filter((_: any, j: number) => j !== i));

  const updateItem = (field: string, i: number, key: string, val: string) => {
    const arr = [...(form[field as keyof typeof form] as any[])];
    arr[i] = { ...arr[i], [key]: val };
    set(field, arr);
  };

  // ✅ Save
  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    updateResume.mutate({ ...form, studentId: user._id } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ✅ Download PDF
  const handleDownload = () => {
    const printArea = document.getElementById("resume-preview-area");
    if (!printArea) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Resume - ${form.name || "My Resume"}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111827;
                   background: #fff; padding: 40px 52px; line-height: 1.65; }
            @page { margin: 15mm; }
            a { color: #1d4ed8; }
          </style>
        </head>
        <body>${printArea.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = form.name || user.name || "Your Name";

  // ============================================================
  // ✅ TAGS COMPONENT — form state వాడతాం కాబట్టి ఇక్కడే
  //    కానీ inline గా JSX లో use చేస్తాం — component గా కాదు
  // ============================================================
  const renderTags = (field: string, input: string, setInput: (v: string) => void, placeholder: string) => (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(field, input, setInput); } }}
          placeholder={placeholder}
          style={{ ...inp, flex: 1 }}
        />
        <button
          type="button"
          onClick={() => addTag(field, input, setInput)}
          style={{
            padding: "9px 18px", borderRadius: 7, background: "#2563eb",
            color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13
          }}>
          Add
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {(form[field as keyof typeof form] as string[]).map((tag, i) => (
          <span key={i} style={{
            background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
            borderRadius: 5, padding: "4px 12px", fontSize: 13,
            display: "flex", alignItems: "center", gap: 6
          }}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(field, i)}
              style={{
                background: "none", border: "none", color: "#93c5fd",
                cursor: "pointer", fontWeight: 700, fontSize: 14, padding: 0
              }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // ✅ PREVIEW SECTION COMPONENT
  // ============================================================
  const PS = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const,
        letterSpacing: 1.5, borderBottom: "1.5px solid #111827",
        paddingBottom: 4, marginBottom: 9, fontFamily: "Arial, sans-serif"
      }}>{title}</div>
      {children}
    </div>
  );

  // ============================================================
  // ✅ RENDER
  // ============================================================
  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 40 }}>

        {/* Top Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#111827" }}>Resume Builder</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>
              Fill all details, save and download your ATS-friendly resume
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: saved ? "#16a34a" : "#2563eb", color: "#fff",
                border: "none", borderRadius: 8, padding: "10px 22px",
                fontWeight: 700, fontSize: 13.5, cursor: "pointer"
              }}>
              {saved ? "Saved! ✓" : "Save Resume"}
            </button>
            {tab === "preview" && (
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  background: "#111827", color: "#fff", border: "none",
                  borderRadius: 8, padding: "10px 22px", fontWeight: 700,
                  fontSize: 13.5, cursor: "pointer"
                }}>
                Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
          {["editor", "preview"].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "9px 24px", border: "none", background: "transparent",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                color: tab === t ? "#2563eb" : "#6b7280",
                borderBottom: tab === t ? "2px solid #2563eb" : "2px solid transparent",
                marginBottom: -1
              }}>
              {t === "editor" ? "Editor" : "Preview"}
            </button>
          ))}
        </div>

        {/* ============ EDITOR ============ */}
        {tab === "editor" && (
          <div>
            <Sec title="Personal Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <F label="Full Name" value={form.name} onChange={v => set("name", v)} placeholder="Hari Babu" />
                <F label="Email" value={form.email} onChange={v => set("email", v)} placeholder="your@email.com" />
                <F label="Phone" value={form.phone} onChange={v => set("phone", v)} placeholder="+91 9999999999" />
                <F label="Address" value={form.address} onChange={v => set("address", v)} placeholder="City, State" />
              </div>
            </Sec>

            <Sec title="Objective">
              <T
                value={form.objective}
                onChange={v => set("objective", v)}
                placeholder="Brief career objective..."
                rows={3}
              />
            </Sec>

            <Sec title="Professional Summary">
              <T
                value={form.professionalSummary}
                onChange={v => set("professionalSummary", v)}
                placeholder="3-4 line summary of your skills and experience..."
                rows={4}
              />
            </Sec>

            <Sec title="Education">
              {form.education.map((item, i) => (
                <div key={i} style={cardStyle}>
                  <button type="button" style={rmBtn} onClick={() => removeItem("education", i)}>Remove</button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px", paddingRight: 72 }}>
                    <F label="College / School" value={item.institute} onChange={v => updateItem("education", i, "institute", v)} placeholder="e.g. JNTU" />
                    <F label="Year" value={item.year} onChange={v => updateItem("education", i, "year", v)} placeholder="2025" />
                    <F label="CGPA / %" value={item.score} onChange={v => updateItem("education", i, "score", v)} placeholder="8.5" />
                  </div>
                </div>
              ))}
              <button type="button" style={dashed} onClick={() => addItem("education", emptyEdu)}>+ Add Education</button>
            </Sec>

            <Sec title="Skills">
              {renderTags("skills", skillInput, setSkillInput, "Type a skill and press Enter or click Add")}
            </Sec>

            <Sec title="Experience">
              {form.experience.map((item, i) => (
                <div key={i} style={cardStyle}>
                  <button type="button" style={rmBtn} onClick={() => removeItem("experience", i)}>Remove</button>
                  <div style={{ paddingRight: 72 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                      <F label="Company" value={item.company} onChange={v => updateItem("experience", i, "company", v)} placeholder="e.g. TCS" />
                      <F label="Role" value={item.role} onChange={v => updateItem("experience", i, "role", v)} placeholder="e.g. Software Intern" />
                    </div>
                    <T label="Description" value={item.description} onChange={v => updateItem("experience", i, "description", v)} placeholder="What you did..." rows={2} />
                  </div>
                </div>
              ))}
              <button type="button" style={dashed} onClick={() => addItem("experience", emptyExp)}>+ Add Experience</button>
            </Sec>

            <Sec title="Projects">
              {form.projects.map((item, i) => (
                <div key={i} style={cardStyle}>
                  <button type="button" style={rmBtn} onClick={() => removeItem("projects", i)}>Remove</button>
                  <div style={{ paddingRight: 72 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                      <F label="Project Name" value={item.name} onChange={v => updateItem("projects", i, "name", v)} placeholder="e.g. Student Portal" />
                      <F label="GitHub / Live Link" value={item.link} onChange={v => updateItem("projects", i, "link", v)} placeholder="https://github.com/..." />
                    </div>
                    <T label="Description" value={item.description} onChange={v => updateItem("projects", i, "description", v)} placeholder="Technologies used, what it does..." rows={2} />
                  </div>
                </div>
              ))}
              <button type="button" style={dashed} onClick={() => addItem("projects", emptyProject)}>+ Add Project</button>
            </Sec>

            <Sec title="Achievements">
              {form.achievements.map((item, i) => (
                <div key={i} style={cardStyle}>
                  <button type="button" style={rmBtn} onClick={() => removeItem("achievements", i)}>Remove</button>
                  <div style={{ paddingRight: 72 }}>
                    <F label="Title" value={item.title} onChange={v => updateItem("achievements", i, "title", v)} placeholder="e.g. First Prize in Hackathon" />
                    <T label="Description" value={item.description} onChange={v => updateItem("achievements", i, "description", v)} placeholder="Brief details..." rows={2} />
                  </div>
                </div>
              ))}
              <button type="button" style={dashed} onClick={() => addItem("achievements", emptyAchievement)}>+ Add Achievement</button>
            </Sec>

            <Sec title="Certifications">
              {form.certifications.map((item, i) => (
                <div key={i} style={cardStyle}>
                  <button type="button" style={rmBtn} onClick={() => removeItem("certifications", i)}>Remove</button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", paddingRight: 72 }}>
                    <F label="Certificate Name" value={item.name} onChange={v => updateItem("certifications", i, "name", v)} placeholder="e.g. AWS Cloud Practitioner" />
                    <F label="Google Drive Link" value={item.driveLink} onChange={v => updateItem("certifications", i, "driveLink", v)} placeholder="https://drive.google.com/..." />
                  </div>
                </div>
              ))}
              <button type="button" style={dashed} onClick={() => addItem("certifications", emptyCert)}>+ Add Certification</button>
            </Sec>

            <Sec title="Online Profiles">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <F label="LinkedIn URL" value={form.linkedin} onChange={v => set("linkedin", v)} placeholder="https://linkedin.com/in/..." />
                <F label="GitHub URL" value={form.github} onChange={v => set("github", v)} placeholder="https://github.com/..." />
                <F label="HackerRank URL" value={form.hackerrank} onChange={v => set("hackerrank", v)} placeholder="https://hackerrank.com/..." />
                <F label="LeetCode URL" value={form.leetcode} onChange={v => set("leetcode", v)} placeholder="https://leetcode.com/..." />
              </div>
            </Sec>

            <Sec title="Languages Known">
              {renderTags("languages", langInput, setLangInput, "e.g. Telugu, English, Hindi")}
            </Sec>

            <Sec title="Hobbies and Interests">
              {renderTags("hobbies", hobbyInput, setHobbyInput, "e.g. Reading, Cricket")}
            </Sec>
          </div>
        )}

        {/* ============ PREVIEW ============ */}
        {tab === "preview" && (
          <div>
            <div
              id="resume-preview-area"
              style={{
                background: "#fff", maxWidth: 750, margin: "0 auto",
                padding: "44px 52px", fontFamily: "Arial, sans-serif",
                fontSize: 13, color: "#111827", lineHeight: 1.65,
                border: "1px solid #e5e7eb", borderRadius: 4
              }}>

              {/* Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #111827", paddingBottom: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                  {displayName}
                </div>
                <div style={{ marginTop: 5, fontSize: 12.5, color: "#374151" }}>
                  {[form.email, form.phone, form.address].filter(Boolean).join("   |   ")}
                </div>
                {(form.linkedin || form.github || form.hackerrank || form.leetcode) && (
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 16px" }}>
                    {form.linkedin && <a href={form.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>LinkedIn</a>}
                    {form.github && <a href={form.github} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>GitHub</a>}
                    {form.hackerrank && <a href={form.hackerrank} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>HackerRank</a>}
                    {form.leetcode && <a href={form.leetcode} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", fontSize: 12.5 }}>LeetCode</a>}
                  </div>
                )}
              </div>

              {form.objective && (
                <PS title="Objective">
                  <p style={{ margin: 0, fontSize: 13 }}>{form.objective}</p>
                </PS>
              )}

              {form.professionalSummary && (
                <PS title="Professional Summary">
                  <p style={{ margin: 0, fontSize: 13 }}>{form.professionalSummary}</p>
                </PS>
              )}

              {form.education.length > 0 && (
                <PS title="Education">
                  {form.education.map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{e.institute}</span>
                        {e.score && <span style={{ color: "#374151" }}> — {e.score}</span>}
                      </div>
                      <span style={{ color: "#374151" }}>{e.year}</span>
                    </div>
                  ))}
                </PS>
              )}

              {form.skills.length > 0 && (
                <PS title="Skills">
                  <p style={{ margin: 0, fontSize: 13 }}>{form.skills.join(", ")}</p>
                </PS>
              )}

              {form.experience.length > 0 && (
                <PS title="Experience">
                  {form.experience.map((e, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700 }}>{e.role}</span>
                        <span style={{ color: "#374151" }}>{e.company}</span>
                      </div>
                      {e.description && <p style={{ margin: "3px 0 0", color: "#374151", fontSize: 13 }}>{e.description}</p>}
                    </div>
                  ))}
                </PS>
              )}

              {form.projects.length > 0 && (
                <PS title="Projects">
                  {form.projects.map((p, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700 }}>{p.name}</span>
                        {p.link && <span style={{ color: "#1d4ed8", fontSize: 12 }}>{p.link}</span>}
                      </div>
                      {p.description && <p style={{ margin: "3px 0 0", color: "#374151", fontSize: 13 }}>{p.description}</p>}
                    </div>
                  ))}
                </PS>
              )}

              {form.achievements.length > 0 && (
                <PS title="Achievements">
                  {form.achievements.map((a, i) => (
                    <div key={i} style={{ marginBottom: 5 }}>
                      <span style={{ fontWeight: 700 }}>{a.title}</span>
                      {a.description && <span style={{ color: "#374151", fontSize: 13 }}> — {a.description}</span>}
                    </div>
                  ))}
                </PS>
              )}

              {form.certifications.length > 0 && (
                <PS title="Certifications">
                  {form.certifications.map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{c.name}</span>
                      {c.driveLink && <span style={{ color: "#1d4ed8", fontSize: 12 }}>{c.driveLink}</span>}
                    </div>
                  ))}
                </PS>
              )}

              {form.languages.length > 0 && (
                <PS title="Languages">
                  <p style={{ margin: 0, fontSize: 13 }}>{form.languages.join(", ")}</p>
                </PS>
              )}

              {form.hobbies.length > 0 && (
                <PS title="Hobbies and Interests">
                  <p style={{ margin: 0, fontSize: 13 }}>{form.hobbies.join(", ")}</p>
                </PS>
              )}

            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}