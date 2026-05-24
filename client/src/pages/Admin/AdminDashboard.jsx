import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsSection from '../../components/AnalyticsSection.jsx';
import DashboardCard from '../../components/DashboardCard.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import DataTable from '../../components/DataTable.jsx';
import api from '../../services/api.js';
import useToast from '../../context/useToast.js';
import './AdminDashboard.css';

const columns = [
  { key: 'batch', label: 'Batch ID' },
  { key: 'product', label: 'Product' },
  { key: 'line', label: 'Production Line' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status', type: 'status' },
];

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data }) => setDashboard(data));
  }, []);

  const cards = dashboard?.cards || {};
  const rows = (dashboard?.recentActivities || []).map((activity) => ({
    id: activity.batch_id,
    batch: activity.batch_id,
    product: activity.product_name,
    line: activity.production_line,
    status: activity.status,
    owner: activity.created_at,
  }));
  const adminBars = [
    cards.totalBatches,
    cards.approvedBatches,
    cards.rejectedBatches,
    cards.pendingInspections,
    cards.machineEfficiency,
    cards.activeProductionLines,
  ].map((value) => Math.max(12, Math.min(100, Number(value || 0))));
  const approvalStats = dashboard?.approvalStats || { approved: 0, pending: 0, rejected: 0 };

  const exportReport = () => {
    const csv = [
      ['Batch ID', 'Product', 'Production Line', 'Status', 'Created At'],
      ...rows.map((row) => [row.batch, row.product, row.line, row.status, row.owner]),
    ].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'manufacturing-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Report exported');
  };

  return (
    <DashboardLayout title="Admin Command Center" notifications={dashboard?.notifications || []}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Enterprise overview</p>
          <h1>Manufacturing production cockpit</h1>
          <p>Monitor biscuit output, approvals, defect load, machine efficiency, and active production lines from one operating surface.</p>
        </div>
        <div className="page-actions">
          <button className="button primary" type="button" onClick={exportReport}>EX Export report</button>
          <button className="button secondary" type="button" onClick={() => navigate('/quality')}>AP Approvals</button>
        </div>
      </section>

      <section className="admin-card-grid">
        <DashboardCard title="Total Production Batches" value={cards.totalBatches ?? '...'} helper="SQLite live count" icon="TB" tone="blue" progress={84} />
        <DashboardCard title="Approved Batches" value={cards.approvedBatches ?? '...'} helper="Released by quality" icon="OK" tone="green" progress={93} />
        <DashboardCard title="Rejected Batches" value={cards.rejectedBatches ?? '...'} helper="Blocked from dispatch" icon="RJ" tone="red" progress={18} />
        <DashboardCard title="Defect Percentage" value={`${cards.defectPercentage ?? 0}%`} helper="Defect count vs output" icon="DF" tone="amber" progress={Math.min(cards.defectPercentage || 0, 100)} />
        <DashboardCard title="Machine Efficiency" value={`${cards.machineEfficiency ?? 0}%`} helper="Average OEE signal" icon="ME" tone="green" progress={cards.machineEfficiency || 0} />
        <DashboardCard title="Active Production Lines" value={cards.activeProductionLines ?? '...'} helper="Operational line count" icon="PL" tone="blue" progress={80} />
      </section>

      <div className="content-grid">
        <AnalyticsSection title="Production Analytics" subtitle="Hourly batch throughput and approval rhythm" bars={adminBars}>
          <div className="summary-row"><span>Approved</span><strong>{cards.approvedBatches || 0}</strong></div>
          <div className="summary-row"><span>Rejected</span><strong>{cards.rejectedBatches || 0}</strong></div>
          <div className="summary-row"><span>Pending QC</span><strong>{cards.pendingInspections || 0}</strong></div>
          <div className="summary-row"><span>Efficiency</span><strong>{cards.machineEfficiency || 0}%</strong></div>
        </AnalyticsSection>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Approval Statistics</h2>
              <p>Current quality disposition split</p>
            </div>
          </div>
          <div className="approval-stack">
            <span style={{ height: `${Math.max(12, approvalStats.approved)}%` }}>Approved {approvalStats.approved}%</span>
            <span style={{ height: `${Math.max(12, approvalStats.pending)}%` }}>Pending {approvalStats.pending}%</span>
            <span style={{ height: `${Math.max(12, approvalStats.rejected)}%` }}>Rejected {approvalStats.rejected}%</span>
          </div>
        </section>
      </div>

      <section className="panel admin-table-panel">
        <div className="panel-header">
          <div>
            <h2>Production Status Overview</h2>
            <p>Latest activity across biscuit production and inspection cells</p>
          </div>
        </div>
        <DataTable columns={columns} rows={rows} filters={['Created', 'In Production', 'Under Inspection', 'Approved', 'Rejected']} />
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;
