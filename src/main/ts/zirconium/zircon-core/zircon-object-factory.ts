/* eslint-disable @typescript-eslint/no-explicit-any */
import { jQueryFactory } from 'jquery/factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconObject, ZirconObjectState } from './zircon-object';

export interface ZirconObjectFactory<
  TState extends ZirconObjectState = ZirconObjectState,
  TObject extends ZirconObject = ZirconObject,
> {
  name: string;
  objectType: string;
  ancestorType: string;
  create: (state: TState) => Promise<TObject>;
  contextMenuFactory: ZirconContextMenuFactory;
}

// export function createObjectFactory<TState, TObject>(
//   name: string,
//   type: string,
//   ancestorType: string,
//   create: (state: TState) => Promise<TObject> = null,
//   contextMenuFactory: ZirconContextMenuFactory = null,
// ) {
//   return {
//     name: name,
//     type: type,
//     ancestorType: ancestorType,
//     create: create,
//     contextMenuFactory: contextMenuFactory,
//   };
// }

export class ZirconFactoriesRegistry {
  private _objectFactories: {
    [type: string]: ZirconObjectFactory<any, any>;
  } = {};

  constructor() {}

  public registerObjectFactory(
    factory: ZirconObjectFactory<any, any>,
  ): boolean {
    if (!factory) {
      return false;
    }
    if (!factory.objectType) {
      throw new Error(
        `Asked to register a valid factory with invalid type ... factory = ${jQueryFactory.name}`,
      );
    }
    if (this._objectFactories[factory.objectType]) {
      return false;
    }
    this._objectFactories[factory.objectType] = factory;
    return true;
  }

  /**
   * Look if handeled types contains the state type
   * @param state
   * @returns
   */
  public isHandled(state: ZirconObjectState): boolean {
    if (!state) {
      return false;
    }
    if (!state.type) {
      throw new Error(
        `Object states with undefined type are not allowed ID = ${state.id}`,
      );
    }
    return true;
  }

  public getHandlingFactory(type: string): ZirconObjectFactory {
    if (!type) {
      return null;
    }
    return this._objectFactories[type];
  }

  public getFactories(): ZirconObjectFactory[] {
    return Object.values(this._objectFactories);
  }

  public getHandledTypes(): string[] {
    return Object.keys(this._objectFactories);
  }

  public createInstance(state: any): Promise<any> | null {
    if (!this.isHandled(state)) {
      return null;
    }
    if (!state.type) {
      throw new Error(
        `Object state has no type defined:  ${JSON.stringify(state)}}`,
      );
    }
    if (!this._objectFactories[state.type]) {
      throw new Error(
        `Object type ${state.type} has no associated Factory. Please add one for this type using Application.registerObjectFactory(factory: ZirconObjectFactory)`,
      );
    }
    return this._objectFactories[state.type].create(state);
  }

  public getContextMenuFactory(type: string): ZirconContextMenuFactory {
    return this._objectFactories[type]?.contextMenuFactory;
  }

  public getContextMenuFactories(): ZirconContextMenuFactory[] {
    return Object.values(this._objectFactories)
      .map((factory) => {
        return factory.contextMenuFactory;
      })
      .filter((factory) => {
        return factory !== null;
      });
  }
}

export abstract class SimpleZirconObjectFactory implements ZirconObjectFactory {
  name: string = null;
  objectType: string = null;
  ancestorType: string = null;
  create: (state: any) => Promise<any>;
  contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(objectType: string, ancestorType: string) {
    this.name = `${objectType}-factory`;
    this.objectType = objectType;
    this.ancestorType = ancestorType;
    this.create = (state: ZirconObjectState) => {
      return this.createObject(state);
    };
    this.contextMenuFactory = null;
  }

  public abstract createObject(state: ZirconObjectState): Promise<any> | null;

  /**
   * default context menu is null. override this method if necessary
   * @returns
   */
  public createContextMenu(): ZirconContextMenuFactory {
    return null;
  }
}
