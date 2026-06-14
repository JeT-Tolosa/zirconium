/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZIRCON_DATA_ADAPTER_TYPE } from '../zircon-core/zircon-types';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import {
  ZirconDataProvider,
  ZirconDataProviderDescriptor,
  ZirconDataProviderEventRegistry,
  ZirconDataProviderEvents,
  ZirconDataProviderState,
} from './zircon-data-provider';
import { ZirconDataProviderManagerEvents } from './zircon-data-provider-manager';

export interface ZirconDataAdapterState extends ZirconDataProviderState {
  type: typeof ZIRCON_DATA_ADAPTER_TYPE;
  inputDataType: string;
  dataProviderSourceId: string;
}
export type ZirconDataAdapterEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderManagerEvents,
          'DATA_PROVIDER' | 'DATA_PROVIDER_REQUEST_ERROR'
        >,
        PickEvents<ZirconDataProviderEvents, 'DATA_PROVIDER_FULL_CONTENT'>,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<ZirconDataProviderManagerEvents, 'DATA_PROVIDER_REQUEST'>,
        PickEvents<
          ZirconDataProviderEvents,
          'DATA_PROVIDER_FULL_CONTENT_REQUEST'
        >,
      ]
    >;
  },
  ZirconDataProviderEventRegistry
>;

export class ZirconDataAdapter<
  Tin = any,
  Tout = any,
  R extends ZirconDataAdapterEventRegistry = ZirconDataAdapterEventRegistry,
> extends ZirconDataProvider<Tout, R> {
  private _inputDataType: string = null;
  private _dataProviderSourceId: string = null;
  private __sourceDataProvider: ZirconDataProvider = null;
  private __transformData: (data: Tin) => Tout = null;

  constructor(
    inputDataType: string,
    outputDataType: string,
    state: ZirconDataAdapterState,
    transformData?: (data: Tin) => Tout,
    compareData?: (a: Tout, b: Tout) => number,
  ) {
    super(outputDataType, state, compareData);
    this._inputDataType = inputDataType;
    this.__transformData = transformData;
    this.setState(state);
  }

  public override async setState(state: ZirconDataAdapterState): Promise<void> {
    await super.setState(state);
    if (!state) {
      return;
    }
    if (state.inputDataType !== this._inputDataType) {
      throw new Error(
        `state inputdataType ${state.inputDataType} does not match inputDataType ${this._inputDataType} in ${this.constructor.name} constructor`,
      );
    }
    this.setDataSourceId(state.dataProviderSourceId);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('DATA_PROVIDER', async (arg) => {
      if (arg.dataProvider.getId() !== this._dataProviderSourceId) {
        return;
      }
      this.setDataProviderSource(arg.dataProvider);
    });
    this.addListener('DATA_CHANGED', async (arg) => {
      if (arg.dataProviderId !== this._dataProviderSourceId) {
        return;
      }
      this.emit('DATA_PROVIDER_FULL_CONTENT_REQUEST', {
        dataProviderId: this._dataProviderSourceId,
      });
    });
    this.addListener('DATA_PROVIDER_REQUEST_ERROR', (arg) => {
      if (arg.dataProviderId !== this._dataProviderSourceId) {
        return;
      }
      this.setDataProviderSource(null);
    });
    this.addListener('DATA_PROVIDER_FULL_CONTENT', (arg) => {
      if (arg.dataProviderDescriptor.id !== this._dataProviderSourceId) {
        return;
      }
      this.onDATA_PROVIDER_FULL_CONTENT(
        arg.dataProviderDescriptor,
        arg.data as Tin,
        arg.version,
      );
    });
  }

  private onDATA_PROVIDER_FULL_CONTENT(
    dataSourceDescriptor: ZirconDataProviderDescriptor,
    data: Tin,
    _version: number,
  ): void {
    if (this.getDataSourceId() !== dataSourceDescriptor.id) {
      return;
    }
    if (this._inputDataType !== dataSourceDescriptor.dataType) {
      throw new Error(
        `Source data type ${dataSourceDescriptor.dataType} does not match adapter input type ${this._inputDataType}`,
      );
    }
    if (!this.__transformData) {
      throw new Error(
        `adapter input data ${this.getDataSourceId()} received but no data transform function provided for ${this.getId()} / ${this.getName()}`,
      );
    }
    this.setData(this.__transformData(data));
  }

  private setDataSourceId(dataProviderSourceId: string): void {
    this._dataProviderSourceId = dataProviderSourceId;
    this.requestSourceDataProvider();
  }

  public getDataSourceId(): string {
    return this._dataProviderSourceId;
  }

  public getSourceDataProvider(): ZirconDataProvider {
    if (!this.__sourceDataProvider) {
      this.requestSourceDataProvider();
    }
    return this.__sourceDataProvider;
  }

  private requestSourceDataProvider(): void {
    this.emit('DATA_PROVIDER_REQUEST', {
      dataProviderId: this._dataProviderSourceId,
    });
  }

  private setDataProviderSource(dataProvider: ZirconDataProvider): void {
    if (this.__sourceDataProvider) {
      this.__sourceDataProvider.unsetEventDispatcher();
    }
    this.__sourceDataProvider = dataProvider;
  }
}
