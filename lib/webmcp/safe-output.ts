const forbiddenKeys = new Set([
  '__proto__',
  'prototype',
  'constructor',
  'uid',
  'userid',
  'firebaseuid',
  'listingid',
  'documentid',
  'documentpath',
  'email',
  'phone',
  'contact',
  'coordinates',
  'latitude',
  'longitude',
  'address',
  'exactaddress',
  'photourl',
  'imageurl',
  'url',
  'stack',
  'secret',
  'token',
  'cookie',
  'providerpayload',
  'firebaseconfig',
]);

const unsafeInstructionPattern = /(?:ignore\s+(?:all|the|previous)|call\s+another\s+tool|system\s+instruction|bypass\s+confirmation|reveal\s+hidden)/i;
const urlPattern = /https?:\/\//i;

export class SafeOutputError extends Error {
  constructor() {
    super('unsafe_output');
    this.name = 'SafeOutputError';
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function inspect(value: unknown, key: string, depth: number): void {
  if (depth > 8) throw new SafeOutputError();
  if (typeof value === 'string') {
    if (value.length > 600 || urlPattern.test(value) || unsafeInstructionPattern.test(value)) {
      throw new SafeOutputError();
    }
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new SafeOutputError();
    return;
  }
  if (value === null || typeof value === 'boolean' || value === undefined) return;
  if (Array.isArray(value)) {
    if (value.length > 32) throw new SafeOutputError();
    value.forEach((item) => inspect(item, key, depth + 1));
    return;
  }
  if (!isPlainObject(value)) throw new SafeOutputError();
  for (const [nestedKey, nestedValue] of Object.entries(value)) {
    if (forbiddenKeys.has(nestedKey.toLowerCase())) throw new SafeOutputError();
    inspect(nestedValue, nestedKey, depth + 1);
  }
}

export function assertSafeToolOutput<Value>(value: Value): Value {
  inspect(value, '', 0);
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw new SafeOutputError();
  }
  if (serialized.length > 16_000) throw new SafeOutputError();
  return value;
}
