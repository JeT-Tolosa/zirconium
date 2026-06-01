/**
 * PKCE utilities (OAuth2 / Keycloak)
 * TypeScript strict version
 */

const CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Generate a random high-entropy code_verifier
 * Length: 43–128 chars (recommended: 64–96)
 */
export function generateCodeVerifier(length = 96): string {
  if (length < 43 || length > 128) {
    throw new Error('code_verifier length must be between 43 and 128');
  }

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (x) => CHARSET[x % CHARSET.length]).join('');
}

/**
 * Base64URL encode (RFC 7636 compliant)
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate code_challenge from verifier using SHA-256
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);

  const digest = await crypto.subtle.digest('SHA-256', data);

  return base64UrlEncode(digest);
}

/**
 * Optional helper: full PKCE pair
 */
export async function createPkcePair(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  return { verifier, challenge };
}
