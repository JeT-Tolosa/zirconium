import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from '../zircon-core/zircon-object-factory';
import {
  ZIRCON_DATA_PROVIDER_TYPE,
  ZIRCON_OBJECT_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import {
  ZirconDataProvider,
  ZirconDataProviderState,
} from './zircon-data-provider';

export class ZirconDataProviderFactory implements ZirconObjectFactory<
  ZirconDataProviderState,
  ZirconDataProvider
> {
  private __compareData: (a: unknown, b: unknown) => number = null;
  private _outputDataType: string = null;

  public name = `zircon-data-provider-factory`;
  public objectType = ZIRCON_DATA_PROVIDER_TYPE;
  public ancestorType: string = ZIRCON_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(
    app: ZirconApplication,
    name: string,
    outputDataType: string,
    comparData?: (a: unknown, b: unknown) => number,
  ) {
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this.name = name;
    this._outputDataType = outputDataType;
    this.__compareData = comparData;
  }

  public async create(
    state: ZirconDataProviderState,
  ): Promise<ZirconDataProvider> {
    return new ZirconDataProvider(
      this._outputDataType,
      state,
      this.__compareData,
    );
  }
}
