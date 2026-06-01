import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { ZirconPlugin } from '../../zirconium/zircon-plugin/zircon-plugin';
import { showToast } from '../../zirconium/zircon-ui/toaster';
import { AuthError, AuthService } from '../../zirconium/zircon-user/connect';
import { KeycloakAuthService } from '../../zirconium/zircon-user/connect-keycloak';
import { UserConnectUIOAuth } from '../../zirconium/zircon-user/connect-ui-oauth';

export class UserConnectUIZirconPlugin extends ZirconPlugin {
  private static LOGOUT_ICON = `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>  </path> <polyline points="14 17 19 12 14 7"> </polyline> <line x1="19" y1="12" x2="7" y2="12"></line>`;
  private static LOGIN_ICON = `<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/> </path> <polyline points="10 17 15 12 10 7"> </polyline> <line x1="15" y1="12" x2="3" y2="12"></line>`;

  private __auth: AuthService = null;
  private __connectUI: UserConnectUIOAuth = null;

  constructor(name: string = 'user-connect-ui-zircon-plugin') {
    super(name);
    this.__auth = new KeycloakAuthService({
      url: 'http://localhost:8080',
      realm: 'fake_users',
      clientId: 'frontend-app',
      redirectUri: `${window.location.origin}`,
    });
  }

  public setAuthMethod(auth: AuthService): void {
    this.__auth = auth;
    this.__connectUI = null;
  }

  private getConnectUI(): UserConnectUIOAuth {
    if (this.__connectUI) return this.__connectUI;
    this.__connectUI = new UserConnectUIOAuth(this.__auth);
    return this.__connectUI;
  }

  private getLoginIcon(): Element {
    const loginIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    loginIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    loginIcon.setAttribute('width', '24');
    loginIcon.setAttribute('height', '24');
    loginIcon.setAttribute('stroke-width', '2');
    loginIcon.setAttribute('viewBox', '0 0 24 24');
    loginIcon.setAttribute('fill', 'none');
    loginIcon.setAttribute('stroke', 'currentColor');
    loginIcon.setAttribute('stroke-linecap', 'round');
    loginIcon.setAttribute('stroke-linejoin', 'round');
    loginIcon.innerHTML = UserConnectUIZirconPlugin.LOGIN_ICON;
    loginIcon.addEventListener('click', async () => {
      try {
        this.getConnectUI().start();
      } catch (error: unknown) {
        if (error instanceof AuthError)
          switch (error.code) {
            case 'NETWORK_ERROR':
              showToast('Serveur inaccessible');
              break;

            case 'NETWORK_TIMEOUT':
              showToast('Le serveur ne répond pas');
              break;

            case 'POPUP_CLOSED':
              showToast('Connexion annulée');
              break;
          }
      }
    });
    return loginIcon;
  }

  private getLogoutIcon(): Element {
    const logoutIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    logoutIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    logoutIcon.setAttribute('width', '24');
    logoutIcon.setAttribute('height', '24');
    logoutIcon.setAttribute('viewBox', '0 0 24 24');
    logoutIcon.setAttribute('fill', 'none');
    logoutIcon.setAttribute('stroke', 'currentColor');
    logoutIcon.setAttribute('stroke-width', '2');
    logoutIcon.setAttribute('stroke-linecap', 'round');
    logoutIcon.setAttribute('stroke-linejoin', 'round');
    logoutIcon.innerHTML = UserConnectUIZirconPlugin.LOGOUT_ICON;
    return logoutIcon;
  }

  public async plugInApplication(app: ZirconApplication): Promise<void> {
    app.getDesktopManager().addToolbarElement({
      content: this.getLoginIcon(),
    });
  }
}

//http://localhost:8080/realms/fake_users/protocol/openid-connect/auth?client_id=frontend-app&response_type=code&scope=openid+profile+email&code_challenge=BZC_k4hb4tWlcNM0DO9H_c3IYFkGANUqV1_y315EtHM&code_challenge_method=S256&state=eee63023-a7e4-4a13-9047-97213ce917af
