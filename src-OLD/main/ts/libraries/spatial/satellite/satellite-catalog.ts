import { Catalog, CatalogDescriptor } from '../../collection/item-collection';
import { Satellite, SATELLITE_TYPE } from './satellite';

/**
 * satellite indexation method
 * @param el satellite object
 * @returns satellite index
 */
export function satelliteIndexationMethod(el: Satellite): string {
  return el.OBJECT_ID;
}

/**
 * Satellite catalog
 */
export class SatelliteCatalog extends Catalog<Satellite> {
  constructor(catalogDescriptor: CatalogDescriptor) {
    super(SATELLITE_TYPE, catalogDescriptor, satelliteIndexationMethod);
  }
}
