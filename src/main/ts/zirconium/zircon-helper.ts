import { ZirconApplication } from './zircon-core/zircon-app';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_WINDOW_TYPE,
} from './zircon-core/zircon-types';
import {
  ZirconParamWindow,
  ZirconParamWindowState,
} from './zircon-params/zircon-param-window';
import { ZirconDesktop } from './zircon-ui/zircon-desktop';
import { ZirconWindow } from './zircon-ui/zircon-window';

export class ZirconHelper {
  /** * Moves a window to a different desktop
   * @param application The Zircon application instance
   * @param windowId The ID of the window to move
   * @param targetDesktopId The ID of the target desktop
   * @returns A promise that resolves when the window has been moved
   */
  public static async moveWindowToDesktop(
    application: ZirconApplication,
    windowId: string,
    targetDesktopId: string,
  ): Promise<void> {
    const window: ZirconWindow = application
      .getObjectManager()
      .getExistingInstance(windowId, ZIRCON_WINDOW_TYPE) as ZirconWindow;
    if (!window) {
      throw new Error(`Moving window: Window with ID ${windowId} not found.`);
      return;
    }
    const sourceDesktop: ZirconDesktop = window.getParentDesktop();
    if (!sourceDesktop) {
      console.error(
        `Moving window: Source desktop with ID ${sourceDesktop} not found.`,
      );
      return;
    }
    const targetDesktop: ZirconDesktop = application
      .getObjectManager()
      .getExistingInstance(
        targetDesktopId,
        ZIRCON_DESKTOP_TYPE,
      ) as ZirconDesktop;
    if (!targetDesktop) {
      console.error(
        `Moving window: Target desktop with ID ${targetDesktopId} not found.`,
      );
      return;
    }
    // add to target
    if (targetDesktopId === sourceDesktop?.getId()) {
      return Promise.resolve();
    }
    const targetDesktopState = targetDesktop.generateCurrentState();
    targetDesktopState.windowIds.push(windowId);
    application.emit('SET_OBJECT_STATE_REQUEST', {
      objectId: targetDesktopId,
      state: targetDesktopState,
    });
    if (sourceDesktop) {
      // remove from source
      const sourceDesktopState = sourceDesktop.generateCurrentState();
      sourceDesktopState.windowIds = sourceDesktopState.windowIds.filter(
        (id) => id !== windowId,
      );
      application.emit('SET_OBJECT_STATE_REQUEST', {
        objectId: sourceDesktop.getId(),
        state: sourceDesktopState,
      });
    }
  }

  public static addParamWindowToDesktop(
    application: ZirconApplication,
    paramWindow: ZirconParamWindow,
    desktopId: string,
  ): void {
    if (!application) {
      throw new Error('Application instance is required.');
    }
    if (!paramWindow || !paramWindow.getId()) {
      throw new Error('Param Window state with a valid ID is required.');
    }
    if (!desktopId) {
      throw new Error('Desktop ID is required.');
    }
    // retrieve desktop instance
    const desktop = application
      .getObjectManager()
      .getExistingInstance(desktopId, ZIRCON_DESKTOP_TYPE) as ZirconDesktop;
    if (!desktop) {
      throw new Error(`Cannot find desktop with id ${desktopId}`);
    }
    const windowState: ZirconParamWindowState =
      paramWindow.generateCurrentState();
    const desktopState = desktop.generateCurrentState();
    // register the window state
    application.emit('SET_OBJECT_STATE_REQUEST', {
      objectId: windowState.id,
      state: windowState,
    });
    // update the desktop state to include the new window ID
    desktopState.windowIds.push(windowState.id);
    application.emit('SET_OBJECT_STATE_REQUEST', {
      objectId: desktop.getId(),
      state: desktopState,
    });
  }
}
