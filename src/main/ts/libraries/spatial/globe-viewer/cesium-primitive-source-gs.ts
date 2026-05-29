import { GroundStation } from '../ground-station/ground-station';
import * as Cesium from 'cesium';
import { CesiumPrimitiveDataProvider } from './cesium-primitive-source';

export const CESIUM_PRIMITIVE_SOURCE_TYPE = 'cesium-primitive-source';

export class CatalogCesiumPrimitiveDataProvider extends CesiumPrimitiveDataProvider {
  private _gsCatId: string = null;

  constructor(gsCatalogId?: string) {
    super(CESIUM_PRIMITIVE_SOURCE_TYPE);
    this._gsCatId = gsCatalogId;
  }

  private async groundStationsToCollection(
    stations: GroundStation[],
  ): Promise<Cesium.BillboardCollection> {
    const collection = new Cesium.BillboardCollection();
    for (const station of stations) {
      collection.add(await this.groundStationToBillboard(station));
    }
    return collection;
  }
  public async createPrimitive(): Promise<Cesium.BillboardCollection> {
    if (!gsCatalog) {
      throw new Error('No ground station catalog source provided');
    }
    return this.groundStationsToCollection(
      Object.values(gsCatalog.getElements()),
    );
  }
}
