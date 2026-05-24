import './DashboardCard.css';

function DashboardCard({ title, value, helper, icon = 'ID', tone = 'green', progress = 64 }) {
  return (
    <article className={`dashboard-card ${tone}`}>
      <div className="card-topline">
        <span className="card-icon">{icon}</span>
        <span className="card-pulse" />
      </div>
      <strong>{value}</strong>
      <p>{title}</p>
      {helper && <span className="card-helper">{helper}</span>}
      <div className="card-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}

export default DashboardCard;
