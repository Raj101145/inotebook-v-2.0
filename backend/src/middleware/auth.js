const jwt = require('jsonwebtoken');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    const err = new Error(`Missing ${name} in environment`);
    err.status = 500;
    throw err;
  }
  return v;
}

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'missing or invalid authorization header' });
    }

    const payload = jwt.verify(token, requireEnv('JWT_SECRET'));

    req.user = {
      id: String(payload.sub),
      email: payload.email,
      name: payload.name,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }
}

module.exports = { authRequired };

