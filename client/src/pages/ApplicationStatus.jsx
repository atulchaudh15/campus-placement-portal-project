import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import StatusBadge from "../components/StatusBadge.jsx";

const ApplicationStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/applications/my");
        setApplications(res.data.data.applications);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load your applications."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-3xl text-ink">Application Status</h1>
      <p className="text-muted mt-1">Track every job you've applied to.</p>

      {loading && <p className="text-muted mt-8">Loading applications...</p>}
      {error && <p className="text-coral mt-8">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <div className="card p-8 mt-8 text-center">
          <p className="text-muted">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn btn-primary btn-sm mt-4 inline-flex">
            Browse jobs
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-8">
        {applications.map((app) => (
          <div
            key={app._id}
            className="card p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <h3 className="font-display font-semibold text-ink">{app.job?.title}</h3>
              <p className="text-muted text-sm mt-0.5">
                {app.job?.company?.name} {app.job?.location ? `· ${app.job.location}` : ""}
              </p>
              <p className="text-muted text-xs mt-1">
                Applied on {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationStatus;
