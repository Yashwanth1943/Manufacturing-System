const { all, get, run } = require('../database/database');

const listDefects = async (req, res) => {
  const defects = await all(`
    SELECT id, batch_id, defect_type, defect_count, severity, description, created_at
    FROM defects
    ORDER BY created_at DESC, id DESC
  `);
  return res.json({ defects });
};

const createDefect = async (req, res) => {
  const { batch_id, defect_type, defect_count, severity, description } = req.body;

  if (!batch_id || !defect_type || !defect_count || !severity) {
    return res.status(400).json({ message: 'Batch ID, defect type, count, and severity are required' });
  }

  if (!['Low', 'Medium', 'High'].includes(severity)) {
    return res.status(400).json({ message: 'Severity must be Low, Medium, or High' });
  }

  if (!Number.isFinite(Number(defect_count)) || Number(defect_count) <= 0) {
    return res.status(400).json({ message: 'Defect count must be greater than zero' });
  }

  const batch = await get('SELECT id FROM production_batches WHERE batch_id = ?', [batch_id]);
  if (!batch) {
    return res.status(404).json({ message: 'Production batch does not exist' });
  }

  const result = await run(
    'INSERT INTO defects (batch_id, defect_type, defect_count, severity, description) VALUES (?, ?, ?, ?, ?)',
    [batch_id, defect_type, Number(defect_count), severity, description || ''],
  );

  await run('INSERT INTO notifications (message, role) VALUES (?, ?)', [
    `${severity} defect reported for ${batch_id}`,
    'admin',
  ]);

  const defect = await get('SELECT * FROM defects WHERE id = ?', [result.id]);
  return res.status(201).json({ defect });
};

const updateDefect = async (req, res) => {
  const { id } = req.params;
  const { defect_type, defect_count, severity, description } = req.body;
  const existing = await get('SELECT * FROM defects WHERE id = ?', [id]);

  if (!existing) {
    return res.status(404).json({ message: 'Defect not found' });
  }

  if (severity !== undefined && !['Low', 'Medium', 'High'].includes(severity)) {
    return res.status(400).json({ message: 'Severity must be Low, Medium, or High' });
  }

  if (defect_count !== undefined && (!Number.isFinite(Number(defect_count)) || Number(defect_count) <= 0)) {
    return res.status(400).json({ message: 'Defect count must be greater than zero' });
  }

  await run(
    `UPDATE defects
     SET defect_type = ?, defect_count = ?, severity = ?, description = ?
     WHERE id = ?`,
    [
      defect_type ?? existing.defect_type,
      Number(defect_count ?? existing.defect_count),
      severity ?? existing.severity,
      description ?? existing.description,
      id,
    ],
  );

  const defect = await get('SELECT * FROM defects WHERE id = ?', [id]);
  return res.json({ defect });
};

const deleteDefect = async (req, res) => {
  const { id } = req.params;
  const existing = await get('SELECT * FROM defects WHERE id = ?', [id]);

  if (!existing) {
    return res.status(404).json({ message: 'Defect not found' });
  }

  await run('DELETE FROM defects WHERE id = ?', [id]);
  return res.json({ message: 'Defect deleted successfully' });
};

module.exports = {
  listDefects,
  createDefect,
  updateDefect,
  deleteDefect,
};
