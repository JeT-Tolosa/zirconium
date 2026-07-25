import { v4 as uuid } from 'uuid';

import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import { GlobeViewer } from '../../libraries/spatial/globe-viewer/globe-viewer';
import {
  CesiumPrimitive,
  GlobeViewerCesium,
} from '../../libraries/spatial/globe-viewer/globe-viewer-cesium';
import {
  ZirconDataProvider,
  ZirconDataProviderDescriptor,
  ZirconDataProviderEvents,
} from '../../zirconium/zircon-data/zircon-data-provider';
import { VizCesiumEventRegistry } from './viz-eye-cesium';

export const CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE: string =
  'cesium-with-data-providers-visualizer';

export type ZirconEngineEvents = {
  ENGINE_START_REQUEST: { engineId: string };
  ENGINE_START_ERROR: { engineId: string; error: string };
  ENGINE_STARTED: { engineId: string };
  ENGINE_STOP_REQUEST: { engineId: string };
  ENGINE_STOPPED: { engineId: string };
  ENGINE_STOP_ERROR: { engineId: string; error: string };
};

export type VizCesiumWithDataProvidersEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<ZirconDataProviderEvents, 'DATA_PROVIDER_FULL_CONTENT'>]
    >;
    outgoing: {};
  },
  VizCesiumEventRegistry
>;

/**
 * Visualizer based on Cesium library
 * https://cesium.com/platform/cesiumjs/
 *
 * jeremie.turbet@gmail.com
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw
 *
 */

export interface VizCesiumWithDataProvidersState extends ZirconVizState {
  type: typeof CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE;
  token?: string;
  sunLightning?: boolean;
  timeControllerId?: string;
}

const JET_CESIUM_TOKEN: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw';

export class VizCesiumWithDataProviders<
  R extends VizCesiumWithDataProvidersEventRegistry =
    VizCesiumWithDataProvidersEventRegistry,
> extends ZirconViz<R> {
  public static readonly CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE =
    'cesium-with-data-providers-visualizer-type';
  private _token: string = JET_CESIUM_TOKEN;
  private _sunLightning: boolean = true;
  private __mainDiv: HTMLDivElement = null;
  private __viewer: GlobeViewer = null;
  private __cesiumPrimitiveDataProviders: {
    [id: string]: ZirconDataProvider<CesiumPrimitive>;
  } = {};

  /**
   * constructor
   */
  constructor() {
    super();
  }

  protected override listenToEvents(): void {
    this.addListener('DATA_PROVIDER_FULL_CONTENT', (arg) => {
      this.onDATA_PROVIDER_FULL_CONTENT(
        arg.dataProviderDescriptor,
        arg.version,
        arg.data,
      );
    });
  }

  private onDATA_PROVIDER_FULL_CONTENT(
    dataProviderDescriptor: ZirconDataProviderDescriptor,
    _version: number,
    _data: unknown,
  ): void {
    if (!dataProviderDescriptor) {
      return;
    }
    if (!dataProviderDescriptor.id) {
      return;
    }
    // check if received data Provider content is one the displayed one
    if (
      !Object.keys(this.__cesiumPrimitiveDataProviders).includes(
        dataProviderDescriptor.id,
      )
    ) {
      return;
    }
    throw new Error('not yet implemented');
    // if (!dataProviderDescriptor.dataType !== CESIUM_PRIMITIVE) {
    //   return;
    // }
  }

  public override getType(): string {
    return VizCesiumWithDataProviders.CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE;
  }

  public override generateCurrentState(): VizCesiumWithDataProvidersState {
    const baseState = super.generateCurrentState();
    return {
      ...baseState,
      type: VizCesiumWithDataProviders.CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE,
      sunLightning: this.getSunLightning(),
      token: this.getToken(),
    };
  }

  public addCesiumPrimitiveDataProvider(
    dataProvider: ZirconDataProvider<CesiumPrimitive>,
  ): void {
    if (!dataProvider) {
      return;
    }
    const previousDataProvider =
      this.__cesiumPrimitiveDataProviders[dataProvider.getId()];
    if (previousDataProvider === dataProvider) {
      return;
    } else {
      this.removeCesiumPrimitiveDataProvider(dataProvider.getId());
    }
    this.__cesiumPrimitiveDataProviders[dataProvider.getId()] = dataProvider;
    this.emit('DATA_PROVIDER_FULL_CONTENT_REQUEST', {
      dataProviderId: dataProvider.getId(),
    });
  }

  public removeCesiumPrimitiveDataProvider(dataProviderId: string): void {
    if (
      !dataProviderId ||
      !this.__cesiumPrimitiveDataProviders[dataProviderId]
    ) {
      return;
    }
    delete this.__cesiumPrimitiveDataProviders[dataProviderId];
  }

  public override async setState(
    state?: VizCesiumWithDataProvidersState,
  ): Promise<void> {
    if (!state) {
      return;
    }
    await super.setState(state);
    if (state.token) {
      this.setToken(state.token);
    }
    if (state.sunLightning !== undefined) {
      this.setSunLightning(state.sunLightning);
    }
  }

  /**
   * Get Cesium token
   * @param token Cesium token
   */
  public setToken(token: string): void {
    this._token = token;
    this.getGlobeViewer()?.setOption('token', token);
  }

  private getGlobeViewer(): GlobeViewer {
    return this.__viewer;
  }

  public setSunLightning(sunLightning: boolean): void {
    this._sunLightning = sunLightning;
    this.getGlobeViewer()?.setOption('sunLightning', sunLightning);
  }

  public getSunLightning(): boolean {
    return this._sunLightning;
  }

  /**
   * Get Cesium token
   */
  public getToken(): string {
    return this._token;
  }

  private async createViewer(): Promise<void> {
    if (this.__viewer) {
      return;
    }
    const cesiumOptions = {
      token: this.getToken(),
      sunLightning: this.getSunLightning(),
    };
    this.__viewer = new GlobeViewerCesium(cesiumOptions);
  }

  private async displayViewer(): Promise<void> {
    if (!this.__viewer) {
      await this.createViewer();
    }
    this.__viewer.displayIn(this.getContainer());
  }

  public override async onDisplay(): Promise<void> {
    await this.displayViewer();
  }

  /**
   * Get Main div element
   */
  public override getContainer(): HTMLDivElement {
    if (this.__mainDiv) {
      return this.__mainDiv;
    }
    this.__mainDiv = document.createElement('div');
    this.__mainDiv.style.width = '100%';
    this.__mainDiv.style.height = '100%';
    this.__mainDiv.id = `cesium-viz-container-${uuid()}`;
    return this.__mainDiv;
  }

  public override updateResize(): boolean {
    this.__viewer?.updateResize();
    return true;
  }
}
