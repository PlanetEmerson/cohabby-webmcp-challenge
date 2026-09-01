export type SecurityHeader = Readonly<{ key: string; value: string }>;

export function buildSecurityHeaders(production: boolean): SecurityHeader[] {
  const scriptSources = production
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const connectSources = production
    ? "connect-src 'self'"
    : "connect-src 'self' ws: wss:";
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    scriptSources,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    connectSources,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
  const headers: SecurityHeader[] = [
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), tools=(self)' },
    { key: 'Origin-Agent-Cluster', value: '?1' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy', value: csp },
  ];
  if (production) {
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' });
  }
  return headers;
}
