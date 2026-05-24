const rateLimitStore = new Map();

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
};

const createRateLimiter = ({ limit = 120, windowMs = 15 * 60 * 1000 } = {}) => (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  res.setHeader('RateLimit-Limit', String(limit));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - current.count)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

  if (current.count > limit) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  return next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 15 * 60 * 1000).unref();

module.exports = {
  createRateLimiter,
  securityHeaders,
};
