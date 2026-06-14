import { v4 as uuid } from 'uuid';
import { AuthService, LoginResult } from './connect';
import { jsPanel } from 'jspanel4/es6module/jspanel.js';
import 'jspanel4/es6module/extensions/modal/jspanel.modal.js';
import './connect-ui.css';

export class UserConnectUIPassword {
  private __id: string = null;
  private __auth: AuthService = null;
  private __usernameInput: HTMLInputElement = null;
  private __passwordInput: HTMLInputElement = null;
  private __usernameLabel: HTMLLabelElement = null;
  private __passwordLabel: HTMLLabelElement = null;
  private __loginButton: HTMLButtonElement = null;
  private __title: HTMLTitleElement = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private __modalPanel: any = null;
  private __infoBox: HTMLDivElement = null;
  private __container: HTMLDivElement = null;

  constructor(auth: AuthService) {
    this.__id = uuid();
    this.__auth = auth;
  }

  private getId(): string {
    return this.__id;
  }

  private getAuthService(): AuthService {
    return this.__auth;
  }

  private getContainer(): HTMLDivElement {
    if (this.__container) {
      return this.__container;
    }

    this.__container = document.createElement('div');
    this.__container.id = this.getId();
    this.__container.classList.add('user-connect-ui');

    this.__infoBox = document.createElement('div');
    this.__infoBox.classList.add('infobox');
    this.__infoBox.textContent =
      'Veuillez saisir votre identifiant et votre mot de passe.';

    this.__usernameInput = document.createElement('input');
    this.__usernameInput.id = `${this.getId()}-user`;
    this.__usernameInput.type = 'text';

    this.__usernameLabel = document.createElement('label');
    this.__usernameLabel.innerText = 'username';
    this.__usernameLabel.setAttribute('for', String(this.__usernameInput.id));

    this.__passwordInput = document.createElement('input');
    this.__passwordInput.id = `${this.getId()}-pwd`;
    this.__passwordInput.type = 'password';
    this.__passwordInput.placeholder = 'Mot de passe';

    this.__passwordLabel = document.createElement('label');
    this.__passwordLabel.innerText = 'password';
    this.__passwordLabel.setAttribute('for', String(this.__passwordInput.id));

    this.__loginButton = document.createElement('button');
    this.__loginButton.textContent = 'Login';

    this.__container.appendChild(this.__infoBox);
    this.__container.appendChild(this.__usernameLabel);
    this.__container.appendChild(this.__usernameInput);
    this.__container.appendChild(this.__passwordLabel);
    this.__container.appendChild(this.__passwordInput);
    this.__container.appendChild(this.__loginButton);

    /*
     * EVENTS
     */

    this.__loginButton.addEventListener('click', async () => {
      const username = this.__usernameInput.value.trim();
      const password = this.__passwordInput.value.trim();

      if (!username || !password) {
        this.__infoBox.textContent =
          'Erreur : veuillez remplir tous les champs.';
        this.__infoBox.style.background = '#ffe5e5';
        this.__infoBox.style.color = '#b00020';

        return;
      }

      this.__infoBox.textContent = 'Connexion en cours...';
      this.__infoBox.style.background = '#e8f0fe';
      this.__infoBox.style.color = '#1a73e8';
      this.__loginButton.disabled = true;

      try {
        const loginResult: LoginResult = await this.getAuthService().login();
        this.__infoBox.textContent = `Connexion réussie ${loginResult.accessToken}`;
        this.__infoBox.style.background = '#e6f4ea';
        this.__infoBox.style.color = '#137333';

        setTimeout(() => {
          this.__modalPanel.close();
          console.log('CONNECTED:', username);
        }, 800);
      } catch (error) {
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
