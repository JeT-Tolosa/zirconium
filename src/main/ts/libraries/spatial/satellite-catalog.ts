import { Catalog, CatalogDescriptor } from '../catalog/catalog';
import { CatalogCollection } from '../catalog/catalog-collection';
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

/**
 * Satellite catalog collection
 */
export class SatelliteCatalogCollection extends CatalogCollection<Satellite> {
  constructor() {
    super(SATELLITE_TYPE, satelliteIndexationMethod);
  }
}
