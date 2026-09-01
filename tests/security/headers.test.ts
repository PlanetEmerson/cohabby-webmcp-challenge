import { describe, expect, it } from 'vitest';

import { buildSecurityHeaders } from '@/lib/security/headers';
import nextConfig from '../../next.config';

describe('challenge security headers', () => {
  it('enables same-origin WebMCP while excluding every production service', () => {
    const headers = Object.fromEntries(buildSecurityHeaders(true).map(({ key, value }) => [key, value]));

    expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=(), tools=(self)');
    expect(headers['Origin-Agent-Cluster']).toBe('?1');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains');
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy']).not.toMatch(/firebase|stripe|googleapis|cohabby\.com|openai|analytics/i);
  });

  it('does not advertise the framework in production responses', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
