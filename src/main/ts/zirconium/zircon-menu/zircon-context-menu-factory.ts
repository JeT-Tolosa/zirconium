import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconContextMenuItem } from './zircon-context-menu';

/**
 * Registry of all ContextMenu Factories
 */
export class ZirconContextMenuFactoryRegistry {
  private __appUI: ZirconApplication = null;
  private __factories: ZirconContextMenuFactory[] = [];

  constructor(appUI: ZirconApplication) {
    this.__appUI = appUI;
  }

  public getApplication(): ZirconApplication {
    return this.__appUI;
  }

  public registerFactory(factory: ZirconContextMenuFactory): void {
    this.__factories.push(factory);
  }

  public getFactories(): ZirconContextMenuFactory[] {
    return this.__factories;
  }
}

/**
 * Base class of ContextMenu Factories
 */
export abstract class ZirconContextMenuFactory {
  private __appUI: ZirconApplication = null;

  constructor(appUI: ZirconApplication) {
    this.__appUI = appUI;
  }

  public getApplication(): ZirconApplication {
    return this.__appUI;
  }

  public abstract getContextMenuElements(
    element: Element,
  ): ZirconContextMenuItem[];

  public abstract handledThisElement(element: Element): boolean;
}
