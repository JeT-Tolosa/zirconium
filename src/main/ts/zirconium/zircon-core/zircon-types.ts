import { ZirconObject, ZirconObjectState } from '../zircon-object';
import { ZirconDesktop, ZirconDesktopState } from '../zircon-ui/zircon-desktop';
import { ZirconWindow, ZirconWindowState } from '../zircon-ui/zircon-window';
import {
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';

export const ZIRCON_OBJECT_TYPE: string = 'zircon-object';
export const ZIRCON_APP_OBJECT_TYPE: string = 'zircon-app-object';
export const ZIRCON_DESKTOP_TYPE: string = 'zircon-desktop';
export const ZIRCON_DESKTOP_MANAGER_TYPE: string = 'zircon-desktop-manager';
export const ZIRCON_WINDOW_TYPE: string = 'zircon-window';
export const ZIRCON_VISUALIZER_WINDOW_TYPE: string = 'zircon-viz-window';
export const ZIRCON_PARAMETER_WINDOW_TYPE: string = 'zircon-param-window';
export const ZIRCON_ENGINE_TYPE: string = 'zircon-engine';

export const DESKTOPS_MANAGER_CLASS = 'desktop-manager';
export const DESKTOPS_CONTAINER_CLASS = `desktops-container`;
export const DESKTOPS_SELECTOR_CLASS = `desktops-selector`;
export const DESKTOP_CONTAINER_CLASS = `desktop-container`;
export const DESKTOP_SELECTOR_CLASS = `desktop-selector`;
export const ACTIVE_DESKTOP_CLASS = 'active';

export const ZirconObjectHierarchy = {};

export class ZirconTypes {
  private constructor() {
    // helper class
  }

  public static asDesktopState(state: ZirconObjectState): ZirconDesktopState {
    if (!state) return null;
    if (state.type !== ZIRCON_DESKTOP_TYPE) return null;
    return state as ZirconDesktopState;
  }

  public static asWindowState(state: ZirconObjectState): ZirconWindowState {
    if (!state) return null;
    if (
      state.type !== ZIRCON_VISUALIZER_WINDOW_TYPE &&
      state.type !== ZIRCON_PARAMETER_WINDOW_TYPE
    )
      return null;
    return state as ZirconWindowState;
  }

  public static asDesktopManagerState(
    state: ZirconObjectState,
  ): ZirconDesktopManagerState {
    if (!state) return null;
    if (state.type !== ZIRCON_DESKTOP_MANAGER_TYPE) return null;
    return state as ZirconDesktopManagerState;
  }

  public static asDesktop(obj: ZirconObject): ZirconDesktop {
    if (!obj) return null;
    if (!(obj instanceof ZirconDesktop)) return null;
    return obj as ZirconDesktop;
  }

  public static asDesktopManager(obj: ZirconObject): ZirconDesktopManager {
    if (!obj) return null;
    if (!(obj instanceof ZirconDesktopManager)) return null;
    return obj as ZirconDesktopManager;
  }

  public static asWindow(obj: ZirconObject): ZirconWindow {
    if (!obj) return null;
    if (!(obj instanceof ZirconWindow)) return null;
    return obj as ZirconWindow;
  }
}
// interface ZirconObjectType {
//   type: string;
//   parent: string | null;
// }

// export class ZirconObjectTypes {
//   public static ZirconBasicObjectType: ZirconObjectType = {
//     type: 'zircon-object',
//     parent: null,
//   };
//   public static ZirconAppObjectType: ZirconObjectType = {
//     type: 'zircon-application-object',
//     parent: 'ZirconObject',
//   };
//   public static ZirconWindowType: ZirconObjectType = {
//     type: 'zircon-window',
//     parent: 'ZirconAppObject',
//   };
//   public static ZirconDesktopType: ZirconObjectType = {
//     type: 'zircon-desktop',
//     parent: 'ZirconDesktop',
//   };
//   public static ZirconVizWindowType: ZirconObjectType = {
//     type: 'zircon-viz-window',
//     parent: 'ZirconWindow',
//   };
//   public static ZirconDesktopManagerType: ZirconObjectType = {
//     type: 'zircon-desktop-manager',
//     parent: 'ZirconAppObject',
//   };
//   public static ZirconVizType: ZirconObjectType = {
//     type: 'zircon-visualizer',
//     parent: 'ZirconObject',
//   };
//   public static ZirconEngineType: ZirconObjectType = {
//     type: 'zircon-engine',
//     parent: 'ZirconObject',
//   };
// }
