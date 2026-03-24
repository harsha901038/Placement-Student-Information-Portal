export const DEMO_STUDENT_USER = {
  _id: "demo-student-001",
  name: "Arjun Sharma",
  email: "student@demo.com",
  role: "student",
};

export const DEMO_ADMIN_USER = {
  _id: "demo-admin-001",
  name: "Dr. Priya Menon",
  email: "admin@demo.com",
  role: "admin",
};

export const mockProfile = {
  _id: "demo-student-001",
  name: "Arjun Sharma",
  email: "student@demo.com",
  role: "student",
  profile: {
    branch: "Computer Science Engineering",
    college: "KSR College of Engineering",
    rollNumber: "21CSE045",
    phone: "9876543210",
    cgpa: 8.7,
    skills: ["React", "Node.js", "Python", "MongoDB", "Machine Learning", "TypeScript"],
    about: "Passionate CSE student with a strong interest in full-stack development and AI/ML.",
    linkedIn: "linkedin.com/in/arjun-sharma",
    github: "github.com/arjunsharma",
    year: 3,
    semester: 6,
  },
};

export const mockAttendance = {
  records: [
    { subject: "Data Structures & Algorithms", totalClasses: 60, attendedClasses: 58, percentage: 96.7 },
    { subject: "Operating Systems", totalClasses: 55, attendedClasses: 50, percentage: 90.9 },
    { subject: "Database Management Systems", totalClasses: 50, attendedClasses: 40, percentage: 80.0 },
    { subject: "Computer Networks", totalClasses: 48, attendedClasses: 34, percentage: 70.8 },
    { subject: "Machine Learning", totalClasses: 45, attendedClasses: 30, percentage: 66.7 },
    { subject: "Software Engineering", totalClasses: 40, attendedClasses: 38, percentage: 95.0 },
  ],
  overallPercentage: 83.3,
};

export const mockResults = [
  {
    _id: "sem1",
    semester: 1,
    year: 2022,
    subjects: [
      { subject: "Engineering Mathematics I", subjectCode: "MA101", credits: 4, grade: "A", gradePoints: 9 },
      { subject: "Engineering Physics", subjectCode: "PH101", credits: 3, grade: "B+", gradePoints: 8 },
      { subject: "Programming in C", subjectCode: "CS101", credits: 4, grade: "A+", gradePoints: 10 },
      { subject: "Engineering Drawing", subjectCode: "ME101", credits: 2, grade: "B", gradePoints: 7 },
      { subject: "English Communication", subjectCode: "EN101", credits: 2, grade: "A", gradePoints: 9 },
    ],
    sgpa: 8.93,
    cgpa: 8.93,
  },
  {
    _id: "sem2",
    semester: 2,
    year: 2022,
    subjects: [
      { subject: "Engineering Mathematics II", subjectCode: "MA102", credits: 4, grade: "A", gradePoints: 9 },
      { subject: "Engineering Chemistry", subjectCode: "CH101", credits: 3, grade: "A+", gradePoints: 10 },
      { subject: "Data Structures", subjectCode: "CS102", credits: 4, grade: "A+", gradePoints: 10 },
      { subject: "Digital Electronics", subjectCode: "EC101", credits: 3, grade: "A", gradePoints: 9 },
      { subject: "Environmental Science", subjectCode: "EV101", credits: 2, grade: "B+", gradePoints: 8 },
    ],
    sgpa: 9.29,
    cgpa: 9.10,
  },
  {
    _id: "sem3",
    semester: 3,
    year: 2023,
    subjects: [
      { subject: "Discrete Mathematics", subjectCode: "MA201", credits: 4, grade: "B+", gradePoints: 8 },
      { subject: "Object Oriented Programming", subjectCode: "CS201", credits: 4, grade: "A", gradePoints: 9 },
      { subject: "Database Systems", subjectCode: "CS202", credits: 4, grade: "A", gradePoints: 9 },
      { subject: "Computer Organization", subjectCode: "CS203", credits: 3, grade: "B+", gradePoints: 8 },
      { subject: "Probability & Statistics", subjectCode: "MA202", credits: 3, grade: "A", gradePoints: 9 },
    ],
    sgpa: 8.72,
    cgpa: 8.98,
  },
  {
    _id: "sem4",
    semester: 4,
    year: 2023,
    subjects: [
      { subject: "Operating Systems", subjectCode: "CS301", credits: 4, grade: "A", gradePoints: 9 },
      { subject: "Computer Networks", subjectCode: "CS302", credits: 4, grade: "B+", gradePoints: 8 },
      { subject: "Theory of Computation", subjectCode: "CS303", credits: 3, grade: "B", gradePoints: 7 },
      { subject: "Software Engineering", subjectCode: "CS304", credits: 3, grade: "A", gradePoints: 9 },
      { subject: "Web Technologies", subjectCode: "CS305", credits: 4, grade: "A+", gradePoints: 10 },
    ],
    sgpa: 8.61,
    cgpa: 8.89,
  },
  {
    _id: "sem5",
    semester: 5,
    year: 2024,
    subjects: [
      { subject: "Machine Learning", subjectCode: "CS401", credits: 4, grade: "A", gradePoints: 9 },
      { subject: "Compiler Design", subjectCode: "CS402", credits: 3, grade: "B+", gradePoints: 8 },
      { subject: "Information Security", subjectCode: "CS403", credits: 3, grade: "A", gradePoints: 9 },
      { subject: "Cloud Computing", subjectCode: "CS404", credits: 3, grade: "A+", gradePoints: 10 },
      { subject: "Mobile Application Development", subjectCode: "CS405", credits: 4, grade: "A", gradePoints: 9 },
    ],
    sgpa: 9.06,
    cgpa: 8.93,
  },
];

