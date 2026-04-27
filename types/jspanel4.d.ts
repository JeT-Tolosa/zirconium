// src: https://gist.github.com/markhalliwell/e984bbca9741d0501f08937a9351f323
/* eslint-disable  @typescript-eslint/no-explicit-any*/
declare module 'jspanel4' {
  // Types.
  export type IJSPanelAutoPosition = 'down' | 'left' | 'up' | 'right';
  export type JSPanelContent<T = string | HTMLElement> = T;
  export type IJSPanelContentArray<
    TContent = string | HTMLElement,
  > = IJSPanelDynamicContent<TContent>[] | JSPanelContent<TContent>;
  export type JSPanelControlStatus = 'disable' | 'enable' | 'hide' | 'remove' | 'show';
  export type IJSPanelDimension = number | string | IJSPanelCallback<number | string>;
  export type IJSPanelDynamicContent<
    TReturn = string,
    TContent = string | HTMLElement,
  > = JSPanelContent<TContent> | IJSPanelCallback<TReturn>;
  export type JSPanelPosition = 'center' | 'center-bottom' | 'center-top' | 'left-bottom' | 'left-center' | 'left-top' | 'right-bottom' | 'right-center' | 'right-top';
  export type JSPanelStatus = 'closed' | 'maximized' | 'minimized' | 'normalized' | 'smallified' | 'smallifiedmax';
  export type JSPanelType = 'contextmenu' | 'error' | 'hint' | 'modal' | 'standard' | 'tooltip';

  // Interfaces.
  export interface IJSPanelInstance extends HTMLDivElement {
    // Properties.
    autocloseProgressbar?: HTMLDivElement;
    content: HTMLDivElement;
    controlbar?: HTMLDivElement;
    droppableTo?: HTMLDivElement;
    footer?: HTMLDivElement;
    header?: HTMLDivElement;
    headerbar?: HTMLDivElement;
    headerlogo?: HTMLDivElement;
    headertitle?: HTMLSpanElement;
    headertoolbar?: HTMLDivElement;
    options: IJSPanelOptions;
    snappableTo: JSPanelPosition;
    snapped: JSPanelPosition;
    status: JSPanelStatus;
    titlebar?: HTMLDivElement;

    // Methods.
    addControl(config: IJSPanelControl): this;
    addToolbar(location: 'header' | 'footer', toolbar: IJSPanelContentArray, callback?: IJSPanelCallback): this;
    close(callback?: (this: string | IJSPanelInstance, id: string, panel?: IJSPanelInstance) => void): string | false;
    closeChildpanels(callback?: IJSPanelCallback): this;
    contentRemove(callback?: IJSPanelCallback): this;
    dragit(action: 'enable' | 'disable'): this;
    front(callback?: IJSPanelCallback): this;
    getChildpanels<TList = HTMLElement[]>(callback?: IJSPanelChildPanelsCallback): TList;
    isChildpanel(callback?: IJSPanelChildPanelCallback): IJSPanelInstance | false;
    maximize(callback?: IJSPanelStatusCallback<void>): this;
    minimize(callback?: IJSPanelStatusCallback<void>): this;
    normalize(callback?: IJSPanelStatusCallback<void>): this;
    overlaps(reference: 'window' | 'parent' | string, elmtBox: 'paddingbox' | string, event: PointerEvent): IJSPanelOverlaps;
    reposition(position: string | IJSPanelPositionOptions, updateCache?: boolean, callback?: IJSPanelCallback): this;
    resize(size: string | IJSPanelSize, updateCache?: boolean, callback?: IJSPanelCallback): this;
    resizeit(action: 'enable' | 'disable'): this;
    setBorder(border?: string): this;
    setBorderRadius(radius: number | string): this;
    setControlStatus(control: string, action: JSPanelControlStatus, callback?: IJSPanelCallback): this;
    setHeaderLogo(logo: string | HTMLElement, callback?: IJSPanelCallback): this;
    setHeaderTitle(title: IJSPanelDynamicContent, callback?: IJSPanelCallback): this;
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
    width: IJSPanelDimension
  }

  export interface IJSPanelData {
    height: number;
    left: number;
    top: number;
    width: number;
  }

