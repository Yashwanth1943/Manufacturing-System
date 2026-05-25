const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'manufacturing.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function handleRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });

const seedUsers = async () => {
  const users = [
    ['Admin User', 'admin@factory.com', 'admin123', 'admin'],
    ['Priya Nair', 'production@factory.com', 'production123', 'production'],
    ['Arjun Mehta', 'defects@factory.com', 'defects123', 'defects'],
    ['Neha Shah', 'quality@factory.com', 'quality123', 'quality'],
  ];

  for (const [name, email, password, role] of users) {
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!existing) {
      await run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
        name,
        email,
        hashedPassword,
        role,
      ]);
    } else {
      await run('UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?', [
        name,
        hashedPassword,
        role,
        email,
      ]);
    }
  }
};

const seedFactoryData = async () => {
  const lineCount = await get('SELECT COUNT(*) as count FROM production_lines');
  if (lineCount.count === 0) {
    const lines = [
      ['Line A2', 'Glucose biscuit line', 'Operational'],
      ['Line B4', 'Marie biscuit line', 'Operational'],
      ['Line C1', 'Cream sandwich line', 'Operational'],
      ['Line D3', 'Packaging and wrapping', 'Maintenance'],
    ];
    for (const line of lines) {
      await run('INSERT INTO production_lines (line_name, description, status) VALUES (?, ?, ?)', line);
    }
  }

  const machineCount = await get('SELECT COUNT(*) as count FROM machines');
  if (machineCount.count === 0) {
    const machines = [
      ['Rotary Oven A2', 'Running', 98, 24000],
      ['Mixer B4', 'Running', 91, 18500],
      ['Creamer C1', 'Running', 87, 15800],
      ['Wrapper D3', 'Maintenance', 76, 12900],
    ];
    for (const machine of machines) {
      await run(
        'INSERT INTO machines (machine_name, running_status, efficiency, production_count) VALUES (?, ?, ?, ?)',
        machine,
      );
    }
  }

  const batchCount = await get('SELECT COUNT(*) as count FROM production_batches');
  if (batchCount.count === 0) {
    const admin = await get('SELECT id FROM users WHERE role = ?', ['admin']);
    const production = await get('SELECT id FROM users WHERE role = ?', ['production']);
    const creatorId = production?.id || admin?.id || null;
    const batches = [
      ['BIS-2049', 'Marie Gold', 18500, 'Mixer B4', 'Line B4', 'In Production', creatorId],
      ['BIS-2048', 'Glucose Classic', 24000, 'Rotary Oven A2', 'Line A2', 'Under Inspection', creatorId],
      ['BIS-2047', 'Cream Sandwich', 15800, 'Creamer C1', 'Line C1', 'Created', creatorId],
      ['BIS-2045', 'Salt Crackers', 12600, 'Wrapper D3', 'Line D3', 'Rejected', creatorId],
      ['BIS-2044', 'Glucose Classic', 22000, 'Rotary Oven A2', 'Line A2', 'Approved', creatorId],
    ];
    for (const batch of batches) {
      await run(
        `INSERT INTO production_batches
          (batch_id, product_name, quantity, machine_name, production_line, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        batch,
      );
    }
  }

  const defectCount = await get('SELECT COUNT(*) as count FROM defects');
  if (defectCount.count === 0) {
    const defects = [
      ['BIS-2049', 'Over-baked edges', 142, 'Medium', 'Edges darkened after oven temperature spike.'],
      ['BIS-2048', 'Broken biscuit', 86, 'Low', 'Breakage observed at cooling conveyor transfer.'],
      ['BIS-2045', 'Cream mismatch', 228, 'High', 'Cream layer weight variance exceeded threshold.'],
      ['BIS-2044', 'Under weight pack', 39, 'Medium', 'Few packs below target fill weight.'],
    ];
    for (const defect of defects) {
      await run(
        'INSERT INTO defects (batch_id, defect_type, defect_count, severity, description) VALUES (?, ?, ?, ?, ?)',
        defect,
      );
    }
  }

  const qualityCount = await get('SELECT COUNT(*) as count FROM quality_checks');
  if (qualityCount.count === 0) {
    const checks = [
      ['BIS-2048', 'Pass', 94, 'Moisture, color, and breakage within limits.', 'Neha Shah', 'Approved'],
      ['BIS-2047', 'Pending', 0, 'Waiting for post-bake sampling.', 'Amit Rao', 'Pending'],
      ['BIS-2045', 'Fail', 62, 'Cream mismatch and texture variance detected.', 'Neha Shah', 'Rejected'],
      ['BIS-2044', 'Pass', 96, 'Batch released for packaging.', 'Riya Mehta', 'Approved'],
    ];
    for (const check of checks) {
      await run(
        `INSERT INTO quality_checks
          (batch_id, inspection_result, quality_score, remarks, inspector_name, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        check,
      );
    }
  }

  const notificationCount = await get('SELECT COUNT(*) as count FROM notifications');
  if (notificationCount.count === 0) {
    const notifications = [
      ['Oven line A2 temperature stable after adjustment', 'admin'],
      ['Batch BIS-2048 entered quality inspection', 'quality'],
      ['Packaging machine D3 requires scheduled calibration', 'production'],
      ['Cream layer variance detected on line C1', 'defects'],
    ];
    for (const notification of notifications) {
      await run('INSERT INTO notifications (message, role) VALUES (?, ?)', notification);
    }
  }
};

const initializeDatabase = async () => {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'production', 'defects', 'quality'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS production_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT UNIQUE NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      machine_name TEXT NOT NULL,
      production_line TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Created', 'In Production', 'Under Inspection', 'Approved', 'Rejected')),
      created_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS defects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      defect_type TEXT NOT NULL,
      defect_count INTEGER NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('Low', 'Medium', 'High')),
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(batch_id) REFERENCES production_batches(batch_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quality_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      inspection_result TEXT NOT NULL CHECK(inspection_result IN ('Pass', 'Fail', 'Pending')),
      quality_score INTEGER NOT NULL DEFAULT 0,
      remarks TEXT,
      inspector_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      inspection_time TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(batch_id) REFERENCES production_batches(batch_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine_name TEXT UNIQUE NOT NULL,
      running_status TEXT NOT NULL,
      efficiency INTEGER NOT NULL,
      production_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS production_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      line_name TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS batch_sequences (
      prefix TEXT PRIMARY KEY,
      last_sequence INTEGER NOT NULL
    )
  `);

  await seedUsers();
  await seedFactoryData();
};

module.exports = {
  db,
  run,
  get,
  all,
  initializeDatabase,
};
