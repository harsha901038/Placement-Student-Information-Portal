const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Groq = require("groq-sdk");

// 🔥 DEBUG
console.log("🔥 NEW SERVER FILE RUN AVUTHUNDI 🔥");

// ✅ GROQ SETUP — మీ key ఇక్కడ replace చేయండి
const groq = new Groq({ apiKey: "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" });

// ✅ CONNECT DB
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ TEST ROUTE
app.get("/api/test", (req, res) => {
  res.send("API WORKING ✅");
});

// ✅ HOME
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// ================= SCHEMA =================
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profile: {
    branch: String,
    cgpa: Number,
    attendance: Number,
    backlogs: Number,
    rollNumber: { type: String, unique: true },
    skills: [String],
    college: String,
    about: String,
    phone: String,
    altPhone: String,
    dob: String,
    gender: String,
    religion: String,
    caste: String,
    fatherName: String,
    fatherPhone: String,
    fatherOccupation: String,
    motherName: String,
    motherPhone: String,
    motherOccupation: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    aadharNumber: String,
    panNumber: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    linkedIn: String,
    github: String,
  }
});

const Student = mongoose.model("Student", studentSchema);

// ================= APPLICATION SCHEMA =================
const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  jobTitle: String,
  company: String,
  status: {
    type: String,
    enum: ["applied", "shortlisted", "rejected", "selected"],
    default: "applied"
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Application = mongoose.model("Application", applicationSchema);

// ================= JOB SCHEMA =================
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  salary: String,
  minCgpa: Number,
  description: String,
  type: String
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

// ================= RESULT SCHEMA =================
const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  semester: Number,
  subjects: [
    {
      subject: String,
      credits: Number,
      gradePoints: Number,
      grade: String
    }
  ],
  sgpa: Number,
  backlogs: Number
});

const Result = mongoose.model("Result", resultSchema);

// ================= RESUME SCHEMA =================
const resumeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  name: String,
  email: String,
  phone: String,
  address: String,
  objective: String,
  professionalSummary: String,
  skills: [String],
  education: [{ institute: String, year: String, score: String }],
  experience: [{ company: String, role: String, description: String }],
  projects: [{ name: String, description: String, link: String }],
  achievements: [{ title: String, description: String }],
  certifications: [{ name: String, driveLink: String }],
  languages: [String],
  hobbies: [String],
  linkedin: String,
  github: String,
  hackerrank: String,
  leetcode: String,
});

const Resume = mongoose.model("Resume", resumeSchema);

// ================= ASSIGNMENT SCHEMA =================
const assignmentSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  title: String,
  deadline: Date,
  questions: [
    {
      question: String,
      options: [String],      // 4 options
      correctIndex: Number,   // 0-3
      explanation: String     // shown after submission
    }
  ],
  createdAt: { type: Date, default: Date.now }
});
const Assignment = mongoose.model("Assignment", assignmentSchema);

// ================= SUBMISSION SCHEMA =================
const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
  answers: [Number],          // student's chosen option index per question
  score: Number,              // out of 20
  percentage: Number,
  submittedAt: { type: Date, default: Date.now }
});
const Submission = mongoose.model("Submission", submissionSchema);

// ================= ADMIN: CREATE ASSIGNMENT =================
app.post("/api/admin/assignments", async (req, res) => {
  try {
    console.log("CREATE ASSIGNMENT BODY:", JSON.stringify(req.body).substring(0, 200));
    
    const { week, title, deadline, questions } = req.body;
    
    // ✅ Validation
    if (!week) return res.status(400).json({ message: "Week number required" });
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "Questions required" });
    }
    
    const assignment = new Assignment({ week, title, deadline, questions });
    await assignment.save();
    
    console.log("ASSIGNMENT SAVED:", assignment._id);
    res.json(assignment);
  } catch (err) {
    console.log("CREATE ASSIGNMENT ERROR:", err.message);
    res.status(500).json({ message: err.message }); // ✅ exact error చూపిస్తుంది
  }
});

