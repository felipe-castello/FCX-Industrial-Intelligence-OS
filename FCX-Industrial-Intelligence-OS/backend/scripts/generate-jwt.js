const { createHmac } = require('crypto');

const secret = process.env.JWT_SECRET;

if (!secret || secret.includes('CHANGE_ME')) {
  console.error('Configure JWT_SECRET antes de gerar um token.');
  process.exit(1);
}

const subject = process.argv[2] || 'fcx-admin';
const expiresInSeconds = Number(process.argv[3] || 3600);
const now = Math.floor(Date.now() / 1000);

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const header = encode({ alg: 'HS256', typ: 'JWT' });
const payload = encode({
  sub: subject,
  role: 'admin',
  iat: now,
  exp: now + expiresInSeconds,
});

const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');

console.log(`${header}.${payload}.${signature}`);
