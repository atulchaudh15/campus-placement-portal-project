import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import { useToast } from "../context/ToastContext.jsx";

const emptyForm = {
  title: "",
  company: "",
  description: "",
  ctc: "",
  location: "",
  type: "it",
  skillsRequired: "",
  status: "open",
};

const JOB_TYPES = ["it", "core", "finance", "internship", "other"];

const RecruiterDashboard = () => {
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadJobs = async () => {
    try {
      const res = await api.get("/jobs/my");
      setJobs(res.data.data.jobs);
    } catch (err) {
      showToast(getErrorMessage(err, "Could not load your jobs."), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data.data.companies);
    } catch {
      // non-fatal — form will just show an empty company list
    }
  };

  useEffect(() => {
    loadJobs();
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, company: companies[0]?._id || "" });
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      company: job.company?._id || "",
      description: job.description || "",
      ctc: job.ctc || "",
      location: job.location || "",
      type: job.type,
      skillsRequired: (job.skillsRequired || []).join(", "),
      status: job.status,
    });
    setShowForm(true);
  };

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) {
      showToast("Title and company are required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
        showToast("Job updated successfully!");
      } else {
        await api.post("/jobs", form);
        showToast("Job posted successfully!");
      }
      setShowForm(false);
      loadJobs();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save job."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job? This also removes its applications.")) return;
    setDeletingId(jobId);
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      showToast("Job deleted.");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not delete job."), "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Recruiter Dashboard</h1>
          <p className="text-muted mt-1">Manage your job postings and applicants.</p>
        </div>
        <button onClick={openCreateForm} className="btn btn-primary">
          + Post a Job
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted block mb-1">Job Title</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">Company</label>
            <select
              className="input-field"
              value={form.company}
              onChange={(e) => handleChange("company", e.target.value)}
            >
              <option value="">Select a company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">Type</label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">CTC</label>
            <input
              className="input-field"
              value={form.ctc}
              onChange={(e) => handleChange("ctc", e.target.value)}
              placeholder="e.g. 12 LPA"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted block mb-1">Location</label>
            <input
              className="input-field"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted block mb-1">Skills (comma separated)</label>
            <input
              className="input-field"
              value={form.skillsRequired}
              onChange={(e) => handleChange("skillsRequired", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-muted block mb-1">Description</label>
            <textarea
              className="input-field"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          {editingId && (
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3 mt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Saving..." : editingId ? "Update Job" : "Post Job"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-muted mt-8">Loading your jobs...</p>}

      {!loading && jobs.length === 0 && (
        <div className="card p-8 mt-8 text-center">
          <p className="text-muted">You haven't posted any jobs yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-8">
        {jobs.map((job) => (
          <div key={job._id} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-ink">{job.title}</h3>
                <span className={`badge ${job.status === "open" ? "badge-green" : "badge-coral"}`}>
                  {job.status}
                </span>
              </div>
              <p className="text-muted text-sm mt-0.5">
                {job.company?.name} {job.location ? `· ${job.location}` : ""}
              </p>
              <p className="text-muted text-xs mt-1">{job.applicantCount ?? 0} applicant(s)</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-outline btn-sm">
                View Applicants
              </Link>
              <button onClick={() => openEditForm(job)} className="btn btn-outline btn-sm">
                Edit
              </button>
              <button
                onClick={() => handleDelete(job._id)}
                disabled={deletingId === job._id}
                className="btn btn-outline btn-sm !text-coral !border-coral hover:!bg-coral-s"
              >
                {deletingId === job._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