// ================= ADMIN: GET ALL ASSIGNMENTS =================
app.get("/api/admin/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ week: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

// ================= ADMIN: GET ASSIGNMENT RESULTS =================
app.get("/api/admin/assignments/:id/results", async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate("studentId", "name profile")
      .sort({ score: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

// ================= ADMIN: DELETE ASSIGNMENT =================
app.delete("/api/admin/assignments/:id", async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignmentId: req.params.id });
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

// ================= STUDENT: GET ASSIGNMENTS =================
app.get("/api/student/assignments", async (req, res) => {
  try {
    const { studentId } = req.query;
    const assignments = await Assignment.find().sort({ week: -1 });

    // mark which ones student already submitted
    const submissions = await Submission.find({ studentId });
    const submittedIds = new Set(submissions.map(s => s.assignmentId.toString()));

    const result = assignments.map(a => ({
      _id: a._id,
      week: a.week,
      title: a.title,
      deadline: a.deadline,
      questionCount: a.questions.length,
      submitted: submittedIds.has(a._id.toString())
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

// ================= STUDENT: GET ONE ASSIGNMENT (questions only, no answers) =================
app.get("/api/student/assignments/:id", async (req, res) => {
  try {
    const { studentId } = req.query;

    // check already submitted
    const existing = await Submission.findOne({
      assignmentId: req.params.id,
      studentId
    });
    if (existing) {
      return res.status(403).json({ message: "Already submitted" });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Not found" });

    // send questions WITHOUT correctIndex and explanation
    const safe = {
      _id: assignment._id,
      week: assignment.week,
      title: assignment.title,
      deadline: assignment.deadline,
      questions: assignment.questions.map((q, i) => ({
        _id: i,
        question: q.question,
        options: q.options
      }))
    };

    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= STUDENT: SUBMIT ASSIGNMENT =================
app.post("/api/student/assignments/:id/submit", async (req, res) => {
  try {
    const { studentId, answers } = req.body;

    // prevent double submission
    const existing = await Submission.findOne({
      assignmentId: req.params.id,
      studentId
    });
    if (existing) {
      return res.status(400).json({ message: "Already submitted!" });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // auto-correct
    let correct = 0;
    const detailed = assignment.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return {
        question: q.question,
        options: q.options,
        studentAnswer: answers[i],
        correctAnswer: q.correctIndex,
        explanation: q.explanation,
        isCorrect
      };
    });

    const score = correct;
    const percentage = ((correct / assignment.questions.length) * 100).toFixed(1);

    const submission = new Submission({
      studentId,
      assignmentId: req.params.id,
      answers,
      score,
      percentage
    });
    await submission.save();

    res.json({ score, percentage, total: assignment.questions.length, detailed });
  } catch (err) {
    console.log("SUBMIT ERROR:", err);
    res.status(500).json({ message: "Submission failed" });
  }
});

// ================= STUDENT: GET MY SUBMISSION RESULT =================
app.get("/api/student/assignments/:id/result", async (req, res) => {
  try {
    const { studentId } = req.query;

    const submission = await Submission.findOne({
      assignmentId: req.params.id,
      studentId
    });
    if (!submission) return res.status(404).json({ message: "Not submitted yet" });

    const assignment = await Assignment.findById(req.params.id);

    const detailed = assignment.questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      studentAnswer: submission.answers[i],
      correctAnswer: q.correctIndex,
      explanation: q.explanation,
      isCorrect: submission.answers[i] === q.correctIndex
    }));

    res.json({
      score: submission.score,
      percentage: submission.percentage,
      total: assignment.questions.length,
      submittedAt: submission.submittedAt,
      detailed
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ATTENDANCE SCHEMA =================
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  semester: Number,
  totalClasses: Number,
  attendedClasses: Number,
  percentage: Number
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// ================= VALID ROLL NUMBERS SCHEMA =================
const validRollSchema = new mongoose.Schema({
  rollNumber: { type: String, unique: true },
  used: { type: Boolean, default: false }
});

const ValidRoll = mongoose.model("ValidRoll", validRollSchema);

// ================= GROQ RESUME ANALYZER ✅ =================
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are an ATS resume expert. Analyze this resume and respond ONLY with a valid raw JSON object. No markdown, no backticks, no explanation — just pure JSON:
{
  "atsScore": <number 0-100>,
  "keywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["fix1", "fix2"],
  "mistakes": [
    {
      "type": "Grammar / Weak Verb / Vague / Missing Info",
      "issue": "exact problem here",
      "fix": "corrected version here"
    }
  ],
  "overallFeedback": "2-3 line overall summary"
}

Resume:
${resumeText}`
      }],
      max_tokens: 1500
    });

    const text = completion.choices[0].message.content || "";
    console.log("GROQ RAW RESPONSE:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "AI response does not contain valid JSON" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);

  } catch (err) {
    console.log("GROQ ERROR:", err);
    res.status(500).json({ message: "Analysis failed" });
  }
});

// ================= ADMIN ROUTES =================
app.get("/api/admin/clear-applications", async (req, res) => {
  await Application.deleteMany({});
  res.json({ message: "All applications cleared ✅" });
});

app.post("/api/admin/roll-numbers", async (req, res) => {
  try {
    const { rollNumbers } = req.body;
    const docs = rollNumbers.map(r => ({ rollNumber: r.trim() }));
    await ValidRoll.insertMany(docs, { ordered: false });
    res.json({ message: "Roll numbers added ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add roll numbers" });
  }
});

// ================= ADMIN: CHANGE STUDENT PASSWORD =================
app.put("/api/admin/change-password", async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
  return res.status(400).json({ message: "Password too short ❌" });
}
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.password = newPassword;
    await student.save();

    res.json({ message: "Password updated successfully ✅" });

  } catch (err) {
    res.status(500).json({ message: "Error updating password" });
  }
});

// ================= ADMIN: SET ALL PASSWORDS =================
app.get("/api/admin/set-all-passwords", async (req, res) => {
  try {
    await Student.updateMany({}, { $set: { password: "Student555" } });

    res.json({ message: "All student passwords set to Student555 ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error updating passwords" });
  }
});

// 👇 IKKADA ADD CHEY
app.get("/api/admin/rolls-by-branch", async (req, res) => {
  try {
    const students = await Student.find();

    const grouped = {};

    students.forEach(st => {
      const branch = st.profile?.branch || "OTHER";
      const roll = st.profile?.rollNumber;

      if (!grouped[branch]) {
        grouped[branch] = [];
      }

      grouped[branch].push(roll);
    });

    res.json(grouped);

  } catch (err) {
    res.status(500).json({ message: "Error fetching roll numbers" });
  }
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, rollNumber } = req.body;

    const isValid = await ValidRoll.findOne({ rollNumber });
    if (!isValid) {
      return res.status(400).json({ message: "Invalid roll number! Contact admin." });
    }
    if (isValid.used) {
      return res.status(400).json({ message: "Roll number already registered!" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = new Student({
      name,
      email,
      password: "123456",
      profile: { 
  branch: (() => {
    const validBranches = ["AIML", "CSE", "ECE", "EEE", "AI", "DS", "CIVIL", "MECH"];
    const upper = rollNumber.toUpperCase();
    return validBranches.find(b => upper.startsWith(b)) || "";
  })(),
  cgpa: 0, 
  attendance: 75,
  backlogs: 0, 
  rollNumber, 
  skills: [] 
}
    });

    await student.save();

    // 👇 ATTENDANCE RECORDS AUTO-GENERATE చేయి
    const seed = student._id.toString().charCodeAt(0);
    const attendanceRecords = [];
    
    for (let sem = 1; sem <= 7; sem++) {
      const totalClasses = 180 + sem * 10;
      const pct = Math.min(97, 65 + (seed % 20) + sem * 2 + Math.floor(Math.random() * 8));
      const attendedClasses = Math.floor(totalClasses * pct / 100);
      const percentage = parseFloat((attendedClasses / totalClasses * 100).toFixed(1));
      
      attendanceRecords.push({
        studentId: student._id,
        semester: sem,
        totalClasses,
        attendedClasses,
        percentage
      });
    }
    
    await Attendance.insertMany(attendanceRecords);
    
    // Overall attendance calculate చేసి profile లో save చేయి
    const overall = parseFloat(
      (attendanceRecords.reduce((s, r) => s + r.percentage, 0) / 7).toFixed(1)
    );
    student.profile.attendance = overall;
    await student.save();

    // ── 7 SEMESTER RESULTS AUTO-GENERATE ──────────────────────
    const grades = [
      { grade: "O",  points: 10 },
      { grade: "A+", points: 9  },
      { grade: "A",  points: 8  },
      { grade: "B+", points: 7  },
      { grade: "B",  points: 6  },
      { grade: "C",  points: 5  },
    ];

    const subjectsBySem = {
      1: ["Engineering Mathematics-I", "Engineering Physics", "Engineering Chemistry", "English", "C Programming", "Engineering Drawing"],
      2: ["Engineering Mathematics-II", "Data Structures", "Digital Electronics", "Environmental Science", "OOP with Java", "Workshop"],
      3: ["Discrete Mathematics", "Database Management", "Computer Organization", "Software Engineering", "Python Programming", "Constitution of India"],
      4: ["Design & Analysis of Algorithms", "Operating Systems", "Computer Networks", "Formal Languages", "Web Technologies", "Mini Project"],
      5: ["Machine Learning", "Cloud Computing", "Information Security", "Mobile App Development", "Elective-I", "Project-I"],
      6: ["Deep Learning", "Big Data Analytics", "DevOps", "Blockchain", "Elective-II", "Project-II"],
      7: ["Compiler Design", "Distributed Systems", "IoT", "Elective-III", "Internship/Industry Project", "Seminar"],
    };

    const resultRecords = [];
    const cgpaBase = 6.0 + (seed % 30) / 10;

    for (let sem = 1; sem <= 7; sem++) {
      const subjectNames = subjectsBySem[sem];
      const subjects = subjectNames.map(name => {
        const baseIndex = Math.max(0, Math.floor((10 - cgpaBase) * 0.8) + Math.floor(Math.random() * 2));
        const gradeObj = grades[Math.min(baseIndex, grades.length - 1)];
        return {
          subject: name,
          credits: [3, 4][Math.floor(Math.random() * 2)],
          gradePoints: gradeObj.points,
          grade: gradeObj.grade
        };
      });

      const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
      const totalPoints  = subjects.reduce((s, sub) => s + sub.credits * sub.gradePoints, 0);
      const sgpa = parseFloat((totalPoints / totalCredits).toFixed(2));

      resultRecords.push({
        studentId: student._id,
        semester: sem,
        subjects,
        sgpa,
        backlogs: cgpaBase < 6 ? Math.floor(Math.random() * 2) : 0
      });
    }

    await Result.insertMany(resultRecords);

    const allSubs     = resultRecords.flatMap(r => r.subjects);
    const totCredits  = allSubs.reduce((s, sub) => s + sub.credits, 0);
    const totPoints   = allSubs.reduce((s, sub) => s + sub.credits * sub.gradePoints, 0);
    student.profile.cgpa = totCredits > 0
      ? parseFloat((totPoints / totCredits).toFixed(2))
      : parseFloat(cgpaBase.toFixed(2));
    await student.save();
    // ── END RESULTS GENERATE ───────────────────────────────────
    isValid.used = true;
    await isValid.save();

    res.json({
      token: "student-token",
      user: { ...student._doc, role: "student" }
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // admin login
    if (rollNumber === "admin" && password == "123456") {
      return res.json({
        token: "admin-token",
        user: { role: "admin" }
      });
    }

    const student = await Student.findOne({
      "profile.rollNumber": rollNumber
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid Roll Number" });
    }

    if (student.password != password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({
      token: "student-token",
      user: { ...student._doc, role: "student" }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ADMIN DASHBOARD =================
app.get("/api/admin/dashboard", async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const totalApplications = await Application.countDocuments();

  const placed = await Application.countDocuments({ status: "selected" });
  const shortlisted = await Application.countDocuments({ status: "shortlisted" });

  const recentApplications = await Application.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("studentId");

  const formatted = recentApplications.map(app => ({
    ...app._doc,
    student: app.studentId,
    job: {
      title: app.jobTitle,
      company: app.company
    }
  }));

  res.json({
    totalStudents,
    totalApplications,
    placed,
    shortlisted,
    recentApplications: formatted,
    totalJobs: await Job.countDocuments()
  });
});

// ================= STUDENT PROFILE =================
app.get("/api/student/profile", async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ message: "studentId required" });
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/student/profile", async (req, res) => {
  try {
    const { studentId, name, ...rest } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name) student.name = name;

    const source = rest.profile || rest;

    const profileFields = [
      "branch", "cgpa", "attendance", "backlogs", "skills",
      "college", "about", "phone", "altPhone", "dob", "gender",
      "religion", "caste", "fatherName", "fatherPhone", "fatherOccupation",
      "motherName", "motherPhone", "motherOccupation",
      "address", "city", "state", "pincode",
      "aadharNumber", "panNumber", "bankName", "accountNumber", "ifscCode",
      "linkedIn", "github"
    ];

    profileFields.forEach(field => {
      if (source[field] !== undefined) {
        student.profile[field] = source[field];
      }
    });

    student.markModified("profile");
    await student.save();

    res.json(student);
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= STUDENT ATTENDANCE =================
app.get("/api/student/attendance", async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ message: "studentId required" });

    let records = await Attendance.find({ studentId }).sort({ semester: 1 });

    // లేకపోతే default generate చేసి save చేయి
    if (records.length === 0) {
      const seed = studentId.toString().charCodeAt(0);
      const toInsert = Array.from({ length: 7 }, (_, i) => {
        const sem = i + 1;
        const totalClasses = 180 + sem * 10;
        const pct = Math.min(97, 65 + (seed % 20) + sem * 2 + Math.floor(Math.random() * 8));
        const attendedClasses = Math.floor(totalClasses * pct / 100);
        const percentage = parseFloat((attendedClasses / totalClasses * 100).toFixed(1));
        return { studentId, semester: sem, totalClasses, attendedClasses, percentage };
      });
      await Attendance.insertMany(toInsert);
      records = await Attendance.find({ studentId }).sort({ semester: 1 });
    }

    const overall = parseFloat(
      (records.reduce((s, r) => s + r.percentage, 0) / records.length).toFixed(1)
    );

    res.json({ overallPercentage: overall, records });
  } catch (err) {
    console.log("ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
});

// ================= ADMIN: GET STUDENT ATTENDANCE =================
app.get("/api/admin/attendance/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ semester: 1 });
    const overall = records.length > 0
      ? parseFloat((records.reduce((s, r) => s + r.percentage, 0) / records.length).toFixed(1))
      : 0;
    res.json({ overallPercentage: overall, records });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// ================= ADMIN: UPDATE ATTENDANCE =================
app.put("/api/admin/attendance/:id", async (req, res) => {
  try {
    const { attendedClasses, totalClasses } = req.body;
    const percentage = parseFloat((attendedClasses / totalClasses * 100).toFixed(1));
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { attendedClasses, totalClasses, percentage },
      { new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});

// ================= JOBS =================
app.get("/api/student/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ jobs: jobs });
  } catch (err) {
    console.log("JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

app.post("/api/admin/jobs", async (req, res) => {
  try {
    console.log("JOB DATA:", req.body);
    const job = new Job(req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error creating job" });
  }
});

app.get("/api/admin/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

app.delete("/api/admin/jobs/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

// ================= ADMIN STUDENTS =================
app.get("/api/admin/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// ================= ADMIN: DELETE STUDENT =================
app.delete("/api/admin/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // 1️⃣ Student details తీసుకో
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    const rollNumber = student.profile?.rollNumber;
    
    // 2️⃣ Student delete చేయి
    await Student.findByIdAndDelete(studentId);
    
    // 3️⃣ Roll number మళ్ళీ available చేయి
    if (rollNumber) {
      await ValidRoll.updateOne(
        { rollNumber },
        { used: false }
      );
    }
    
    // 4️⃣ Student తో related data అన్ని delete చేయి
    await Application.deleteMany({ studentId });
    await Result.deleteMany({ studentId });
    await Resume.deleteMany({ studentId });
    await Attendance.deleteMany({ studentId });
    await Submission.deleteMany({ studentId });
    
    res.json({ 
      message: `Student deleted successfully ✅`,
      rollNumber: rollNumber 
    });
    
  } catch (err) {
    console.log("DELETE STUDENT ERROR:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
});

app.get("/api/admin/applications", async (req, res) => {
  const applications = await Application.find()
    .populate({ path: "studentId", select: "name profile" })
    .sort({ createdAt: -1 });

  const formatted = applications.map(app => ({
    ...app._doc,
    student: app.studentId,
    job: { title: app.jobTitle, company: app.company }
  }));

  res.json(formatted);
});

app.get("/api/admin/student/:studentId", async (req, res) => {
  console.log("🔥 ADMIN STUDENT API HIT");
  try {
    const studentId = req.params.studentId;

    // ✅ Student info తీసుకో
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const allResults = await Result.find({ studentId }).sort({ semester: 1, _id: -1 });

    const seen = new Set();
    const results = allResults.filter(r => {
      if (seen.has(r.semester)) return false;
      seen.add(r.semester);
      return true;
    });

    // ✅ CGPA — results నుండి calculate చేయి
    const totalCredits = results.reduce((sum, r) =>
      r.subjects.reduce((s, sub) => s + (sub.credits || 0), sum), 0);
    const totalPoints = results.reduce((sum, r) =>
      r.subjects.reduce((s, sub) => s + ((sub.credits || 0) * (sub.gradePoints || 0)), sum), 0);
    const cgpa = totalCredits > 0 
      ? (totalPoints / totalCredits).toFixed(2) 
      : student.profile?.cgpa || null;

    const resume = await Resume.findOne({ studentId }).sort({ _id: -1 });

    // ✅ COMPLETE STUDENT OBJECT RETURN చేయి
    res.json({ 
      results, 
      resume, 
      cgpa,
      student: student  // 👈 ఇక్కడ మార్పు!
    });

  } catch (err) {
    console.log("FETCH STUDENT ERROR:", err);
    res.status(500).json({ message: "Error fetching student data" });
  }
});

app.put("/api/admin/applications/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json(application);

  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ================= APPLY =================
app.post("/api/student/apply", async (req, res) => {
  const { studentId, jobTitle, company } = req.body;

  const application = new Application({ studentId, jobTitle, company });
  await application.save();

  res.json({
    ...application._doc,
    job: { title: jobTitle, company: company }
  });
});

// ================= STUDENT APPLICATIONS =================
app.get("/api/student/applications/:studentId", async (req, res) => {
  const applications = await Application.find({
    studentId: new mongoose.Types.ObjectId(req.params.studentId)
  });

  const formatted = applications.map(app => ({
    ...app._doc,
    job: { title: app.jobTitle, company: app.company }
  }));

  res.json(formatted);
});

// ================= RESULTS =================
app.get("/api/student/results", async (req, res) => {
  try {
    const { studentId } = req.query;
    
    const results = await Result.find({ 
      studentId: new mongoose.Types.ObjectId(studentId)
    }).sort({ semester: 1 });

    res.json(results);
  } catch (err) {
    console.log("GET RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

app.get("/api/student/results/:studentId", async (req, res) => {
  try {
    const results = await Result.find({
      studentId: req.params.studentId
    }).sort({ semester: 1 });

    res.json(results);

  } catch (err) {
    console.log("GET RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

app.post("/api/student/results", async (req, res) => {
  const { studentId, semester, subjects, backlogs } = req.body;

  if (subjects.length > 10) {
    return res.status(400).json({ message: "Max 10 subjects allowed" });
  }

  const existing = await Result.findOne({ 
    studentId: new mongoose.Types.ObjectId(studentId), 
    semester: parseInt(semester)
  });

  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
  const totalPoints = subjects.reduce((acc, s) => acc + (s.credits * s.gradePoints), 0);

  const sgpa = totalPoints / totalCredits;

  if (existing) {
    existing.subjects = subjects;
    existing.sgpa = sgpa;
    existing.backlogs = backlogs;

    await existing.save();
    return res.json(existing);
  }

  const result = new Result({ studentId, semester, subjects, sgpa, backlogs });
  await result.save();

  res.json(result);
});

app.get("/api/admin/fix-results", async (req, res) => {
  const all = await Result.find().sort({ createdAt: 1 });
  const seen = new Set();
  const toDelete = [];

  for (const r of all) {
    const key = `${r.studentId}_${r.semester}`;
    if (seen.has(key)) {
      toDelete.push(r._id);
    } else {
      seen.add(key);
    }
  }

  await Result.deleteMany({ _id: { $in: toDelete } });
  res.json({ deleted: toDelete.length, message: "Duplicates removed ✅" });
});

app.delete("/api/student/results/:id", async (req, res) => {
  try {
    console.log("DELETE RESULT:", req.params.id);
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// ================= RESUME =================
app.get("/api/student/resume", async (req, res) => {
  try {
    const { studentId } = req.query;

    console.log("🔥 GET RESUME FOR:", studentId);

    const resume = await Resume.findOne({ studentId });

    if (!resume) {
      return res.json({});
    }

    res.json(resume);

  } catch (err) {
    console.log("GET RESUME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

app.put("/api/student/resume", async (req, res) => {
  const { studentId } = req.body;

  let resume = await Resume.findOne({ studentId });

  if (!resume) {
    resume = new Resume({ ...req.body, studentId });
  } else {
    Object.assign(resume, req.body);
  }

  await resume.save();

  res.json(resume);
});

// ================= OLD ANALYZER (basic) =================
app.post("/api/student/analyze-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;

    const knownSkills = [
      "react","node","python","java","sql","mongodb",
      "javascript","typescript","express","html","css",
      "git","docker","aws","machine learning","django"
    ];

    const foundSkills = knownSkills.filter(skill =>
      resumeText.toLowerCase().includes(skill)
    );

    res.json({
      skills: foundSkills,
      wordCount: resumeText.split(" ").length
    });

  } catch(err) {
    res.status(500).json({ message: "Analysis failed" });
  }
});

// ================= AI GENERATE ASSIGNMENT QUESTIONS =================
app.post("/api/admin/generate-questions", async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a placement exam expert. Generate exactly 20 multiple choice questions on the topic: "${topic}" for placement preparation.

Respond ONLY with a valid raw JSON array. No markdown, no backticks, no explanation:
[
  {
    "question": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0,
    "explanation": "why this answer is correct"
  }
]

Rules:
- Exactly 20 questions
- Each question has exactly 4 options
- correctIndex is 0, 1, 2, or 3
- Questions must be placement/competitive exam level
- Topic: ${topic}`
      }],
      max_tokens: 4000
    });

    const text = completion.choices[0].message.content || "";
    console.log("GROQ QUESTIONS RAW:", text.substring(0, 200));

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ message: "AI response లో JSON కనపడలేదు" });
    }

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ questions });

  } catch (err) {
    console.log("GENERATE ERROR:", err);
    res.status(500).json({ message: "Question generation failed" });
  }
});

// ================= CHATBOT =================
app.post("/api/chatbot", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful placement assistant for engineering students in India. 
You help with: placement preparation, aptitude, coding interviews, resume tips, ML/DL concepts, soft skills.
Keep answers concise and practical. You can respond in Telugu or English based on what the student uses.
Always be encouraging and supportive.`
        },
        ...messages
      ],
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.log("CHATBOT ERROR:", err);
    res.status(500).json({ reply: "Sorry, an error occurred. Please try again." });
  }
});

// ================= NEWS SCHEMA =================
const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  source: String,
  applyLink: String,
  aiSummary: String,
  category: { type: String, enum: ["job", "internship", "vacancy", "other"] },
  approved: { type: Boolean, default: false },
  fetchedAt: { type: Date, default: Date.now }
});
const News = mongoose.model("News", newsSchema);

// ================= FETCH + AI ANALYZE NEWS =================
app.post("/api/admin/fetch-news", async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Generate 10 realistic current job vacancies for Indian engineering freshers (2024-2025 batch).
Respond ONLY with a valid raw JSON array. No markdown, no backticks:
[
  {
    "title": "Job title here",
    "company": "Company name",
    "role": "Role description in 1 line",
    "location": "City, India",
    "salary": "X - Y LPA",
    "skills": ["skill1", "skill2", "skill3"],
    "category": "job or internship",
    "applyLink": "https://careers.companyname.com or https://linkedin.com/jobs or https://naukri.com",
    "deadline": "2025-06-30"
  }
]
Include mix of: TCS, Infosys, Wipro, HCL, Cognizant, Amazon, Google, Microsoft, Zoho, Freshworks type companies.`
      }],
      max_tokens: 2000
    });

    const text = completion.choices[0].message.content || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ message: "AI response error" });

    const vacancies = JSON.parse(match[0]);

    // Save to DB
    let saved = 0;
    for (const v of vacancies) {
      const exists = await News.findOne({ title: v.title, source: v.company });
      if (exists) continue;

      const news = new News({
        title: v.title,
        description: `Role: ${v.role} | Skills: ${v.skills.join(", ")} | Salary: ${v.salary} | Location: ${v.location} | Deadline: ${v.deadline}`,
        url: v.applyLink,
        source: v.company,
        applyLink: v.applyLink,
        aiSummary: `${v.role} | ${v.salary} | ${v.location}`,
        category: v.category || "job",
        approved: false
      });
      await news.save();
      saved++;
    }

    res.json({ fetched: saved, message: `${saved} vacancies fetched ✅` });
  } catch (err) {
    console.log("FETCH NEWS ERROR:", err);
    res.status(500).json({ message: "Failed: " + err.message });
  }
});

