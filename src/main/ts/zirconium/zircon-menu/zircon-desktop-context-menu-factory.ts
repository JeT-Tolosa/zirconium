import { v4 as uuid } from 'uuid';
import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-object';
import { ZirconDesktop, ZirconDesktopState } from '../zircon-ui/zircon-desktop';
import {
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZirconVizWindowState,
} from '../zircon-ui/zircon-viz-window';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';

/**
 *
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryDesktop extends ZirconContextMenuFactory {
  constructor(appUI: ZirconApplication) {
    super(appUI);
  }

  private getAssociatedZirconDesktop(element: Element): ZirconDesktop {
    if (!element) return null;
    if (!(element instanceof HTMLElement)) return null;
    const htmlElement: HTMLElement = element;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) return null;
    const obj: ZirconDesktop =
      this.getApplication().getExistingDesktop(zirconObjectId);
    if (!obj) return;
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconDesktop(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const desktop: ZirconDesktop = this.getAssociatedZirconDesktop(element);
    if (!desktop) return null;
    return [
      {
        label: `Desktop ${desktop.getName()}`,
        children: [
          {
            label: `Create window`,
            action: () => {
              const windowState: ZirconVizWindowState = {
                id: `user-window-${uuid()}`,
                type: ZIRCON_VISUALIZER_WINDOW_TYPE,
                name: `user window`,
                width: 300,
                height: 300,
                left: element.getBoundingClientRect().x,
                top: element.getBoundingClientRect().y,
                vizId: null,
              };
              this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
                objectId: windowState.id,
                state: windowState,
              });

              const desktopState: ZirconDesktopState =
                desktop.generateCurrentState();
              if (desktopState.windowIds)
                desktopState.windowIds.push(windowState.id);
              else desktopState.windowIds = [windowState.id];
              this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
                objectId: desktop.getId(),
                state: desktopState,
              });
            },
          },
        ],
      },
    ];
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
