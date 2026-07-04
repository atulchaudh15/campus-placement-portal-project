import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import { useToast } from "../context/ToastContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STATUS_OPTIONS = ["Applied", "In Review", "Interview", "Offered", "Rejected"];

const RecruiterApplicants = () => {
  const { jobId } = useParams();
  const { showToast } = useToast();

  const [jobTitle, setJobTitle] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadApplicants = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setJobTitle(res.data.data.job.title);
      setApplications(res.data.data.applications);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load applicants."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status } : a))
      );
      showToast(`Application marked as ${status}.`);
    } catch (err) {
      showToast(getErrorMessage(err, "Could not update application status."), "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-muted text-center py-16">Loading applicants...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/recruiter/dashboard" className="text-sm text-muted hover:text-orange">
        ← Back to dashboard
      </Link>

      <h1 className="font-display font-bold text-3xl text-ink mt-3">
        Applicants {jobTitle && `for ${jobTitle}`}
      </h1>

      {error && <p className="text-coral mt-6">{error}</p>}

      {!error && applications.length === 0 && (
        <div className="card p-8 mt-8 text-center">
          <p className="text-muted">No applicants yet for this job.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-8">
        {applications.map((app) => (
          <div key={app._id} className="card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display font-semibold text-ink">{app.student?.name}</h3>
              <p className="text-muted text-sm mt-0.5">{app.student?.email}</p>
              <p className="text-muted text-xs mt-1">
                {app.student?.college} {app.student?.branch ? `· ${app.student.branch}` : ""}
              </p>
              {app.student?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {app.student.skills.map((s) => (
                    <span key={s} className="text-xs bg-cream2 text-ink2 px-2 py-1 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {app.student?.resumeUrl && (
                <a
                  href={app.student.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange text-sm font-semibold hover:underline mt-2 inline-block"
                >
                  View Resume →
                </a>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={app.status} />
              <select
                className="input-field !w-auto text-sm"
                value={app.status}
                disabled={updatingId === app._id}
                onChange={(e) => handleStatusChange(app._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(app._id, "Offered")}
                  disabled={updatingId === app._id || app.status === "Offered"}
                  className="btn btn-sm !bg-green !text-white disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusChange(app._id, "Rejected")}
                  disabled={updatingId === app._id || app.status === "Rejected"}
                  className="btn btn-sm !bg-coral !text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterApplicants;
