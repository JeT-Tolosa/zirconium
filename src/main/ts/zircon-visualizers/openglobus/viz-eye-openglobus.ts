import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-viz-ui';
import { v4 as uuid } from 'uuid';
import * as OG from '@openglobus/og';

import './og.css';

// export const OPENGLOBUS_VISUALIZER_TYPE = 'OPENGLOBUS_VISUALIZER_TYPE';

export interface VizOpenGlobusState extends ZirconVizState {
  type: typeof VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE;
}

// import ogResources from '@openglobus/og/lib/res';
// import ogResourcesFonts from '@openglobus/og/lib/res/fonts';

/**
 * Visualizer based on OpenGlobus library
 */

export class VizOpenGlobus extends ZirconViz {
  public static readonly OPENGLOBUS_VISUALIZER_TYPE =
    'OPENGLOBUS_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _globe: OG.Globe = null;
  private _osm: OG.OpenStreetMap = null;
  private _sat: OG.Bing = null;

  /**
   * constructor
   */
  constructor(state?: VizOpenGlobusState) {
    super(state);
  }

  public override getType(): string {
    return VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE;
  }

  public createGlobe(): void {
    if (this._globe) return;
    this._osm = new OG.OpenStreetMap('osm');

    this._sat = new OG.Bing('bing');

    this._globe = new OG.Globe({
      target: this.getMainDiv(),
      name: 'Earth',
      terrain: new OG.GlobusRgbTerrain(),
      layers: [this._osm, this._sat],
      resourcesSrc: './lib/res/',
      fontsSrc: './lib/res/fonts/',
      // resourcesSrc: ogResources,
      // fontsSrc: ogResourcesFonts,
    });
  }

  public createGlobeCO2(): void {
    if (this._globe) return;

    //
    // Videos from https://svs.gsfc.nasa.gov/5273/
    //

    const attr = new OG.Layer('', {
      attribution: `<a href="https://svs.gsfc.nasa.gov/5273/" target="_blank">Atmospheric Carbon Dioxide Visualization</a>`,
      visibility: true,
      isBaseLayer: false,
      hideInLayerSwitcher: true,
    });

    const foursources = new OG.GeoVideo('SOS_TaggedCO2', {
      src: './assets/videos/SOS_TaggedCO2.mp4',
      corners: [
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90],
      ],
      visibility: true,
      isBaseLayer: true,
      attribution: 'Four Sources',
      opacity: 1.0,
      fullExtent: true,
    });

    this._globe = new OG.Globe({
      target: this.getMainDiv(),
      name: 'Earth',
      terrain: new OG.GlobusRgbTerrain(null, { heightFactor: 7.1 }),
      // layers: [attr],
      layers: [attr, foursources],
      atmosphereEnabled: false,
      transitionOpacityEnabled: false,
      resourcesSrc: './lib/res',
      fontsSrc: './lib/res/fonts',
      sun: {
        active: false,
      },
    });

    // this._globe.planet.renderer.controls.SimpleSkyBackground.colorOne =
    //   'rgb(100, 100, 100)';
    // this._globe.planet.renderer.controls.SimpleSkyBackground.colorTwo =
    //   'rgb(0, 0, 0)';
  }

  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.style.width = '100%';
    this._mainDiv.style.height = '100%';
    this._mainDiv.id = uuid();
    return this._mainDiv;
  }

  public createGlobeRoutes(): void {
    if (this._globe) return;
    const sat: OG.Bing = new OG.Bing('sat');

    this._globe = new OG.Globe({
      target: this.getMainDiv(),
      name: 'Earth',
      layers: [sat, this._collection],
      atmosphereEnabled: true,
      terrain: new OG.GlobusRgbTerrain(),
      resourcesSrc: './og/lib/res',
      fontsSrc: './og/lib/res/fonts',
      sun: {
        stopped: true,
      },
    });
    this.readRoutes();
  }

  private POINTS_NUMBER: number = 70;

  private readRoutes() {
    fetch('./assets/gis/routes.json')
      .then((res) => res.json())
      .then((data) => {
        const paths = [];
        const colors: [number, number, number, number][][] = [];
        const animIndex: number[] = [];

        for (let i = 0; i < data.length; i++) {
          const p = data[i],
            dst = new OG.LonLat(
              Number(p.dstAirport.lng),
              Number(p.dstAirport.lat),
            ),
            src = new OG.LonLat(
              Number(p.srcAirport.lng),
              Number(p.srcAirport.lat),
            );

          const path = this.getPath(this._globe.planet.ellipsoid, src, dst);

          paths.push(path.path);
          colors.push(path.colors as [number, number, number, number][]);

          animIndex.push(OG.math.randomi(0, this.POINTS_NUMBER));
        }

        const entity = new OG.Entity({
          polyline: {
            path3v: paths,
            pathColors: colors as OG.SegmentPathColor[],
            thickness: 1.8,
            color: 'red',
            isClosed: false,
          },
        });

        this._collection.add(entity);

        this._globe.planet.renderer.handler.defaultClock.setInterval(3, () => {
          const e = this._collection.getEntities()[0].polyline;
          const cArr = e.getPathColors();
          for (let i = 0; i < cArr.length; i++) {
            animIndex[i]++;
            let ind = animIndex[i];
            if (ind > this.POINTS_NUMBER + 4) {
              animIndex[i] = 0;
              ind = 0;
            }

            const r = colors[i][0][0],
              g = colors[i][0][1],
              b = colors[i][0][2];
            e.setPointColor([r, g, b, 0.8], ind, i);
            e.setPointColor([r, g, b, 0.6], ind - 1, i);
            e.setPointColor([r, g, b, 0.3], ind - 2, i);
            e.setPointColor([r, g, b, 0.1], ind - 3, i);
            e.setPointColor(
              colors[i][ind] || colors[i][this.POINTS_NUMBER - 1],
              ind - 4,
              i,
            );
          }
        });
      });
  }

  private getPath(ell: OG.Ellipsoid, start: OG.LonLat, end: OG.LonLat) {
    const num = this.POINTS_NUMBER;

    const { distance, initialAzimuth } = ell.inverse(start, end);

    const p25 = ell.getGreatCircleDestination(
        start,
        initialAzimuth,
        distance * 0.25,
      ),
      p75 = ell.getGreatCircleDestination(
        start,
        initialAzimuth,
        distance * 0.75,
      );

    start.height = 50;
    end.height = 50;
    const h = distance / 4;
    p25.height = h;
    p75.height = h;

    const startCart = ell.lonLatToCartesian(start),
      endCart = ell.lonLatToCartesian(end),
      p25Cart = ell.lonLatToCartesian(p25),
      p75Cart = ell.lonLatToCartesian(p75);

    const path = [],
      colors = [];
    const color = [
      OG.math.random(0, 2),
      OG.math.random(0, 2),
      OG.math.random(0, 2),
    ];
    for (let i = 0; i <= num; i++) {
      const cn = OG.math.bezier3v(
        i / num,
        startCart,
        p25Cart,
        p75Cart,
        endCart,
      );
      path.push(cn);

      colors.push([color[0], color[1], color[2], 0.1]);
    }

    return {
      path: path,
      colors: colors,
    };
  }

  private _collection: OG.Vector = new OG.Vector('Collection', {
    entities: [],
  });
}
