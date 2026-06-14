import { v4 as uuid } from 'uuid';
import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-core/zircon-object';
import { ZirconDesktop, ZirconDesktopState } from '../zircon-ui/zircon-desktop';
import { ZirconVizWindowState } from '../zircon-ui/zircon-viz-window';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../zircon-core/zircon-types';

/**
 *
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryDesktop extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconDesktop(element: Element): ZirconDesktop {
    if (!element) {
      return null;
    }
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    const htmlElement: HTMLElement = element;
    if (!htmlElement.checkVisibility({ opacityProperty: true })) {
      return;
    }
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) {
      return null;
    }
    const obj: ZirconObject = this.getApplication()
      .getObjectManager()
      .getExistingInstance(zirconObjectId);
    if (!obj) {
      return null;
    }
    if (
      !this.getApplication()
        .getObjectManager()
        .isTypeOf(obj.getType(), ZIRCON_DESKTOP_TYPE)
    ) {
      return null;
    }
    if (!(obj instanceof ZirconDesktop)) {
      return null;
    }
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconDesktop(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const desktop: ZirconDesktop = this.getAssociatedZirconDesktop(element);
    if (!desktop) {
      return null;
    }
    return [
      {
        label: `Desktop ${desktop.getName()}`,
        children: [
          {
            label: `Create window`,
            action: () => {
              this.createWindow(
                desktop,
                element.getBoundingClientRect().x,
                element.getBoundingClientRect().y,
              );
            },
          },
        ],
      },
    ];
  }

  private createWindow(desktop: ZirconDesktop, x: number, y: number) {
    const windowState: ZirconVizWindowState = {
      id: `user-window-${uuid()}`,
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      name: `user window`,
      title: `user window`,
      width: 300,
      height: 300,
      left: x,
      top: y,
      vizId: null,
    };
    this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
      objectId: windowState.id,
      state: windowState,
    });

    const desktopState: ZirconDesktopState = desktop.generateCurrentState();
    if (desktopState.windowIds) {
      desktopState.windowIds.push(windowState.id);
    } else {
      desktopState.windowIds = [windowState.id];
    }
    this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
      objectId: desktop.getId(),
      state: desktopState,
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
