import { ZirconViz, ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { v4 as uuid } from 'uuid';
import * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Visualizer based on Globelet library
 * https://observablehq.com/@jjhembd/hello-globeletjs
 * https://www.maptiler.com
 */

export interface VizLeafletState extends ZirconVizState {
  apiKey?: string;
}

//const MAPTILER_API_KEY = 'fMewEQFJcPQN35729l8o';

export class VizLeaflet extends ZirconViz {
  public static readonly LEAFLET_VISUALIZER_TYPE = 'LEAFLET_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _map: Leaflet.Map = null;
  private _apiKey: string = 'no API key defined. Go to www.maptiler.com';

  /**
   * constructor
   */
  constructor() {
    super();
  }

  public override getType(): string {
    return VizLeaflet.LEAFLET_VISUALIZER_TYPE;
  }

  public getAPIKey(): string {
    return this._apiKey;
  }
  public setAPIKey(value: string) {
    this._apiKey = value;
  }

  public createMap(): void {
    if (this._map) return;
    this._map = Leaflet.map(this.getMainDiv().id).setView([51.505, -0.09], 13);

    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this._map);

    // // Get your own API Key on https://myprojects.geoapify.com
    // var myAPIKey = '6dc7fb95a3b246cfa0f3bcef5ce9ed9a';

    // // Retina displays require different mat tiles quality
    // var isRetina = Leaflet.Browser.retina;

    // var baseUrl =
    //   'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}';
    // var retinaUrl =
    //   'https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}';

    // // Add map tiles layer. Set 20 as the maximal zoom and provide map data attribution.
    // Leaflet.tileLayer(isRetina ? retinaUrl : baseUrl, {
    //   attribution:
    //     'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap <a href="https://www.openstreetmap.org/copyright" target="_blank">contributors</a>',
    //   apiKey: myAPIKey,
    //   maxZoom: 20,
    //   id: 'osm-bright',
    // }).addTo(map);
  }

  public override onDisplay(): void {
    this.createMap();
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
}
