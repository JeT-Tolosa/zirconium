import { v4 as uuid } from 'uuid';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/InfoBox/InfoBox.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ZirconViz, ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';

/**
 * Visualizer based on Cesium library
 * https://cesium.com/platform/cesiumjs/
 *
 * jeremie.turbet@gmail.com
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw
 *
 */

export interface VizCesiumState extends ZirconVizState {
  token?: string;
}

const CESIUM_TOKEN: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw';

export class VizCesium extends ZirconViz {
  public static readonly CESIUM_VISUALIZER_TYPE = 'CESIUM_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _token: string = CESIUM_TOKEN;
  private _viewer: Cesium.Viewer = null;

  /**
   * constructor
   */
  constructor() {
    super();
  }

  public override getType(): string {
    return VizCesium.CESIUM_VISUALIZER_TYPE;
  }

  /**
   * Get Cesium token
   * @param token Cesium token
   */
  public setToken(token: string): void {
    this._token = token;
    Cesium.Ion.defaultAccessToken = token;
  }

  /**
   * Get Cesium token
   */
  public getToken(): string {
    return this._token;
  }

  public createChart(): void {
    // Your access token can be found at: https://ion.cesium.com/tokens.
    // Replace `your_access_token` with your Cesium ion access token.

    Cesium.Ion.defaultAccessToken = this.getToken();

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    // this._viewer = new Cesium.Viewer(this.getDiv().id, {
    //   terrain: Cesium.Terrain.fromWorldTerrain(),
    // });
    this._viewer = new Cesium.Viewer(this.getMainDiv().id);

    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    this._viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
      },
    });

    // // Add Cesium OSM Buildings, a global 3D buildings layer.
    // const buildingTileset = await Cesium.createOsmBuildingsAsync();
    // this._viewer.scene.primitives.add(buildingTileset);
  }

  // /**
  //  * Create chart and dock it into given parent
  //  * @param parent  Parent element to dock chart into
  //  * @returns   true if chart was created and docked, false otherwise
  //  */
  // public override displayIn(parent: HTMLDivElement): boolean {
  //   if (!parent) return false;
  //   parent.appendChild(this.getCanvas());
  //   this.createChart(this.getCanvas());
  //   console.log(
  //     `display chart ${this.getId()} in canvas ${this.getCanvas().id} in parent ${parent.id}`,
  //   );
  // }

  /**
   * Get Main div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.style.width = '100%';
    this._mainDiv.style.height = '100%';
    this._mainDiv.id = uuid();
    return this._mainDiv;
  }
}
