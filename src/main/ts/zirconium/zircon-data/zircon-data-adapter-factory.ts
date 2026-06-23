/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectState } from '../zircon-core/zircon-object';
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
  private __transformData: (data: any) => any = null;
  private __compareData: (a: any, b: any) => number = null;
  private _outputDataType: string = null;
  private _inputDataType: string = null;

  public name = `zircon-data-adapter-factory`;
  public objectType = ZIRCON_DATA_ADAPTER_TYPE;
  public ancestorType: string = ZIRCON_DATA_PROVIDER_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(
    app: ZirconApplication,
    name: string,
    inputDataType: string,
    outputDataType: string,
    transformData?: (data: any) => any,
    comparData?: (a: any, b: any) => number,
  ) {
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this.name = name;
    this._inputDataType = inputDataType;
    this._outputDataType = outputDataType;
    this.__transformData = transformData;
    this.__compareData = comparData;
  }

  public async create(state: ZirconObjectState): Promise<ZirconDataAdapter> {
    return new ZirconDataAdapter(
      this._inputDataType,
      this._outputDataType,
      state as ZirconDataAdapterState,
      this.__transformData,
      this.__compareData,
    );
  }
}
