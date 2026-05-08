/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconObject, ZirconObjectState } from './zircon-object';
import {
  ZirconObjectFactory,
  ZirconFactoriesRegistry,
} from './zircon-object-factory';
import { ZirconApplication } from './zircon-app';
import { ZirconAppObject } from './zircon-app-object';
import {
  ZIRCON_OBJECT_MANAGER_TYPE,
  ZIRCON_OBJECT_TYPE,
  ZirconTypes,
} from './zircon-types';

export class ZirconObjectManager extends ZirconAppObject {
  private __registeredStates: { [id: string]: ZirconObjectState } = {}; // TODO: UI Object
  private __objectInstances: { [id: string]: ZirconObject } = {}; // TODO: UI Object
  private __objectFactoriesRegistry: ZirconFactoriesRegistry = null;

  constructor(app: ZirconApplication) {
    super(app);
  }

  public override getType(): string {
    return ZIRCON_OBJECT_MANAGER_TYPE;
  }

  public getContextMenuFactory(type: string): ZirconContextMenuFactory {
    return this.getObjectRegistry().getContextMenuFactory(type);
  }

  public getObjectRegistry(): ZirconFactoriesRegistry {
    if (!this.__objectFactoriesRegistry)
      this.__objectFactoriesRegistry = new ZirconFactoriesRegistry();
    return this.__objectFactoriesRegistry;
  }

  public getHandlingFactory(type: string): ZirconObjectFactory {
    return this.getObjectRegistry().getHandlingFactory(type);
  }

  public async registerObjectFactory(
    factory: ZirconObjectFactory,
  ): Promise<boolean> {
    if (!factory) return false;
    if (!factory.type)
      throw new Error(
        `Object factory must handle an object type. Factory name = ${factory.name}`,
      );
    if (!factory.ancestorType)
      throw new Error(
        `Object factory must inherent from an object type. Factory name = ${factory.name}. default should be ${ZIRCON_OBJECT_TYPE}`,
      );
    const existingFactory = this.getHandlingFactory(factory.type);
    if (existingFactory) {
      throw new Error(
        `Factory ${factory.name} cannot be registered for type ${factory.type}. Factory ${existingFactory.name}`,
      );
    }
    // test object creation
    if (factory.create) {
      const instance = await factory.create(null);
      if (!instance) {
        throw new Error(
          `factory ${factory.name} handling type ${factory.type} creates null objects`,
        );
      }
      if (!(instance instanceof ZirconObject)) {
        throw new Error(
          `factory ${factory.name} handling type ${factory.type} creates objects which are not ZirconObjects`,
        );
      }
    }
    // everythings ok: register factory
    this.getObjectRegistry().registerObjectFactory(factory);
    this.getLogger().info(
      `object factory ${factory.name} registered. Handled type = ${factory.type} [ancestor of ${factory.ancestorType}]`,
    );
    return true;
  }

  public getContextMenuFactories(): ZirconContextMenuFactory[] {
    return this.getObjectRegistry().getContextMenuFactories();
  }

  private async createObject(state: ZirconObjectState): Promise<ZirconObject> {
    if (!state) {
      this.getLogger().warn(`Object creation with a null state requested`);
      return null;
    }
    if (!state.type) {
      this.getLogger().error(
        `Cannot create an object with undefined type: ${JSON.stringify(state)}`,
      );
      throw new Error(
        `Cannot create an object with undefined type: ${JSON.stringify(state)}`,
      );
    }
    const instance: any = await this.getObjectRegistry().createInstance(state);
    if (!instance) {
      throw new Error(
        `Factory for object type ${state.type} does not create an object`,
      );
    }
    if (!(instance instanceof ZirconObject)) {
      throw new Error(
        `Factory for object type ${state.type} does not create an object type ZirconObject`,
      );
    }
    instance.setEventDispatcher(this.getEventDispatcher());
    return instance;
  }

  // public getWindow(id: string): ZirconWindow {
  //   return this._windows[id];
  // }

  // public getDesktop(id: string): ZirconDesktop {
  //   return this._desktops[id];
  // }

  private addInstance(obj: ZirconObject): ZirconObject {
    if (!obj) return null;
    if (this.__objectInstances[obj.getId()] === obj) return obj;
    this.__objectInstances[obj.getId()] = obj;
    return obj;
  }

  /**
   * register a new object state
   * @param state
   * @returns
   */
  public registerObjectState(state: ZirconObjectState): boolean {
    if (!state) return false;
    if (!state.id) throw new Error('Object state must have an id');
    if (!state.type)
      throw new Error(`Object ${state.id} state must have a type`);
    // Special case for dekstop manager which is unique
    // add or update state
    this.__registeredStates[state.id] = state;
    return true;
  }

  public getRegisteredObjectState(id: string): ZirconObjectState {
    return this.__registeredStates[id];
  }

  //   public registerEngineState(state: ZirconEngineState): boolean {
  //     if (!state) return false;
  //     if (!state.id) throw new Error('Engine state must have an id');
  //     if (!state.type)
  //       throw new Error(`Engine ${state.id} state must have a type`);
  //     this.__registeredEngineStates[state.id] = state;
  //     this.emit('ENGINE_STATE_REGISTERED', { state: state });
  //     return true;
  //   }

  public getExistingInstance(objectId: string, type: string): ZirconObject {
    const instance = this.__objectInstances[objectId];
    if (!instance) return null;
    if (ZirconTypes.isTypeOf(instance.getType(), type))
      throw new Error(
        `Existing object Id ${objectId} exists with type ${instance.getType()} but was requested with type ${type}`,
      );
    return instance;
  }

  public async getInstance(
    objectId: string,
    type: string,
  ): Promise<ZirconObject> {
    let instance = await this.getExistingInstance(objectId, type);
    if (instance) return instance;
    const state = this.__registeredStates[objectId];
    if (!state) {
      this.getLogger().warn(`No state associated with engine Id ${objectId}`);
      return null;
    }
    instance = await this.createObject(state);
    if (!instance)
      if (!ZirconTypes.isTypeOf(instance.getType(), type))
        throw new Error(`Object with id ${objectId} is not an engine`);
    return this.addInstance(instance);
  }

  //   private addEngineInstance(engine: ZirconEngine): ZirconEngine {
  //     if (!engine) return null;
  //     this.__engineInstances[engine.getId()] = engine;
  //     return engine;
  //   }

  public getChildrenObjectTypes(rootType: string): string[] {
    const types: string[] = [];
    Object.values(this.getObjectRegistry().getFactories()).filter(
      (factory: ZirconObjectFactory) => {
        return ZirconTypes.isTypeOf(rootType, factory.type);
      },
    );
    return types;
  }

  public getRegisteredObjectsStates(type: string): ZirconObjectState[] {
    return Object.values(this.__registeredStates).filter(
      (state: ZirconObjectState) => {
        return ZirconTypes.isTypeOf(state?.type, type);
      },
    );
  }
}
