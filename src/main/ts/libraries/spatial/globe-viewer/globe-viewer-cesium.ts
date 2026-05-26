import { v4 as uuid } from 'uuid';
import {
  GlobeViewer,
  GlobeViewerEvents,
  GlobeViewerOptions,
} from './globe-viewer';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/InfoBox/InfoBox.css';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import {
  buildInstancedVisibilityLines,
  VisibilityEngineCesium,
} from './visibility-cesium';

const DEFAULT_CESIUM_TOKEN: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw';

export interface GlobeViewerOptionsCesium extends GlobeViewerOptions {
  token?: string;
  sunLightning?: boolean;
  skyAtmosphere?: boolean;
}

/**
 * Default event map (can be extended by subclasses)
 */
export type GlobeViewerEventsCesium = GlobeViewerEvents & {};

// function temeToCesiumCartesian(state: State): Cesium.Cartesian3 {
//   const date = new Date(state.time);
//   const gmst = satellite.gstime(date);
//   const geo = satellite.eciToGeodetic(state.position, gmst);
//   const lat = satellite.degreesLat(geo.latitude);
//   const lon = satellite.degreesLong(geo.longitude);
//   const altMeters = geo.height * 1000;
//   return Cesium.Cartesian3.fromDegrees(lon, lat, altMeters);
// }

// function timeColor(index: number, total: number): Cesium.Color {
//   const t = index / (total - 1);
//   return new Cesium.Color(t, 0, 1 - t, 1);
// }

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

type State = {
  time: string;
  frame: 'TEME';
  position: Vec3;
  velocity: Vec3;
};

export class GlobeViewerCesium extends GlobeViewer<
  GlobeViewerOptionsCesium,
  GlobeViewerEventsCesium
