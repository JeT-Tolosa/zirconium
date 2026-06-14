import { ZirconApplication } from './zircon-core/zircon-app';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_WINDOW_TYPE,
} from './zircon-core/zircon-types';
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
      console.error(`Moving window: Window with ID ${windowId} not found.`);
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
}
