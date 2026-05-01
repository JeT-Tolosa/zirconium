import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-object';
import { ZirconWindow } from '../zircon-ui/zircon-window';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';

/**
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryWindow extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconWindow(element: Element): ZirconWindow {
    if (!element) return null;
    if (!(element instanceof HTMLElement)) return null;
    const htmlElement: HTMLElement = element;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) return null;
    const obj: ZirconWindow =
      this.getApplication().getExistingWindow(zirconObjectId);
    if (!obj) return;
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconWindow(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const window: ZirconWindow = this.getAssociatedZirconWindow(element);
    if (!window) return null;
    return [
      {
        label: 'window',
        children: [
          {
            label: 'normalize',
            action: () => {
              window.emit('WINDOW_NORMALIZE_REQUEST', {
                windowId: window.getId(),
              });
            },
          },
          {
            label: 'minimize',
            action: () => {
              window.emit('WINDOW_MINIMIZE_REQUEST', {
                windowId: window.getId(),
              });
            },
          },
          {
            label: 'maximize',
            action: () => {
              window.emit('WINDOW_MAXIMIZE_REQUEST', {
                windowId: window.getId(),
              });
            },
          },
          {
            label: 'close',
            action: () => {
              window.emit('WINDOW_CLOSE_REQUEST', { windowId: window.getId() });
            },
          },
        ],
      },
    ];
  }
}
