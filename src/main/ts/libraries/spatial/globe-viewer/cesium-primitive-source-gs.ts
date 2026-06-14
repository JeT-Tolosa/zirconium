// import { GroundStation } from '../ground-station/ground-station';
// import * as Cesium from 'cesium';
// import { CesiumPrimitiveDataProvider } from './cesium-primitive-source';
// import { CatalogEngine } from '../../../sharp-eye/engines/catalog-engine';
// import { GroundStationToCesiumConverter } from '../ground-station/ground-station-cesium-converter';

// export const CESIUM_PRIMITIVE_SOURCE_TYPE = 'cesium-primitive-source';

// export class CatalogCesiumPrimitiveDataProvider<
//   T,
// > extends CesiumPrimitiveDataProvider {
//   private _gsCatId: string = null;
//   private _gsCatalog: CatalogEngine<T> = null;
//   private _gsConverter: GroundStationToCesiumConverter = null;

//   constructor(gsCatalogId?: string) {
//     super(CESIUM_PRIMITIVE_SOURCE_TYPE);
//     this._gsCatId = gsCatalogId;
//     this._gsConverter = new GroundStationToCesiumConverter();
//   }

//   private async groundStationsToCollection(
//     stations: GroundStation[],
//   ): Promise<Cesium.BillboardCollection> {
//     const collection = new Cesium.BillboardCollection();
//     for (const station of stations) {
//       collection.add(await this._gsConverter.createPrimitive(station));
//     }
//     return collection;
//   }

//   private requestCatalog(): void {
//     this.emit(ENGINE, { catalogId: this._gsCatId });
//   }

//   public async createPrimitive(): Promise<Cesium.BillboardCollection> {
//     if (!this._gsCatId) {
//       throw new Error('No ground station catalog source provided');
//     }
//     if (!this._gsCatalog) {
//       this.requestCatalog();
//       return null;
//     }
//     return this.groundStationsToCollection(
//       Object.values(_gsCatalog.getElements()),
//     );
//   }
// }
