import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from '../zircon-core/zircon-object-factory';
import {
  ZIRCON_DATA_ADAPTER_TYPE,
  ZIRCON_DATA_PROVIDER_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import {
  ZirconDataAdapter,
  ZirconDataAdapterState,
} from './zircon-data-adapter';

export class ZirconDataAdapterFactory implements ZirconObjectFactory<
  ZirconDataAdapterState,
  ZirconDataAdapter
> {
  private __transformData: (data: unknown) => unknown = null;
  private __compareData: (a: unknown, b: unknown) => number = null;
  private _outputDataType: string = null;
  private _inputDataType: string = null;

  public name = `zircon-desktop-factory`;
  public type = ZIRCON_DATA_ADAPTER_TYPE;
  public ancestorType: string = ZIRCON_DATA_PROVIDER_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(
    app: ZirconApplication,
    name: string,
    type: string,
    inputDataType: string,
    outputDataType: string,
    transformData?: (data: unknown) => unknown,
    comparData?: (a: unknown, b: unknown) => number,
  ) {
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this.name = name;
    this.type = type;
    this.ancestorType = ZIRCON_DATA_ADAPTER_TYPE;
    this._inputDataType = inputDataType;
    this._outputDataType = outputDataType;
    this.__transformData = transformData;
    this.__compareData = comparData;
  }

  public async create(
    state: ZirconDataAdapterState,
  ): Promise<ZirconDataAdapter> {
    return new ZirconDataAdapter(
      this._inputDataType,
      this._outputDataType,
      state,
      this.__transformData,
      this.__compareData,
    );
  }
}
