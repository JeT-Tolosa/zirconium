/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';

export abstract class ZirconAppObjectFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication, name: string) {
    super(name);
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this._app = app;
  }

  public getApplication(): ZirconApplication {
    return this._app;
  }
}

export class SimpleZirconAppObjectFactory extends ZirconAppObjectFactory {
  private _objectType: string = null;
  private _ancestorType: string = null;
  private _create: (app: ZirconApplication, state: any) => Promise<any>;
  private _contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(
    app: ZirconApplication,
    objectType: string,
    ancestorType: string,
    create: (app: ZirconApplication, state: any) => Promise<any>,
    contextMenuFactory: ZirconContextMenuFactory,
  ) {
    super(app, `${objectType}-factory`);
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
    return this._create(this.getApplication(), state);
  }
}
