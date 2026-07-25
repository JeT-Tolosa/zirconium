/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconObject, ZirconObjectState } from './zircon-object';
import {
  ZIRCON_FACTORY_LEVEL_NONE,
  ZirconObjectFactory,
} from './zircon-object-factory';
import { ZirconApplication } from './zircon-app';
import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
} from './zircon-app-object';
import {
  ZIRCON_OBJECT_MANAGER_TYPE,
  ZIRCON_OBJECT_TYPE,
  ZIRCON_OBJECTS_HIERARCHY,
  ZirconType,
} from './zircon-types';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';

export type ZirconObjectManagerEvents = {
  // ZIRCON_OBJECT_STATE_REQUEST: { id: string };
  // OBJECT_STATE_REGISTERED: { state: ZirconObjectState };
  // ZIRCON_OBJECT_STATE: { state: ZirconObjectState };
  GET_STATE_SNAPSHOT_REQUEST: { id: string };
  GET_STATE_SNAPSHOT_ERROR: { id: string; error: string };
  STORE_STATE_SNAPSHOT_REQUEST: { state: ZirconObjectState };
  STATE_SNAPSHOT_REGISTERED: { state: ZirconObjectState };
  STATE_SNAPSHOT_UNREGISTERED: { id: string };
  STATE_SNAPSHOT_MODIFIED: { state: ZirconObjectState };
  STATE_SNAPSHOT: { state: ZirconObjectState };
};

export type ZirconObjectManagerEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconObjectManagerEvents,
          'GET_STATE_SNAPSHOT_REQUEST' | 'STORE_STATE_SNAPSHOT_REQUEST'
        >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconObjectManagerEvents,
          'STATE_SNAPSHOT_REGISTERED' | 'STATE_SNAPSHOT'
        >,
      ]
    >;
  },
  ZirconAppObjectEventRegistry
>;

export class ZirconObjectManager<
  R extends ZirconObjectManagerEventRegistry = ZirconObjectManagerEventRegistry,
