import './AnalyticsSection.css';

function AnalyticsSection({ title, subtitle, bars = [62, 88, 73, 95, 81, 67, 90], children }) {
  return (
    <section className="panel analytics-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="analytics-tabs">
          <button className="active" type="button">Day</button>
          <button type="button">Week</button>
          <button type="button">Month</button>
        </div>
      </div>
      <div className="analytics-body">
        <div className="placeholder-bars">
          {bars.map((bar, index) => (
            <span className="placeholder-bar" style={{ height: `${bar}%` }} key={`${bar}-${index}`} />
          ))}
        </div>
        {children && <div className="analytics-side">{children}</div>}
      </div>
    </section>
  );
}

export default AnalyticsSection;
