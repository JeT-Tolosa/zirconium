declare module 'jspanel4' {
  // Types.
  export type IJSPanelAutoPosition = 'down' | 'left' | 'up' | 'right';
  export type JSPanelContent<T = string | HTMLElement> = T;
  export type IJSPanelContentArray<TContent = string | HTMLElement> =
    | IJSPanelDynamicContent<TContent>[]
    | JSPanelContent<TContent>;
  export type JSPanelControlStatus =
    | 'disable'
    | 'enable'
    | 'hide'
    | 'remove'
    | 'show';
  export type IJSPanelDimension =
    | number
    | string
    | IJSPanelCallback<number | string>;
  export type IJSPanelDynamicContent<
    TReturn = string,
    TContent = string | HTMLElement,
  > = JSPanelContent<TContent> | IJSPanelCallback<TReturn>;

  export type JSPanelPosition =
    | 'center'
    | 'center-bottom'
    | 'center-top'
    | 'left-bottom'
    | 'left-center'
    | 'left-top'
    | 'right-bottom'
    | 'right-center'
    | 'right-top';

  export type JSPanelStatus =
    | 'closed'
    | 'maximized'
    | 'minimized'
    | 'normalized'
    | 'smallified'
    | 'smallifiedmax';

  export type JSPanelType =
    | 'contextmenu'
    | 'error'
    | 'hint'
    | 'modal'
    | 'standard'
    | 'tooltip';

  export type JSPanelModalPreset =
    | true
    | false
    | 'modal-ok'
    | 'modal-yesno'
    | 'modal-confirm'
    | 'modal-submit';

  // Interfaces.
  export interface IJSPanelInstance extends HTMLDivElement {
    content: HTMLDivElement;
    footer?: HTMLDivElement;
    header?: HTMLDivElement;
    options: IJSPanelOptions;
    status: JSPanelStatus;

    addControl(config: IJSPanelControl): this;
    close(
      callback?: (id: string, panel?: IJSPanelInstance) => void,
    ): string | false;
    front(callback?: IJSPanelCallback): this;
    maximize(callback?: IJSPanelStatusCallback<void>): this;
    minimize(callback?: IJSPanelStatusCallback<void>): this;
    normalize(callback?: IJSPanelStatusCallback<void>): this;
    reposition(
      position: string | IJSPanelPositionOptions,
      updateCache?: boolean,
      callback?: IJSPanelCallback,
    ): this;
    resize(
      size: string | IJSPanelSize,
      updateCache?: boolean,
      callback?: IJSPanelCallback,
    ): this;
    setHeaderTitle(
      title: IJSPanelDynamicContent,
      callback?: IJSPanelCallback,
    ): this;
    setTheme(theme: string | IJSPanelThemeOptions): this;
    smallify(callback?: IJSPanelStatusCallback): this;
    unsmallify(callback?: IJSPanelStatusCallback): this;
  }

  export interface IJSPanelPosition {
    left: number | string;
    top: number | string;
  }

  export interface IJSPanelSize {
    height: IJSPanelDimension;
    width: IJSPanelDimension;
  }

  export interface IJSPanelData {
    height: number;
    left: number;
    top: number;
    width: number;
  }

  // Callbacks.
  export type IJSPanelCallback<TReturn = void> = (
    this: IJSPanelInstance,
    panel: IJSPanelInstance,
  ) => TReturn;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type IJSPanelFunction<TReturn = any> = (...args: any[]) => TReturn;

  export type IJSPanelStatusCallback<TReturn = boolean> = (
    this: IJSPanelControl,
    panel: IJSPanelInstance,
    status: JSPanelStatus,
  ) => TReturn;

  // Option Interfaces.
  export interface IJSPanelAutoCloseOptions {
    background?: string;
    progressbar?: boolean;
    time?: string | number;
  }

  export interface IJSPanelControl {
    html: string;
    name?: string;
    handler?: IJSPanelControlHandler;
    position?: number;
  }

  export type IJSPanelControlHandler = (
    this: IJSPanelInstance,
    panel: IJSPanelInstance,
    control: IJSPanelControl,
  ) => void;

  export interface IJSPanelControlOptions {
    add?: IJSPanelControl | IJSPanelControl[];
    close?: JSPanelControlStatus;
    maximize?: JSPanelControlStatus;
    normalize?: JSPanelControlStatus;
    minimize?: JSPanelControlStatus;
    smallify?: JSPanelControlStatus;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }

  export interface IJSPanelPositionOptions {
    my?: JSPanelPosition | IJSPanelCallback<JSPanelPosition>;
    at?: JSPanelPosition | IJSPanelCallback<JSPanelPosition>;
    of?: string | HTMLElement | IJSPanelCallback<string | HTMLElement>;
    autoposition?: IJSPanelAutoPosition;
    offsetX?: number | string;
    offsetY?: number | string;
  }

  export interface IJSPanelResizeOptions {
    disable?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }

  export interface IJSPanelThemeOptions {
    bgContent?: string;
    bgFooter?: string;
    bgPanel?: string;
    border?: string;
    borderRadius?: string;
    colorContent?: string;
    colorFooter?: string;
    colorHeader?: string;
  }

  export interface IJSPanelModalOptions {
    /**
     * Active l'extension modal.
     */
    modal?: JSPanelModalPreset;

    /**
     * Ferme le modal avec ESC.
     */
    closeOnEscape?: boolean | IJSPanelCallback<boolean>;

    /**
     * Overlay personnalisé.
     */
    overlay?: {
      backgroundColor?: string;
      opacity?: number;
      zIndex?: number;
    };
  }

  export interface IJSPanelOptions extends IJSPanelModalOptions {
    addCloseControl?: 1;
    animateIn?: string;
    animateOut?: string;
    autoclose?: boolean | number | IJSPanelAutoCloseOptions;
    border?: string;
    borderRadius?: string | number;
    boxShadow?: 0 | 1 | 2 | 3 | 4 | 5;
    callback?: IJSPanelCallback | IJSPanelCallback[];
    panelClass?: string;
    container?: string | HTMLElement;
    content?: string | HTMLElement | IJSPanelCallback;
    contentOverflow?: string;
    contentSize?: string | IJSPanelSize;
    css?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    dragit?: {
      disable?: boolean;
    };
    footerToolbar?:
      | string
      | HTMLElement
      | (string | HTMLElement)[]
      | IJSPanelCallback<string | HTMLElement>;
    header?: boolean | 'auto-show-hide';
    headerControls?: string | IJSPanelControlOptions;
    headerLogo?: string;
    headerTitle?: string | HTMLElement | IJSPanelFunction<string>;
    headerToolbar?:
      | string
      | HTMLElement
      | (string | HTMLElement)[]
      | IJSPanelCallback<string | HTMLElement>;
    id?: string | IJSPanelFunction<string>;
    onbeforeclose?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onclosed?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onfronted?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onmaximized?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onminimized?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onnormalized?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onsmallified?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    opacity?: number;
    panelSize?: string | IJSPanelSize;
    paneltype?: JSPanelType;
    position?: boolean | string | IJSPanelPositionOptions;
    resizeit?: IJSPanelResizeOptions | false;
    rtl?: boolean;
    setStatus?: JSPanelStatus;
    template?: HTMLElement;
    theme?: string | IJSPanelThemeOptions;
  }

  export interface IJSPanelModal {
    create(options?: IJSPanelOptions): IJSPanelInstance;
    close(): void;
  }

  export interface IJSPanel {
    defaults: IJSPanelOptions;
    version: string;
    date: string;

    create(options?: IJSPanelOptions): IJSPanelInstance;

    modal: IJSPanelModal;

    tooltip?: {
      create(options?: IJSPanelOptions): IJSPanelInstance;
    };

    hint?: {
      create(options?: IJSPanelOptions): IJSPanelInstance;
    };

    dock?: {
      dock(panel: IJSPanelInstance, target: IJSPanelInstance): void;
    };

    layout?: {
      save(options?: unknown): unknown;
      restore(config: unknown): void;
    };
  }

  export const jsPanel: IJSPanel;
  export default jsPanel;
}

// Export same interfaces for ES modules.
declare module 'jspanel4' {
  import { IJSPanel } from 'jspanel4';

  export const jsPanel: IJSPanel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type modal = any;
  export default jsPanel;
}

// Global browser usage.
declare global {
  const jsPanel: import('jspanel4').IJSPanel;
}

export {};
