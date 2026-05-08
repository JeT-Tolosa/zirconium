/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconObjectState } from './zircon-object';

export interface ZirconObjectFactory {
  name: string;
  type: string;
  ancestorType: string;
  create: (state: any) => Promise<any>;
  contextMenuFactory: ZirconContextMenuFactory;
}

export function createObjectFactory(
  name: string,
  type: string,
  ancestorType: string,
  create: (state: any) => Promise<any>,
  contextMenuFactory: ZirconContextMenuFactory = null,
) {
  return {
    name: name,
    type: type,
    ancestorType: ancestorType,
    create: create,
    contextMenuFactory: contextMenuFactory,
  };
}

export class ZirconFactoriesRegistry {
  private _objectFactories: { [type: string]: ZirconObjectFactory } = {};

  constructor() {}

  public registerObjectFactory(record: ZirconObjectFactory): boolean {
    if (!record) return false;
    if (this._objectFactories[record.type]) return false;
    this._objectFactories[record.type] = record;
    return true;
  }

  /**
   * Look if handeled types contains the state type
   * @param state
   * @returns
   */
  public isHandled(state: ZirconObjectState): boolean {
    if (!state) return false;
    if (!state.type)
      throw new Error(
        `Object states with undefined type are not allowed ID = ${state.id}`,
      );
    return true;
  }

  public getHandlingFactory(type: string): ZirconObjectFactory {
    if (!type) return null;
    return this._objectFactories[type];
  }

  public getFactories(): ZirconObjectFactory[] {
    return Object.values(this._objectFactories);
  }

  public getHandledTypes(): string[] {
    return Object.keys(this._objectFactories);
  }

  public async createInstance(state: any): Promise<any> {
    if (!this.isHandled(state)) return null;
    if (!this._objectFactories[state.type]?.create) return null;
    return this._objectFactories[state.type]?.create(state);
  }

  public getContextMenuFactory(type: string): ZirconContextMenuFactory {
    return this._objectFactories[type]?.contextMenuFactory;
  }

  public getContextMenuFactories(): ZirconContextMenuFactory[] {
    return Object.values(this._objectFactories).map((record) => {
      return record.contextMenuFactory;
    });
  }
}

export abstract class SimpleZirconObjectFactory implements ZirconObjectFactory {
  name: string = null;
  type: string = null;
  ancestorType: string = null;
  create: (state: any) => Promise<any>;
  contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(type: string, ancestorType: string) {
    this.name = `${type}-factory`;
    this.type = type;
    this.ancestorType = ancestorType;
    this.create = (state: any) => {
      return this.createObject(state);
    };
    this.contextMenuFactory = this.createContextMenu();
  }

  public abstract createObject(state: any): Promise<any>;

  /**
   * default context menu is null. override this method if necessary
   * @returns
   */
  public createContextMenu(): ZirconContextMenuFactory {
    return null;
  }
}