> {
  private _viewer: Cesium.Viewer = null;
  private _parent: HTMLDivElement = null;
  private _token: string = DEFAULT_CESIUM_TOKEN;
  private _sunLightning: boolean = true;
  private _skyAtmosphere: boolean = true;

  constructor(options?: GlobeViewerOptionsCesium) {
    super();
    this.setOptions(options);
    this.on('optionsChanged', (_event) => {
      this.onOptionsChanged();
    });
  }

  private onOptionsChanged(): void {
    if (!this._viewer) return;
    if (this.getOptions()?.token && this.getOptions().token !== this._token) {
      this.setToken(this.getOptions().token);
    }
    if (
      this.getOptions()?.sunLightning !== undefined &&
      this.getOptions().sunLightning !== this._sunLightning
    ) {
      this.setSunLightning(this.getOptions().sunLightning);
    }
    if (
      this.getOptions()?.skyAtmosphere !== undefined &&
      this.getOptions().skyAtmosphere !== this._skyAtmosphere
    ) {
      this.setSkyAtmosphere(this.getOptions().skyAtmosphere);
    }
  }

  /**
   * Get Cesium token
   * @param token Cesium token
   */
  public setToken(token: string): void {
    this._token = token;
    Cesium.Ion.defaultAccessToken = token;
  }

  public setSunLightning(sunLightning: boolean): void {
    this._sunLightning = sunLightning;
    if (this._viewer) {
      this._viewer.scene.globe.enableLighting = sunLightning;
    }
  }

  public setSkyAtmosphere(skyAtmosphere: boolean): void {
    this._skyAtmosphere = skyAtmosphere;
    if (this._viewer) {
      this._viewer.scene.skyAtmosphere.show = skyAtmosphere;
    }
  }

  private getToken(): string {
    return this._token;
  }

  private getParent(): HTMLDivElement {
    return this._parent;
  }

  private async createViewer(parent: HTMLDivElement): Promise<void> {
    if (!parent) {
      throw new Error(
        'Parent div must have an id for Cesium Viewer to initialize.',
      );
    }
    if (this._parent) {
      this.destroyViewer();
    }
    this._parent = parent;
    if (!this._parent.id) {
      this._parent.id = `cesiumContainer-${uuid()}`;
    }
    if (this._viewer) return;
    // Your access token can be found at: https://ion.cesium.com/tokens.
    // Replace `your_access_token` with your Cesium ion access token.

    Cesium.Ion.defaultAccessToken = this.getToken();

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    // this._viewer = new Cesium.Viewer(this.getDiv().id, {
    //   terrain: Cesium.Terrain.fromWorldTerrain(),
    // });
    this._viewer = new Cesium.Viewer(this.getParent().id, {
      animation: true,
      timeline: true,
      baseLayerPicker: false,

      terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    this._viewer.scene.globe.enableLighting =
      this._sunLightning !== undefined ? this._sunLightning : true;
    this._viewer.scene.globe.depthTestAgainstTerrain = true;
    this._viewer.scene.skyAtmosphere.show =
      this._skyAtmosphere !== undefined ? this._skyAtmosphere : true;
    // soleil visible (lens effect)
    this._viewer.scene.sun.show = true;

    const groundStations = [
      {
        id: 'paris',
        position: Cesium.Cartesian3.fromDegrees(2.3522, 48.8566, 50),
      },
      {
        id: 'london',
        position: Cesium.Cartesian3.fromDegrees(-0.1276, 51.5072, 50),
      },
      {
        id: 'new_york',
        position: Cesium.Cartesian3.fromDegrees(-74.006, 40.7128, 50),
      },
      {
        id: 'los_angeles',
        position: Cesium.Cartesian3.fromDegrees(-118.2437, 34.0522, 80),
      },
      {
        id: 'tokyo',
        position: Cesium.Cartesian3.fromDegrees(139.6917, 35.6895, 60),
      },
      {
        id: 'singapore',
        position: Cesium.Cartesian3.fromDegrees(103.8198, 1.3521, 50),
      },
      {
        id: 'sydney',
        position: Cesium.Cartesian3.fromDegrees(151.2093, -33.8688, 70),
      },
      {
        id: 'cape_town',
        position: Cesium.Cartesian3.fromDegrees(18.4241, -33.9249, 80),
      },
      {
        id: 'dubai',
        position: Cesium.Cartesian3.fromDegrees(55.2708, 25.2048, 60),
      },
      {
        id: 'brazilia',
        position: Cesium.Cartesian3.fromDegrees(-47.8825, -15.7939, 70),
      },
    ];

    const leoSatellites = [
      {
        id: 'leo_1',
        position: Cesium.Cartesian3.fromDegrees(0, 45, 550000),
      },
      {
        id: 'leo_2',
        position: Cesium.Cartesian3.fromDegrees(30, 10, 520000),
      },
      {
        id: 'leo_3',
        position: Cesium.Cartesian3.fromDegrees(-60, -20, 600000),
      },
      {
        id: 'leo_4',
        position: Cesium.Cartesian3.fromDegrees(120, 35, 580000),
      },
      {
        id: 'leo_5',
        position: Cesium.Cartesian3.fromDegrees(-100, 50, 500000),
      },
      {
        id: 'leo_6',
        position: Cesium.Cartesian3.fromDegrees(80, -10, 620000),
      },
      {
        id: 'leo_7',
        position: Cesium.Cartesian3.fromDegrees(-20, 25, 700000),
      },
      {
        id: 'leo_8',
        position: Cesium.Cartesian3.fromDegrees(140, -30, 750000),
      },
      {
        id: 'leo_9',
        position: Cesium.Cartesian3.fromDegrees(10, -50, 650000),
      },
      {
        id: 'leo_10',
        position: Cesium.Cartesian3.fromDegrees(-140, 20, 560000),
      },
    ];
    const geoSatellites = [
      {
        id: 'geo_1_europe',
        position: Cesium.Cartesian3.fromDegrees(-0.1, 0, 35786000),
      },
      {
        id: 'geo_2_asia',
        position: Cesium.Cartesian3.fromDegrees(100.0, 0, 35786000),
      },
    ];
    const engine = new VisibilityEngineCesium(this._viewer);

    const collection = buildInstancedVisibilityLines(
      groundStations,
      [...leoSatellites, ...geoSatellites],
      engine,
    );

    this._viewer.scene.primitives.add(collection);

    // const dataSource = await Cesium.CzmlDataSource.load(
    //   CESIUM_SATELLITES_CZML_SAMPLE,
    // );

    // this._viewer.dataSources.add(dataSource);

    // this._viewer.zoomTo(dataSource);
  }

  public destroyViewer(): void {
    if (this._viewer) {
      this._viewer.destroy();
      this._viewer = null;
    }
  }

  public displayIn(parent: HTMLDivElement): void {
    if (this._parent) this.destroyViewer();
    this._parent = parent;
    this.createViewer(parent);
  }
  public updateResize(): void {
    if (this._viewer) {
      this._viewer.resize();
    }
  }
}
