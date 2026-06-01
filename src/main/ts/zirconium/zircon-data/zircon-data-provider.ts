import {
  ZirconObject,
  ZirconObjectEventRegistry,
  ZirconObjectState,
} from '../zircon-core/zircon-object';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';

export const ZIRCON_DATA_PROVIDER_TYPE = 'zircon-data-provider-type';

export interface ZirconDataProviderDescriptor {
  id: string;
  name: string;
  type: string;
  dataType: string;
}

export type ZirconDataProviderEvents = {
  DATA_PROVIDER_CONTENT_REQUEST: { dataProviderId: string };
  DATA_PROVIDER_CONTENT: {
    dataProviderDescriptor: ZirconDataProviderDescriptor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  };
};

export type ZirconDataProviderEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<ZirconDataProviderEvents, 'DATA_PROVIDER_CONTENT_REQUEST'>]
    >;
    outgoing: MergePickEvents<
      [PickEvents<ZirconDataProviderEvents, 'DATA_PROVIDER_CONTENT'>]
    >;
  },
  ZirconObjectEventRegistry
>;

export interface ZirconDataProviderState extends ZirconObjectState {
  type: typeof ZIRCON_DATA_PROVIDER_TYPE;
  dataType: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ZirconDataProvider<
  T = any,
  R extends ZirconDataProviderEventRegistry = ZirconDataProviderEventRegistry,
> extends ZirconObject<R> {
  private _dataType: string = null;
  private _data: T = null;
  private __onDataChangeCB: () => void = null;

  constructor(name: string, dataType: string) {
    super({ name: name, type: ZIRCON_DATA_PROVIDER_TYPE });
    this._dataType = dataType;
  }

  public getData(): T {
    return this._data;
  }

  public getDataType(): string {
    return this._dataType;
  }

  public setDataType(dataType: string): void {
    this._dataType = dataType;
  }

  public getType(): string {
    return ZIRCON_DATA_PROVIDER_TYPE;
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('DATA_PROVIDER_CONTENT_REQUEST', (arg) =>
      this.onDATA_PROVIDER_CONTENT_REQUEST(arg.dataProviderId),
    );
  }

  private onDATA_PROVIDER_CONTENT_REQUEST(dataProviderId: string): void {
    if (dataProviderId === this.getId()) {
      this.emit('DATA_PROVIDER_CONTENT', {
        dataProviderDescriptor: this.getDescriptor(),
        data: this.getData(),
      });
    }
  }

  public getDescriptor(): ZirconDataProviderDescriptor {
    return {
      id: this.getId(),
      name: this.getName(),
      type: this.getType(),
      dataType: this.getDataType(),
    };
  }

  public setData(data: T): void {
    this._data = data;
    this.emit('DATA_PROVIDER_CONTENT', {
      dataProviderDescriptor: this.getDescriptor(),
      data: this.getData(),
    });
  }

  // /**
  //  * Registers a callback invoked when the data source content changes.
  //  * @param onChangeCB Callback function
  //  */
  // public onDataChange(onDataChangeCB: () => void): void {
  //   this.__onDataChangeCB = onDataChangeCB;
  // }

  // /**
  //  * Notifies listeners that the source content has changed.
  //  */
  // protected fireDataChanged(): void {
  //   if (this.__onDataChangeCB) {
  //     this.__onDataChangeCB();
  //   }
  // }
}
