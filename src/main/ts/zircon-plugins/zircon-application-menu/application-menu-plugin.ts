import './application-menu-plugin.css';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { ZirconAppPlugin } from '../../zirconium/zircon-plugin/zircon-plugin';
import '@ui5/webcomponents/dist/Button.js';
import '@ui5/webcomponents/dist/Menu.js';
import '@ui5/webcomponents/dist/MenuItem.js';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import type Button from '@ui5/webcomponents/dist/Button.js';
import type Menu from '@ui5/webcomponents/dist/Menu.js';
import type MenuItem from '@ui5/webcomponents/dist/MenuItem.js';

declare global {
  interface HTMLElementTagNameMap {
    'ui5-button': Button;
    'ui5-menu': Menu;
    'ui5-menu-item': MenuItem;
  }
}

const OPEN_WORKSPACE_ACTION = 'open-workspace';
const SAVE_WORKSPACE_ACTION = 'save-workspace';
const QUIT_APPLICATION_ACTION = 'quit-application';

export class ApplicationMenuPlugin extends ZirconAppPlugin {
  constructor(app: ZirconApplication) {
    super('application-menu', app);
  }

  public override async plugInApplication(
    app: ZirconApplication,
  ): Promise<void> {
    const desktopManager = app.getDesktopManager();
    desktopManager.addHeaderLeftElement(this.createMenuButton(app));
  }

  private createMenuButton(app: ZirconApplication): Button {
    const button: Button = document.createElement('ui5-button');
    button.icon = 'menu';
    button.design = 'Transparent';
    button.tooltip = 'Application menu';
    button.addEventListener('click', () => {
      this.openMenu(button, app);
    });
    return button;
  }

  private openMenu(source: Button, _app: ZirconApplication): void {
    const menu: Menu = document.createElement('ui5-menu');
    menu.placement = 'Bottom';
    menu.horizontalAlign = 'Start';
    const fileItem: MenuItem = document.createElement('ui5-menu-item');
    fileItem.text = 'File';
    const loadWorkspaceItem: MenuItem = document.createElement('ui5-menu-item');
    loadWorkspaceItem.text = 'Open Workspace';
    loadWorkspaceItem.setAttribute('action', OPEN_WORKSPACE_ACTION);
    const saveWorkspaceItem: MenuItem = document.createElement('ui5-menu-item');
    saveWorkspaceItem.text = 'Save Workspace';
    saveWorkspaceItem.setAttribute('action', SAVE_WORKSPACE_ACTION);
    fileItem.appendChild(loadWorkspaceItem);
    fileItem.appendChild(saveWorkspaceItem);
    const quitItem: MenuItem = document.createElement('ui5-menu-item');
    quitItem.text = 'Quit';
    quitItem.setAttribute('action', QUIT_APPLICATION_ACTION);

    menu.appendChild(fileItem);
    menu.appendChild(quitItem);
    document.body.appendChild(menu);
    menu.opener = source;
    menu.open = true;
    menu.addEventListener('item-click', (event) => {
      const item = (event as CustomEvent<{ item: MenuItem }>).detail
        .item as MenuItem;
      const action = item.getAttribute('action');
      switch (action) {
        case OPEN_WORKSPACE_ACTION:
          this.loadWorkspace();
          break;
        case SAVE_WORKSPACE_ACTION:
          this.saveWorkspace();
          break;
        case QUIT_APPLICATION_ACTION:
          this.quitApplication();
          break;
      }
      console.log('Menu clicked:', item.text, ' action:', action);
    });

    menu.addEventListener(
      'close',
      () => {
        menu.remove();
      },
      { once: true },
    );
  }

  private async loadWorkspace(): Promise<void> {
    try {
      // Appel asynchrone du Main Process via le Preload
      const filePath: string | null = await window.electronAPI.selectFile();

      if (filePath) {
        this.emit('APPLICATION_LOAD_WORKSPACE_SETTINGS', {
          filePath: filePath,
        });
        console.log(`Fichier sélectionné : ${filePath}`);
      } else {
        console.log('Sélection annulée.');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
    }
  }

  private async saveWorkspace(): Promise<void> {
    try {
      // Appel asynchrone du Main Process via le Preload
      const filePath: string = await window.electronAPI.selectFile();

      if (filePath) {
        this.emit('APPLICATION_SAVE_WORKSPACE_SETTINGS', {
          filePath: filePath,
        });
        console.log(`Fichier sélectionné : ${filePath}`);
      } else {
        console.log('Sélection annulée.');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
    }
  }

  private quitApplication(): void {
    console.log('close application');
  }
}
