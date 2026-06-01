import { Catalog, CatalogDescriptor } from '../collection/item-collection';
import { AIS, AIS_TYPE } from './ais';

/**
 * ais indexation method
 * @param el ais object
 * @returns ais index
 */
export function aisIndexationMethod(el: AIS): string {
  return el.id;
}

/**
 * AIS catalog
 */
export class AISCatalog extends Catalog<AIS> {
  constructor(catalogDescriptor: CatalogDescriptor) {
    super(AIS_TYPE, catalogDescriptor, aisIndexationMethod);
  }
}
