declare module 'jsframe.js' {
  export interface CFrameAppearance {
    showTitleBar: boolean;
    showCloseButton: boolean;
    titleBarCaption: string;
    titleBarCaptionFontSize: string;
    titleBarCaptionFontWeight: string;
    titleBarHeight: string;
    useIframe: boolean;
    useFrame: boolean;
    titleBarClassNameDefault: string | null;
    titleBarClassNameFocused: string | null;
  }

  export type CIfFrameAnchorType =
    | 'LEFT_TOP'
    | 'CENTER_TOP'
    | 'RIGHT_TOP'
    | 'LEFT_CENTER'
    | 'CENTER_CENTER'
    | 'CENTER'
    | 'RIGHT_CENTER'
    | 'LEFT_BOTTOM'
    | 'CENTER_BOTTOM'
    | 'RIGHT_BOTTOM';

  export class CIfFrame {
    show(): void;
    showModal(callback: (frame: CIfFrame) => void): void; //Callback when modal window is closed.
    showToast(arg?: any): void;

    closeFrame(): void;
    hide(): void;
    requestFocus(): void;
    // Event handling
    /**
 * Sets an event listener for the window itself or elements in the contents of the window.
 It is possible to register multiple listeners to the same event type.

 * @param {string} id
 If the "id" is prefixed with "#",
 an event listener can be set to a DOM element (eventTarget) identified by the id in the content.<br>
 This is the same behavior as the usual eventTarget#addEventListener.<br>
 <br>
 In addition to the DOM element in the content, the following special names are reserved for the "id"<br>
 "closeButton" ... close button.<br>
 "minimizeButton" ... Minimize Button<br>
 "zoomButton"...zoom button.<br>
 "restoreButton" ... the button that restores the window size.<br>
 "deminimizeButton" ... the button to return from the minimized state.<br>
 <br>
 You can also receive events such as window resizing, moving, and focusing.
 In this case, specify the following as "id"<br>
 "frame" or "window".<br>
 <br>
 You can specify a frameComponent name that is uniquely defined by addFrameComponent.
 (Generic buttons such as closeButton are one of the frame components.
 * @param {string} eventType The element in the content (HTML) of a window whose "id" starts with "#"
 * can be the same as the eventType(https://developer.mozilla.org/en-US/docs/Web/API/Event/type) used by the normal addEventListener.<br>
 <br>
 If the "id" is a frame or a window, the following can be used<br>
 "move"... When a window is moved, it fires.<br>
 "resize"... Fires when the window is resized.<br>
 "focus"... "focus" means got focus. It fires when the window is in focus.<br>
 "blur"... "blur" means lost focus.It fires when the window loses focus.<br>
 <br>
 * @param {function} callbackFunc
 */
    on: (
      selector?:
        | string
        | 'closeButton'
        | 'minimizeButton'
        | 'zoomButton'
        | 'deminimizeButton'
        | 'restoreButton',
      event?: string | 'move' | 'resize' | 'blur' | 'focus',
      callback?: (frame?: CIfFrame, evt?: Event) => void,
    ) => void;

    setTitle(str: string): CIfFrame; //	Set caption in the title bar
    setResizable(resize: boolean): CIfFrame; //	Set whether the window can be resized
    setMovable(move: boolean): CIfFrame; //	Set whether the window can be moved
    setTitleBarClassName(
      classNameForDefault: string,
      classNameForFocused: string,
    ): CIfFrame; //	Set title bar style class name
    getFrameView(): HTMLDivElement; //	Get window content element. It's just a 'div' element.So you can handle it as a 'div' element.
    setUrl(url: string): Promise<void>; //	Open a page specified as url in the IFrame mode.
    // It returns Promise.If you want to execute something at the timing of opening url,use 'then' .
    // ex:   frame.setUrl('http://something').then(function(){frame.show();});
    show(): CIfFrame; //	Show frame
    requestFocus(): CIfFrame; // 	Requests that this frame gets the focus. Focus and the window comes to the forefront
    setSize(width: number, height: number): CIfFrame; //	set size of frame
    setPosition(x: number, y: number, anchor?: CIfFrameAnchorType): CIfFrame; //	anchor is optional. Default anchor is 'LEFT_TOP'
    hideFrameComponent(elementName: string): void; // 'minimizeButton'
  }

