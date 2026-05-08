export const ZIRCON_OBJECT_TYPE: string = 'zircon-object';
export const ZIRCON_APP_OBJECT_TYPE: string = 'zircon-app-object';
export const ZIRCON_DESKTOP_TYPE: string = 'zircon-desktop';
export const ZIRCON_DESKTOP_MANAGER_TYPE: string = 'zircon-desktop-manager';
export const ZIRCON_WINDOW_TYPE: string = 'zircon-window';
export const ZIRCON_VISUALIZER_TYPE: string = 'zircon-visualizer';
export const ZIRCON_VISUALIZER_WINDOW_TYPE: string = 'zircon-viz-window';
export const ZIRCON_PARAMETER_WINDOW_TYPE: string = 'zircon-param-window';
export const ZIRCON_ENGINE_TYPE: string = 'zircon-engine';
export const ZIRCON_ENGINE_MANAGER_TYPE: string = 'zircon-engin-manager';
export const ZIRCON_OBJECT_MANAGER_TYPE: string = 'zircon-object-manager';

export const DESKTOPS_MANAGER_CLASS = 'desktop-manager';
export const DESKTOPS_CONTAINER_CLASS = `desktops-container`;
export const DESKTOPS_SELECTOR_CLASS = `desktops-selector`;
export const DESKTOP_CONTAINER_CLASS = `desktop-container`;
export const DESKTOP_SELECTOR_CLASS = `desktop-selector`;
export const ACTIVE_DESKTOP_CLASS = 'active';

interface ZirconObjectProperties {
  type: string;
  className: string;
  parent: string | null;
}

// export type ZirconObjectsProperties = Record<string, ZirconObjectProperties> = {
//   ZIRCON_OBJECT_TYPE: { parent: null };
//   ZIRCON_APP_OBJECT_TYPE: { parent: ZIRCON_OBJECT_TYPE };
//   ZIRCON_DESKTOP_TYPE: { parent: ZIRCON_APP_OBJECT_TYPE };
//   ZIRCON_DESKTOP_MANAGER_TYPE: { parent: ZIRCON_APP_OBJECT_TYPE };
//   ZIRCON_WINDOW_TYPE: { parent: ZIRCON_APP_OBJECT_TYPE };
//   ZIRCON_VISUALIZER_WINDOW_TYPE: { parent: ZIRCON_WINDOW_TYPE };
//   ZIRCON_PARAMETER_WINDOW_TYPE: { parent: ZIRCON_WINDOW_TYPE };
//   ZIRCON_ENGINE_TYPE: { parent: ZIRCON_APP_OBJECT_TYPE };
//   ZIRCON_ENGINE_MANAGER_TYPE: { parent: ZIRCON_APP_OBJECT_TYPE };
// };

