const { all, get, run } = require('../database/database');

const listQualityChecks = async (req, res) => {
  const checks = await all(`
    SELECT id, batch_id, inspection_result, quality_score, remarks, inspector_name, status, inspection_time
    FROM quality_checks
    ORDER BY inspection_time DESC, id DESC
  `);
  return res.json({ qualityChecks: checks });
};

const createQualityCheck = async (req, res) => {
  const { batch_id, inspection_result, quality_score, remarks } = req.body;

  if (!batch_id || !inspection_result) {
    return res.status(400).json({ message: 'Batch ID and inspection result are required' });
  }

  if (!['Pass', 'Fail', 'Pending'].includes(inspection_result)) {
    return res.status(400).json({ message: 'Inspection result must be Pass, Fail, or Pending' });
  }

  if (quality_score !== undefined && quality_score !== '' && (!Number.isFinite(Number(quality_score)) || Number(quality_score) < 0 || Number(quality_score) > 100)) {
    return res.status(400).json({ message: 'Quality score must be between 0 and 100' });
  }

  const batch = await get('SELECT id FROM production_batches WHERE batch_id = ?', [batch_id]);
  if (!batch) {
    return res.status(404).json({ message: 'Production batch does not exist' });
  }

  const status = inspection_result === 'Pass' ? 'Approved' : inspection_result === 'Fail' ? 'Rejected' : 'Pending';
  const result = await run(
    `INSERT INTO quality_checks
      (batch_id, inspection_result, quality_score, remarks, inspector_name, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [batch_id, inspection_result, Number(quality_score || 0), remarks || '', req.user.name, status],
  );

  if (status !== 'Pending') {
    await run('UPDATE production_batches SET status = ? WHERE batch_id = ?', [status, batch_id]);
  }

  const check = await get('SELECT * FROM quality_checks WHERE id = ?', [result.id]);
  return res.status(201).json({ qualityCheck: check });
};

const updateQualityStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Approved, Rejected, or Pending' });
  }

  const existing = await get('SELECT * FROM quality_checks WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ message: 'Quality check not found' });
  }

  const inspectionResult = status === 'Approved' ? 'Pass' : status === 'Rejected' ? 'Fail' : 'Pending';
  await run('UPDATE quality_checks SET status = ?, inspection_result = ? WHERE id = ?', [
    status,
    inspectionResult,
    id,
  ]);
  await run('UPDATE production_batches SET status = ? WHERE batch_id = ?', [status, existing.batch_id]);

  const qualityCheck = await get('SELECT * FROM quality_checks WHERE id = ?', [id]);
  return res.json({ qualityCheck });
};

const deleteQualityCheck = async (req, res) => {
  const { id } = req.params;
  const existing = await get('SELECT * FROM quality_checks WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ message: 'Quality check not found' });
  }

  await run('DELETE FROM quality_checks WHERE id = ?', [id]);
  return res.json({ message: 'Quality check deleted successfully' });
};

module.exports = {
  listQualityChecks,
  createQualityCheck,
  updateQualityStatus,
  deleteQualityCheck,
};
