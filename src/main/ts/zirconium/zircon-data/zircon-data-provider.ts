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
  dataType: string;
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
  dataType: string;
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
  T = unknown,
  R extends ZirconDataProviderEventRegistry = ZirconDataProviderEventRegistry,
> extends ZirconObject<R> {
  private _dataType: string = null; // output data type
  private __data: T = null;
  private __version: number = 0;
  private __compareElements: (a: T, b: T) => number = compareDefaultData;

  constructor(
    outDataType: string,
    state: ZirconDataProviderState,
    compareElements: (a: T, b: T) => number = compareDefaultData,
  ) {
    super(state);
    this._dataType = outDataType;
    if (compareElements) {
      this.__compareElements = compareElements;
    }
    if (!state) {
      return;
    }
    if (!state.dataType) {
      throw new Error(
        `state dataType ${state.dataType} is not defined but should be ${outDataType}`,
      );
    }
        if (state.dataType !== outDataType) {
      throw new Error(
        `state dataType ${state.dataType} does not match provided dataType ${this._dataType} in ${this.constructor.name} constructor`,
      );
    }

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

  public getDataType(): string {
    return this._dataType;
  }

  public setDataType(dataType: string): void {
    this._dataType = dataType;
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

    const descriptor = this.getDescriptor();

    // 1. event change léger (for Cesium diff systems)
    this.emit('DATA_PROVIDER_CHANGED', {
      dataProviderDescriptor: descriptor,
      version: this.__version,
    });

    // 2. full payload (legacy compatibility)
    this.emit('DATA_PROVIDER_FULL_CONTENT', {
      dataProviderDescriptor: descriptor,
      data: this.__data,
      version: this.__version,
    });
  }

  // -----------------------
  // DESCRIPTOR
  // -----------------------

  public getDescriptor(): ZirconDataProviderDescriptor {
    return {
      id: this.getId(),
      name: this.getName(),
      type: this.getType(),
      dataType: this.getDataType(),
    };
  }
}
