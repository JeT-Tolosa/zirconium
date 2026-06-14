import { ItemCollection } from '../../libraries/collection/item-collection';
import { ZirconDataProvider } from '../../zirconium/zircon-data/zircon-data-provider';

export const CATALOG_DATA_PROVIDER_TYPE = 'catalog-data-provider';

export class ItemCollectionDataProvider<T> extends ZirconDataProvider<T> {
  private _itemCollection: ItemCollection<T> = null;

  constructor(name: string, itemCollection: ItemCollection<T>) {
    super('unknown-data', {
      name,
      type: CATALOG_DATA_PROVIDER_TYPE,
      dataType: 'unknown',
    });
    this.setItemCollection(itemCollection);
  }

  private setItemCollection(itemCollection: ItemCollection<T>): void {
    if (!itemCollection) {
      throw new Error('Catalog cannot be null');
    } // if (this._catalog === catalog) return;
    // if (this._catalog) this.unsetCatalog();
    // if (!catalog) return;
    this._itemCollection = itemCollection;
    this._itemCollection.addListener(
      'ITEM_COLLECTION_CONTENT_CHANGED',
      (arg) => {
        if (this._itemCollection?.getId() !== arg.collectionDescriptor.id) {
          return;
        } // check if the event is for the current catalog
        this.emit('ITEM_COLLECTION_CONTENT_CHANGED', {
          dataProviderDescriptor: this.getDescriptor(),
          data: this.getData(),
        });
      },
    );
    this.emit('ITEM_COLLECTION_CONTENT', {
      dataProviderId: this.getId(),
      dataType: this.getDataType(),
    });
  }

  public unsetCatalog(): boolean {
    if (!this._itemCollection) {
      return false;
    }
    // TODO: remove listeners
    this._itemCollection = null;
    return true;
  }

  public override getType(): string {
    return CATALOG_DATA_PROVIDER_TYPE;
  }

  public getItemCollection(): ItemCollection<T> {
    return this._itemCollection;
  }
}
