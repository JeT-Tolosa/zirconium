import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-core/zircon-object';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';
import { ZirconDesktopManager } from '../zircon-core/zircon-desktop-manager';
import { ZirconDesktop } from '../zircon-ui/zircon-desktop';

/**
 *
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryDesktopManager extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconDesktopManager(
    element: Element,
  ): ZirconDesktopManager {
    if (!element) return null;
    if (!(element instanceof HTMLElement)) return null;
    const htmlElement: HTMLElement = element;
    if (!htmlElement.checkVisibility({ opacityProperty: true })) return;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (zirconObjectId != this.getApplication().getDesktopManager().getId())
      return null;
    return this.getApplication().getDesktopManager();
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconDesktopManager(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const desktopManager: ZirconDesktopManager =
      this.getAssociatedZirconDesktopManager(element);
    if (!desktopManager) return null;

    return [
      {
        label: `Desktops`,
        children: desktopManager
          .getDisplayedDesktops()
          .map((desktop: ZirconDesktop) => {
            return {
              label: `Activate Desktop ${desktop.getName()}`,
              action: () => {
                console.error('sdkqljfjklsj');
                this.activateDesktop(desktopManager, desktop.getId());
              },
            };
          }),
      },
    ];
  }

  private activateDesktop(desktop: ZirconDesktopManager, desktopId: string) {
    this.getApplication().emit('DESKTOP_ACTIVATE_REQUEST', {
      desktopId: desktopId,
    });
  }

  // /**
  //  * callbacks
  //  * @param args
  //  */
  // private onWINDOW_SET_PARENT_DESKTOP_REQUEST(
  //   windowId: string,
  //   desktopTargetId: string,
  //   _: { x: number; y: number },
  // ): void {
  //   const window: ZirconWindow = this.getWindowById(windowId);
  //   const desktop: ZirconDesktop = this.getDesktopById(desktopTargetId);
  //   // TODO: Throw event
  //   if (!window) {
  //     this.emit('WINDOW_SET_PARENT_DESKTOP_ERROR', {
  //       windowId: windowId,
  //       desktopTargetId: desktopTargetId,
  //       error: `window::plugInto Cannot find window ${windowId}`,
  //     });
  //     return;
  //   }
  //   if (!desktop) {
  //     this.emit('WINDOW_SET_PARENT_DESKTOP_ERROR', {
  //       windowId: windowId,
  //       desktopTargetId: desktopTargetId,
  //       error: `window::plugInto Cannot find desktop ${desktopTargetId}`,
  //     });
  //     return;
  //   }
  //   // TODO: Throw event
  //   desktop.addWindow(window);
  // }
}
