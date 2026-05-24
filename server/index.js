const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { initializeDatabase } = require('./database/database');
const { db } = require('./database/database');
const authRoutes = require('./routes/authRoutes');
const batchRoutes = require('./routes/batchRoutes');
const defectRoutes = require('./routes/defectRoutes');
const qualityRoutes = require('./routes/qualityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { createRateLimiter, securityHeaders } = require('./middleware/securityMiddleware');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: config.requestLimit }));
app.use('/api', createRateLimiter());
app.use('/api/auth/login', createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000 }));

app.get('/api/health', (req, res) => {
  res.json({
    environment: config.isProduction ? 'production' : 'development',
    service: 'manufacturing-system-api',
    status: 'ok',
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({
    message: status >= 500 && config.isProduction ? 'Internal server error' : error.message || 'Internal server error',
  });
});

initializeDatabase()
  .then(() => {
    const server = app.listen(config.port, () => {
      console.log(`Manufacturing API running on port ${config.port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down Manufacturing API...`);
      server.close(() => {
        db.close((error) => {
          if (error) {
            console.error('Database shutdown error', error);
            process.exit(1);
          }
          process.exit(0);
        });
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (error) => {
      console.error('Unhandled promise rejection', error);
      shutdown('unhandledRejection');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
