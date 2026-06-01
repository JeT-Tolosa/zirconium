import { v4 as uuid } from 'uuid';

import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { MergeZirconRegistries } from '../../zirconium/zircon-event';
import { GlobeViewer } from '../../libraries/spatial/globe-viewer/globe-viewer';
import { GlobeViewerCesium } from '../../libraries/spatial/globe-viewer/globe-viewer-cesium';

export const CESIUM_VISUALIZER_TYPE: string = 'cesium-visualizer';
/**
 * Visualizer based on Cesium library
 * https://cesium.com/platform/cesiumjs/
 *
 * jeremie.turbet@gmail.com
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw
 *
 */

export interface VizCesiumState extends ZirconVizState {
  type: typeof CESIUM_VISUALIZER_TYPE;
  token?: string;
  sunLightning?: boolean;
  timeControllerId?: string;
}

const DEFAULT_CESIUM_TOKEN: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw';

export type VizCesiumEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconVizEventRegistry
>;

export class VizCesium<
  R extends VizCesiumEventRegistry = VizCesiumEventRegistry,
> extends ZirconViz<R> {
  public static readonly CESIUM_VISUALIZER_TYPE = 'cesium-visualizer';
  private _token: string = DEFAULT_CESIUM_TOKEN;
  private _sunLightning: boolean = true;
  private __mainDiv: HTMLDivElement = null;
  private __viewer: GlobeViewer = null;

  /**
   * constructor
   */
  constructor(state?: VizCesiumState) {
    super(state);
  }

  public override getType(): string {
    return VizCesium.CESIUM_VISUALIZER_TYPE;
  }

  public override generateCurrentState(): VizCesiumState {
    const baseState = super.generateCurrentState();
    return {
      ...baseState,
      type: VizCesium.CESIUM_VISUALIZER_TYPE,
      sunLightning: this.getSunLightning(),
      token: this.getToken(),
    };
  }

  public override async setState(state?: VizCesiumState): Promise<void> {
    if (!state) return;
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
    if (this.__viewer) return;
    const cesiumOptions = {
      token: this.getToken(),
      sunLightning: this.getSunLightning(),
    };
    this.__viewer = new GlobeViewerCesium(cesiumOptions);
  }

  private async displayViewer(): Promise<void> {
    if (!this.__viewer) await this.createViewer();
    this.__viewer.displayIn(this.getContainer());
  }

  public override async onDisplay(): Promise<void> {
    await this.displayViewer();
  }

  /**
   * Get Main div element
   */
  public override getContainer(): HTMLDivElement {
    if (this.__mainDiv) return this.__mainDiv;
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
