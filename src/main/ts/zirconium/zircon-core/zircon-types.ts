export const ZIRCON_OBJECT_TYPE = 'zircon-object';
export const ZIRCON_APP_OBJECT_TYPE = 'zircon-app-object';
export const ZIRCON_DESKTOP_TYPE = 'zircon-desktop';
export const ZIRCON_DESKTOP_MANAGER_TYPE = 'zircon-desktop-manager';
export const ZIRCON_WINDOW_TYPE = 'zircon-window';
export const ZIRCON_VISUALIZER_TYPE = 'zircon-visualizer';
export const ZIRCON_VISUALIZER_WINDOW_TYPE = 'zircon-viz-window';
export const ZIRCON_PARAMETER_WINDOW_TYPE = 'zircon-param-window';
export const ZIRCON_ENGINE_TYPE = 'zircon-engine';
export const ZIRCON_ENGINE_MANAGER_TYPE = 'zircon-engine-manager';
export const ZIRCON_OBJECT_MANAGER_TYPE = 'zircon-object-manager';

export const DESKTOPS_MANAGER_CLASS = 'desktop-manager';
export const DESKTOPS_CONTAINER_CLASS = `desktops-container`;
export const DESKTOPS_SELECTOR_CLASS = `desktops-selector`;
export const DESKTOP_CONTAINER_CLASS = `desktop-container`;
export const DESKTOP_SELECTOR_CLASS = `desktop-selector`;
export const ACTIVE_DESKTOP_CLASS = 'active';

type ZirconObjectProperties = {
  type: ZirconType;
  className: ZirconType;
  parent: ZirconType | null;
};

export const ZirconObjectHierarchy: {
  [key: string]: ZirconObjectProperties;
} = {
  [ZIRCON_OBJECT_TYPE]: {
    type: ZIRCON_OBJECT_TYPE,
    className: 'ZirconObject',
    parent: null,
  },
  [ZIRCON_APP_OBJECT_TYPE]: {
    type: ZIRCON_APP_OBJECT_TYPE,
    className: 'ZirconAppObject',
    parent: ZIRCON_OBJECT_TYPE,
  },
  [ZIRCON_DESKTOP_TYPE]: {
    type: ZIRCON_DESKTOP_TYPE,
    className: 'ZirconDesktop',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  [ZIRCON_DESKTOP_MANAGER_TYPE]: {
    type: ZIRCON_DESKTOP_MANAGER_TYPE,
    className: 'ZirconDesktopManager',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  [ZIRCON_OBJECT_MANAGER_TYPE]: {
    type: ZIRCON_OBJECT_MANAGER_TYPE,
    className: 'ZirconObjectManager',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  [ZIRCON_WINDOW_TYPE]: {
    type: ZIRCON_WINDOW_TYPE,
    className: 'ZirconWindow',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  [ZIRCON_VISUALIZER_WINDOW_TYPE]: {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    className: 'ZirconVizWindow',
    parent: ZIRCON_WINDOW_TYPE,
  },
  [ZIRCON_PARAMETER_WINDOW_TYPE]: {
    type: ZIRCON_PARAMETER_WINDOW_TYPE,
    className: 'ZirconParamWindow',
    parent: ZIRCON_WINDOW_TYPE,
  },
  [ZIRCON_ENGINE_TYPE]: {
    type: ZIRCON_ENGINE_TYPE,
    className: 'ZirconEngine',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
  [ZIRCON_VISUALIZER_TYPE]: {
    type: ZIRCON_VISUALIZER_TYPE,
    className: 'ZirconViz',
    parent: ZIRCON_APP_OBJECT_TYPE,
  },
} as const;

export type ZirconType = keyof typeof ZirconObjectHierarchy;