  // Callbacks.
  export type IJSPanelAfterInsertCallback = (this: IJSPanelControl, control: IJSPanelControl) => void;
  export type IJSPanelCallback<TReturn = void> = (this: IJSPanelInstance, panel: IJSPanelInstance) => TReturn;
  export type IJSPanelChildPanelCallback = (this: IJSPanelInstance, panel: IJSPanelInstance, parentpanel: IJSPanelInstance | null) => void;
  export type IJSPanelChildPanelsCallback<TList = HTMLElement[]> = (this: IJSPanelInstance, panel: IJSPanelInstance, index: number, list: TList) => void;
  export type IJSPanelControlHandler = (this: IJSPanelInstance, panel: IJSPanelInstance, control: IJSPanelControl) => void;
  export type IJSPanelDragCallback = (this: IJSPanelInstance, panel: IJSPanelInstance, paneldata: IJSPanelData, event: PointerEvent) => void;
  export type IJSPanelDropCallback = (this: IJSPanelInstance, panel: IJSPanelInstance, target: HTMLElement, source: HTMLElement) => void;
  export type IJSPanelFetchCallback = (this: Response, response: Response, panel: IJSPanelInstance) => void;
  export type IJSPanelFunction<TReturn = any> = (...args: any[]) => TReturn;
  export type IJSPanelOnBeforeCloseCallback = (this: IJSPanelControl, panel: IJSPanelInstance, status: JSPanelStatus, closedByUser: boolean) => boolean;
  export type IJSPanelOnClosedCallback = (this: IJSPanelControl, panel: IJSPanelInstance, closedByUser: boolean) => boolean;
  export type IJSPanelParentCallback = (this: IJSPanelInstance, parent: IJSPanelInstance, size: IJSPanelSize) => void;
  export type IJSPanelPositionCallback<TReturn = number | string> = (this: IJSPanelPosition, pos: IJSPanelPosition, position: IJSPanelPositionOptions) => TReturn;
  export type IJSPanelResizeCallback = (this: IJSPanelInstance, panel: IJSPanelInstance, paneldata: IJSPanelData, event: PointerEvent) => void;
  export type IJSPanelStatusCallback<TReturn = boolean> = (this: IJSPanelControl, panel: IJSPanelInstance, status: JSPanelStatus) => TReturn;
  export type IJSPanelWindowCallback = (this: IJSPanelInstance, event: UIEvent, panel: IJSPanelInstance) => void;
  export type IJSPanelXhrCallback = (this: XMLHttpRequest, xhr: XMLHttpRequest, panel: IJSPanelInstance) => void;

  // Option Interfaces.
  export interface IJSPanelAutoCloseOptions {
    background?: string;
    progressbar?: boolean;
    time?: string | number;
  }

  export interface IJSPanelAjaxOptions {
    always?: IJSPanelXhrCallback;
    async?: boolean;
    autoreposition?: boolean;
    autoresize?: boolean;
    beforeSend?: IJSPanelXhrCallback;
    data?: any;
    done?: IJSPanelXhrCallback;
    fail?: IJSPanelXhrCallback;
    method?: string;
    pwd?: string | null;
    responseType?: XMLHttpRequestResponseType;
    timeout?: number;
    url: string;
    user?: string | null;
    withCredentials?: boolean;
  }

  export interface IJSPanelControl {
    html: string;
    name?: string;
    handler?: IJSPanelControlHandler;
    position?: number;
    afterInsert?: IJSPanelAfterInsertCallback;
  }

  export interface IJSPanelControlOptions {
    add?: IJSPanelControl | IJSPanelControl[];
    close?: JSPanelControlStatus;
    maximize?: JSPanelControlStatus;
    normalize?: JSPanelControlStatus;
    minimize?: JSPanelControlStatus;
    smallify?: JSPanelControlStatus;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }

  export interface IJSPanelDragOptions {
    axis?: string;
    containment?: number | [number, number?, number?, number?];
    cursor?: string; // @todo make this a tuple?
    disable?: boolean;
    disableOnMaximized?: boolean;
    drop?: IJSPanelDropOptions;
    grid?: number | [number, number];
    handles?: string;
    opacity?: number;
    start?: IJSPanelDragCallback | IJSPanelDragCallback[];
    drag?: IJSPanelDragCallback | IJSPanelDragCallback[];
    stop?: IJSPanelDragCallback | IJSPanelDragCallback[];
    snap?: boolean | IJSPanelSnapOptions;
  }

