import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const DEFAULT_BASE_URL = 'http://localhost:41184';

export type TokenSource = 'flag' | 'env' | 'joplin-desktop' | 'none';
export type BaseUrlSource = 'flag' | 'env' | 'default';

export interface ResolvedConfig {
  token: string | null;
  tokenSource: TokenSource;
  baseUrl: string;
  baseUrlSource: BaseUrlSource;
}

// Location of the Joplin desktop settings file (macOS and Linux).
export function desktopSettingsPath(): string {
  return path.join(os.homedir(), '.config', 'joplin-desktop', 'settings.json');
}

// Read the Web Clipper API token straight from the Joplin desktop settings,
// so users with Joplin installed don't need to pass a token. Returns null if
// the file is missing, unreadable, or has no token.
export function readDesktopToken(): string | null {
  try {
    const raw = fs.readFileSync(desktopSettingsPath(), 'utf-8');
    const settings = JSON.parse(raw) as Record<string, unknown>;
    const token = settings['api.token'];
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

// Mask a token for display: keep the first and last 4 characters.
export function maskToken(token: string): string {
  if (token.length <= 8) return '*'.repeat(token.length);
  return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
}

// Resolve the effective token and base URL, tracking where each came from.
// Token precedence: --joplin-api-token > JOPLIN_API_TOKEN > joplin-desktop settings.
export function resolveConfig(argv: { 'joplin-api-token'?: string; 'joplin-base-url'?: string }): ResolvedConfig {
  let token: string | null = null;
  let tokenSource: TokenSource = 'none';
  if (argv['joplin-api-token']) {
    token = argv['joplin-api-token'];
    tokenSource = 'flag';
  } else if (process.env.JOPLIN_API_TOKEN) {
    token = process.env.JOPLIN_API_TOKEN;
    tokenSource = 'env';
  } else {
    const desktopToken = readDesktopToken();
    if (desktopToken) {
      token = desktopToken;
      tokenSource = 'joplin-desktop';
    }
  }

  let baseUrl = DEFAULT_BASE_URL;
  let baseUrlSource: BaseUrlSource = 'default';
  if (argv['joplin-base-url']) {
    baseUrl = argv['joplin-base-url'];
    baseUrlSource = 'flag';
  } else if (process.env.JOPLIN_BASE_URL) {
    baseUrl = process.env.JOPLIN_BASE_URL;
    baseUrlSource = 'env';
  }

  return { token, tokenSource, baseUrl, baseUrlSource };
}
