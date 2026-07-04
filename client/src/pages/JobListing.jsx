import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import JobCard from "../components/JobCard.jsx";

const TYPES = [
  { value: "all", label: "All" },
  { value: "it", label: "IT" },
  { value: "core", label: "Core" },
  { value: "finance", label: "Finance" },
  { value: "internship", label: "Internship" },
];

const JobListing = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const fetchJobs = async (q = "", t = "all") => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (q) params.q = q;
      if (t && t !== "all") params.type = t;
      const res = await api.get("/jobs", { params });
      setJobs(res.data.data.jobs);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load jobs right now."));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!user || user.role !== "student") return;
    try {
      const res = await api.get("/applications/my");
      const ids = new Set(res.data.data.applications.map((a) => a.job?._id));
      setAppliedJobIds(ids);
    } catch {
      // non-fatal — apply button will just not show "already applied" state
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchJobs(query, type), 350);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type]);

  const handleApply = async (jobId) => {
    if (!user) {
      showToast("Please log in as a student to apply.", "info");
      return;
    }
    if (user.role !== "student") {
      showToast("Only students can apply to jobs.", "info");
      return;
    }

    setApplyingId(jobId);
    try {
      await api.post("/applications", { jobId });
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      showToast("Application submitted successfully!");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not submit application."), "error");
    } finally {
      setApplyingId(null);
    }
  };

  const emptyState = useMemo(() => !loading && jobs.length === 0, [loading, jobs]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-3xl text-ink">Browse Jobs</h1>
      <p className="text-muted mt-1">Find your next opportunity.</p>

      <div className="flex flex-col md:flex-row gap-3 mt-6">
        <input
          className="input-field md:max-w-sm"
          placeholder="Search by title, skill, or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`btn btn-sm ${type === t.value ? "btn-primary" : "btn-outline"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-coral text-sm mt-6">{error}</p>}
      {loading && <p className="text-muted mt-8">Loading jobs...</p>}
      {emptyState && <p className="text-muted mt-8">No jobs match your search.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            footer={
              user?.role !== "recruiter" &&
              user?.role !== "admin" && (
                <button
                  onClick={() => handleApply(job._id)}
                  disabled={appliedJobIds.has(job._id) || applyingId === job._id}
                  className="btn btn-primary btn-sm"
                >
                  {appliedJobIds.has(job._id)
                    ? "Applied"
                    : applyingId === job._id
                    ? "Applying..."
                    : "Apply"}
                </button>
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default JobListing;
