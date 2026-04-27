import { Catalog, CatalogDescriptor } from '../catalog/catalog';
import { CatalogCollection } from '../catalog/catalog-collection';
import { GROUND_STATION_TYPE, GroundStation } from './ground-station';

/**
 * satellite indexation method
 * @param el satellite object
 * @returns satellite index
 */
export function groundStationIndexationMethod(el: GroundStation): string {
  return el.name;
}

/**
 * GroundStation catalog
 */
export class GroundStationCatalog extends Catalog<GroundStation> {
  constructor(catalogDescriptor: CatalogDescriptor) {
    super(
      GROUND_STATION_TYPE,
      catalogDescriptor,
      groundStationIndexationMethod,
    );
  }
}

/**
 * GroundStation catalog collection
 */
export class GroundStationCatalogCollection extends CatalogCollection<GroundStation> {
  constructor() {
    super(GROUND_STATION_TYPE, groundStationIndexationMethod);
  }
}
