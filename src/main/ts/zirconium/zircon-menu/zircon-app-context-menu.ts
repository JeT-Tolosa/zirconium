import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconEngineState } from '../zircon-core/zircon-engine';
import { ZIRCON_ENGINE_TYPE } from '../zircon-core/zircon-types';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';

/**
 * Context Menu for Application
 * Creating a new application is not allowed (create method is null) but
 * it is used to generate the context menu
 */
export class ZirconContextMenuFactoryApplication extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconApplication(element: Element): ZirconApplication {
    if (!element) {
      return null;
    }
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const htmlElement: HTMLElement = element;
    if (htmlElement.id !== this.getApplication().getUI().id) {
      return null;
    }
    return this.getApplication();
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconApplication(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const app: ZirconApplication = this.getAssociatedZirconApplication(element);
    if (!app) {
      return null;
    }
    return [
      {
        label: `Application`,
        children: [
          {
            label: 'Engines',
            children: this.getEnginesMenuElements(app),
          },
        ],
      },
    ];
  }

  private getEnginesMenuElements(
    app: ZirconApplication,
  ): ZirconContextMenuItem[] {
    return app
      .getObjectManager()
      .getRegisteredObjectsStates(ZIRCON_ENGINE_TYPE)
      .map((engineState) => {
        return this.getEngineMenuElement(app, engineState);
      });
  }

  private getEngineMenuElement(
    app: ZirconApplication,
    engineState: ZirconEngineState,
  ): ZirconContextMenuItem {
    if (!engineState) {
      return null;
    }
    const instance = app
      .getObjectManager()
      .getExistingInstance(engineState.id, ZIRCON_ENGINE_TYPE);
    return {
      label: `${engineState.name || engineState.id}`,
      classes: instance !== null ? ['highlighted'] : ['lowlighted'],

      children: [
        {
          label: `start`,
          unavailable: instance !== null,
          action: () => {
            app.emit('ENGINE_START_REQUEST', {
              engineId: engineState.id,
            });
          },
        },
        {
          label: `stop`,
          unavailable: instance === null,
          action: () => {
            app.emit('ENGINE_STOP_REQUEST', {
              engineId: engineState.id,
            });
          },
        },
      ],
    };
  }
}
