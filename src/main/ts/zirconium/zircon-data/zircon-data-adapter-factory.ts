/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ZIRCON_DATA_ADAPTER_TYPE,
  ZIRCON_DATA_PROVIDER_TYPE,
} from '../zircon-core/zircon-types';
import {
  ZirconDataAdapter,
  ZirconDataAdapterState,
} from './zircon-data-adapter';
import { ZirconDataProviderFactory } from './zircon-data-provider-factory';

export class ZirconDataAdapterFactory extends ZirconDataProviderFactory {
  private __transformData: (data: any) => any = null;
  private _inputDataType: string = null;

  constructor(
    name: string,
    inputDataType: string,
    outputDataType: string,
    transformData?: (data: any) => any,
    compareData?: (a: any, b: any) => number,
  ) {
    super(name, outputDataType, compareData);
    this._inputDataType = inputDataType;
    this.__transformData = transformData;
  }

  protected getInputDataType(): string {
    return this._inputDataType;
  }

  public override getObjectType(): string {
    return ZIRCON_DATA_ADAPTER_TYPE;
  }

  public override getAncestorType(): string {
    return ZIRCON_DATA_PROVIDER_TYPE;
  }

  protected getTransformDataFunction(): (data: any) => any {
    return this.__transformData;
  }

  public override async createObject(state: any): Promise<any> {
    return new ZirconDataAdapter(
      this.getInputDataType(),
      this.getOutputDataType(),
      state as ZirconDataAdapterState,
      this.getTransformDataFunction(),
      this.getCompareDataFunction(),
    );
  }
}
