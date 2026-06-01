import { v4 as uuid } from 'uuid';
import './viz-eye-catalog-tabulator.css';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CollectionCatalogSelectorComponent } from '../../catalog-ui/collection-catalog-selector-component';

import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';

import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import {
  ItemCollection,
  ItemCollectionDescriptor,
} from '../../libraries/collection/item-collection';
import {
  CatalogEngineDescriptor,
  CatalogEngineEvents,
} from '../../sharp-eye/engines/catalog-engine';
import { ItemArray } from '../../libraries/collection/item-array';

/**
 * Events definition for Catalog Tabulator
 */
export type VizCatalogTabulatorEvents<T> = {
  COLLECTION_GET_CATALOG_CONTENT: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
    elements: T[];
  };
  CATALOG_COLLECTION_CREATED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
  CATALOG_COLLECTION_REMOVED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
  };
  CATALOG_ITEM_SELECTED: {
    rowData: { [key: string]: unknown };
  };
};

/**
 * Events Registry for Catalog Tabulator
 */
export type VizCatalogTabulatorEventRegistry<T> = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          CatalogEngineEvents<T>,
          | 'CATALOG_ENGINE_COLLECTION_ADDED'
          | 'CATALOG_ENGINE_COLLECTION_REMOVED'
          | 'CATALOG_ENGINE_COLLECTION_DESCRIPTORS'
          | 'CATALOG_ENGINE_COLLECTION_CONTENT'
          | 'CATALOG_ENGINE_ELEMENTS_ADDED'
          | 'CATALOG_ENGINE_ELEMENTS_REMOVED'
          | 'CATALOG_ENGINE_ELEMENTS_SET'
        >,
      ]
    >;

    outgoing: MergePickEvents<
      [
        //PickEvents<
        //   VizCatalogTabulatorEvents<T>,
        //   | 'CATALOG_COLLECTION_CREATED'
        //   | 'CATALOG_COLLECTION_REMOVED'
        //   | 'CATALOG_ITEM_SELECTED'
        // >,
        PickEvents<VizCatalogTabulatorEvents<T>, 'CATALOG_ITEM_SELECTED'>,
        PickEvents<
          CatalogEngineEvents<T>,
          | 'CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST'
          | 'CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST'
          | 'CATALOG_ENGINE_ADD_ELEMENTS_REQUEST'
          | 'CATALOG_ENGINE_COLLECTION_CREATE_REQUEST'
        >,
      ]
    >;
  },
  ZirconVizEventRegistry
>;

export interface VizCollectionCatalogTabulatorState extends ZirconVizState {
  catalogId?: string;
}

export class VizCollectionCatalogTabulator<
  T,
  R extends VizCatalogTabulatorEventRegistry<T> =
    VizCatalogTabulatorEventRegistry<T>,
