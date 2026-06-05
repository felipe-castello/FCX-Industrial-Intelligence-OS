import { createHmac, timingSafeEqual } from 'crypto';

type IncomingRequest = {
  method?: string;
  path?: string;
  originalUrl?: string;
  headers?: Record<string, string | string[] | undefined>;
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

const verifyJwtHs256 = (token: string, secret: string) => {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as { alg?: string; typ?: string };

  if (header.alg !== 'HS256') {
    return false;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as { exp?: number; nbf?: number };
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    return false;
  }

  if (payload.nbf && payload.nbf > now) {
    return false;
  }

  return true;
};

const isProtectedRequest = (request: IncomingRequest) => {
  const method = (request.method || 'GET').toUpperCase();
  const path = request.path || request.originalUrl || '/';

  if (path === '/health') {
    return false;
  }

  if (path.startsWith('/users')) {
    return true;
  }

  if (path.startsWith('/integrations') || path.startsWith('/acquisition')) {
    return method !== 'GET';
  }

  return !['GET', 'HEAD', 'OPTIONS'].includes(method);
};

const readHeader = (headers: IncomingRequest['headers'], name: string) => {
  const value = headers?.[name] || headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export const securityMiddleware = (request: IncomingRequest, response: OutgoingResponse, next: NextFunction) => {
  const authEnabled = (process.env.SECURITY_AUTH_ENABLED || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) !== 'false';

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
    next();
    return;
  }

  const authorization = readHeader(request.headers, 'authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (jwtSecret && token) {
    try {
      if (verifyJwtHs256(token, jwtSecret)) {
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