const JOBS = [
  {
    _id: "job1",
    title: "Software Engineer Intern",
    company: "Google",
    description: "Work on Google's core products. Experience in full-stack development required.",
    eligibility: "CSE / IT / ECE students with CGPA ≥ 7.5",
    minCgpa: 7.5,
    requiredSkills: ["Python", "JavaScript", "React"],
    location: "Bangalore",
    salary: "₹70,000/month",
    type: "internship",
    deadline: "2026-05-15",
    createdAt: "2026-03-01",
  },
  {
    _id: "job2",
    title: "Full Stack Developer",
    company: "Microsoft",
    description: "Join the Azure team to build scalable cloud solutions using React and Node.js.",
    eligibility: "B.E/B.Tech in CSE/IT with CGPA ≥ 8.0",
    minCgpa: 8.0,
    requiredSkills: ["React", "Node.js", "TypeScript", "Azure"],
    location: "Hyderabad",
    salary: "₹18 LPA",
    type: "placement",
    deadline: "2026-04-30",
    createdAt: "2026-03-05",
  },
  {
    _id: "job3",
    title: "Data Scientist",
    company: "Amazon",
    description: "Build ML models to drive recommendations and analytics across Amazon's platforms.",
    eligibility: "CSE / Data Science students with CGPA ≥ 7.0",
    minCgpa: 7.0,
    requiredSkills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    location: "Chennai",
    salary: "₹22 LPA",
    type: "placement",
    deadline: "2026-05-01",
    createdAt: "2026-03-10",
  },
  {
    _id: "job4",
    title: "Backend Developer Intern",
    company: "Flipkart",
    description: "Design and develop scalable APIs and microservices for Flipkart's e-commerce platform.",
    eligibility: "B.E/B.Tech in CSE/IT with CGPA ≥ 6.5",
    minCgpa: 6.5,
    requiredSkills: ["Node.js", "MongoDB", "Docker", "REST APIs"],
    location: "Bangalore",
    salary: "₹50,000/month",
    type: "internship",
    deadline: "2026-04-20",
    createdAt: "2026-03-12",
  },
  {
    _id: "job5",
    title: "AI/ML Engineer",
    company: "Infosys",
    description: "Develop AI-powered applications and integrate LLMs into enterprise products.",
    eligibility: "B.E/B.Tech CSE/IT with CGPA ≥ 7.0",
    minCgpa: 7.0,
    requiredSkills: ["Python", "Deep Learning", "NLP", "TensorFlow"],
    location: "Pune",
    salary: "₹12 LPA",
    type: "both",
    deadline: "2026-05-20",
    createdAt: "2026-03-15",
  },
  {
    _id: "job6",
    title: "Frontend Developer",
    company: "Razorpay",
    description: "Build beautiful and performant UIs for India's leading fintech platform.",
    eligibility: "B.E/B.Tech with CGPA ≥ 7.5",
    minCgpa: 7.5,
    requiredSkills: ["React", "TypeScript", "CSS", "JavaScript"],
    location: "Bangalore",
    salary: "₹16 LPA",
    type: "placement",
    deadline: "2026-04-25",
    createdAt: "2026-03-18",
  },
];

export const mockJobs = {
  jobs: JOBS,
  total: JOBS.length,
  page: 1,
  pages: 1,
};

export const mockApplications = [
  {
    _id: "app1",
    status: "shortlisted",
    appliedAt: "2026-03-10T10:30:00Z",
    job: JOBS[0],
  },
  {
    _id: "app2",
    status: "applied",
    appliedAt: "2026-03-14T09:00:00Z",
    job: JOBS[2],
  },
  {
    _id: "app3",
    status: "rejected",
    appliedAt: "2026-03-05T14:00:00Z",
    job: JOBS[1],
  },
];

