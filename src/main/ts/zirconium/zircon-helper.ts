import { ZirconApplication } from './zircon-core/zircon-app';
import { ZirconObjectManagerEventRegistry } from './zircon-core/zircon-object-manager';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_WINDOW_TYPE,
} from './zircon-core/zircon-types';
import { ZirconParamWindowState } from './zircon-params/zircon-param-window';

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
    application.emit('ZIRCON_OBJECT_SET_STATE_REQUEST', {
      id: targetDesktopId,
      state: targetDesktopState,
    });
    if (sourceDesktop) {
      // remove from source
      const sourceDesktopState = sourceDesktop.generateCurrentState();
      sourceDesktopState.windowIds = sourceDesktopState.windowIds.filter(
        (id) => id !== windowId,
      );
      application.emit('ZIRCON_OBJECT_SET_STATE_REQUEST', {
        id: sourceDesktop.getId(),
        state: sourceDesktopState,
      });
    }
  }

  private static async sleep(ms: number) {
    new Promise((r) => setTimeout(r, ms));
  }

  public static async addParamWindowToDesktop(
    application: ZirconApplication,
    sourceWindow: ZirconWindow,
    paramWindowState: ZirconParamWindowState,
    desktopId: string,
  ) {
    if (!application) {
      throw new Error('Application instance is required.');
    }
    if (!paramWindowState) {
      throw new Error('Param Window state is required.');
    }
    if (!paramWindowState.id) {
      throw new Error('Param Window state ID is required.');
    }
    if (!desktopId) {
      throw new Error('Desktop ID is required.');
    }
    // OLD Way: Using emit to request state snapshot, wait and add window to desktop

    // setTimeout(
    //   () =>
    //     application.emit('REGISTER_STATE_SNAPSHOT_REQUEST', {
    //       state: paramWindowState,
    //     }),
    //   2000,
    // );

    // // application.emit('REGISTER_STATE_SNAPSHOT_REQUEST', {
    // //   state: paramWindowState,
    // // });

    // application.emit('DESKTOP_ADD_WINDOW_REQUEST', {
    //   desktopId: desktopId,
    //   windowId: paramWindowState.id,
    // });

    // NEW Way: Create an emit transaction to request state snapshot and add window to desktop when first is fulfilled
    const storeSnapshotTransaction = application
      .getEventDispatcher()
      .createEmitTransaction('REGISTER_STATE_SNAPSHOT_REQUEST', {
        state: paramWindowState,
      });
    storeSnapshotTransaction.onResponse<
      ZirconObjectManagerEventRegistry,
      'STATE_SNAPSHOT_REGISTERED'
    >('STATE_SNAPSHOT_REGISTERED', () => {
      application.emit('DESKTOP_ADD_WINDOW_REQUEST', {
        desktopId: desktopId,
        windowId: paramWindowState.id,
      });
    });
    storeSnapshotTransaction.execute();
  }
}
