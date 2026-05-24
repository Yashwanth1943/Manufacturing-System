const { all, get, run } = require('../database/database');

const statuses = ['Created', 'In Production', 'Under Inspection', 'Approved', 'Rejected'];

const buildBatchPrefix = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `BIS-${year}${month}${day}`;
};

const generateUniqueBatchId = async () => {
  const prefix = buildBatchPrefix();
  const sequence = await get('SELECT last_sequence FROM batch_sequences WHERE prefix = ?', [prefix]);
  let nextSequence = sequence ? Number(sequence.last_sequence) + 1 : 1;

  while (nextSequence < 100000) {
    const candidate = `${prefix}-${String(nextSequence).padStart(4, '0')}`;
    const existing = await get('SELECT id FROM production_batches WHERE batch_id = ?', [candidate]);
    if (!existing) {
      if (sequence) {
        await run('UPDATE batch_sequences SET last_sequence = ? WHERE prefix = ?', [nextSequence, prefix]);
      } else {
        await run('INSERT INTO batch_sequences (prefix, last_sequence) VALUES (?, ?)', [prefix, nextSequence]);
      }
      return candidate;
    }
    nextSequence += 1;
  }

  throw new Error('Unable to generate a unique batch ID for today');
};

const listBatches = async (req, res) => {
  const batches = await all(`
    SELECT
      pb.id,
      pb.batch_id,
      pb.product_name,
      pb.quantity,
      pb.machine_name,
      pb.production_line,
      pb.status,
      pb.created_at,
      u.name as created_by_name
    FROM production_batches pb
    LEFT JOIN users u ON u.id = pb.created_by
    ORDER BY pb.created_at DESC, pb.id DESC
  `);
  return res.json({ batches });
};

const createBatch = async (req, res) => {
  const { batch_id, product_name, quantity, machine_name, production_line, status = 'Created' } = req.body;

  if (!product_name || !quantity || !machine_name || !production_line) {
    return res.status(400).json({ message: 'Product, quantity, machine, and production line are required' });
  }

  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than zero' });
  }

  if (!statuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid batch status' });
  }

  if (batch_id) {
    const existingBatch = await get('SELECT id FROM production_batches WHERE batch_id = ?', [batch_id]);
    if (existingBatch) {
      return res.status(409).json({ message: 'Batch ID already exists' });
    }
  }

  const finalBatchId = batch_id || (await generateUniqueBatchId());

  const result = await run(
    `INSERT INTO production_batches
      (batch_id, product_name, quantity, machine_name, production_line, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [finalBatchId, product_name, Number(quantity), machine_name, production_line, status, req.user.id],
  );

  await run('INSERT INTO notifications (message, role) VALUES (?, ?)', [
    `New production batch ${finalBatchId} created`,
    'admin',
  ]);

  const batch = await get('SELECT * FROM production_batches WHERE id = ?', [result.id]);
  return res.status(201).json({ batch });
};

const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { product_name, quantity, machine_name, production_line, status } = req.body;

  const existing = await get('SELECT * FROM production_batches WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  if (quantity !== undefined && (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0)) {
    return res.status(400).json({ message: 'Quantity must be greater than zero' });
  }

  if (status !== undefined && !statuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid batch status' });
  }

  if (req.user.role === 'production' && ['Approved', 'Rejected'].includes(status)) {
    return res.status(403).json({ message: 'Only quality or admin users can approve or reject batches' });
  }

  const next = {
    product_name: product_name ?? existing.product_name,
    quantity: quantity ?? existing.quantity,
    machine_name: machine_name ?? existing.machine_name,
    production_line: production_line ?? existing.production_line,
    status: status ?? existing.status,
  };

  await run(
    `UPDATE production_batches
     SET product_name = ?, quantity = ?, machine_name = ?, production_line = ?, status = ?
     WHERE id = ?`,
    [next.product_name, Number(next.quantity), next.machine_name, next.production_line, next.status, id],
  );

  const batch = await get('SELECT * FROM production_batches WHERE id = ?', [id]);
  return res.json({ batch });
};

const deleteBatch = async (req, res) => {
  const { id } = req.params;
  const existing = await get('SELECT * FROM production_batches WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ message: 'Batch not found' });
  }

  await run('DELETE FROM defects WHERE batch_id = ?', [existing.batch_id]);
  await run('DELETE FROM quality_checks WHERE batch_id = ?', [existing.batch_id]);
  await run('DELETE FROM production_batches WHERE id = ?', [id]);
  await run('INSERT INTO notifications (message, role) VALUES (?, ?)', [
    `Production batch ${existing.batch_id} deleted`,
    'admin',
  ]);

  return res.json({ message: 'Batch deleted successfully' });
};

module.exports = {
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
};
