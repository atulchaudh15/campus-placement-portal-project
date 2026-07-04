import { Link } from "react-router-dom";

const typeLabels = {
  it: "IT",
  core: "Core",
  finance: "Finance",
  internship: "Internship",
  other: "Other",
};

const JobCard = ({ job, footer }) => {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink">{job.title}</h3>
          <p className="text-muted text-sm mt-0.5">{job.company?.name || "Company"}</p>
        </div>
        <span className="badge badge-orange whitespace-nowrap">{typeLabels[job.type] || job.type}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted">
        {job.location && <span>📍 {job.location}</span>}
        {job.ctc && <span>💰 {job.ctc}</span>}
      </div>

      {job.skillsRequired?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs bg-cream2 text-ink2 px-2 py-1 rounded-md">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
          View details
        </Link>
        {footer}
      </div>
    </div>
  );
};

export default JobCard;
