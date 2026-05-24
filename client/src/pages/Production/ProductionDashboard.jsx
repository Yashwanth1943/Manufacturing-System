import { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import DataTable from '../../components/DataTable.jsx';
import FormInput from '../../components/FormInput.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../services/api.js';
import useToast from '../../context/useToast.js';
import './ProductionDashboard.css';

const initialForm = {
  product_name: '',
  quantity: '',
  machine_name: '',
  production_line: '',
  status: 'Created',
};

const columns = [
  { key: 'batch', label: 'Batch ID' },
  { key: 'product', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'machine', label: 'Machine' },
  { key: 'line', label: 'Production Line' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'created', label: 'Created Time' },
];

function ProductionDashboard() {
  const [form, setForm] = useState(initialForm);
  const [dashboard, setDashboard] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadDashboard = () => api.get('/dashboard/production').then(({ data }) => setDashboard(data));

  useEffect(() => {
    loadDashboard();
  }, []);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const createBatch = async () => {
    if (!form.product_name || !form.quantity || !form.machine_name || !form.production_line) {
      showToast('Fill product, quantity, machine, and production line', 'error');
      return;
    }
    if (Number(form.quantity) <= 0) {
      showToast('Quantity must be greater than zero', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/batches', form);
      setForm(initialForm);
      await loadDashboard();
      showToast(`Batch ${data.batch.batch_id} created`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not create batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateBatchStatus = async (row, status) => {
    await api.put(`/batches/${row.id}`, { status });
    await loadDashboard();
    showToast(`${row.batch} moved to ${status}`);
  };

  const deleteBatch = async (row) => {
    if (!window.confirm(`Delete batch ${row.batch}?`)) {
      return;
    }
    await api.delete(`/batches/${row.id}`);
    await loadDashboard();
    showToast(`${row.batch} deleted`);
  };

  const cards = dashboard?.cards || {};
  const machines = dashboard?.machines || [];
  const machineOptions = machines.map((machine) => machine.machine_name);
  const lineOptions = (dashboard?.lines || []).map((line) => line.line_name);
  const rows = (dashboard?.batches || []).map((batch) => ({
    id: batch.id,
    batch: batch.batch_id,
    product: batch.product_name,
    quantity: Number(batch.quantity).toLocaleString(),
    machine: batch.machine_name,
    line: batch.production_line,
    status: batch.status,
    created: new Date(`${batch.created_at}Z`).toLocaleString(),
  }));

  return (
    <DashboardLayout title="Production Operator Portal" notifications={dashboard?.notifications || []}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Batch execution</p>
          <h1>Create and monitor biscuit production batches</h1>
          <p>Capture produced quantity, machine assignment, line status, and live machine output for factory floor execution.</p>
        </div>
      </section>

      <div className="content-grid production-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Production Batch Creation</h2>
              <p>Register a new manufacturing batch for downstream inspection.</p>
            </div>
          </div>
          <form>
            <div className="form-grid">
              <div className="auto-batch-field">
                <span>Batch ID</span>
                <strong>Auto generated on create</strong>
              </div>
              <FormInput label="Product Name" name="product_name" value={form.product_name} onChange={update} />
              <FormInput label="Quantity Produced" name="quantity" type="number" value={form.quantity} onChange={update} />
              <FormInput label="Machine Name" name="machine_name" value={form.machine_name} onChange={update} options={['', ...machineOptions]} />
              <FormInput label="Production Line" name="production_line" value={form.production_line} onChange={update} options={['', ...lineOptions]} />
              <FormInput label="Status" name="status" value={form.status} onChange={update} options={['Created', 'In Production', 'Under Inspection']} />
            </div>
            <div className="form-actions">
              <button className="button primary" type="button" onClick={createBatch} disabled={saving}>CB {saving ? 'Saving...' : 'Create Batch'}</button>
              <button className="button secondary" type="button" onClick={() => setForm(initialForm)}>RS Reset Form</button>
            </div>
          </form>
        </section>

        <section className="machine-status-grid">
          {machines.map((machine) => (
            <article className="machine-status-card" key={machine.id}>
              <div>
                <h3>{machine.machine_name}</h3>
                <StatusBadge status={machine.running_status} />
              </div>
              <div className="machine-stats">
                <span>Efficiency <strong>{machine.efficiency}%</strong></span>
                <span>Production Count <strong>{Number(machine.production_count).toLocaleString()}</strong></span>
              </div>
            </article>
          ))}
        </section>
      </div>

      <section className="metric-grid production-metrics">
        <DashboardCard title="Shift Output" value={Number(cards.shiftOutput || 0).toLocaleString()} helper="Biscuits produced" icon="SO" tone="green" progress={86} />
        <DashboardCard title="In Production" value={cards.inProduction ?? 0} helper="Active batches" icon="IP" tone="blue" progress={60} />
        <DashboardCard title="Inspection Queue" value={cards.inspection ?? 0} helper="Batches waiting" icon="IQ" tone="amber" progress={46} />
      </section>

      <section className="panel production-history">
        <div className="panel-header">
          <div>
            <h2>Production History</h2>
            <p>Recently created and running production batches</p>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          filters={['Created', 'In Production', 'Under Inspection', 'Approved', 'Rejected']}
          actions={[
            {
              label: 'Start',
              onClick: (row) => updateBatchStatus(row, 'In Production'),
              disabled: (row) => row.status !== 'Created',
              variant: 'primary',
            },
            {
              label: 'Inspect',
              onClick: (row) => updateBatchStatus(row, 'Under Inspection'),
              disabled: (row) => row.status !== 'In Production',
            },
            {
              label: 'Delete',
              onClick: deleteBatch,
              variant: 'danger',
            },
          ]}
        />
      </section>
    </DashboardLayout>
  );
}

export default ProductionDashboard;
