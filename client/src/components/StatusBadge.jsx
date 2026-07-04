const statusStyles = {
  Applied: "badge-orange",
  "In Review": "badge-amber",
  Interview: "badge-violet",
  Offered: "badge-green",
  Rejected: "badge-coral",
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${statusStyles[status] || "badge-orange"}`}>{status}</span>
);

export default StatusBadge;
