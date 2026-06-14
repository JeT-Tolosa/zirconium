import { v4 as uuid } from 'uuid';
import { AuthService, LoginResult } from './connect';
import './connect-ui.css';

export class UserConnectUIOAuth implements UserConnectUIOAuth {
  private __id: string = null;
  private __auth: AuthService = null;
  private __loginButton: HTMLButtonElement = null;
  private __infoBox: HTMLDivElement = null;
  private __container: HTMLDivElement = null;

  constructor(auth: AuthService) {
    this.__id = uuid();
    this.__auth = auth;
  }

  public getId(): string {
    return this.__id;
  }

  public getAuthService(): AuthService {
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

    this.__container.appendChild(this.__infoBox);
    this.__container.appendChild(this.__loginButton);

    /*
     * EVENTS
     */

    this.__loginButton.addEventListener('click', async () => {
      this.__infoBox.textContent = 'Connexion en cours...';
      this.__infoBox.style.background = '#e8f0fe';
      this.__infoBox.style.color = '#1a73e8';
      this.__loginButton.disabled = true;

      try {
        const loginResult: LoginResult = await this.getAuthService().login();
        this.__infoBox.textContent = `Connexion réussie ${loginResult.accessToken}`;
        this.__infoBox.style.background = '#e6f4ea';
        this.__infoBox.style.color = '#137333';
      } catch (error) {
        this.__infoBox.textContent = `Error: ${error.toString()}`;
        this.__infoBox.style.background = '#ffe5e5';
        this.__infoBox.style.color = '#b00020';
        this.__loginButton.disabled = false;
      }
    });
    return this.__container;
  }

  private async openModal(): Promise<void> {
    try {
      await this.__auth?.login();
    } catch (error) {
      this.__infoBox.textContent = `Error: ${error.toString()}`;
      this.__infoBox.style.background = '#ffe5e5';
      this.__infoBox.style.color = '#b00020';
      this.__loginButton.disabled = false;
    }
  }

  public async start(): Promise<void> {
    return this.openModal();
  }
}
