import { ZirconApplication } from './zircon-core/zircon-app';
import { ZirconObject, ZirconObjectState } from './zircon-object';
import { ZIRCON_PARAMETER_WINDOW_TYPE } from './zircon-params/zircon-param-window';
import {
  ZIRCON_DESKTOP_TYPE,
  ZirconDesktop,
  ZirconDesktopState,
} from './zircon-ui/zircon-desktop';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-core/zircon-desktop-manager';
import {
  DEFAULT_VISUALIZER_WINDOW_STATE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZirconVizWindow,
  ZirconVizWindowState,
} from './zircon-ui/zircon-viz-window';
import { ZirconWindow, ZirconWindowState } from './zircon-ui/zircon-window';

// export type InstancesMap = {
//   DesktopManager: ZirconDesktopManager;
//   Desktop: ZirconDesktop;
//   Window: ZirconWindow;
//   ContextMenu: ZirconContextMenu;
// };

// type ZirconAppObjectConstructor<T> = new (app: ZirconApplication) => T;

// const typedConstructors: {
//   [K in keyof InstancesMap]: ZirconAppObjectConstructor<InstancesMap[K]>;
// } = {
//   DesktopManager: ZirconDesktopManager,
//   Desktop: ZirconDesktop,
//   Window: ZirconWindow,
//   ContextMenu: ZirconContextMenu,
// };

export interface ArrayComparisonResult {
  inserted: string[];
  common: string[];
  deleted: string[];
}

export class Zircon {
  /**
   * Create a new Window
   * @param app
   * @param state
   * @returns
   */
  public static createWindowInstance(
    app: ZirconApplication,
    state: ZirconVizWindowState = DEFAULT_VISUALIZER_WINDOW_STATE,
  ): ZirconWindow {
    const window = new ZirconVizWindow(app, state);
    return window;
  }

  /**
   * Create a new Desktop
   * @param app
   * @param state
   * @returns
   */
  public static createDesktopInstance(
    app: ZirconApplication,
    state: ZirconDesktopState,
  ): ZirconDesktop {
    const desktop = new ZirconDesktop(app, state);
    return desktop;
  }

  public static createDesktopManagerInstance(
    app: ZirconApplication,
  ): ZirconDesktopManager {
    return new ZirconDesktopManager(app);
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

  //   public static createApplicationObject<T extends keyof InstancesMap>(
  //     type: T,
  //     app: ZirconApplication,
  //   ): InstancesMap[T] {
  //     const Ctor = typedConstructors[type];
  //     return new Ctor(app);
  //   }
  //   public static createWindow(state: WindowState): ZirconWindow {
  //     return new ZirconWindow();
  //   }

  public static arrayComparison(
    previous: string[],
    next: string[],
  ): ArrayComparisonResult {
    if (!previous && !next) return { inserted: [], common: [], deleted: [] };
    if (!previous && next) return { inserted: next, common: [], deleted: [] };
    if (previous && !next) return { inserted: [], common: [], deleted: next };
    const setPrevious = new Set(previous);
    const setNext = new Set(next);

    const common: string[] = [];
    const inserted: string[] = [];
    const deleted: string[] = [];

    // éléments communs + disparus
    for (const val of setPrevious) {
      if (setNext.has(val)) {
        common.push(val);
      } else {
        deleted.push(val);
      }
    }

    // nouveaux éléments
    for (const val of setNext) {
      if (!setPrevious.has(val)) {
        inserted.push(val);
      }
    }

    return { inserted: inserted, common: common, deleted: deleted };
  }
}
