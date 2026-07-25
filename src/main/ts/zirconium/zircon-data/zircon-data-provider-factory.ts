import { ZirconObjectFactory } from '../zircon-core/zircon-object-factory';
import {
  ZIRCON_DATA_PROVIDER_TYPE,
  ZIRCON_OBJECT_TYPE,
} from '../zircon-core/zircon-types';
import {
  ZirconDataProvider,
  ZirconDataProviderState,
} from './zircon-data-provider';

export class ZirconDataProviderFactory extends ZirconObjectFactory {
  private __compareData: (a: unknown, b: unknown) => number = null;
  private _outputDataType: string = null;

  constructor(
    name: string,
    outputDataType: string,
    compareData?: (a: unknown, b: unknown) => number,
  ) {
    super(name);
    this._outputDataType = outputDataType;
    this.__compareData = compareData;
  }

  public override getAncestorType(): string {
    return ZIRCON_OBJECT_TYPE;
  }
  public override getObjectType(): string {
    return ZIRCON_DATA_PROVIDER_TYPE;
  }

  protected getOutputDataType(): string {
    return this._outputDataType;
  }

  protected getCompareDataFunction(): (a: unknown, b: unknown) => number {
    return this.__compareData;
  }

  public override async createObject(
    state: ZirconDataProviderState,
  ): Promise<ZirconDataProvider> {
    const instance = new ZirconDataProvider(
      this.getOutputDataType(),
      this.getCompareDataFunction(),
    );
    await instance.setState(state);
    return instance;
  }
}
