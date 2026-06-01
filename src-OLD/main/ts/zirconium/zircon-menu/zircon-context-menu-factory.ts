import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconContextMenuItem } from './zircon-context-menu';

/**
 * Base class of ContextMenu Factories
 */
export abstract class ZirconContextMenuFactory {
  private __app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this.__app = app;
  }

  public getApplication(): ZirconApplication {
    return this.__app;
  }

  public abstract getContextMenuElements(
    element: Element,
  ): ZirconContextMenuItem[];

  public abstract handledThisElement(element: Element): boolean;
}
