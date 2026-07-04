import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const typeLabels = {
  it: "IT",
  core: "Core",
  finance: "Finance",
  internship: "Internship",
  other: "Other",
};

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data.job);

        if (user?.role === "student") {
          const appsRes = await api.get("/applications/my");
          const already = appsRes.data.data.applications.some((a) => a.job?._id === id);
          setApplied(already);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Could not load this job."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      showToast("Please log in as a student to apply.", "info");
      return;
    }
    if (user.role !== "student") {
      showToast("Only students can apply to jobs.", "info");
      return;
    }

    setApplying(true);
    try {
      await api.post("/applications", { jobId: id });
      setApplied(true);
      showToast("Application submitted successfully!");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not submit application."), "error");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <p className="text-muted text-center py-16">Loading job...</p>;
  if (error)
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-coral">{error}</p>
        <Link to="/jobs" className="btn btn-outline btn-sm mt-4 inline-flex">
          Back to jobs
        </Link>
      </div>
    );
  if (!job) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link to="/jobs" className="text-sm text-muted hover:text-orange">
        ← Back to jobs
      </Link>

      <div className="card p-8 mt-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink">{job.title}</h1>
            <p className="text-muted mt-1">{job.company?.name}</p>
          </div>
          <span className="badge badge-orange">{typeLabels[job.type] || job.type}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted mt-4">
          {job.location && <span>📍 {job.location}</span>}
          {job.ctc && <span>💰 {job.ctc}</span>}
          <span className={job.status === "open" ? "text-green" : "text-coral"}>
            {job.status === "open" ? "● Accepting applications" : "● Closed"}
          </span>
        </div>

        {job.description && (
          <p className="text-ink2 mt-6 leading-relaxed whitespace-pre-line">{job.description}</p>
        )}

        {job.skillsRequired?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink2 mb-2">Skills required</h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill) => (
                <span key={skill} className="text-xs bg-cream2 text-ink2 px-2.5 py-1 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {user?.role !== "recruiter" && user?.role !== "admin" && (
          <button
            onClick={handleApply}
            disabled={applied || applying || job.status !== "open"}
            className="btn btn-primary btn-lg mt-8"
          >
            {applied ? "Applied" : applying ? "Applying..." : job.status !== "open" ? "Closed" : "Apply Now"}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