> extends ZirconViz<R> {
  private _itemCollections: {
    [id: string]: ItemCollection;
  } = {};
  private _dataType: string = 'unknown data type';
  private _indexationMethod: (el: T) => string;

  private _div: HTMLDivElement = null;
  private _catalogTabulatorDiv: HTMLDivElement = null;
  private _itemCollectionSelector: CollectionCatalogSelectorComponent = null;
  private _menu: HTMLDivElement = null;
  private _menuDiv: HTMLDivElement = null;
  private _dataTable: Tabulator = null;
  private _local: boolean = true;

  /**
   * constructor
   */
  constructor(
    dataType: string,
    indexationMethod: (el: T) => string,
    state?: VizCollectionCatalogTabulatorState,
  ) {
    super(state);
    this.setIndexMethod(indexationMethod);
    this._dataType = dataType;
  }

  protected override listenToEvents(): void {
    this.addListener('CATALOG_ENGINE_ELEMENTS_ADDED', (arg) => {
      this.onCATALOG_ENGINE_COLLECTION_ELEMENTS_CHANGED(
        arg.catalogDescriptor,
        arg.itemCollectionDescriptor,
      );
    });
    this.addListener('CATALOG_ENGINE_ELEMENTS_REMOVED', (arg) => {
      this.onCATALOG_ENGINE_COLLECTION_ELEMENTS_CHANGED(
        arg.catalogDescriptor,
        arg.itemCollectionDescriptor,
      );
    });
    this.addListener('CATALOG_ENGINE_ELEMENTS_SET', (arg) => {
      this.onCATALOG_ENGINE_COLLECTION_ELEMENTS_CHANGED(
        arg.catalogDescriptor,
        arg.itemCollectionDescriptor,
      );
    });

    this.addListener('CATALOG_ENGINE_COLLECTION_ADDED', (arg) => {
      this.onCATALOG_ENGINE_COLLECTIONS_CHANGED(arg.catalogDescriptor);
    });
    this.addListener('CATALOG_ENGINE_COLLECTION_REMOVED', (arg) => {
      this.onCATALOG_ENGINE_COLLECTIONS_CHANGED(arg.catalogDescriptor);
    });
    this.addListener('CATALOG_ENGINE_COLLECTION_CONTENT', (arg) => {
      this.onCATALOG_ENGINE_COLLECTION_CONTENT(
        arg.catalogDescriptor,
        arg.itemCollectionDescriptor,
        arg.items,
      );
    });
    this.addListener('CATALOG_ENGINE_COLLECTION_DESCRIPTORS', (arg) => {
      this.onCATALOG_ENGINE_COLLECTION_DESCRIPTORS(
        arg.catalogDescriptor,
        arg.itemCollectionDescriptors,
      );
    });
  }

  public getElementsType(): string {
    return this._dataType;
  }

  private onCATALOG_ENGINE_COLLECTION_DESCRIPTORS(
    catalogDescriptor: CatalogEngineDescriptor,
    itemCollectionDescriptors: ItemCollectionDescriptor[],
  ): void {
    if (catalogDescriptor?.dataType !== this.getElementsType()) return;
    this.getCollectionCatalogComponent().setItemCollectionDescriptors(
      itemCollectionDescriptors,
    );
  }

  private onCATALOG_ENGINE_COLLECTION_ELEMENTS_CHANGED(
    catalogDescriptor: CatalogEngineDescriptor,
    itemCollectionDescriptor: ItemCollectionDescriptor,
  ): void {
    if (catalogDescriptor?.dataType !== this.getElementsType()) return;
    this.requestItemCollectionContent(itemCollectionDescriptor.id);
  }

  private onCATALOG_ENGINE_COLLECTION_CONTENT(
    catalogDescriptor: CatalogEngineDescriptor,
    itemCollectionDescriptor: ItemCollectionDescriptor,
    items: T[],
  ): void {
    if (catalogDescriptor?.dataType !== this.getElementsType()) return;
    const array = new ItemArray<T>(itemCollectionDescriptor);
    array.addItems(items);
    this._itemCollections[itemCollectionDescriptor.id] = array;
    if (itemCollectionDescriptor.id === this.getSelectedCatalogId())
      this.setTabulatorData(items);
  }

  private onCATALOG_ENGINE_COLLECTIONS_CHANGED(
    catalogDescriptor: CatalogEngineDescriptor,
  ): void {
    if (catalogDescriptor?.dataType !== this.getElementsType()) return;
    this.emit('CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST', {
      dataType: this.getElementsType(),
    });
  }

  /**
   * Set indexation method
   * @param indexation
   */
  private setIndexMethod(indexation: (el: T) => string): void {
    this._indexationMethod = indexation;
  }

  /**
   * Get indexation method
   * @return indexation method
   */
  public getIndexMethod(): (el: T) => string {
    return this._indexationMethod;
  }

  public updateData(): boolean {
    // this.fetchData(URL_CELESTRACK);
    return true;
  }

  public update(): void {}

  public start(): void {}

  public close(): void {}

  // private celestrakJsonToSat(json: unknown): Satellite[] {
  //   if (!json) return [];
  //   if (!json.length) return [];
  //   const result: Satellite[] = [];
  //   json.forEach((element: unknown) => {
  //     result.push({
  //       OBJECT_NAME: element.OBJECT_NAME,
  //       OBJECT_ID: element.OBJECT_ID,
  //     });
  //   });
  //   return result;
  // }

  private displaySelectedCatalogContent(): void {
    const itemCollectionId: string =
      this.getCollectionCatalogComponent().getSelectedItemCollectionId();
    if (!itemCollectionId) return;
    const itemCollection: ItemCollection =
      this.getItemCollection(itemCollectionId);
    if (!itemCollection) {
      this.displayNoData();
      // ask for catalog content
      this.emit('CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST', {
        itemCollectionId: itemCollectionId,
      });
      return;
    }

    if (!itemCollection.getItems()) {
      this.requestItemCollectionContent(itemCollectionId);
    } else {
      // set stored values
      this.setTabulatorData(Object.values(itemCollection.getItems() as T[]));
    }
  }

  private requestItemCollectionContent(itemCollectionId: string): void {
    // ask for catalog content
    this.emit('CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST', {
      itemCollectionId: itemCollectionId,
    });
  }

  private getSelectedCatalogId(): string {
    return this.getCollectionCatalogComponent().getSelectedItemCollectionId();
  }

  private getItemCollection(itemCollectionId: string): ItemCollection {
    return this._itemCollections[itemCollectionId];
  }

  private setTabulatorData(items: T[]): Promise<void> {
    const tabulatorData: unknown[] = [];
    items.forEach((element: T) => {
      tabulatorData.push(element);
    });
    this.getTabulator().setData(tabulatorData);
    // force rebuild of columns (HACK: call two times set data)
    if (this.getTabulator().options.autoColumns)
      this.getTabulator().setColumns([]); // clear
    return this.getTabulator()
      .setData(tabulatorData)
      .then(() => {
        this.getTabulator().redraw();
      });
  }

  /**
   * @param parent  Parent element to dock chart into
   * @returns   true if chart was created and docked, false otherwise
   */
  public override async onDisplay(): Promise<void> {
    this.getTabulator().on('tableBuilt', () => {});
  }

  private displayNoData(): void {
    this.getTabulator().setData([]);
    this.getTabulator().options.placeholder = 'Retrieving data...';
    this.getTabulator().redraw();
  }

  private getTabulator(): Tabulator {
    if (this._dataTable) return this._dataTable;
    this._dataTable = new Tabulator(`#${this.getSatCatDiv().id}`, {
      minHeight: '100px',
      maxHeight: '100%',
      layout: 'fitColumns',
      pagination: true,
      paginationSize: 50,
      paginationSizeSelector: [10, 25, 50, 100],
      movableColumns: true,
      // paginationCounter: 'rows',
      resizableColumnFit: true,
      selectableRows: true, //make rows selectable
      autoColumns: true,
    });

    this._dataTable.on('rowClick', (e, row) => {
      this.emit('CATALOG_ITEM_SELECTED', { rowData: row.getData() });
    });

    this._dataTable.on('rowContext', function (e, row) {
      alert('Row ' + JSON.stringify(row.getData()) + ' Context Clicked!!!!');
    });
    this.enableDrag();
    this.enableDrop();
    return this._dataTable;
  }

  private enableDrag() {
    this._dataTable.on('rowMouseDown', (e, row) => {
      const el = row.getElement();

      el.setAttribute('draggable', 'true');

      el.addEventListener(
        'dragstart',
        (event: DragEvent) => {
          const selectedRows = this._dataTable.getSelectedRows();
          const rows = selectedRows.length ? selectedRows : [row];

          const data = rows.map((r) => r.getData());

          event.dataTransfer?.setData('application/json', JSON.stringify(data));

          event.dataTransfer!.effectAllowed = 'copy';
        },
        { once: true },
      );
    });
    return this._dataTable;
  }

  // TODO: ces methodes devraient etre generique dans la classe mere

  private enableDrop() {
    const container = this.getSatCatDiv();

    if (!container) return;

    container.addEventListener('dragover', (e) => {
      e.preventDefault(); // obligatoire
    });

    container.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();

      const json = e.dataTransfer?.getData('application/json');
      if (!json) return;

      const data = JSON.parse(json) as Array<unknown>;
      // TODO: unsafe cast: Check data type
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_REQUEST', {
        itemCollectionId:
          this.getCollectionCatalogComponent().getSelectedItemCollectionId(),
        items: data as T[],
      });
    });
  }

  // // Clic droit sur une ligne
  // this.getMainDiv().addEventListener('contextmenu', (event: MouseEvent) =>
  //   this.displayContextMenu(event),
  // );

  // // Clic en dehors du menu = cacher le menu
  // document.addEventListener('click', () => {
  //   this.getContextMenuDiv().style.display = 'none';
  // });

  // // this._dataTable.on(
  // //   'click',
  // //   'tr',
  // //   function (trElement: HTMLElement, e: Event, ...args: unknown[]) {
  // //     trElement.classList.add('active');
  // //   },
  // // );

  /**
   * Display Context Menu
   * @param event
   * @returns
   */
  private displayContextMenu(event: MouseEvent): void {
    event.preventDefault();

    const tr = (event.target as HTMLElement).closest('tr');
    if (!tr) return;

    // const row = this._dataTable.getData(tr);

    // // Sélection automatique si la ligne n’est pas sélectionnée
    // if (!tr.classList.contains('selected')) {
    //   this._dataTable.rows().deselect(); // désélectionner toutes les autres
    //   row.select();
    // }

    // Positionner et afficher le menu
    this.getContextMenuDiv().style.top = `${event.clientY}px`;
    this.getContextMenuDiv().style.left = `${event.clientX}px`;
    this.getContextMenuDiv().style.display = 'block';
  }

  /**
   * Hide Context Menu
   */
  private hideContextMenu(): void {
    this._menuDiv!.style.display = 'none';
  }

  private getContextMenu(): HTMLDivElement {
    if (this._menu) return this._menu;
    this._menu = document.createElement('div');
    this._menu.id = uuid();
    this._menu.classList.add('catalog-menu');

    // delete row action
    const deleteRow = document.createElement('p');
    deleteRow.innerHTML = 'Delete row';
    this._menu.appendChild(deleteRow);

    deleteRow!.addEventListener('click', () => {
      this.hideContextMenu();
    });

    // edit row action
    const editRow = document.createElement('p');
    editRow.innerHTML = 'Edit row';
    this._menu.appendChild(editRow);

    editRow!.addEventListener('click', () => {
      this.hideContextMenu();
    });
    return this._menu;
  }

  private getContextMenuDiv(): HTMLDivElement {
    if (this._menuDiv) return this._menuDiv;
    this._menuDiv = document.createElement('div');
    this._menuDiv.id = uuid();
    this._menuDiv.style.display = 'none';
    this._menuDiv.style.position = 'absolute';
    this._menuDiv.style.zIndex = '1000';
    this._menuDiv.classList.add('context-menu');
    this._menuDiv.appendChild(this.getContextMenu());
    // Actions du menu

    return this._menuDiv;
  }

  public getCollectionCatalogComponent(): CollectionCatalogSelectorComponent {
    if (this._itemCollectionSelector) return this._itemCollectionSelector;
    this._itemCollectionSelector = new CollectionCatalogSelectorComponent();
    this._itemCollectionSelector.getUI().classList.add('catalog-selector');
    this._itemCollectionSelector.onCreateNewCollection(
      (collectionName: string) => {
        this.emit('CATALOG_ENGINE_COLLECTION_CREATE_REQUEST', {
          itemCollectionDescriptor: {
            itemType: this.getElementsType(),
            name: collectionName,
          },
        });
      },
    );
    this._itemCollectionSelector.onSelectedItemCollectionChange((_: string) => {
      this.displaySelectedCatalogContent();
    });
    return this._itemCollectionSelector;
  }

  private selectCatalog(collectionId: string): boolean {
    return this.getCollectionCatalogComponent().selectItemCollection(
      collectionId,
    );
  }
  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getContainer(): HTMLDivElement {
    if (this._div) return this._div;
    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('catalog-container');
    this._div.appendChild(this.getCollectionCatalogComponent().getUI());
    this._div.appendChild(this.getSatCatDiv());
    // document.body.appendChild(this.getContextMenuDiv());

    return this._div;
  }

  /**
   */
  private getSatCatDiv(): HTMLDivElement {
    if (this._catalogTabulatorDiv) return this._catalogTabulatorDiv;
    this._catalogTabulatorDiv = document.createElement('div');
    this._catalogTabulatorDiv.id = `tabulator-div-${uuid()}`;
    this._catalogTabulatorDiv.classList.add('catalog-grid');
    return this._catalogTabulatorDiv;
  }

  public override updateResize(): boolean {
    // console.log(`update resize catalog ${this.getName()}`);
    this.getTabulator()?.redraw();
    return true;
  }
}
