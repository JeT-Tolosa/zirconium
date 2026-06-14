import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
} from '../zircon-core/zircon-app-object';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import {
  ZirconDataProvider,
  ZirconDataProviderDescriptor,
} from './zircon-data-provider';

export const ZIRCON_DATA_PROVIDER_MANAGER_TYPE =
  'zircon-data-provider-manager-type';

export type ZirconDataProviderManagerEvents = {
  DATA_PROVIDER: {
    dataProvider: ZirconDataProvider;
  };
  DATA_PROVIDER_REQUEST: {
    dataProviderId: string;
  };
  DATA_PROVIDER_REQUEST_ERROR: {
    dataProviderId: string;
    error: string;
  };
  REGISTER_DATA_PROVIDER_REQUEST: {
    dataProvider: ZirconDataProvider<unknown>;
  };
  UNREGISTER_DATA_PROVIDER_REQUEST: {
    dataProviderId: string;
  };
  DATA_PROVIDER_MANAGER_DESCRIPTORS: {
    dataTypes?: string[];
    dataProviderDescriptors: ZirconDataProviderDescriptor[];
  };
  DATA_PROVIDER_MANAGER_DESCRIPTOR: {
    dataProviderId: string;
  };
  DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED: {
    dataProviderDescriptor: ZirconDataProviderDescriptor;
  };
  DATA_PROVIDER_MANAGER_PROVIDER_UNREGISTERED: {
    dataProviderDescriptor: ZirconDataProviderDescriptor;
  };
  DATA_PROVIDER_MANAGER_DESCRIPTORS_REQUEST: {
    dataTypes?: string[];
  };
};

export type ZirconDataProviderManagerRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderManagerEvents,
          | 'DATA_PROVIDER_REQUEST'
          | 'DATA_PROVIDER_MANAGER_DESCRIPTORS_REQUEST'
          | 'REGISTER_DATA_PROVIDER_REQUEST'
          | 'UNREGISTER_DATA_PROVIDER_REQUEST'
        >,
      ]
    >;

    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderManagerEvents,
          | 'DATA_PROVIDER'
          | 'DATA_PROVIDER_REQUEST_ERROR'
          | 'DATA_PROVIDER_MANAGER_DESCRIPTOR'
          | 'DATA_PROVIDER_MANAGER_DESCRIPTORS'
          | 'DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED'
          | 'DATA_PROVIDER_MANAGER_PROVIDER_UNREGISTERED'
        >,
      ]
    >;
  },
  ZirconAppObjectEventRegistry
>;

export class ZirconDataProviderManager<
  R extends ZirconDataProviderManagerRegistry =
    ZirconDataProviderManagerRegistry,
> extends ZirconAppObject<R> {
  private __registeredDataProviders: { [id: string]: ZirconDataProvider } = {};

  constructor(app: ZirconApplication) {
    super(app);
  }

  protected override listenToEvents(): void {
    this.addListener('DATA_PROVIDER_MANAGER_DESCRIPTORS_REQUEST', (arg) => {
      this.onDATA_PROVIDER_MANAGER_IDS_REQUEST(arg.dataTypes);
    });
    this.addListener('REGISTER_DATA_PROVIDER_REQUEST', (arg) => {
      this.registerDataProvider(arg.dataProvider);
    });
    this.addListener('UNREGISTER_DATA_PROVIDER_REQUEST', (arg) => {
      this.unregisterDataProvider(arg.dataProviderId);
    });
    this.addListener('DATA_PROVIDER_REQUEST', (arg) => {
      this.onDATA_PROVIDER_REQUEST(arg.dataProviderId);
    });
  }

  private onDATA_PROVIDER_REQUEST(dataProviderId: string): void {
    const dataProvider = this.getDataProvider(dataProviderId);
    if (!dataProvider) {
      this.emit('DATA_PROVIDER_REQUEST_ERROR', {
        dataProviderId,
        error: `Data provider ${dataProviderId} not found`,
      });
      return;
    }
    this.emitDataProvider(dataProvider);
  }

  private onDATA_PROVIDER_MANAGER_IDS_REQUEST(dataTypes?: string[]): void {
    this.emit('DATA_PROVIDER_MANAGER_DESCRIPTORS', {
      dataProviderDescriptors: this.getDataProviderDescriptors(dataTypes),
      dataTypes: dataTypes,
    });
  }

  public override getType(): string {
    return ZIRCON_DATA_PROVIDER_MANAGER_TYPE;
  }

  public getDataProviderDescriptors(
    dataTypes?: string[],
  ): ZirconDataProviderDescriptor[] {
    if (!dataTypes || dataTypes.length === 0) {
      return Object.values(this.__registeredDataProviders).map((provider) =>
        provider.getDescriptor(),
      );
    }
  }

  public getDataProvider(id: string): ZirconDataProvider {
    if (!id) {
      return null;
    }
    return this.__registeredDataProviders[id];
  }

  public registerDataProvider(dataProvider: ZirconDataProvider): boolean {
    if (!dataProvider) {
      return false;
    }
    if (
      this.__registeredDataProviders[dataProvider.getId()] &&
      this.__registeredDataProviders[dataProvider.getId()] !== dataProvider
    ) {
      return false;
    }

    // connect data provider to app event bus
    dataProvider.setEventDispatcher(this.getEventDispatcher());
    this.__registeredDataProviders[dataProvider.getId()] = dataProvider;
    this.emit('DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED', {
      dataProviderDescriptor: dataProvider.getDescriptor(),
    });
    this.emitDataProvider(dataProvider);
    return true;
  }

  public unregisterDataProvider(dataProviderId: string): boolean {
    if (!dataProviderId) {
      return false;
    }
    const dataProvider = this.__registeredDataProviders[dataProviderId];
    if (!dataProvider) {
      return false;
    }

    // connect data provider to app event bus
    dataProvider.unsetEventDispatcher();
    delete this.__registeredDataProviders[dataProvider.getId()];
    this.emit('DATA_PROVIDER_MANAGER_PROVIDER_UNREGISTERED', {
      dataProviderDescriptor: dataProvider.getDescriptor(),
    });
    return true;
  }

  private emitDataProvider(dataProvider: ZirconDataProvider): void {
    if (!dataProvider) {
      return;
    }
    this.emit('DATA_PROVIDER', { dataProvider });
  }

  // public async startDataProvider(DataProviderId: string): Promise<void> {
  //   await this.__registeredDataProviders[DataProviderId]?.DataProviderApplication(
  //     this.getApplication(),
  //   );
  // }

  // public async startDataProviders(): Promise<void> {
  //   Object.keys(this.__registeredDataProviders).forEach(async (dataProviderId) => {
  //     await this.startDataProvider(dataProviderId);
  //   });
  // }
}
