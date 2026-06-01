import { Catalog } from '../../libraries/collection/item-collection';
import { ZirconDataProvider } from '../../zirconium/zircon-data/zircon-data-provider';

export const CATALOG_DATA_PROVIDER_TYPE = 'catalog-data-provider';

export class CatalogDataProvider<
  CatalogElement,
> extends ZirconDataProvider<CatalogElement> {
  private _catalog: Catalog<CatalogElement> = null;

  constructor(name: string, catalog: Catalog<CatalogElement>) {
    super(name);
    this.setCatalog(catalog);
  }

  private setCatalog(catalog: Catalog<CatalogElement>): void {
    if (!catalog) throw new Error('Catalog cannot be null');
    // if (this._catalog === catalog) return;
    // if (this._catalog) this.unsetCatalog();
    // if (!catalog) return;
    this._catalog = catalog;
    this._catalog.addListener('CATALOG_CONTENT_CHANGED', (arg) => {
      if (this._catalog?.getId() !== arg.catalogId) return; // check if the event is for the current catalog
      this.emit('DATA_PROVIDER_CONTENT', {
        dataProviderDescriptor: this.getDescriptor(),
        data: this.getData(),
      });
    });
    this.emit('DATA_PROVIDER_CHANGED', {
      dataProviderId: this.getId(),
      dataType: this.getDataType(),
    });
  }

  public unsetCatalog(): boolean {
    if (!this._catalog) return false;
    // TODO: remove listeners
    this._catalog = null;
    return true;
  }

  public getType(): string {
    return CATALOG_DATA_PROVIDER_TYPE;
  }

  public getDataType(): string {
    return this._catalog.getDataType();
  }

  public getCatalog(): Catalog<CatalogElement> {
    return this._catalog;
  }
}
