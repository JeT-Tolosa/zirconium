/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';

export const ZIRCON_FACTORY_LEVEL_NONE = 0;
export const ZIRCON_FACTORY_LEVEL_TYPE = 10;
export const ZIRCON_FACTORY_LEVEL_SUBTYPE = 100;
export const ZIRCON_FACTORY_LEVEL_FACTORY = 1000;

export abstract class ZirconObjectFactory {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public abstract createObject(state: any): Promise<any>;
  public abstract getAncestorType(): string;
  public abstract getObjectType(): string;

  public create(state: any): Promise<any> {
    return this.createObject(state);
  }

  // default behaviour: check factoryId then type
  public handlingLevel(state: any): number {
    if (!state || !state.type) {
      return ZIRCON_FACTORY_LEVEL_NONE;
    }
    if (state.factoryId) {
      return ZIRCON_FACTORY_LEVEL_FACTORY;
    }
    if (state.type === this.getObjectType()) {
      return ZIRCON_FACTORY_LEVEL_TYPE;
    }
    return ZIRCON_FACTORY_LEVEL_NONE;
  }

  // by default context menu is not defined
  public getContextMenuFactory(): ZirconContextMenuFactory {
    return null;
  }
}

export class SimpleZirconObjectFactory extends ZirconObjectFactory {
  private _objectType: string = null;
  private _ancestorType: string = null;
  private _create: (state: any) => Promise<any>;
  private _contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(
    objectType: string,
    ancestorType: string,
    create: (state: any) => Promise<any>,
    contextMenuFactory: ZirconContextMenuFactory,
  ) {
    super(`${objectType}-factory`);
    this._objectType = objectType;
    this._ancestorType = ancestorType;
    this._contextMenuFactory = contextMenuFactory;
    this._create = create;
  }

  public override getAncestorType(): string {
    return this._ancestorType;
  }

  public override getObjectType(): string {
    return this._objectType;
  }

  public override getContextMenuFactory(): ZirconContextMenuFactory {
    return this._contextMenuFactory;
  }

  public override createObject(state: any): Promise<any> {
    return this._create(state);
  }
}
