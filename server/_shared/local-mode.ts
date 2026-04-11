const LOCAL_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
]);

function readHardLocalEnv(): string {
  return String(process.env.WORLDMONITOR_HARD_LOCAL_MODE || '').trim().toLowerCase();
}

export function isHardLocalModeEnabled(): boolean {
  const raw = readHardLocalEnv();
  return raw === '1' || raw === 'true' || raw === 'on';
}

export function isLocalhostRequestUrl(requestUrl?: string): boolean {
  if (!requestUrl) return false;
  try {
    const parsed = new URL(requestUrl);
    return LOCAL_HOSTNAMES.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function shouldForceLocalLlm(requestUrl?: string): boolean {
  return isHardLocalModeEnabled() || isLocalhostRequestUrl(requestUrl);
}
