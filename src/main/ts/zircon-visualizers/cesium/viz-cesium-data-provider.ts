import { v4 as uuid } from 'uuid';

import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { MergeZirconRegistries } from '../../zirconium/zircon-event';
import { GlobeViewer } from '../../libraries/spatial/globe-viewer/globe-viewer';
import { GlobeViewerCesium } from '../../libraries/spatial/globe-viewer/globe-viewer-cesium';

export const CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE: string =
  'cesium-with-data-providers-visualizer';
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

export type VizCesiumWithDataProvidersEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconVizEventRegistry
>;

export class VizCesiumWithDataProviders<
  R extends VizCesiumWithDataProvidersEventRegistry =
    VizCesiumWithDataProvidersEventRegistry,
> extends ZirconViz<R> {
  public static readonly CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE =
    CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE;
  private _token: string = JET_CESIUM_TOKEN;
  private _sunLightning: boolean = true;
  private __mainDiv: HTMLDivElement = null;
  private __viewer: GlobeViewer = null;

  /**
   * constructor
   */
  constructor(state?: VizCesiumWithDataProvidersState) {
    super(state);
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
