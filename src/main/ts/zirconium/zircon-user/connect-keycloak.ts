export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  redirectUri: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}

interface OAuthMessage {
  type: 'oauth_callback';
  code?: string;
  state?: string;
  error?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

export interface AuthService {
  login(): Promise<LoginResult>;
  logout(): Promise<void>;
}

export class KeycloakAuthService implements AuthService {
  private readonly config: KeycloakConfig;

  public constructor(config: KeycloakConfig) {
    this.config = config;
  }

  public async logout(): Promise<void> {
    throw new Error('Not yet implemented');
  }

  public async login(): Promise<LoginResult> {
    const verifier = this.generateCodeVerifier();
    const challenge = await this.generateCodeChallenge(verifier);
    const state = crypto.randomUUID();
    sessionStorage.setItem('pkce_verifier', verifier);
    sessionStorage.setItem('oauth_state', state);
    const authUrl = this.buildAuthorizationUrl(challenge, state);
    const popup = window.open(
      authUrl,
      'oauth2-login',
      [
        'popup=yes',
        'width=500',
        'height=700',
        'menubar=no',
        'toolbar=no',
        'location=no',
        'status=no',
      ].join(','),
    );

    if (!popup) {
      throw new Error('Popup bloquée par le navigateur');
    }

    return new Promise<LoginResult>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Authentication timeout'));
      }, 120000);

      const cleanup = (): void => {
        window.clearTimeout(timeout);
        window.removeEventListener('message', listener);
        popup.close();
      };

      const listener = async (event: MessageEvent): Promise<void> => {
        if (event.origin !== window.location.origin) {
          return;
        }
        const data = event.data as OAuthMessage;
        if (data.type !== 'oauth_callback') {
          return;
        }
        cleanup();
        try {
          if (data.error) {
            throw new Error(data.error);
          }

          const expectedState = sessionStorage.getItem('oauth_state');
          if (expectedState !== data.state) {
            throw new Error('Invalid state');
          }

          if (!data.code) {
            throw new Error('Missing authorization code');
          }

          const tokens = await this.exchangeCode(data.code, verifier);
          resolve(tokens);
        } catch (error: unknown) {
          reject(error instanceof Error ? error : new Error('Unknown error'));
        }
      };

      window.addEventListener('message', listener);
    });
  }

  private buildAuthorizationUrl(challenge: string, state: string): string {
    const url = new URL(
      `${this.config.url}` +
        `/realms/${this.config.realm}` +
        `/protocol/openid-connect/auth`,
    );
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid profile email');
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);
    return url.toString();
  }

  private async exchangeCode(
    code: string,
    verifier: string,
  ): Promise<LoginResult> {
    const tokenUrl =
      `${this.config.url}` +
      `/realms/${this.config.realm}` +
      `/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: this.config.redirectUri,
      code_verifier: verifier,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const json = (await response.json()) as TokenResponse;

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      idToken: json.id_token,
      expiresIn: json.expires_in,
    };
  }

  private generateCodeVerifier(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return this.base64UrlEncode(bytes);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
