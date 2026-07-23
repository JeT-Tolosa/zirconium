import {
  ZirconObject,
  ZirconObjectEventRegistry,
  ZirconObjectState,
} from '../zircon-core/zircon-object';
import {
  ZIRCON_DATA_PROVIDER_DEFAULT_TYPE,
  ZIRCON_DATA_PROVIDER_TYPE,
} from '../zircon-core/zircon-types';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';

export interface ZirconDataProviderDescriptor {
  id: string;
  name: string;
  type: string;
  outputDataType: string;
}

export interface DiffData {
  baseVersion: number;
  newVersion: number;
  added: unknown[];
  removed: unknown[];
  modified: unknown[]; // modified are usefull only if you can identify items (e.g., by id) and want to send only the changed properties
}

export type ZirconDataProviderEvents = {
  DATA_PROVIDER_FULL_CONTENT_REQUEST: { dataProviderId: string };
  DATA_PROVIDER_DIFF_CONTENT_REQUEST: {
    dataProviderId: string;
    baseVersion: number;
  };

  DATA_PROVIDER_FULL_CONTENT: {
    dataProviderDescriptor: ZirconDataProviderDescriptor;
    data: unknown;
    version: number;
  };

  DATA_PROVIDER_DIFF_CONTENT: {
    dataProviderDescriptor: ZirconDataProviderDescriptor;
    diffData: DiffData;
    baseVersion: number;
    version: number;
  };

  DATA_PROVIDER_CHANGED: {
    dataProviderDescriptor: ZirconDataProviderDescriptor;
    version: number;
  };
};
export type ZirconDataProviderEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderEvents,
          | 'DATA_PROVIDER_FULL_CONTENT_REQUEST'
          | 'DATA_PROVIDER_DIFF_CONTENT_REQUEST'
        >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderEvents,
          | 'DATA_PROVIDER_FULL_CONTENT'
          | 'DATA_PROVIDER_DIFF_CONTENT'
          | 'DATA_PROVIDER_CHANGED'
        >,
      ]
    >;
  },
  ZirconObjectEventRegistry
>;

export interface ZirconDataProviderState extends ZirconObjectState {
  type: typeof ZIRCON_DATA_PROVIDER_TYPE;
  outputDataType: string;
  active?: boolean;
  minEventEmissionThresholdInterval?: number; // min time between two DATA_CHANGED event
}

function compareDefaultData<T>(a: T, b: T): number {
  if (a === undefined && b === undefined) {
    return 0;
  }
  if (a === undefined && b !== undefined) {
    return 1;
  }
  if (a !== undefined && b === undefined) {
    return -1;
  }
  if (a === null && b === null) {
    return 0;
  }
  if (a === null && b !== null) {
    return 1;
  }
  if (a !== null && b === null) {
    return -1;
  }
  return JSON.stringify(a) === JSON.stringify(b) ? 0 : -1;
}

export class ZirconDataProvider<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any,
  R extends ZirconDataProviderEventRegistry = ZirconDataProviderEventRegistry,