> extends ZirconAppObject<R> {
  private __registeredStates: { [id: string]: ZirconObjectState } = {}; // TODO: UI Object
  private __objectInstances: { [id: string]: ZirconObject } = {}; // TODO: UI Object
  private __objectFactories: { [id: string]: ZirconObjectFactory } = {};
  private __objectHierarchy: { [id: string]: string } = {};

  constructor(app: ZirconApplication) {
    super(app);
    // initialize object hierarchy with default ZIRCON values
    Object.keys(ZIRCON_OBJECTS_HIERARCHY).forEach((key) => {
      this.__objectHierarchy[key] = ZIRCON_OBJECTS_HIERARCHY[key]
        .parent as string;
    });
  }

  protected override listenToEvents(): void {
    this.addListener('GET_STATE_SNAPSHOT_REQUEST', (arg) => {
      if (arg.id) {
        this.emit('STATE_SNAPSHOT', {
          state: this.__registeredStates[arg.id],
        });
      }
    });
    this.addListener('STORE_STATE_SNAPSHOT_REQUEST', (arg) => {
      this.registerObjectState(arg.state);
    });
  }

  public override getType(): string {
    return ZIRCON_OBJECT_MANAGER_TYPE;
  }

  public async registerObjectFactory(
    factory: ZirconObjectFactory,
  ): Promise<boolean> {
    if (!factory) {
      return false;
    }
    const factoryName = factory.getName();
    if (!factoryName) {
      throw new Error(`Object factory must have a name...`);
    }
    const objectType = factory.getObjectType();
    if (!factory.getAncestorType()) {
      throw new Error(
        `Object factory must be a child of an object type. Factory name = ${factoryName}. default should be ${ZIRCON_OBJECT_TYPE}`,
      );
    }
    const existingFactory = this.__objectFactories[factoryName];
    if (existingFactory && existingFactory !== factory) {
      throw new Error(
        `Two factories named ${factoryName} conflict. Already registered factory = ${JSON.stringify(existingFactory)}. New on registration factory = ${JSON.stringify(factory)}`,
      );
    }
    // test object creation
    if (factory.create) {
      const instance = await factory.create(null);
      if (!instance) {
        throw new Error(
          `factory ${factoryName} handling type ${objectType} creates null objects`,
        );
      }
      if (!(instance instanceof ZirconObject)) {
        throw new Error(
          `factory ${factoryName} handling type ${objectType} creates objects which are not ZirconObjects`,
        );
      }
      if (!this.isTypeOf(instance.getType(), objectType)) {
        throw new Error(
          `Factory ${factoryName} for object type ${objectType} creates a wrong object type ${instance.getType()}`,
        );
      }
    }

    // everythings ok: register factory
    this.getLogger().info(
      `object factory ${factoryName} registered. Handled type = ${factory.getObjectType()} [ancestor of ${factory.getAncestorType()}]`,
    );

    // store object hierarchy
    this.__objectFactories[factory.getName()] = factory;
    if (!factory.getAncestorType()) {
      throw new Error(
        `Factory ${factory.getName()} has no ancestor type defined`,
      );
    }
    if (
      this.__objectHierarchy[factory.getObjectType()] &&
      this.__objectHierarchy[factory.getObjectType()] !==
        factory.getAncestorType()
    ) {
      throw new Error(
        `Factory ${factory.getName()} has an ancestor type ${factory.getAncestorType()} which is different from the one already registered for this object type ${this.__objectHierarchy[factory.getObjectType()]}`,
      );
    }
    this.__objectHierarchy[factory.getObjectType()] = factory.getAncestorType();
    console.log(
      'REGISTER FACTORY',
      factory.getName(),
      factory.getObjectType(),
      factory.getAncestorType(),
    );
    return true;
  }

  public getFactories(): ZirconObjectFactory[] {
    return Object.values(this.__objectFactories);
  }

  // public getHandledTypes(): string[] {
  //   return Object.keys(this.__objectFactories);
  // }

  private getFactory(state: any): ZirconObjectFactory {
    if (!state) {
      return null;
    }
    // if a factory is set, use it
    if (state.factoryId) {
      return this.__objectFactories[state.factoryId];
    }
    // else, choose the most appropriate one
    const handlingLevels: { [level: number]: ZirconObjectFactory[] } = {};
    let maxLevel: number = 0;
    Object.values(this.__objectFactories).forEach((factory) => {
      if (!factory) {
        throw new Error(
          `A null factory has been registereed. It should not happen`,
        );
      }
      const level = factory.handlingLevel(state);
      (handlingLevels[level] ??= []).push(factory);
      maxLevel = Math.max(maxLevel, level);
    });

    if (maxLevel <= ZIRCON_FACTORY_LEVEL_NONE) {
      return null;
    }
    const availableFactories: ZirconObjectFactory[] = handlingLevels[maxLevel];
    if (!availableFactories) {
      throw new Error(
        `Available factories array is null. It should not happen`,
      );
    }
    if (availableFactories.length === 0) {
      throw new Error(
        `Available factories array is empty. It should not happen`,
      );
    }
    if (availableFactories.length > 1) {
      throw new Error(
        `More than one (${availableFactories.length}) available factory for state ${JSON.stringify(state)} with level ${maxLevel}: ${JSON.stringify(availableFactories.map((e) => e.getName()))}`,
      );
    }
    return availableFactories[0];
  }

  public createInstance(state: any): Promise<any> {
    if (!state) {
      throw new Error(`Cannot create an object with a null state`);
    }
    const factory: ZirconObjectFactory = this.getFactory(state);
    if (!factory) {
      throw new Error(
        `Object type ${state.type} has no associated Factory. Please add one for this type using Application.registerObjectFactory(factory: ZirconObjectFactory)`,
      );
    }
    return factory.create(state);
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
    const instance: any = await this.createInstance(state);
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
    if (instance.getType() !== state.type) {
      throw new Error(
        `Factory for object type ${state.type} creates a wrong object type ${instance.getType()}`,
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
    if (!obj) {
      return null;
    }
    if (this.__objectInstances[obj.getId()] === obj) {
      return obj;
    }
    this.__objectInstances[obj.getId()] = obj;
    return obj;
  }

  /**
   * register a new object state
   * @param state
   * @returns
   */
  public registerObjectState(state: ZirconObjectState): boolean {
    if (!state) {
      return false;
    }
    if (!state.id) {
      throw new Error('Object state must have an id');
    }
    if (!state.type) {
      throw new Error(`Object ${state.id} state must have a type`);
    }
    // add or update state
    this.__registeredStates[state.id] = state;
    this.emit('STATE_SNAPSHOT_REGISTERED', { state: state });
    return true;
  }

  public getRegisteredObjectState(id: string): ZirconObjectState {
    return this.__registeredStates[id];
  }

  public getExistingInstance(
    objectId: string,
    type: ZirconType = ZIRCON_OBJECT_TYPE,
  ): ZirconObject | null {
    const instance = this.__objectInstances[objectId];
    if (!instance) {
      return null;
    }
    if (!this.isTypeOf(instance.getType(), type as string)) {
      throw new Error(
        `Existing object Id ${objectId} exists with type ${instance.getType()} but was requested with type ${type}`,
      );
    }
    return instance;
  }

  public async getInstance(
    objectId: string,
    type: ZirconType = ZIRCON_OBJECT_TYPE,
  ): Promise<ZirconObject> {
    let instance = await this.getExistingInstance(objectId, type);
    if (instance) {
      return instance;
    }
    const state = this.__registeredStates[objectId];
    if (!state) {
      this.getLogger().warn(`No state associated with object Id ${objectId}`);
      return null;
    }
    instance = await this.createObject(state);
    if (!instance) {
      if (!this.isTypeOf(instance.getType(), type as string)) {
        throw new Error(
          `Object with id ${objectId} is not the expected class: ${instance.getType()} which is not ofType ${type}`,
        );
      }
    }
    this.addInstance(instance);
    return instance;
  }

  public getContextMenuFactoriesByType(
    type: string,
  ): ZirconContextMenuFactory[] {
    return Object.values(this.__objectFactories)
      .filter((factory) => {
        return factory?.getObjectType() === type;
      })
      .map((factory) => {
        return factory.getContextMenuFactory();
      })
      .filter((factory) => {
        return factory !== null;
      });
  }

  public getContextMenuFactories(): ZirconContextMenuFactory[] {
    return Object.values(this.__objectFactories)
      .map((factory) => {
        return factory.getContextMenuFactory();
      })
      .filter((factory) => {
        return factory !== null;
      });
  }

  public getChildrenObjectTypes(rootType: string): string[] {
    if (!rootType) {
      return;
    }
    return Object.values(this.getFactories())
      .filter((factory: ZirconObjectFactory) => {
        return this.isTypeOf(factory.getObjectType(), rootType);
      })
      .map((factory: ZirconObjectFactory) => {
        return factory.getObjectType();
      });
  }

  public getRegisteredObjectsStates(
    type: string = ZIRCON_OBJECT_TYPE,
  ): ZirconObjectState[] {
    if (!type) {
      return;
    }
    return Object.values(this.__registeredStates).filter(
      (state: ZirconObjectState) => {
        return this.isTypeOf(state?.type, type);
      },
    );
  }

  public getExistingObjects(type: string = ZIRCON_OBJECT_TYPE): ZirconObject[] {
    const states: ZirconObjectState[] = this.getRegisteredObjectsStates(type);
    const objects: ZirconObject[] = states
      .map((state: ZirconObjectState) => {
        return this.getApplication()
          .getObjectManager()
          .getExistingInstance(state.id);
      })
      .filter((v) => v !== null);
    return objects;
  }

  public isTypeOf(type: string, parentType: string): boolean {
    let current: string | null = type;
    while (current) {
      if (current === parentType) {
        return true;
      }
      current = this.__objectHierarchy[current];
    }
    return false;
  }

  public getTypeHierarchy(type: string): string[] {
    const hierarchy: string[] = [];
    let current: string | null = type;
    while (current) {
      hierarchy.push(current);
      current = this.__objectHierarchy[current];
    }
    return hierarchy;
  }
}
