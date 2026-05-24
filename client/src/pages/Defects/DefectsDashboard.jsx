import { useEffect, useState } from 'react';
import AnalyticsSection from '../../components/AnalyticsSection.jsx';
import DashboardCard from '../../components/DashboardCard.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import DataTable from '../../components/DataTable.jsx';
import FormInput from '../../components/FormInput.jsx';
import api from '../../services/api.js';
import useToast from '../../context/useToast.js';
import './DefectsDashboard.css';

const columns = [
  { key: 'batch', label: 'Batch ID' },
  { key: 'type', label: 'Defect Type' },
  { key: 'severity', label: 'Severity', type: 'status' },
  { key: 'count', label: 'Count' },
  { key: 'status', label: 'Status', type: 'status' },
];

function DefectsDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    batch_id: '',
    defect_type: '',
    defect_count: '',
    severity: 'Low',
    description: '',
  });

  const loadData = async () => {
    const [dashboardResponse, batchResponse] = await Promise.all([
      api.get('/dashboard/defects'),
      api.get('/batches'),
    ]);
    setDashboard(dashboardResponse.data);
    setBatches(batchResponse.data.batches);
  };

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/dashboard/defects'), api.get('/batches')]).then(([dashboardResponse, batchResponse]) => {
      if (active) {
        setDashboard(dashboardResponse.data);
        setBatches(batchResponse.data.batches);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const createDefect = async () => {
    if (!form.batch_id || !form.defect_type || !form.defect_count || !form.severity) {
      showToast('Fill all required defect fields', 'error');
      return;
    }
    if (Number(form.defect_count) <= 0) {
      showToast('Defect count must be greater than zero', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/defects/${editingId}`, form);
        showToast('Defect updated');
      } else {
        await api.post('/defects', form);
        showToast('Defect reported');
      }
      setForm({ batch_id: '', defect_type: '', defect_count: '', severity: 'Low', description: '' });
      setEditingId(null);
      await loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save defect', 'error');
    } finally {
      setSaving(false);
    }
  };

  const editDefect = (row) => {
    const defect = dashboard.defects.find((item) => item.id === row.id);
    setEditingId(row.id);
    setForm({
      batch_id: defect.batch_id,
      defect_type: defect.defect_type,
      defect_count: String(defect.defect_count),
      severity: defect.severity,
      description: defect.description || '',
    });
  };

  const deleteDefect = async (row) => {
    if (!window.confirm(`Delete defect record for ${row.batch}?`)) {
      return;
    }
    await api.delete(`/defects/${row.id}`);
    await loadData();
    showToast('Defect deleted');
  };

  const cards = dashboard?.cards || {};
  const rows = (dashboard?.defects || []).map((defect) => ({
    id: defect.id,
    batch: defect.batch_id,
    type: defect.defect_type,
    severity: defect.severity,
    count: defect.defect_count,
    status: defect.severity === 'High' ? 'Open' : 'Pending',
  }));
  const heatCells = (dashboard?.defects || []).flatMap((defect) => {
    const intensity = defect.severity === 'High' ? 4 : defect.severity === 'Medium' ? 3 : 2;
    return Array.from({ length: Math.max(1, Math.ceil(Number(defect.defect_count || 1) / 50)) }, () => intensity);
  });
  const defectBars = (dashboard?.byType || []).map((item) => Math.max(12, Math.min(100, Number(item.count || 0))));

  return (
    <DashboardLayout title="Defects Team Portal" notifications={dashboard?.notifications || []}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Defect containment</p>
          <h1>Report, classify, and trend production defects</h1>
          <p>Track biscuit quality deviations, severity, impacted counts, and investigation status across every active batch.</p>
        </div>
      </section>

      <div className="content-grid defects-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Defect Reporting Form</h2>
              <p>Log defect details for review by production and quality teams.</p>
            </div>
          </div>
          <form>
            <div className="form-grid">
              <FormInput label="Batch ID" name="batch_id" value={form.batch_id} onChange={update} options={['', ...batches.map((batch) => batch.batch_id)]} />
              <FormInput label="Defect Type" name="defect_type" value={form.defect_type} onChange={update} />
              <FormInput label="Defect Count" name="defect_count" type="number" value={form.defect_count} onChange={update} />
              <FormInput label="Severity" name="severity" value={form.severity} onChange={update} options={['Low', 'Medium', 'High']} />
              <FormInput className="span-2" label="Description" name="description" textarea value={form.description} onChange={update} />
            </div>
            <div className="form-actions">
              <button className="button primary" type="button" onClick={createDefect} disabled={saving}>{editingId ? 'SC Save Changes' : `RD ${saving ? 'Saving...' : 'Report Defect'}`}</button>
              <button className="button secondary" type="button" onClick={() => { setForm({ batch_id: '', defect_type: '', defect_count: '', severity: 'Low', description: '' }); setEditingId(null); }}>CL Clear</button>
            </div>
          </form>
        </section>

        <section className="metric-grid defects-metrics">
          <DashboardCard title="Defect Percentage" value={`${cards.defectPercentage ?? 0}%`} helper="Plant-wide current shift" icon="DP" tone="amber" progress={cards.defectPercentage || 0} />
          <DashboardCard title="High Severity" value={cards.highSeverity ?? 0} helper="Needs immediate review" icon="HS" tone="red" progress={38} />
          <DashboardCard title="Containment Rate" value={`${cards.containmentRate ?? 0}%`} helper="Issues closed in target" icon="CR" tone="green" progress={cards.containmentRate || 0} />
        </section>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Defect Tracking Table</h2>
              <p>Open and recently resolved defect reports</p>
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            filters={['Low', 'Medium', 'High', 'Open', 'Pending']}
            actions={[
              { label: 'Edit', onClick: editDefect, variant: 'primary' },
              { label: 'Delete', onClick: deleteDefect, variant: 'danger' },
            ]}
          />
        </section>

        <section className="panel heatmap-panel">
          <div className="panel-header">
            <div>
              <h2>Defect Heatmap</h2>
              <p>Defect concentration by line and process area</p>
            </div>
          </div>
          <div className="defect-heatmap">
            {(heatCells.length ? heatCells : [1]).map((intensity, index) => (
              <span key={index} className={`heat-${intensity}`} />
            ))}
          </div>
        </section>
      </div>

      <AnalyticsSection title="Defect Analytics" subtitle="Recurring biscuit defect counts by type" bars={defectBars} />
    </DashboardLayout>
  );
}

export default DefectsDashboard;
