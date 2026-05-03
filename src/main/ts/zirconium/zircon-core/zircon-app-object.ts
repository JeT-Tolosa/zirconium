import {
  ZirconObject,
  ZirconObjectState,
  ZirconObjectEventRegistry,
} from '../zircon-object';
import { ZirconApplication } from './zircon-app';
import { MergeZirconRegistries } from '../zircon-event';
import { ZIRCON_APP_OBJECT_TYPE } from './zircon-types';

/**
 * Base state for all zircon objects UI
 */
export interface ZirconAppObjectState extends ZirconObjectState {
  type?: typeof ZIRCON_APP_OBJECT_TYPE;
}

export type ZirconAppObjectEvents = {};

export type ZirconAppObjectEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconObjectEventRegistry
>;

/**
 * A Zircon Object is the base class of managed zircon components:
 * - ZirconDesktopManager
 * - ZirconDesktop
 * - ZirconWindow
 */
export abstract class ZirconAppObject<
  R extends ZirconAppObjectEventRegistry = ZirconAppObjectEventRegistry,
> extends ZirconObject<R> {
  private _application: ZirconApplication = null;

  /**
   * constructor
   * @param app the application this object belongs to
   */
  constructor(app: ZirconApplication, state?: ZirconAppObjectState) {
    super(state);
    this._application = app;
    this.setEventDispatcher(app.getEventDispatcher());
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
  }

  // private onVISUALIZER_REFRESH_REQUEST(vizId: string): void {
  //   if (this.getId() !== vizId) return;
  //   if (this.refreshDisplay()) {
  //     this.emit('VISUALIZER_DISPLAYED', {
  //       vizId: vizId,
  //       timestamp: Date.now(),
  //     });
  //   }
  // }

  public refreshDisplay(): boolean {
    // do nothing by default
    return true;
  }

  /**
   * get the application UI
   * @returns
   */
  public getApplication(): ZirconApplication {
    return this._application;
  }

  /**
   * Get the state of this UI Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconAppObjectState {
    return {
      ...super.generateCurrentState(),
    };
  }
}
