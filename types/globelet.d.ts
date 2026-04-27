declare module 'globeletjs' {
  declare interface GlobeletInitParams {
    container: Element | string; //(REQUIRED): An HTML DIV element (or its string ID) where the globe will be displayed
    style: string; //: A link to a MapLibre style document describing the map to be rendered. Please see below for some notes about supported map styles.
    // OPTIONALS
    infobox?; //: An HTML DIV element (or its string ID) where information about a map feature will be displayed. NOTE: if supplied, this element will be wrapped inside a sliding pane with a close button. See the API methods showInfo and hideInfo for more information
    mapboxToken?: string; // Your API token for Mapbox services (if needed)
    width?: number; // The width of the map that will be projected onto the globe, in pixels. Defaults to container.clientWidth + 512
    height?: number; // The height of the map that will be projected onto the globe, in pixels. Defaults to container.clientHeight + 512
    center?: [number, number]; // The initial geographic position of the camera, given as [longitude, latitude] in degrees. Default: [0.0, 0.0]
    altitude?: number; // The initial altitude of the camera, in kilometers. Default: 20000
    minAltitude?: number; // The minimum altitude of the camera, in kilometers. Default: 0.0001 * earthRadius
    maxAltitude?: number; // The maximum altitude of the camera, in kilometers. Default: 8.0 * earthRadius
    minLongitude?: number; // minLatitude, maxLongitude, maxLatitude: Geographic limits on camera movement. By default, the globe can be spun and zoomed to any point on the planet. Setting these limits will restrict motion to a specified box. See spinning-ball documentation for further details    }
  }

  export function initGlobe(params: GlobeletInitParams): Promise<any>;
}
