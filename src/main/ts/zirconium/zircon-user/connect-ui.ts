import { v4 as uuid } from 'uuid';
import { AuthService, LoginResult } from './connect-keycloak';
// import { jsPanel } from 'jspanel4';
import { jsPanel } from 'jspanel4/es6module/jspanel.js';
import 'jspanel4/es6module/extensions/modal/jspanel.modal.js';

export class UserConnectUI {
  private __auth: AuthService = null;
  private __usernameInput: HTMLInputElement = null;
  private __passwordInput: HTMLInputElement = null;
  private __usernameItem: HTMLInputElement = null;
  private __usernameLabel: HTMLLabelElement = null;
  private __passwordItem: HTMLInputElement = null;
  private __passwordLabel: HTMLLabelElement = null;
  private __loginButton: HTMLButtonElement = null;
  // private __header: HTMLHeaderElement = null;
  // private __toolbar: HTMLToolbarElement = null;
  private __title: HTMLTitleElement = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private __modalPanel: any = null;
  private __infoBox: HTMLDivElement = null;
  private __container: HTMLDivElement = null;

  constructor(auth: AuthService) {
    this.__auth = auth;
  }

  private getAuthService(): AuthService {
    return this.__auth;
  }

  private getContainer(): HTMLDivElement {
    if (this.__container) return this.__container;
    /*
     * ROOT CONTAINER
     */

    this.__container = document.createElement('div');
    this.__container.style.flexDirection = 'column';
    this.__container.style.display = 'flex';
    this.__container.style.gap = '12px';
    this.__container.style.padding = '8px';

    /*
     * INFO BOX
     */

    this.__infoBox = document.createElement('div');
    this.__infoBox.textContent =
      'Veuillez saisir votre identifiant et votre mot de passe.';
    this.__infoBox.style.padding = '10px';
    this.__infoBox.style.borderRadius = '6px';
    this.__infoBox.style.background = '#f1f1f1';
    this.__infoBox.style.fontSize = '14px';

    /*
     * USERNAME
     */

    this.__usernameInput = document.createElement('input');
    this.__usernameInput.type = 'text';
    this.__usernameInput.placeholder = 'Identifiant';
    this.__usernameInput.style.padding = '10px';

    /*
     * PASSWORD
     */

    this.__passwordInput = document.createElement('input');
    this.__passwordInput.type = 'password';
    this.__passwordInput.placeholder = 'Mot de passe';
    this.__passwordInput.style.padding = '10px';

    /*
     * LOGIN BUTTON
     */

    this.__loginButton = document.createElement('button');
    this.__loginButton.textContent = 'Login';
    this.__loginButton.style.padding = '10px';
    this.__loginButton.style.cursor = 'pointer';

    /*
     * APPEND
     */

    this.__container.appendChild(this.__infoBox);
    this.__container.appendChild(this.__usernameInput);
    this.__container.appendChild(this.__passwordInput);
    this.__container.appendChild(this.__loginButton);

    /*
     * EVENTS
     */

    this.__loginButton.addEventListener('click', async () => {
      const username = this.__usernameInput.value.trim();
      const password = this.__passwordInput.value.trim();

      /*
       * VALIDATION
       */

      if (!username || !password) {
        this.__infoBox.textContent =
          'Erreur : veuillez remplir tous les champs.';
        this.__infoBox.style.background = '#ffe5e5';
        this.__infoBox.style.color = '#b00020';

        return;
      }

      /*
       * LOADING
       */

      this.__infoBox.textContent = 'Connexion en cours...';
      this.__infoBox.style.background = '#e8f0fe';
      this.__infoBox.style.color = '#1a73e8';
      this.__loginButton.disabled = true;

      try {
        /*
         * KEYCLOAK LOGIN HERE
         */

        // Exemple :
        // await keycloak.login(...)

        const loginResult: LoginResult = await this.getAuthService().login();
        this.__infoBox.textContent = `Connexion réussie ${loginResult.accessToken}`;
        this.__infoBox.style.background = '#e6f4ea';
        this.__infoBox.style.color = '#137333';

        setTimeout(() => {
          this.__modalPanel.close();
          console.log('CONNECTED:', username);
        }, 800);
      } catch (error) {
        /*
         * ERROR
         */
        this.__infoBox.textContent = `Error: ${error.toString()}`;
        this.__infoBox.style.background = '#ffe5e5';
        this.__infoBox.style.color = '#b00020';
        this.__loginButton.disabled = false;
      }
    });
    return this.__container;
  }

  public async openModal(): Promise<void> {
    /*
     * MODAL
     */
    this.__modalPanel = jsPanel.modal.create({
      id: 'sdfmlksdmlfk',
      headerTitle: 'Connexion',
      contentSize: '400 260',
      content: this.getContainer(),
      theme: 'primary',
      resizeit: false,
    });
  }

  // public renderIn(parent: HTMLElement): void {
  //   if (!parent) return;
  //   const mainDiv: HTMLDivElement = document.createElement('div');
  //   const user = this.getAuthService().getUser();

  //   mainDiv.innerHTML = `
  //       <div>
  //       <h2>Keycloak PKCE Demo</h2>

  //       ${
  //         user
  //           ? `<p>👤 ${user.username}</p>
  //           <p>Roles: ${user.roles.join(', ')}</p>
  //           <button id="logout">Logout</button>`
  //           : `<button id="login">Login</button>`
  //       }
  //           </div>
  //           `;

  //   const loginBtn = document.getElementById('login');
  //   const logoutBtn = document.getElementById('logout');

  //   loginBtn?.addEventListener('click', () => this.getAuthService().login());
  //   logoutBtn?.addEventListener('click', () => this.getAuthService().logout());
  //   parent.appendChild(mainDiv);
  // }
}
