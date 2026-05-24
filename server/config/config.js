const isProduction = process.env.NODE_ENV === 'production';

const requiredInProduction = ['JWT_SECRET', 'CLIENT_URL'];

if (isProduction) {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

const config = {
  clientUrl: process.env.CLIENT_URL || 'http://127.0.0.1:5173',
  clientUrls: (process.env.CLIENT_URL || 'http://127.0.0.1:5173,http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  isProduction,
  jwtSecret: process.env.JWT_SECRET || 'dev_manufacturing_secret_change_me',
  port: Number(process.env.PORT || 3000),
  requestLimit: process.env.REQUEST_LIMIT || '100kb',
};

module.exports = config;
