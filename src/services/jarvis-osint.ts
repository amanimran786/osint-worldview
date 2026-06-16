import { proxyUrl } from '@/utils';
import { isDesktopRuntime } from './runtime';
import { isFeatureAvailable } from './runtime-config';

const API_PATH = '/api/jarvis-osint';

function endpointUrl(): string {
  return isDesktopRuntime() ? proxyUrl(API_PATH) : API_PATH;
}

export interface JarvisOsintStatus {
  ok: boolean;
  status?: {
    maigret?: { available?: boolean; command?: string };
    dnstwist?: { available?: boolean; command?: string };
    subfinder?: { available?: boolean; command?: string };
    whois?: { available?: boolean; command?: string };
  };
  error?: string;
  message?: string;
}

export interface JarvisUsernameProfile {
  site: string;
  url: string;
  status: string;
}

export interface JarvisUsernameScanResult {
  ok: boolean;
  provider?: string;
  username?: string;
  profiles?: JarvisUsernameProfile[];
  found_count?: number;
  error?: string;
  message?: string;
  detail?: string;
}

export interface JarvisDomainTypoCandidate {
  domain: string;
  fuzzer: string;
  dns_a: string[] | string;
  dns_aaaa: string[] | string;
  mx: string[] | string;
  ns: string[] | string;
  whois_created: string;
  risk_score: number;
}

export interface JarvisDomainTyposResult {
  ok: boolean;
  provider?: string;
  domain?: string;
  registered_only?: boolean;
  candidates?: JarvisDomainTypoCandidate[];
  candidate_count?: number;
  error?: string;
  message?: string;
  detail?: string;
}

function assertJarvisFeatureReady(): void {
  if (isDesktopRuntime() && !isFeatureAvailable('aiJarvis')) {
    throw new Error('Jarvis is not configured in Settings (AI & Summarization).');
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const detail = payload && typeof payload === 'object' ? JSON.stringify(payload) : response.statusText;
    throw new Error(`Jarvis OSINT API ${response.status}: ${detail.slice(0, 240)}`);
  }
  return (payload ?? {}) as T;
}

export async function getJarvisOsintStatus(): Promise<JarvisOsintStatus> {
  assertJarvisFeatureReady();
  const response = await fetch(endpointUrl());
  return parseJsonResponse<JarvisOsintStatus>(response);
}

export async function scanUsernameFootprint(
  username: string,
  opts?: { timeoutSeconds?: number; topSites?: number; maxResults?: number; signal?: AbortSignal },
): Promise<JarvisUsernameScanResult> {
  assertJarvisFeatureReady();
  const response = await fetch(endpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'username',
      username,
      timeoutSeconds: opts?.timeoutSeconds ?? 45,
      topSites: opts?.topSites ?? 200,
      maxResults: opts?.maxResults ?? 25,
    }),
    signal: opts?.signal,
  });
  return parseJsonResponse<JarvisUsernameScanResult>(response);
}

export async function scanDomainTypos(
  domain: string,
  opts?: { timeoutSeconds?: number; maxResults?: number; registeredOnly?: boolean },
): Promise<JarvisDomainTyposResult> {
  assertJarvisFeatureReady();
  const response = await fetch(endpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'domain_typos',
      domain,
      timeoutSeconds: opts?.timeoutSeconds ?? 60,
      maxResults: opts?.maxResults ?? 25,
      registeredOnly: opts?.registeredOnly ?? true,
    }),
  });
  return parseJsonResponse<JarvisDomainTyposResult>(response);
}

export interface JarvisSubdomain {
  host: string;
  source: string;
  ip: string;
}

export interface JarvisSubdomainResult {
  ok: boolean;
  provider?: string;
  domain?: string;
  subdomains?: JarvisSubdomain[];
  count?: number;
  error?: string;
  message?: string;
  detail?: string;
}

export interface JarvisWhoisResult {
  ok: boolean;
  provider?: string;
  domain?: string;
  registrar?: string | null;
  created?: string | null;
  expires?: string | null;
  name_servers?: string[];
  status?: string[];
  registrant_org?: string | null;
  raw_truncated?: string;
  error?: string;
  message?: string;
}

export interface JarvisWorldviewIntelligence {
  typos?: JarvisDomainTyposResult;
  subdomains?: JarvisSubdomainResult;
  whois?: JarvisWhoisResult;
  profiles?: JarvisUsernameScanResult;
}

export interface JarvisWorldviewResult {
  ok: boolean;
  target?: string;
  target_type?: 'domain' | 'username';
  intelligence?: JarvisWorldviewIntelligence;
  tools_run?: string[];
  tools_failed?: string[];
  elapsed_seconds?: number;
  error?: string;
  message?: string;
}

export async function enumSubdomains(
  domain: string,
  opts?: { timeoutSeconds?: number; maxResults?: number; passiveOnly?: boolean },
): Promise<JarvisSubdomainResult> {
  assertJarvisFeatureReady();
  const response = await fetch(endpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'subdomain',
      domain,
      timeoutSeconds: opts?.timeoutSeconds ?? 60,
      maxResults: opts?.maxResults ?? 100,
      passiveOnly: opts?.passiveOnly ?? true,
    }),
  });
  return parseJsonResponse<JarvisSubdomainResult>(response);
}

export async function whoisLookup(
  domain: string,
  opts?: { timeoutSeconds?: number },
): Promise<JarvisWhoisResult> {
  assertJarvisFeatureReady();
  const response = await fetch(endpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'whois',
      domain,
      timeoutSeconds: opts?.timeoutSeconds ?? 15,
    }),
  });
  return parseJsonResponse<JarvisWhoisResult>(response);
}

export async function worldviewScan(
  target: string,
  opts?: { timeoutSeconds?: number; maxResultsPerTool?: number; includeTypos?: boolean; signal?: AbortSignal },
): Promise<JarvisWorldviewResult> {
  assertJarvisFeatureReady();
  const response = await fetch(endpointUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'worldview',
      target,
      timeoutSeconds: opts?.timeoutSeconds ?? 90,
      maxResultsPerTool: opts?.maxResultsPerTool ?? 25,
      includeTypos: opts?.includeTypos ?? false,
    }),
    signal: opts?.signal,
  });
  return parseJsonResponse<JarvisWorldviewResult>(response);
}