export const mockResume: Record<string, unknown> = {
  objective: "Motivated Computer Science student seeking a challenging software engineering role where I can leverage my skills in full-stack development and machine learning to deliver impactful solutions.",
  education: [
    { degree: "B.E. Computer Science Engineering", institution: "KSR College of Engineering", year: "2021 - 2025", cgpa: "8.93" },
    { degree: "Higher Secondary (Class XII)", institution: "St. Xavier's School, Chennai", year: "2021", cgpa: "92%" },
  ],
  experience: [
    { role: "Web Development Intern", company: "TechCorp Solutions", duration: "May 2024 - July 2024", description: "Built RESTful APIs using Node.js and Express.js. Worked on React dashboards and integrated MongoDB." },
  ],
  skills: ["React", "Node.js", "Python", "MongoDB", "TypeScript", "Machine Learning", "Docker", "Git"],
  projects: [
    { name: "Student Portal System", description: "Full-stack web app for managing student academic records, attendance, and placements.", technologies: ["React", "Node.js", "MongoDB"], link: "github.com/arjunsharma/student-portal" },
    { name: "Sentiment Analysis Tool", description: "NLP model to classify product reviews with 91% accuracy using BERT.", technologies: ["Python", "TensorFlow", "BERT"], link: "github.com/arjunsharma/sentiment-analysis" },
  ],
  certifications: ["AWS Cloud Practitioner", "Google Data Analytics Certificate", "Meta Frontend Developer Certificate"],
  achievements: ["Smart India Hackathon 2024 - Runner Up", "University Rank 3 in Semester 2", "Published research paper on NLP at ICETCS 2024"],
};

export const mockResumeScore = {
  score: 82,
  maxScore: 100,
  breakdown: {
    objective: 8,
    education: 18,
    experience: 16,
    skills: 18,
    projects: 14,
    certifications: 8,
  },
  suggestions: [
    "Add more internship or work experience to strengthen your profile.",
    "Include more quantifiable achievements (e.g., 'improved performance by 40%').",
    "Add a portfolio website link for better visibility.",
    "Consider adding open-source contributions.",
  ],
};

const ALL_STUDENTS = [
  mockProfile,
  {
    _id: "s2", name: "Priya Nair", email: "priya@demo.com", role: "student",
    profile: { branch: "Information Technology", college: "KSR College of Engineering", rollNumber: "21IT012", cgpa: 9.2, skills: ["Java", "Spring Boot", "React", "MySQL"], year: 3, semester: 6 },
  },
  {
    _id: "s3", name: "Rahul Verma", email: "rahul@demo.com", role: "student",
    profile: { branch: "Electronics & Communication", college: "KSR College of Engineering", rollNumber: "21ECE078", cgpa: 7.4, skills: ["Embedded C", "VLSI", "IoT", "Python"], year: 3, semester: 6 },
  },
  {
    _id: "s4", name: "Sneha Patel", email: "sneha@demo.com", role: "student",
    profile: { branch: "Computer Science Engineering", college: "KSR College of Engineering", rollNumber: "21CSE023", cgpa: 8.1, skills: ["Python", "Django", "TensorFlow", "SQL"], year: 3, semester: 6 },
  },
  {
    _id: "s5", name: "Karthik Rajan", email: "karthik@demo.com", role: "student",
    profile: { branch: "Mechanical Engineering", college: "KSR College of Engineering", rollNumber: "21ME056", cgpa: 6.8, skills: ["AutoCAD", "MATLAB", "Python"], year: 3, semester: 6 },
  },
];

const ALL_APPLICATIONS_ADMIN = [
  { _id: "app1", status: "shortlisted", appliedAt: "2026-03-10T10:30:00Z", student: ALL_STUDENTS[0], job: JOBS[0] },
  { _id: "app2", status: "applied", appliedAt: "2026-03-14T09:00:00Z", student: ALL_STUDENTS[0], job: JOBS[2] },
  { _id: "app3", status: "rejected", appliedAt: "2026-03-05T14:00:00Z", student: ALL_STUDENTS[0], job: JOBS[1] },
  { _id: "app4", status: "selected", appliedAt: "2026-03-08T11:00:00Z", student: ALL_STUDENTS[1], job: JOBS[1] },
  { _id: "app5", status: "shortlisted", appliedAt: "2026-03-12T13:00:00Z", student: ALL_STUDENTS[1], job: JOBS[2] },
  { _id: "app6", status: "applied", appliedAt: "2026-03-16T10:00:00Z", student: ALL_STUDENTS[2], job: JOBS[3] },
  { _id: "app7", status: "applied", appliedAt: "2026-03-17T09:30:00Z", student: ALL_STUDENTS[3], job: JOBS[4] },
  { _id: "app8", status: "selected", appliedAt: "2026-03-09T15:00:00Z", student: ALL_STUDENTS[3], job: JOBS[5] },
];

export const mockDashboard = {
  totalStudents: ALL_STUDENTS.length,
  totalJobs: JOBS.length,
  totalApplications: ALL_APPLICATIONS_ADMIN.length,
  placed: ALL_APPLICATIONS_ADMIN.filter(a => a.status === "selected").length,
  shortlisted: ALL_APPLICATIONS_ADMIN.filter(a => a.status === "shortlisted").length,
  recentApplications: ALL_APPLICATIONS_ADMIN.slice(0, 5),
};

export const mockAdminStudents = ALL_STUDENTS;
export const mockAdminJobs = JOBS;
export const mockAdminApplications = ALL_APPLICATIONS_ADMIN;