  export interface JSFrameInitializationParameter {
    fixed?: boolean;
    parentElement?: HTMLElement;
    align?: 'top' | 'center' | 'bottom'; // TOAST only
    duration?: number; // Duration (millis) TOAST only
    closeButton?: boolean; //Show close button TOAST only
    closeButtonColor?: string; //Color of close button TOAST only

    horizontalAlign?: 'right' | 'left';
    verticalAlign?: 'bottom' | 'top';
    name?: string; //Window name.Unique name is required.
    title?: string; //Window title
    left?: number; //x coordinate of the upper left corner of the window
    top?: number; //y coordinate of the upper left corner of the window
    width?: number; //width of the window
    height?: number; //height of the window
    minWidth?: number; //The minimum width of the window
    minHeight?: number; //The minimum height of the window
    movable?: boolean; //true:You can move the window with mouse
    resizable?: true; //true:You can resize the window with mouse
    appearance?: appearanceObj; //Appearance object
    appearanceName?: string; //Preset name of appearance(Not with 'appearance')
    style?: CSSStyleDeclaration; //Style of the content. Can be specified just like inline style attribute.
    html?: string; //HTML shown in the content(Not with 'url')
    url?: string; //The URL for contents.To be shown in iframe.
    urlLoaded?: (frame: CIfFrame) => {}; //Callback function when url is finished loading.
  }

  export class JSFrame {
    create(arg?: JSFrameInitializationParameter): CIfFrame;
    createFrame(
      left: number,
      top: number,
      width: number,
      height: number,
      appearance: CFrameAppearance,
      properties: any,
    );
    getWindowByName(windowName: string): CIfFrame;
  }

  /*
CFrameAppearance class
CFrameAppearance is a class for frame appearance.You can modify frame's looking as you like.
Methods	Details
CFrameAppearance setUseIFrame(boolean)	If 'true' ,You can set CIfFrame 'IFrame mode' and you can use CIfFrame#setUrl method for opening specified url.
void onInitialize()	Since this callback method is called at frame initialization,Initialization processing such as adding frameComponent should be written here.
Members	Details
showTitleBar	true or false
showCloseButton	true or false
titleBarCaptionFontSize	ex)'12px'
titleBarCaptionFontWeight	ex)'bold'
titleBarHeight	ex)'24px'
titleBarCaptionLeftMargin	ex)'10px'
titleBarColorDefault	Color for not focused state.
ex)'#dddddd'
titleBarColorFocused	Color for focused state.
ex)'white'
titleBarCaptionColorDefault	Color for not focused state.
ex)'black'
titleBarCaptionColorFocused	Color for focused state.
ex)'red'
titleBarBorderBottomDefault	Style for bottom of the title bar.
ex)'1px solid rgba(0,0,0,0.2)'
titleBarBorderBottomFocused	If null,'titleBarBorderBottomDefault' will be applied.
frameBorderRadius	Corner radius of the window.
ex)'6px'
frameBorderWidthDefault	Width of border line in the not focused state.
ex)'1px'
frameBorderWidthFocused	Width of border line in the focused state.
ex)'1px'
frameBorderColorDefault	Color of border line in the not focused state.
ex)'rgba(1, 1, 1, 0.2)'
frameBorderColorFocused	Color of border line in the focused state.
ex)'rgba(1, 1, 1, 0.2)'
frameBorderStyle	Border line style
ex)solid
frameBoxShadow	Shadow style of the frame
ex) '5px 5px 10px rgba(0, 0, 0, 0.3)'
frameBackgroundColor	Background color of the frame
ex)'white'
*/
}
