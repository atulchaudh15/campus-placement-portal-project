// Seed script for local development & testing ONLY.
// Run with: npm run seed   (from the /server folder)
//
// Populates the database with:
//   - 1 admin account
//   - 2 recruiter accounts
//   - 5 companies
//   - 10 sample jobs
//   - 4 student accounts
//   - a handful of sample applications
//
// Safe to re-run: it wipes and reseeds all collections it manages.

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../db/connect.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";

dotenv.config();

const run = async () => {
  await connectDB();
  console.log("Seeding database...");

  // ── Wipe existing data (dev only) ──
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // ── Admin ──
  const admin = await User.create({
    name: "Portal Admin",
    email: "admin@campushire.com",
    password: passwordHash,
    role: "admin",
  });

  // ── Companies ──
  const companyData = [
    { name: "Google", industry: "Technology", website: "https://google.com", description: "Search, cloud & consumer technology." },
    { name: "Amazon", industry: "E-commerce", website: "https://amazon.com", description: "E-commerce, cloud computing & logistics." },
    { name: "Flipkart", industry: "E-commerce", website: "https://flipkart.com", description: "India's leading e-commerce marketplace." },
    { name: "Deloitte", industry: "Consulting", website: "https://deloitte.com", description: "Audit, consulting, and advisory services." },
    { name: "Zomato", industry: "Food Tech", website: "https://zomato.com", description: "Food delivery and restaurant discovery." },
  ];
  const companies = await Company.insertMany(
    companyData.map((c) => ({ ...c, createdBy: admin._id }))
  );
  const [google, amazon, flipkart, deloitte, zomato] = companies;

  // ── Recruiters ──
  const recruiter1 = await User.create({
    name: "Priya Sharma",
    email: "recruiter1@campushire.com",
    password: passwordHash,
    role: "recruiter",
    company: google._id,
  });
  const recruiter2 = await User.create({
    name: "Arjun Mehta",
    email: "recruiter2@campushire.com",
    password: passwordHash,
    role: "recruiter",
    company: amazon._id,
  });

  // ── Jobs ──
  const jobData = [
    { title: "Software Engineer", company: google._id, ctc: "₹28 LPA", location: "Bengaluru", type: "it", description: "Work on large-scale distributed systems.", skillsRequired: ["Java", "DSA", "System Design"], postedBy: recruiter1._id },
    { title: "SDE - I", company: amazon._id, ctc: "₹24 LPA", location: "Hyderabad", type: "it", description: "Build and scale backend services for Amazon retail.", skillsRequired: ["Java", "AWS", "DSA"], postedBy: recruiter2._id },
    { title: "Frontend Developer", company: flipkart._id, ctc: "₹18 LPA", location: "Bengaluru", type: "it", description: "Build customer-facing web experiences.", skillsRequired: ["React", "JavaScript", "CSS"], postedBy: recruiter1._id },
    { title: "Data Analyst", company: deloitte._id, ctc: "₹12 LPA", location: "Mumbai", type: "finance", description: "Analyze business data to drive client decisions.", skillsRequired: ["SQL", "Excel", "Power BI"], postedBy: recruiter2._id },
    { title: "Consulting Analyst", company: deloitte._id, ctc: "₹14 LPA", location: "Gurgaon", type: "finance", description: "Support strategy consulting engagements.", skillsRequired: ["Excel", "Communication"], postedBy: recruiter2._id },
    { title: "ML Engineer Intern", company: zomato._id, ctc: "₹50,000/mo", location: "Gurgaon", type: "internship", description: "Work on recommendation systems.", skillsRequired: ["Python", "ML", "Pandas"], postedBy: recruiter1._id },
    { title: "Product Manager", company: flipkart._id, ctc: "₹22 LPA", location: "Bengaluru", type: "core", description: "Own product roadmap for a category team.", skillsRequired: ["Product Sense", "SQL"], postedBy: recruiter1._id },
    { title: "Cloud Support Engineer", company: amazon._id, ctc: "₹16 LPA", location: "Chennai", type: "it", description: "Support enterprise customers on AWS.", skillsRequired: ["AWS", "Linux", "Networking"], postedBy: recruiter2._id },
    { title: "Backend Engineer", company: google._id, ctc: "₹26 LPA", location: "Pune", type: "it", description: "Build APIs powering Google Workspace.", skillsRequired: ["Go", "Kubernetes", "DSA"], postedBy: recruiter1._id },
    { title: "Business Analyst", company: deloitte._id, ctc: "₹10 LPA", location: "Delhi", type: "finance", description: "Bridge business needs and technical teams.", skillsRequired: ["Excel", "SQL", "Communication"], postedBy: recruiter2._id },
  ];
  const jobs = await Job.insertMany(jobData);

  // ── Students ──
  const studentData = [
    { name: "Anjali Mhase", email: "anjali@student.com", college: "VIT Pune", branch: "Computer Engineering", year: "Final Year", cgpa: "8.7", tenth: "92", twelfth: "89", skills: ["React", "Node.js", "MongoDB"], phone: "9876543210" },
    { name: "Rohan Kulkarni", email: "rohan@student.com", college: "COEP Pune", branch: "IT", year: "Final Year", cgpa: "8.2", tenth: "88", twelfth: "85", skills: ["Java", "DSA", "SQL"], phone: "9876543211" },
    { name: "Sneha Iyer", email: "sneha@student.com", college: "PICT Pune", branch: "Computer Engineering", year: "Pre-Final Year", cgpa: "9.1", tenth: "95", twelfth: "93", skills: ["Python", "ML", "Pandas"], phone: "9876543212" },
    { name: "Karan Verma", email: "karan@student.com", college: "MIT WPU", branch: "E&TC", year: "Final Year", cgpa: "7.6", tenth: "84", twelfth: "80", skills: ["Excel", "SQL", "Communication"], phone: "9876543213" },
  ];
  const students = await User.insertMany(
    studentData.map((s) => ({ ...s, password: passwordHash, role: "student" }))
  );
  const [anjali, rohan, sneha, karan] = students;

  // ── Applications ──
  const applicationData = [
    { student: anjali._id, job: jobs[2]._id, status: "Interview" }, // Frontend Developer @ Flipkart
    { student: anjali._id, job: jobs[6]._id, status: "Applied" },   // Product Manager @ Flipkart
    { student: rohan._id, job: jobs[0]._id, status: "In Review" }, // Software Engineer @ Google
    { student: rohan._id, job: jobs[1]._id, status: "Offered" },   // SDE-I @ Amazon
    { student: sneha._id, job: jobs[5]._id, status: "Interview" }, // ML Engineer Intern @ Zomato
    { student: karan._id, job: jobs[3]._id, status: "Rejected" },  // Data Analyst @ Deloitte
    { student: karan._id, job: jobs[9]._id, status: "Applied" },   // Business Analyst @ Deloitte
  ];
  await Application.insertMany(applicationData);

  console.log("Seed complete:");
  console.log(`  Admin:      admin@campushire.com / Password@123`);
  console.log(`  Recruiter:  recruiter1@campushire.com / Password@123 (Google)`);
  console.log(`  Recruiter:  recruiter2@campushire.com / Password@123 (Amazon)`);
  console.log(`  Student:    anjali@student.com / Password@123`);
  console.log(`  Companies:  ${companies.length}, Jobs: ${jobs.length}, Students: ${students.length}, Applications: ${applicationData.length}`);

  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
