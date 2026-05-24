import { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import DataTable from '../../components/DataTable.jsx';
import FormInput from '../../components/FormInput.jsx';
import api from '../../services/api.js';
import useToast from '../../context/useToast.js';
import './QualityDashboard.css';

const columns = [
  { key: 'batch', label: 'Batch ID' },
  { key: 'result', label: 'Result', type: 'status' },
  { key: 'inspector', label: 'Inspector' },
  { key: 'time', label: 'Inspection Time' },
  { key: 'status', label: 'Status', type: 'status' },
];

function QualityDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    batch_id: '',
    inspection_result: 'Pending',
    quality_score: '',
    remarks: '',
  });

  const loadData = async () => {
    const [dashboardResponse, batchResponse] = await Promise.all([
      api.get('/dashboard/quality'),
      api.get('/batches'),
    ]);
    setDashboard(dashboardResponse.data);
    setBatches(batchResponse.data.batches);
  };

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/dashboard/quality'), api.get('/batches')]).then(([dashboardResponse, batchResponse]) => {
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

  const submitInspection = async (result) => {
    if (!form.batch_id) {
      showToast('Select a batch before saving inspection', 'error');
      return;
    }
    if (form.quality_score !== '' && (Number(form.quality_score) < 0 || Number(form.quality_score) > 100)) {
      showToast('Quality score must be between 0 and 100', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/quality', { ...form, inspection_result: result });
      setForm({ batch_id: '', inspection_result: 'Pending', quality_score: '', remarks: '' });
      await loadData();
      showToast(result === 'Pass' ? 'Batch approved' : 'Batch rejected');
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not save inspection', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateQualityStatus = async (row, status) => {
    await api.put(`/quality/${row.id}/status`, { status });
    await loadData();
    showToast(`${row.batch} ${status.toLowerCase()}`);
  };

  const deleteQualityCheck = async (row) => {
    if (!window.confirm(`Delete inspection for ${row.batch}?`)) {
      return;
    }
    await api.delete(`/quality/${row.id}`);
    await loadData();
    showToast('Inspection deleted');
  };

  const cards = dashboard?.cards || {};
  const rows = (dashboard?.qualityChecks || []).map((check) => ({
    id: check.id,
    batch: check.batch_id,
    result: check.inspection_result,
    inspector: check.inspector_name,
    time: new Date(`${check.inspection_time}Z`).toLocaleString(),
    status: check.status,
  }));

  return (
    <DashboardLayout title="Quality Inspector Portal" notifications={dashboard?.notifications || []}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Quality release</p>
          <h1>Inspect, approve, or reject biscuit batches</h1>
          <p>Evaluate inspection score, remarks, and final disposition before releasing batches to packaging and dispatch.</p>
        </div>
      </section>

      <section className="metric-grid quality-stats">
        <DashboardCard title="Approved" value={cards.approved ?? 0} helper="Released batches" icon="AP" tone="green" progress={91} />
        <DashboardCard title="Rejected" value={cards.rejected ?? 0} helper="Needs RCA" icon="RJ" tone="red" progress={18} />
        <DashboardCard title="Pending Inspection" value={cards.pendingInspection ?? 0} helper="Queue depth" icon="PI" tone="amber" progress={44} />
        <DashboardCard title="Quality Pass Rate" value={`${cards.qualityPassRate ?? 0}%`} helper="Approved vs total" icon="QR" tone="blue" progress={cards.qualityPassRate || 0} />
      </section>

      <div className="content-grid quality-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Quality Inspection Form</h2>
              <p>Record batch inspection result and release decision.</p>
            </div>
          </div>
          <form>
            <div className="form-grid">
              <FormInput label="Batch ID" name="batch_id" value={form.batch_id} onChange={update} options={['', ...batches.map((batch) => batch.batch_id)]} />
              <FormInput label="Inspection Result" name="inspection_result" value={form.inspection_result} onChange={update} options={['Pass', 'Fail', 'Pending']} />
              <FormInput label="Quality Score" name="quality_score" type="number" value={form.quality_score} onChange={update} />
              <FormInput className="span-2" label="Remarks" name="remarks" textarea value={form.remarks} onChange={update} />
            </div>
            <div className="form-actions">
              <button className="button primary" type="button" onClick={() => submitInspection('Pass')} disabled={saving}>AB {saving ? 'Saving...' : 'Approve Batch'}</button>
              <button className="button danger" type="button" onClick={() => submitInspection('Fail')} disabled={saving}>RB Reject Batch</button>
            </div>
          </form>
        </section>

        <section className="panel quality-ring-panel">
          <div className="panel-header">
            <div>
              <h2>Inspection Mix</h2>
              <p>Live pass rate from quality checks</p>
            </div>
          </div>
          <div className="quality-ring">
            <strong>{cards.qualityPassRate ?? 0}%</strong>
            <span>Pass rate</span>
          </div>
        </section>
      </div>

      <section className="panel quality-history">
        <div className="panel-header">
          <div>
            <h2>Inspection History</h2>
            <p>Recent batch quality decisions and release status</p>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          filters={['Pass', 'Fail', 'Pending', 'Approved', 'Rejected']}
          actions={[
            { label: 'Approve', onClick: (row) => updateQualityStatus(row, 'Approved'), disabled: (row) => row.status === 'Approved', variant: 'primary' },
            { label: 'Reject', onClick: (row) => updateQualityStatus(row, 'Rejected'), disabled: (row) => row.status === 'Rejected' },
            { label: 'Delete', onClick: deleteQualityCheck, variant: 'danger' },
          ]}
        />
      </section>
    </DashboardLayout>
  );
}

export default QualityDashboard;
