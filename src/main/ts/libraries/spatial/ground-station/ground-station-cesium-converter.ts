import { ToCesiumPrimitiveConverter } from '../globe-viewer/cesium-primitive-converter';
import { GroundStation } from './ground-station';
import * as Cesium from 'cesium';

export class GroundStationToCesiumConverter extends ToCesiumPrimitiveConverter<GroundStation> {
  public async createPrimitive(
    station: GroundStation,
  ): Promise<Cesium.Billboard> {
    return GroundStationToCesiumConverter.groundStationToBillboard(station);
  }

  public static async groundStationToBillboard(
    station: GroundStation,
  ): Promise<Cesium.Billboard> {
    let image = '/icons/unknown-country.png';
    // priorité à une image custom
    if (station.imagery) {
      image = station.imagery;
    }
    // logique métier
    else if (station.country.toLowerCase() === 'france') {
      image = '/icons/france-country.png';
    } else if (station.country === 'weather') {
      image = '/icons/unknown-country.png';
    }
    return {
      id: station.id,
      position: Cesium.Cartesian3.fromDegrees(
        station.coordinates.lon,
        station.coordinates.lat,
      ),
      image,
      width: 32,
      height: 32,
      scale: 1.0,
      color: Cesium.Color.WHITE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 10000000, 0.3),
    } as Cesium.Billboard;
  }
}