> extends ZirconObject<R> {
  private _outputDataType: string = null; // output data type
  private _active: boolean = false;
  private _minEventEmissionThresholdInterval: number = 0; // in milliseconds
  private __lastEmitTime: number = null;
  private __data: T = null;
  private __version: number = 0;
  private __compareElements: (a: T, b: T) => number = compareDefaultData;

  constructor(
    outDataType: string,
    state: ZirconDataProviderState,
    compareElements: (a: T, b: T) => number = compareDefaultData,
  ) {
    super(state);
    this._outputDataType = outDataType;
    if (compareElements) {
      this.__compareElements = compareElements;
    }
  }

  protected override async setState(
    state: ZirconDataProviderState,
  ): Promise<void> {
    await super.setState(state);
    if (!state) {
      return;
    }
    this.setOutputDataType(state.outputDataType);
    this.setActive(state.active);
    this.setMinEventEmissionThresholdInterval(
      state.minEventEmissionThresholdInterval,
    );
  }

  private setMinEventEmissionThresholdInterval(intervalMS: number) {
    this._minEventEmissionThresholdInterval = intervalMS;
    this.stateModified();
  }

  private getMinEventEmissionThresholdInterval(): number {
    return this._minEventEmissionThresholdInterval;
  }

  private setOutputDataType(dataType: string): void {
    if (!dataType) {
      return;
    }
    if (dataType !== this._outputDataType) {
      throw new Error(
        `provider state dataType cannot be changed dynamically. Existing data type ${this._outputDataType} != requested data type ${dataType}`,
      );
    }
    this._outputDataType = dataType;
    this.stateModified();
  }

  public getOutputDataType(): string {
    return this._outputDataType;
  }

  private async setActive(active: boolean): Promise<void> {
    if (active === undefined) {
      return;
    }
    if (active === this._active) {
      return;
    }
    if (!active) {
      await this.stop();
      this._active = false;
      this.stateModified();
    } else {
      await this.start();
      this._active = true;
      this.stateModified();
    }
  }

  public isActive(): boolean {
    return this._active;
  }

  public async activate(active: boolean): Promise<void> {
    return this.setActive(active);
  }

  // this  method should be overriden if data are non static
  protected start(): Promise<void> {
    return;
  }

  // this  method should be overriden if data are non static
  protected stop(): Promise<void> {
    return;
  }
  // -----------------------
  // CORE DATA
  // -----------------------

  public async getData(): Promise<T> {
    return this.__data;
  }

  public getSnapshot(): { data: T; version: number } {
    return {
      data: this.__data,
      version: this.__version,
    };
  }

  public getType(): string {
    return ZIRCON_DATA_PROVIDER_TYPE;
  }

  public getDataProviderSubtype(): string {
    return ZIRCON_DATA_PROVIDER_DEFAULT_TYPE;
  }

  // -----------------------
  // EVENTS
  // -----------------------

  protected override listenToEvents(): void {
    super.listenToEvents();

    this.addListener('DATA_PROVIDER_FULL_CONTENT_REQUEST', (arg) =>
      this.onContentRequest(arg.dataProviderId),
    );
    this.addListener('DATA_PROVIDER_DIFF_CONTENT_REQUEST', (arg) =>
      this.onDiffContentRequest(arg.baseVersion, arg.dataProviderId),
    );
  }

  private onContentRequest(dataProviderId: string): void {
    if (dataProviderId !== this.getId()) {
      return;
    }

    this.emit('DATA_PROVIDER_FULL_CONTENT', {
      dataProviderDescriptor: this.getDescriptor(),
      data: this.__data,
      version: this.__version,
    });
  }

  private onDiffContentRequest(
    baseVersion: number,
    dataProviderId: string,
  ): void {
    if (dataProviderId !== this.getId()) {
      return;
    }
    if (baseVersion === this.__version) {
      return; // no change
    }

    const diffData: DiffData = this.computeDiff(baseVersion, this.__data);
    if (!diffData) {
      // if no diff data, send full content
      this.onContentRequest(dataProviderId);
      return;
    }

    this.emit('DATA_PROVIDER_DIFF_CONTENT', {
      dataProviderDescriptor: this.getDescriptor(),
      diffData: diffData,
      baseVersion,
      version: this.__version,
    });
  }

  private computeDiff<T extends {}>(baseVersion: number, _data: T): DiffData {
    throw new Error(
      'computeDiff method not implemented for version ' + baseVersion,
    );
  }

  // -----------------------
  // UPDATE DATA (IMPORTANT)
  // -----------------------

  public setData(data: T): void {
    this.__data = data;
    this.__version++;
    const now = Date.now();
    if (
      this.__lastEmitTime !== undefined &&
      this.__lastEmitTime !== null &&
      now - this.__lastEmitTime < this.getMinEventEmissionThresholdInterval()
    ) {
      return;
    }
    this.__lastEmitTime = now;
    const descriptor = this.getDescriptor();

    // 1. event change léger (for Cesium diff systems)
    this.emit('DATA_PROVIDER_CHANGED', {
      dataProviderDescriptor: descriptor,
      version: this.__version,
    });

    // // 2. full payload (legacy compatibility)
    // this.emit('DATA_PROVIDER_FULL_CONTENT', {
    //   dataProviderDescriptor: descriptor,
    //   data: this.__data,
    //   version: this.__version,
    // });
  }

  // -----------------------
  // DESCRIPTOR
  // -----------------------

  public getDescriptor(): ZirconDataProviderDescriptor {
    return {
      id: this.getId(),
      name: this.getName(),
      type: this.getType(),
      outputDataType: this.getOutputDataType(),
    };
  }
}

export class ZirconDataProviderConstant<
  T = unknown,
> extends ZirconDataProvider<T> {
  constructor(
    outDataType: string,
    state: ZirconDataProviderState,
    data: T,
    compareElements: (a: T, b: T) => number = compareDefaultData,
  ) {
    super(outDataType, state, compareElements);
    this.setData(data);
  }
}
