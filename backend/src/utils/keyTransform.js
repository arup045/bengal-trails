// Converts snake_case keys to camelCase recursively.
// Applied globally as middleware so all API responses are consistent for the frontend.
// PostgreSQL columns come back as snake_case; the rest of the app uses camelCase.

function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/gi, (_, c) => c.toUpperCase());
}

function transformKeys(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(transformKeys);
  if (value instanceof Date) return value;
  if (typeof value !== 'object') return value;
  // Plain objects only
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    return value;
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[snakeToCamel(k)] = transformKeys(v);
  }
  return out;
}

// Express middleware that wraps res.json to auto-transform responses
function camelCaseResponseMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(transformKeys(body));
  next();
}

module.exports = { snakeToCamel, transformKeys, camelCaseResponseMiddleware };
