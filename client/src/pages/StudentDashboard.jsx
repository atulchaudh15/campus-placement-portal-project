import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const EDITABLE_FIELDS = [
  { key: "phone", label: "Phone" },
  { key: "college", label: "College" },
  { key: "branch", label: "Branch" },
  { key: "year", label: "Year" },
  { key: "cgpa", label: "CGPA" },
  { key: "city", label: "City" },
  { key: "linkedin", label: "LinkedIn" },
];

const StudentDashboard = () => {
  const { updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [aboutInput, setAboutInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applicationCount, setApplicationCount] = useState(null);

  const loadProfile = async () => {
    try {
      const res = await api.get("/students/profile");
      const p = res.data.data.profile;
      setProfile(p);
      setForm(p);
      setSkillsInput((p.skills || []).join(", "));
      setAboutInput(p.about || "");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not load your profile."), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationCount = async () => {
    try {
      const res = await api.get("/applications/my");
      setApplicationCount(res.data.data.applications.length);
    } catch {
      setApplicationCount(null);
    }
  };

  useEffect(() => {
    loadProfile();
    loadApplicationCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, skills: skillsInput, about: aboutInput };
      const res = await api.put("/students/profile", payload);
      const updated = res.data.data.profile;
      setProfile(updated);
      setForm(updated);
      updateUserLocal({ skills: updated.skills });
      setEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not update profile."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Only PDF files are allowed for resumes.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Resume must be under 5MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    try {
      const res = await api.post("/students/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resumeUrl = res.data.data.resumeUrl;
      setProfile((prev) => ({ ...prev, resumeUrl }));
      setForm((prev) => ({ ...prev, resumeUrl }));
      showToast("Resume uploaded successfully!");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not upload resume."), "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <p className="text-muted text-center py-16">Loading your dashboard...</p>;
  if (!profile) return null;

  const completionFields = ["phone", "college", "branch", "year", "resumeUrl"];
  const filledCount = completionFields.filter((f) => profile[f]).length;
  const completion = Math.round((filledCount / completionFields.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Hi, {profile.name.split(" ")[0]}</h1>
          <p className="text-muted mt-1">{profile.email}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/jobs" className="btn btn-outline btn-sm">
            Browse Jobs
          </Link>
          <Link to="/applications" className="btn btn-outline btn-sm">
            My Applications {applicationCount !== null ? `(${applicationCount})` : ""}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <div className="card p-5 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Profile</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm(profile);
                    setSkillsInput((profile.skills || []).join(", "));
                    setAboutInput(profile.about || "");
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {EDITABLE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium text-muted block mb-1">{label}</label>
                {editing ? (
                  <input
                    className="input-field"
                    value={form[key] || ""}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                  />
                ) : (
                  <p className="text-ink text-sm">{profile[key] || "—"}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-muted block mb-1">Skills (comma separated)</label>
            {editing ? (
              <input
                className="input-field"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.skills?.length ? (
                  profile.skills.map((s) => (
                    <span key={s} className="text-xs bg-cream2 text-ink2 px-2 py-1 rounded-md">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-ink text-sm">—</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-muted block mb-1">About</label>
            {editing ? (
              <textarea
                className="input-field"
                rows={3}
                value={aboutInput}
                onChange={(e) => setAboutInput(e.target.value)}
              />
            ) : (
              <p className="text-ink text-sm">{profile.about || "—"}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card p-5 text-center">
            <p className="text-xs font-medium text-muted mb-2">Profile Completion</p>
            <div className="relative w-24 h-24 mx-auto">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2D9C8"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E8650A"
                  strokeWidth="3"
                  strokeDasharray={`${completion}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg">
                {completion}%
              </span>
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-medium text-muted mb-2">Resume</p>
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-orange text-sm font-semibold hover:underline block mb-3"
              >
                View current resume →
              </a>
            ) : (
              <p className="text-muted text-sm mb-3">No resume uploaded yet.</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleResumeSelect}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className={`btn btn-outline btn-sm w-full justify-center cursor-pointer ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {uploading ? "Uploading..." : profile.resumeUrl ? "Replace Resume (PDF)" : "Upload Resume (PDF)"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
