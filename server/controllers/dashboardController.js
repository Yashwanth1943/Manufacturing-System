const { all, get } = require('../database/database');

const numberValue = (row, key = 'value') => Number(row?.[key] || 0);

const getAdminDashboard = async (req, res) => {
  const total = numberValue(await get('SELECT COUNT(*) as value FROM production_batches'));
  const approved = numberValue(await get("SELECT COUNT(*) as value FROM production_batches WHERE status = 'Approved'"));
  const rejected = numberValue(await get("SELECT COUNT(*) as value FROM production_batches WHERE status = 'Rejected'"));
  const defectCount = numberValue(await get('SELECT COALESCE(SUM(defect_count), 0) as value FROM defects'));
  const totalQuantity = numberValue(await get('SELECT COALESCE(SUM(quantity), 0) as value FROM production_batches'));
  const efficiency = numberValue(await get('SELECT ROUND(AVG(efficiency), 0) as value FROM machines'));
  const activeLines = numberValue(await get("SELECT COUNT(*) as value FROM production_lines WHERE status = 'Operational'"));
  const pending = numberValue(await get("SELECT COUNT(*) as value FROM quality_checks WHERE status = 'Pending'"));
  const recentActivities = await all(`
    SELECT batch_id, product_name, production_line, status, created_at
    FROM production_batches
    ORDER BY created_at DESC, id DESC
    LIMIT 8
  `);
  const machines = await all('SELECT * FROM machines ORDER BY efficiency DESC');
  const notifications = await all(
    "SELECT * FROM notifications WHERE role IN ('admin', 'all') ORDER BY created_at DESC LIMIT 6",
  );

  const approvalTotal = approved + rejected + pending;
  const approvalStats = {
    approved: approvalTotal ? Number(((approved / approvalTotal) * 100).toFixed(1)) : 0,
    pending: approvalTotal ? Number(((pending / approvalTotal) * 100).toFixed(1)) : 0,
    rejected: approvalTotal ? Number(((rejected / approvalTotal) * 100).toFixed(1)) : 0,
  };
  const trends = await all(`
    SELECT status, COUNT(*) as count
    FROM production_batches
    GROUP BY status
    ORDER BY count DESC
  `);

  return res.json({
    cards: {
      totalBatches: total,
      approvedBatches: approved,
      rejectedBatches: rejected,
      defectPercentage: totalQuantity ? Number(((defectCount / totalQuantity) * 100).toFixed(2)) : 0,
      machineEfficiency: efficiency,
      activeProductionLines: activeLines,
      pendingInspections: pending,
    },
    recentActivities,
    machines,
    notifications,
    approvalStats,
    trends,
  });
};

const getProductionDashboard = async (req, res) => {
  const batches = await all(`
    SELECT * FROM production_batches
    ORDER BY created_at DESC, id DESC
  `);
  const machines = await all('SELECT * FROM machines ORDER BY machine_name');
  const lines = await all('SELECT * FROM production_lines ORDER BY line_name');
  const created = numberValue(await get("SELECT COUNT(*) as value FROM production_batches WHERE status = 'Created'"));
  const inProduction = numberValue(await get("SELECT COUNT(*) as value FROM production_batches WHERE status = 'In Production'"));
  const inspection = numberValue(await get("SELECT COUNT(*) as value FROM production_batches WHERE status = 'Under Inspection'"));
  const output = numberValue(await get('SELECT COALESCE(SUM(quantity), 0) as value FROM production_batches'));
  const notifications = await all(
    "SELECT * FROM notifications WHERE role IN ('production', 'admin', 'all') ORDER BY created_at DESC LIMIT 6",
  );

  return res.json({
    cards: { created, inProduction, inspection, shiftOutput: output },
    batches,
    machines,
    lines,
    notifications,
  });
};

const getDefectsDashboard = async (req, res) => {
  const defects = await all('SELECT * FROM defects ORDER BY created_at DESC, id DESC');
  const totalDefects = numberValue(await get('SELECT COALESCE(SUM(defect_count), 0) as value FROM defects'));
  const highSeverity = numberValue(await get("SELECT COUNT(*) as value FROM defects WHERE severity = 'High'"));
  const mediumSeverity = numberValue(await get("SELECT COUNT(*) as value FROM defects WHERE severity = 'Medium'"));
  const lowSeverity = numberValue(await get("SELECT COUNT(*) as value FROM defects WHERE severity = 'Low'"));
  const totalQuantity = numberValue(await get('SELECT COALESCE(SUM(quantity), 0) as value FROM production_batches'));
  const byType = await all(`
    SELECT defect_type, SUM(defect_count) as count
    FROM defects
    GROUP BY defect_type
    ORDER BY count DESC
  `);
  const notifications = await all(
    "SELECT * FROM notifications WHERE role IN ('defects', 'admin', 'all') ORDER BY created_at DESC LIMIT 6",
  );

  return res.json({
    cards: {
      defectPercentage: totalQuantity ? Number(((totalDefects / totalQuantity) * 100).toFixed(2)) : 0,
      totalDefects,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      containmentRate: totalDefects ? Math.max(0, Number((100 - (highSeverity / defects.length) * 100).toFixed(1))) : 100,
    },
    defects,
    byType,
    notifications,
  });
};

const getQualityDashboard = async (req, res) => {
  const qualityChecks = await all('SELECT * FROM quality_checks ORDER BY inspection_time DESC, id DESC');
  const approved = numberValue(await get("SELECT COUNT(*) as value FROM quality_checks WHERE status = 'Approved'"));
  const rejected = numberValue(await get("SELECT COUNT(*) as value FROM quality_checks WHERE status = 'Rejected'"));
  const pending = numberValue(await get("SELECT COUNT(*) as value FROM quality_checks WHERE status = 'Pending'"));
  const total = approved + rejected + pending;
  const avgScore = numberValue(await get('SELECT ROUND(AVG(quality_score), 0) as value FROM quality_checks'));
  const notifications = await all(
    "SELECT * FROM notifications WHERE role IN ('quality', 'admin', 'all') ORDER BY created_at DESC LIMIT 6",
  );

  return res.json({
    cards: {
      approved,
      rejected,
      pendingInspection: pending,
      qualityPassRate: total ? Number(((approved / total) * 100).toFixed(1)) : 0,
      avgScore,
    },
    qualityChecks,
    notifications,
  });
};

module.exports = {
  getAdminDashboard,
  getProductionDashboard,
  getDefectsDashboard,
  getQualityDashboard,
};