export const ZirconObjectHierarchy: {
  [id: string]: ZirconObjectProperties;
} = {
  ZIRCON_OBJECT_TYPE: {
    type: ZIRCON_OBJECT_TYPE,
    className: 'ZirconObject',
    parent: null,
  },
  ZIRCON_APP_OBJECT_TYPE: {
    type: ZIRCON_APP_OBJECT_TYPE,
    className: 'ZirconAppObject',
    parent: ZIRCON_OBJECT_TYPE,
  },
  ZIRCON_DESKTOP_TYPE: {
    type: ZIRCON_DESKTOP_TYPE,
    className: 'ZirconDesktop',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  ZIRCON_DESKTOP_MANAGER_TYPE: {
    type: ZIRCON_DESKTOP_MANAGER_TYPE,
    className: 'ZirconDesktopManager',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  ZIRCON_OBJECT_MANAGER_TYPE: {
    type: ZIRCON_OBJECT_MANAGER_TYPE,
    className: 'ZirconObjectManager',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  ZIRCON_WINDOW_TYPE: {
    type: ZIRCON_WINDOW_TYPE,
    className: 'ZirconWindow',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  ZIRCON_VISUALIZER_WINDOW_TYPE: {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    className: 'ZirconVizWindow',
    parent: ZIRCON_WINDOW_TYPE,
  },
  ZIRCON_PARAMETER_WINDOW_TYPE: {
    type: ZIRCON_PARAMETER_WINDOW_TYPE,
    className: 'ZirconParamWindow',
    parent: ZIRCON_WINDOW_TYPE,
  },
  ZIRCON_ENGINE_TYPE: {
    type: ZIRCON_ENGINE_TYPE,
    className: 'ZirconEngine',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  ZIRCON_ENGINE_MANAGER_TYPE: {
    type: ZIRCON_ENGINE_MANAGER_TYPE,
    className: 'ZirconEngineManager',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  ZIRCON_VISUALIZER_TYPE: {
    type: ZIRCON_VISUALIZER_TYPE,
    className: 'ZirconViz',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
};

export class ZirconTypes {
  private constructor() {
    // helper class
  }

  public static isTypeOf(type: string, parentType: string): boolean {
    let current: string | null = type;

    while (current) {
      if (current === parentType) {
        return true;
      }

      current = ZirconObjectHierarchy[current]?.parent ?? null;
    }

    return false;
  }

  // public typeHasAncestor(type: string, ancestorType: string): boolean {
  //   if (!ancestorType) return false;
  //   return ancestorType === type;
  // }

  // public static instanceHasType(instance: ZirconObject, type: string): boolean {
  //   return instance?.getType() === type;
  // }

  // public static instanceHasAncestor(
  //   instance: ZirconObject,
  //   ancestorType: string,
  // ): boolean {
  //   return ZirconObjectManager.typeHasAncestor(
  //     instance?.getType(),
  //     ancestorType,
  //   );
  // }

  // public static typeHasAncestor(_type: string, _ancestorType: string): boolean {
  //   throw Error('Not yet implemented');
  // }
}
//   public static asDesktopState(state: ZirconObjectState): ZirconDesktopState {
//     if (!state) return null;
//     if (state.type !== ZIRCON_DESKTOP_TYPE) return null;
//     return state as ZirconDesktopState;
//   }

//   public static asWindowState(state: ZirconObjectState): ZirconWindowState {
//     if (!state) return null;
//     if (
//       state.type !== ZIRCON_VISUALIZER_WINDOW_TYPE &&
//       state.type !== ZIRCON_PARAMETER_WINDOW_TYPE
//     )
//       return null;
//     return state as ZirconWindowState;
//   }

//   public static asDesktopManagerState(
//     state: ZirconObjectState,
//   ): ZirconDesktopManagerState {
//     if (!state) return null;
//     if (state.type !== ZIRCON_DESKTOP_MANAGER_TYPE) return null;
//     return state as ZirconDesktopManagerState;
//   }

//   public static asEngineManagerState(
//     state: ZirconObjectState,
//   ): ZirconEngineManagerState {
//     if (!state) return null;
//     if (state.type !== ZIRCON_ENGINE_MANAGER_TYPE) return null;
//     return state as ZirconEngineManagerState;
//   }

//   public static asDesktop(obj: ZirconObject): ZirconDesktop {
//     if (!obj) return null;
//     if (!(obj instanceof ZirconDesktop)) return null;
//     return obj as ZirconDesktop;
//   }

//   public static asDesktopManager(obj: ZirconObject): ZirconDesktopManager {
//     if (!obj) return null;
//     if (!(obj instanceof ZirconDesktopManager)) return null;
//     return obj as ZirconDesktopManager;
//   }

//   public static asWindow(obj: ZirconObject): ZirconWindow {
//     if (!obj) return null;
//     if (!(obj instanceof ZirconWindow)) return null;
//     return obj as ZirconWindow;
//   }
// }
// // interface ZirconObjectType {
// //   type: string;
// //   parent: string | null;
// // }

// // export class ZirconObjectTypes {
// //   public static ZirconBasicObjectType: ZirconObjectType = {
// //     type: 'zircon-object',
// //     parent: null,
// //   };
// //   public static ZirconAppObjectType: ZirconObjectType = {
// //     type: 'zircon-application-object',
// //     parent: 'ZirconObject',
// //   };
// //   public static ZirconWindowType: ZirconObjectType = {
// //     type: 'zircon-window',
// //     parent: 'ZirconAppObject',
// //   };
// //   public static ZirconDesktopType: ZirconObjectType = {
// //     type: 'zircon-desktop',
// //     parent: 'ZirconDesktop',
// //   };
// //   public static ZirconVizWindowType: ZirconObjectType = {
// //     type: 'zircon-viz-window',
// //     parent: 'ZirconWindow',
// //   };
// //   public static ZirconDesktopManagerType: ZirconObjectType = {
// //     type: 'zircon-desktop-manager',
// //     parent: 'ZirconAppObject',
// //   };
// //   public static ZirconVizType: ZirconObjectType = {
// //     type: 'zircon-visualizer',
// //     parent: 'ZirconObject',
// //   };
// //   public static ZirconEngineType: ZirconObjectType = {
// //     type: 'zircon-engine',
// //     parent: 'ZirconObject',
// //   };
// // }
