import { createHmac, timingSafeEqual } from 'crypto';

type IncomingRequest = {
  method?: string;
  path?: string;
  originalUrl?: string;
  headers?: Record<string, string | string[] | undefined>;
  user?: JwtPayload;
};

type OutgoingResponse = {
  status: (code: number) => { json: (body: unknown) => void };
};

type NextFunction = () => void;

const base64UrlDecode = (input: string) => Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

type JwtPayload = { sub?: string; role?: string; companyId?: string; permissions?: string[]; exp?: number; nbf?: number };

const verifyJwtHs256 = (token: string, secret: string): JwtPayload | null => {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as { alg?: string; typ?: string };

  if (header.alg !== 'HS256') {
    return null;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    return null;
  }

  if (payload.nbf && payload.nbf > now) {
    return null;
  }

  return payload;
};

const isProtectedRequest = (request: IncomingRequest) => {
  const method = (request.method || 'GET').toUpperCase();
  const path = request.path || request.originalUrl || '/';

  if (path === '/health' || path === '/metrics') {
    return false;
  }

  if (path.startsWith('/auth/')) {
    return false;
  }

  return !['HEAD', 'OPTIONS'].includes(method);
};

const rolePermissions: Record<string, string[]> = {
  MASTER_ADMIN: ['*'],
  ADMIN: ['*'],
  FCX_ADMIN: ['read', 'create', 'update', 'delete'],
  MANAGER: ['read', 'create', 'update'],
  SUPERVISOR: ['read', 'create', 'update'],
  ENGINEER: ['read', 'create', 'update'],
  TECHNICIAN: ['read', 'update'],
  CLIENT: ['read'],
  VIEWER: ['read'],
};

const actionFor = (method = 'GET') => ({ POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' } as Record<string, string>)[method.toUpperCase()] || 'read';

const canAccess = (request: IncomingRequest, payload: JwtPayload) => {
  if ((process.env.SECURITY_RBAC_ENABLED || 'false') !== 'true') return true;
  const path = request.path || request.originalUrl || '/';
  if (path.startsWith('/roles') || path.startsWith('/permissions') || path.startsWith('/audit-logs')) {
    return ['MASTER_ADMIN', 'FCX_ADMIN', 'ADMIN'].includes(payload.role || '');
  }
  const action = actionFor(request.method);
  const allowed = rolePermissions[payload.role || 'VIEWER'] || [];
  return allowed.includes('*') || allowed.includes(action) || payload.permissions?.includes('*') || payload.permissions?.includes(action) || false;
};

const readHeader = (headers: IncomingRequest['headers'], name: string) => {
  const value = headers?.[name] || headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export const securityMiddleware = (request: IncomingRequest, response: OutgoingResponse, next: NextFunction) => {
  const authEnabled = (process.env.SECURITY_AUTH_ENABLED || 'false') === 'true';

  if (!authEnabled || !isProtectedRequest(request)) {
    next();
    return;
  }

  const apiKey = process.env.API_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (!apiKey && !jwtSecret) {
    response.status(503).json({ error: 'Security credentials are not configured.' });
    return;
  }

  const providedApiKey = readHeader(request.headers, 'x-api-key');

  if (apiKey && providedApiKey && safeEqual(providedApiKey, apiKey)) {
    request.user = { role: 'MASTER_ADMIN', permissions: ['*'] };
    next();
    return;
  }

  const authorization = readHeader(request.headers, 'authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (jwtSecret && token) {
    try {
      const payload = verifyJwtHs256(token, jwtSecret);
      if (payload) {
        if (!canAccess(request, payload)) {
          response.status(403).json({ error: 'Insufficient permissions.' });
          return;
        }
        request.user = payload;
        next();
        return;
      }
    } catch {
      response.status(401).json({ error: 'Invalid authorization token.' });
      return;
    }
  }

  response.status(401).json({ error: 'Authentication required.' });
};