  export interface IJSPanelDropOptions {
    callback?: IJSPanelDropCallback;
    dropZones: (string | HTMLElement)[];
  }

  export interface IJSPanelFetchOptions {
    autoreposition?: boolean;
    autoresize?: boolean;
    beforeSend?: IJSPanelFetchCallback;
    bodyMethod?: string;
    done?: IJSPanelFetchCallback;
    fetchInit?: RequestInit;
    resource: RequestInfo | URL;
  }

  export interface IJSPanelSnapOptions {
    active?: 'both' | 'inside';
    callback?: IJSPanelCallback;
    containment?: boolean;
    repositionOnSnap?: boolean;
    resizeToPreSnap?: boolean;
    sensitivity?: number;
    snapCenterBottom?: boolean | IJSPanelCallback;
    snapCenterTop?: boolean | IJSPanelCallback;
    snapLeftBottom?: boolean | IJSPanelCallback;
    snapLeftCenter?: boolean | IJSPanelCallback;
    snapLeftTop?: boolean | IJSPanelCallback;
    snapRightBottom?: boolean | IJSPanelCallback;
    snapRightCenter?: boolean | IJSPanelCallback;
    snapRightTop?: boolean | IJSPanelCallback;
    trigger?: 'panel' | 'pointer';
  }

  export interface IJSPanelOverlaps {
    bottom: number;
    left: number;
    overlaps: boolean;
    panelRect: DOMRect;
    parentBorderWidth: DOMRect;
    pointer: {
      bottom: number;
      clientX: number;
      clientY: number;
      left: number;
      right: number;
      top: number;
    }
    referenceRect: DOMRect;
    right: number;
    top: number;
  }

  export interface IJSPanelPositionOptions {
    my?: JSPanelPosition | IJSPanelCallback<JSPanelPosition>;
    at?: JSPanelPosition | IJSPanelCallback<JSPanelPosition>;
    of?: string | HTMLElement | IJSPanelCallback<string | HTMLElement>;
    autoposition?: IJSPanelAutoPosition;
    offsetX?: number | string | IJSPanelPositionCallback;
    offsetY?: number | string | IJSPanelPositionCallback;
    minLeft?: number | string | IJSPanelPositionCallback;
    maxLeft?: number | string | IJSPanelPositionCallback;
    maxTop?: number | string | IJSPanelPositionCallback;
    minTop?: number | string | IJSPanelPositionCallback;
    modify?: number | string | IJSPanelPositionCallback<IJSPanelPosition>;
  }

  export interface IJSPanelResizeOptions {
    aspectRatio?: 'panel' | 'content';
    containment?: number | [number, number?, number?, number?];
    disable?: boolean;
    grid?: [number, number?];
    handles?: string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    start?: IJSPanelResizeCallback;
    resize?: IJSPanelResizeCallback;
    stop?: IJSPanelResizeCallback;
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