// ================= ADMIN: GET ALL NEWS =================
app.get("/api/admin/news", async (req, res) => {
  try {
    const news = await News.find().sort({ fetchedAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// ================= ADMIN: APPROVE NEWS =================
app.put("/api/admin/news/:id/approve", async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// ================= ADMIN: DELETE NEWS =================
app.delete("/api/admin/news/:id", async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// ================= STUDENT: GET APPROVED NEWS =================
app.get("/api/student/news", async (req, res) => {
  try {
    const news = await News.find({ approved: true }).sort({ fetchedAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// ================= BULK STUDENT GENERATION =================
const firstNames = ["Arjun","Priya","Rahul","Sneha","Vikram","Anjali","Kiran","Deepika","Suresh","Kavya","Ravi","Pooja","Manoj","Lavanya","Anil","Divya","Srinivas","Meghana","Charan","Bhavana","Naveen","Swathi","Prasad","Ramya","Venkat","Sirisha","Krishna","Haritha","Mahesh","Nandini","Raju","Pavani","Satish","Mounika","Rajesh","Anusha","Sunil","Keerthi","Ganesh","Sravani","Murali","Tejaswi","Naresh","Himabindu","Praveen","Sowmya","Ajay","Madhavi","Santosh","Revathi","Lokesh","Usha","Saikiran","Padmaja","Ashok","Saritha","Ramesh","Jayasri","Harish","Vani","Dinesh","Sunitha","Vijay","Rekha","Pavan","Sarada","Srikanth","Nalini","Gopal","Jyothi","Balaji","Anitha","Nagaraju","Sudha","Varun","Lakshmi","Sagar","Kumari","Tarun","Vasantha","Abhishek","Radha","Nikhil","Geetha","Rohan","Vijayalakshmi","Karthik","Bhargavi","Aakash","Naga","Hari","Sai","Chandra","Roja","Durga","Sarath","Aditya","Amrutha"];

const lastNames = ["Kumar","Rao","Reddy","Sharma","Naidu","Varma","Prasad","Babu","Goud","Murthy","Raju","Devi","Lakshmi","Chowdary","Srinivas","Nair","Pillai","Iyer","Krishnan","Menon","Patel","Shah","Gupta","Mishra","Singh","Yadav","Tiwari","Pandey","Verma","Joshi","Das","Roy","Ghosh","Sen","Bose","Chatterjee","Mukherjee","Banerjee","Chakraborty","Nath"];

const generateName = () => {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
};

const generateCgpa = () => {
  // Realistic distribution: mostly 6-9
  const r = Math.random();
  if (r < 0.05) return +(5 + Math.random()).toFixed(1);      // 5% below 6
  if (r < 0.25) return +(6 + Math.random()).toFixed(1);      // 20% in 6-7
  if (r < 0.65) return +(7 + Math.random()).toFixed(1);      // 40% in 7-8
  if (r < 0.90) return +(8 + Math.random()).toFixed(1);      // 25% in 8-9
  return +(9 + Math.random() * 0.9).toFixed(1);              // 10% in 9-10
};

const generateAttendance = () => Math.floor(60 + Math.random() * 40); // 60-100%
const generateBacklogs = () => Math.random() < 0.15 ? Math.floor(Math.random() * 3) + 1 : 0;

const branchSkillsMap = {
  "CSE": ["C", "Python", "Java", "DSA", "DBMS", "OS", "React", "Node.js"],
  "ECE": ["C", "VLSI", "Embedded Systems", "Signal Processing", "MATLAB", "Arduino"],
  "EEE": ["C", "Power Systems", "Control Systems", "MATLAB", "AutoCAD", "PLC"],
  "AIML": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "NLP", "Computer Vision"],
  "AI": ["Python", "AI", "Neural Networks", "PyTorch", "Data Science", "LLMs"],
  "DS": ["Python", "Statistics", "SQL", "Tableau", "Power BI", "Machine Learning"],
  "CIVIL": ["AutoCAD", "STAAD Pro", "Revit", "Construction Management", "Surveying"],
  "MECH": ["AutoCAD", "SolidWorks", "CATIA", "Thermodynamics", "Manufacturing"]
};

// Generate roll number
const generateRoll = async (branch, index) => {
  const prefix = branch.substring(0, 2).toUpperCase();
  const roll = `${prefix}${22 + Math.floor(Math.random() * 3)}A${String(index + 1).padStart(4, "0")}`;
  return roll;
};

app.post("/api/admin/generate-students", async (req, res) => {
  try {
    const { branch, count } = req.body;
    if (!branch || !count) return res.status(400).json({ message: "branch and count required" });

    const skills = branchSkillsMap[branch] || ["C", "Python", "Java"];
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < count; i++) {
      const name = generateName();
      const rollNumber = await generateRoll(branch, Date.now() + i);
      const email = `${name.toLowerCase().replace(/\s/g, ".")}.${rollNumber.toLowerCase()}@college.edu`;

      // Check duplicate roll
      const existingRoll = await ValidRoll.findOne({ rollNumber });
      if (existingRoll) { skipped++; continue; }

      // Add to valid rolls
      await ValidRoll.create({ rollNumber, used: true });

      // Pick 3-5 random skills
      const studentSkills = skills.sort(() => Math.random() - 0.5).slice(0, Math.floor(3 + Math.random() * 3));

      const student = new Student({
        name,
        email,
        password: "student123",
        profile: {
          branch,
          cgpa: generateCgpa(),
          attendance: generateAttendance(),
          backlogs: generateBacklogs(),
          rollNumber,
          skills: studentSkills
        }
      });

      await student.save();
      created++;
    }

    res.json({ message: `${created} students created ✅ (${skipped} skipped)`, created });
  } catch (err) {
    console.log("GENERATE STUDENTS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Branch wise stats
app.get("/api/admin/branch-stats", async (req, res) => {
  try {
    const branches = ["CSE", "ECE", "EEE", "AIML", "AI", "DS", "CIVIL", "MECH"];
    const stats = await Promise.all(branches.map(async (branch) => {
      const students = await Student.find({ "profile.branch": branch });
      const count = students.length;
      if (count === 0) return { branch, count: 0, avgCgpa: 0, avgAttendance: 0 };
      
      const avgCgpa = (students.reduce((s, st) => s + (st.profile?.cgpa || 0), 0) / count).toFixed(2);
      const avgAttendance = Math.round(students.reduce((s, st) => s + (st.profile?.attendance || 0), 0) / count);
      
      return { branch, count, avgCgpa, avgAttendance };
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Students by branch
app.get("/api/admin/students-by-branch", async (req, res) => {
  try {
    const { branch, minCgpa, maxCgpa, minAttendance } = req.query;
    const filter = {};
if (branch) filter["profile.branch"] = branch;
if (minCgpa) filter["profile.cgpa"] = { $gte: parseFloat(minCgpa) };
if (maxCgpa) filter["profile.cgpa"] = { ...filter["profile.cgpa"], $lte: parseFloat(maxCgpa) };
if (minAttendance) filter["profile.attendance"] = { $gte: parseFloat(minAttendance) };
    
    const students = await Student.find(filter).sort({ "profile.cgpa": -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN: GENERATE RESULTS FOR ALL STUDENTS =================
app.post("/api/admin/generate-all-results", async (req, res) => {
  try {
    const students = await Student.find();
    let generated = 0;

    const grades = [
      { grade: "O",  points: 10 },
      { grade: "A+", points: 9 },
      { grade: "A",  points: 8 },
      { grade: "B+", points: 7 },
      { grade: "B",  points: 6 },
      { grade: "C",  points: 5 },
    ];

    const subjectsBySem = {
      1: ["Engineering Mathematics-I", "Engineering Physics", "Engineering Chemistry", "English", "C Programming", "Engineering Drawing"],
      2: ["Engineering Mathematics-II", "Data Structures", "Digital Electronics", "Environmental Science", "OOP with Java", "Workshop"],
      3: ["Discrete Mathematics", "Database Management", "Computer Organization", "Software Engineering", "Python Programming", "Constitution of India"],
      4: ["Design & Analysis of Algorithms", "Operating Systems", "Computer Networks", "Formal Languages", "Web Technologies", "Mini Project"],
      5: ["Machine Learning", "Cloud Computing", "Information Security", "Mobile App Development", "Elective-I", "Project-I"],
      6: ["Deep Learning", "Big Data Analytics", "DevOps", "Blockchain", "Elective-II", "Project-II"],
      7: ["Compiler Design", "Distributed Systems", "IoT", "Elective-III", "Internship/Industry Project", "Seminar"],
    };

    for (const student of students) {
      const cgpa = student.profile?.cgpa || 7.5;

      for (let sem = 1; sem <= 7; sem++) {
        const existing = await Result.findOne({ studentId: student._id, semester: sem });
        if (existing) continue;

        const subjectNames = subjectsBySem[sem];
        const subjects = subjectNames.map(name => {
          // CGPA based grade — higher cgpa = better grades
          const baseIndex = Math.max(0, Math.floor((10 - cgpa) * 0.8) + Math.floor(Math.random() * 2));
          const gradeObj = grades[Math.min(baseIndex, grades.length - 1)];
          return {
            subject: name,
            credits: [3, 4][Math.floor(Math.random() * 2)],
            gradePoints: gradeObj.points,
            grade: gradeObj.grade
          };
        });

        const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
        const totalPoints = subjects.reduce((s, sub) => s + sub.credits * sub.gradePoints, 0);
        const sgpa = parseFloat((totalPoints / totalCredits).toFixed(2));

        await Result.create({
          studentId: student._id,
          semester: sem,
          subjects,
          sgpa,
          backlogs: cgpa < 6 ? Math.floor(Math.random() * 2) : 0
        });

        generated++;
      }
    }
    // CGPA recalculate
const allStu = await Student.find();
for (const st of allStu) {
  const allRes = await Result.find({ studentId: st._id });
  if (allRes.length === 0) continue;
  const tc = allRes.reduce((sum, r) => sum + r.subjects.reduce((s, sub) => s + (sub.credits || 0), 0), 0);
  const tp = allRes.reduce((sum, r) => sum + r.subjects.reduce((s, sub) => s + ((sub.credits || 0) * (sub.gradePoints || 0)), 0), 0);
  if (tc > 0) await Student.findByIdAndUpdate(st._id, { "profile.cgpa": parseFloat((tp / tc).toFixed(2)) });
}

    res.json({ message: `${generated} semester results generated ✅`, generated });
  } catch (err) {
    console.log("GENERATE RESULTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN: GENERATE ATTENDANCE FOR ALL STUDENTS =================
app.post("/api/admin/generate-all-attendance", async (req, res) => {
  try {
    const students = await Student.find();
    let generated = 0;

    for (const student of students) {
      for (let sem = 1; sem <= 7; sem++) {
        const existing = await Attendance.findOne({ studentId: student._id, semester: sem });
        if (existing) continue;

        const att = student.profile?.attendance || 75;
        const variation = Math.floor(Math.random() * 10) - 5; // ±5
        const percentage = Math.min(98, Math.max(60, att + variation + (sem % 3)));
        const totalClasses = 180 + sem * 10;
        const attendedClasses = Math.floor(totalClasses * percentage / 100);

        await Attendance.create({
          studentId: student._id,
          semester: sem,
          totalClasses,
          attendedClasses,
          percentage: parseFloat((attendedClasses / totalClasses * 100).toFixed(1))
        });
        generated++;
      }
    }

    res.json({ message: `${generated} attendance records generated ✅`, generated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/admin/recalculate-cgpa", async (req, res) => {
  try {
    const students = await Student.find();
    let updated = 0;
    for (const st of students) {
      const allRes = await Result.find({ studentId: st._id });
      if (allRes.length === 0) continue;
      const tc = allRes.reduce((sum, r) => sum + r.subjects.reduce((s, sub) => s + (sub.credits || 0), 0), 0);
      const tp = allRes.reduce((sum, r) => sum + r.subjects.reduce((s, sub) => s + ((sub.credits || 0) * (sub.gradePoints || 0)), 0), 0);
      if (tc > 0) {
        await Student.findByIdAndUpdate(st._id, { "profile.cgpa": parseFloat((tp / tc).toFixed(2)) });
        updated++;
      }
    }
    res.json({ message: `${updated} students CGPA updated ✅` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/admin/recalculate-attendance", async (req, res) => {
  try {
    const students = await Student.find();
    let updated = 0;
    for (const st of students) {
      const records = await Attendance.find({ studentId: st._id });
      if (records.length === 0) continue;
      const overall = parseFloat(
        (records.reduce((s, r) => s + r.percentage, 0) / records.length).toFixed(1)
      );
      await Student.findByIdAndUpdate(st._id, { "profile.attendance": overall });
      updated++;
    }
    res.json({ message: `${updated} students attendance updated ✅` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= REASSIGN ROLL NUMBERS =================
app.post("/api/admin/reassign-rollnumbers", async (req, res) => {
  try {
    const prefixMap = {
      "CSE":  "CSE",
      "ECE":  "ECE",
      "EEE":  "EEE",
      "CIVIL": "CIV",
      "MECH": "MEC",
      "AIML": "AIM",
      "AI":   "AI",
      "DS":   "DS",
      "IT":   "IT",
    };

    const branches = Object.keys(prefixMap);
    let updated = 0;

    for (const branch of branches) {
      const students = await Student.find({ "profile.branch": branch })
        .sort({ name: 1 }); // name order లో sort

      for (let i = 0; i < students.length; i++) {
        const prefix = prefixMap[branch];
        const num = String(i + 1).padStart(3, "0");
        const newRoll = `${prefix}${num}`;

        // ValidRoll లో కూడా update చేయి
        await ValidRoll.deleteOne({ rollNumber: students[i].profile?.rollNumber });
        await ValidRoll.create({ rollNumber: newRoll, used: true });

        await Student.findByIdAndUpdate(students[i]._id, {
          "profile.rollNumber": newRoll
        });

        updated++;
      }
    }

    res.json({ message: `${updated} students roll numbers updated ✅` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN: FIX BRANCHES =================
app.get("/api/admin/fix-branches", async (req, res) => {
  try {
    const students = await Student.find();
    const validBranches = ["AIML", "CSE", "ECE", "EEE", "AI", "DS", "CIVIL", "MECH"];
    let updated = 0;

    for (const st of students) {
      if (st.profile?.branch) continue; // already has branch, skip
      const roll = (st.profile?.rollNumber || "").toUpperCase();
      const detected = validBranches.find(b => roll.startsWith(b));
      if (detected) {
        await Student.findByIdAndUpdate(st._id, { "profile.branch": detected });
        updated++;
      }
    }

    res.json({ message: `${updated} students branch updated ✅` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= START =================
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});