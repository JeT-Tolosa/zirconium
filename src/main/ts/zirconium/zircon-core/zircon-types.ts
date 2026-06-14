export const ZIRCON_OBJECT_TYPE: string = 'zircon-object';
export const ZIRCON_APP_OBJECT_TYPE: string = 'zircon-app-object';
export const ZIRCON_DESKTOP_TYPE: string = 'zircon-desktop';
export const ZIRCON_DESKTOP_MANAGER_TYPE: string = 'zircon-desktop-manager';
export const ZIRCON_WINDOW_TYPE: string = 'zircon-window';
export const ZIRCON_VISUALIZER_TYPE: string = 'zircon-visualizer';
export const ZIRCON_VISUALIZER_WINDOW_TYPE: string = 'zircon-viz-window';
export const ZIRCON_PARAMETER_WINDOW_TYPE: string = 'zircon-param-window';
export const ZIRCON_ENGINE_TYPE: string = 'zircon-engine';
export const ZIRCON_ENGINE_MANAGER_TYPE: string = 'zircon-engine-manager';
export const ZIRCON_OBJECT_MANAGER_TYPE: string = 'zircon-object-manager';
export const ZIRCON_PLUGIN_TYPE: string = 'zircon-plugin';
export const ZIRCON_PLUGIN_MANAGER_TYPE: string = 'zircon-plugin-manager';
export const ZIRCON_DATA_PROVIDER_TYPE: string = 'zircon-data-provider';
export const ZIRCON_DATA_PROVIDER_DEFAULT_TYPE: string =
  'zircon-data-provider-default';
export const ZIRCON_DATA_ADAPTER_TYPE: string = 'zircon-data-adapter';

export const DESKTOPS_MANAGER_CLASS = 'desktops-manager';
export const DESKTOPS_MANAGER_HEADER_CLASS = 'desktops-manager-header';
export const DESKTOP_MANAGER_DESKTOPS_CONTAINER_CLASS = `desktops-container`;
export const TOOLBAR_CONTAINER_CLASS = `toolbar-container`;
export const DESKTOPS_CONTAINER_CLASS = `desktops-container`;
export const DESKTOPS_SELECTOR_CLASS = `desktops-selector`;
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