  export interface IJSPanelOptions {
    addCloseControl?: 1;
    animateIn?: string;
    animateOut?: string;
    autoclose?: boolean | number | IJSPanelAutoCloseOptions;
    border?: string;
    borderRadius?: string | number;
    boxShadow?: 0 | 1 | 2 | 3 | 4 | 5;
    callback?: IJSPanelCallback | IJSPanelCallback[];
    closeOnEscape?: boolean | IJSPanelCallback<boolean>;
    config?: IJSPanelOptions;
    panelClass?: string;
    container?: string | HTMLElement;
    content?: string | HTMLElement | IJSPanelCallback;
    contentAjax?: string | IJSPanelAjaxOptions;
    contentFetch?: string | IJSPanelFetchOptions;
    contentOverflow?: string;
    contentSize?: string | IJSPanelSize;
    css?: Record<string, string>; // @todo make this a tuple?
    data?: any;
    dragit?: IJSPanelDragOptions;
    footerToolbar?: string | HTMLElement | (string | HTMLElement)[] | IJSPanelCallback<string | HTMLElement>;
    header?: boolean | 'auto-show-hide';
    headerControls?: string | IJSPanelControlOptions;
    headerLogo?: string;
    headerTitle?: string | HTMLElement | IJSPanelFunction<string>;
    headerToolbar?: string | HTMLElement | (string | HTMLElement)[] | IJSPanelCallback<string | HTMLElement>;
    iconfont?: string | string[];
    id?: string | IJSPanelFunction<string>;
    maximizedMargin?: number | [number, number?, number?, number?];
    minimizeTo?: 'default' | 'parent' | 'parentpanel' | string | boolean;
    onbeforeclose?: IJSPanelOnBeforeCloseCallback | IJSPanelOnBeforeCloseCallback[];
    onbeforemaximize?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onbeforeminimize?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onbeforenormalize?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onbeforesmallify?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onbeforeunsmallify?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onclosed?: IJSPanelOnClosedCallback | IJSPanelOnClosedCallback[];
    onfronted?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onmaximized?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onminimized?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onnormalized?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onsmallified?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onstatuschange?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onunsmallified?: IJSPanelStatusCallback | IJSPanelStatusCallback[];
    onparentresize?: boolean | IJSPanelParentCallback | {
      callback: IJSPanelParentCallback;
      preset?: boolean;
    };
    onwindowresize?: boolean | IJSPanelWindowCallback | {
      callback: IJSPanelWindowCallback;
      preset?: boolean;
    };
    opacity?: number;
    panelSize?: string | IJSPanelSize;
    paneltype?: JSPanelType;
    position?: boolean | string | IJSPanelPositionOptions;
    resizeit?: IJSPanelResizeOptions | false;
    rtl?: boolean;
    setStatus?: JSPanelStatus;
    syncMargins?: boolean;
    template?: HTMLElement;
    theme?: string | IJSPanelThemeOptions;
  }

  export interface IJSPanel {
    autopositionSpacing?: number;
    colorFilled?: number;
    colorFilledDark?: number;
    colorFilledLight?: number;
    colorNames?: { [key: string]: string };
    defaults: IJSPanelOptions;
    errorReporting?: 0 | 1;
    globalCallbacks?: IJSPanelCallback | IJSPanelCallback[];
    icons?: { [key: string]: string };
    pointerdown?: ['pointerdown'?, 'touchstart'?, 'mousedown'?];
    pointermove?: ['pointermove'?, 'touchmove'?, 'mousemove'?];
    pointerup?: ['pointerup'?, 'touchend'?, 'mouseup'?];
    version: string;
    date: string;
    ziBase?: number;
    addScript(src: string, type: string, callback?: IJSPanelFunction): void;
    ajax(xhrConfig: IJSPanelAjaxOptions): void;
    calcColors(color: string): [string, string, string, string, string, string, string];
    color(color: string): {
      hex: string;
      hsl: { css: string, h: number, s: string, l: string };
      rgb: { css: string, r: string, g: string, b: string };
    };
    create(options?: IJSPanelOptions): IJSPanelInstance;
    darken(color: string, amount: number): string;
    emptyNode<T = HTMLElement>(node: T): T;
    extend(object: Record<PropertyKey, any>): void;
    fetch(fetchConfig: IJSPanelFetchOptions): void;
    getPanels(condition?: IJSPanelCallback): IJSPanelInstance[];
    getCssVariableValue(variable: string): string;
    lighten(color: string, amount: number): string;
    perceivedBrightness(color: string): number;
    position<T = HTMLElement>(element: T, position: IJSPanelPositionOptions): T;
    remClass<T = HTMLElement>(element: T, classnames: string): T;
    setClass<T = HTMLElement>(element: T, classnames: string): T;
    setStyles<T = HTMLElement>(element: T, stylesobject: Record<string, string>): T;
    strToHtml(string: string): DocumentFragment;
    toggleClass<T = HTMLElement>(element: T, classnames: string): T;
    usePointerEvents(use?: boolean): void;
  }

  export const jsPanel: IJSPanel;
  export default jsPanel;
}

// Export same interfaces for ES6 code.
declare module 'jspanel4' {
  import { IJSPanel } from 'jspanel4';

  export const jsPanel: IJSPanel;
  export default jsPanel;
}