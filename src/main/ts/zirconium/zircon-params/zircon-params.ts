import { ZirconObject, ZirconObjectEventRegistry } from '../zircon-object';
import { ZirconWindowState } from '../zircon-ui/zircon-window';
import { MergeZirconRegistries } from '../zircon-event';

export const ZIRCON_WINDOW_PARAMETERS_TYPE: string = 'zircon-window-parameters';

export interface ZirconWindowParametersState extends ZirconWindowState {}

export type ZirconParametersEvents = {};

export type ZirconParametersEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconObjectEventRegistry
>;

/**
 * Zircon Parameters window displays parameters for a given window
 */
export class ZirconParametersDiv<
  R extends ZirconParametersEventRegistry,
> extends ZirconObject<R> {
  private _mainDiv: HTMLDivElement = null;

  /**
   * constructor
   * @param descriptor
   */
  constructor() {
    super();
  }

  /**
   * Get the main Div for this parameters set
   * @returns
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    return this._mainDiv;
  }
}
