import { v4 as uuid } from 'uuid';
import './viz-eye-catalog-tabulator.css';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CatalogCollectionSelectorComponent } from '../../catalog-ui/catalog-collection-component';
import {
  Catalog,
  CatalogDescriptor,
  CatalogEvents,
} from '../../libraries/catalog/catalog';

import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import {
  CatalogCollection,
  CatalogCollectionEvents,
} from '../../libraries/catalog/catalog-collection';
import { CatalogEngineEvents } from '../../sharp-eye/engines/catalog-engine';
import {
  ZirconViz,
  ZirconVizEventRegistry,
} from '../../zirconium/zircon-ui/zircon-viz-ui';
import { ZirconObjectState } from '../../zirconium/zircon-object';

/**
 * Events definition for Catalog Tabulator
 */
export type VizCatalogTabulatorEvents<CatalogElement> = {
  COLLECTION_GET_CATALOG_CONTENT_DONE: {
    catalogDescriptor: CatalogDescriptor;
    elements: CatalogElement[];
  };
  COLLECTION_CREATE_CATALOG_DONE: {
    catalogDescriptor: CatalogDescriptor;
    elements: CatalogElement[];
  };
  CATALOG_ITEM_SELECTED: {
    rowData: { [key: string]: unknown };
  };
};

/**
 * Events Registry for Catalog Tabulator
 */
export type VizCatalogTabulatorEventRegistry<CatalogElement> =
  MergeZirconRegistries<
    {
      incoming: MergePickEvents<
        [
          PickEvents<
            VizCatalogTabulatorEvents<CatalogElement>,
            | 'COLLECTION_GET_CATALOG_CONTENT_DONE'
            | 'COLLECTION_CREATE_CATALOG_DONE'
          >,
          PickEvents<CatalogEvents, 'CATALOG_CONTENT_CHANGED'>,
          PickEvents<
            CatalogCollectionEvents,
            'MANAGED_CATALOG_CONTENT_CHANGED'
          >,
        ]
      >;

      outgoing: MergePickEvents<
        [
          PickEvents<
            VizCatalogTabulatorEvents<CatalogElement>,
            'CATALOG_ITEM_SELECTED'
          >,
          PickEvents<
            CatalogEngineEvents<CatalogElement>,
            | 'COLLECTION_GET_CATALOG_CONTENT_REQUEST'
            | 'COLLECTION_CREATE_CATALOG_REQUEST'
            | 'COLLECTION_ADD_ELEMENTS_REQUEST'
            | 'COLLECTION_ADD_ELEMENTS_REQUEST'
          >,
        ]
      >;
    },
    ZirconVizEventRegistry
  >;

export interface VizCatalogCollectionTabulatorState extends ZirconObjectState {
  catalogId?: string;
}

export class VizCatalogCollectionTabulator<CatalogElement> extends ZirconViz<
  VizCatalogTabulatorEventRegistry<CatalogElement>
> {
  private _div: HTMLDivElement = null;
  private _catalogTabulatorDiv: HTMLDivElement = null;
  private _catalogSelector: CatalogCollectionSelectorComponent = null;
  private _menu: HTMLDivElement = null;
  private _menuDiv: HTMLDivElement = null;
  private _catColl: CatalogCollection<CatalogElement> = null;

  private _dataTable: Tabulator = null;
  private _local: boolean = true;
  private _catalogType: string = null;
  private _indexationMethod: (el: CatalogElement) => string;

  /**
   * constructor
   */
  constructor(
    catalogType: string,
    indexationMethod: (el: CatalogElement) => string,
    state?: VizCatalogCollectionTabulatorState,
  ) {
    super(state);
    this._indexationMethod = indexationMethod;
    this._catalogType = catalogType;
    this._catColl = new CatalogCollection(
      this.getCatalogType(),
      indexationMethod,
    );
  }

  protected override listenToEvents(): void {
    this.addListener('COLLECTION_CREATE_CATALOG_DONE', (arg) => {
      if (arg.catalogDescriptor?.type !== this.getCatalogType()) return;
      this.onCOLLECTION_CREATE_CATALOG_DONE(
        arg.catalogDescriptor,
        arg.elements,
      );
    });
    this.addListener('COLLECTION_GET_CATALOG_CONTENT_DONE', (arg) => {
      this.onCOLLECTION_GET_CATALOG_DONE(arg.catalogDescriptor, arg.elements);
    });
    this.addListener('MANAGED_CATALOG_CONTENT_CHANGED', (arg) => {
      this.onMANAGED_CATALOG_CONTENT_CHANGED(arg.catalogId);
    });
  }

  public getCatalogType(): string {
    return this._catalogType;
  }

  private onMANAGED_CATALOG_CONTENT_CHANGED(catalogId: string): void {
    if (
      this.getCatalogCollectionComponent().getSelectedCatalogId() === catalogId
    ) {
      this.emit('COLLECTION_GET_CATALOG_CONTENT_REQUEST', {
        catalogId: catalogId,
      });
    }
  }

  private onCOLLECTION_CREATE_CATALOG_DONE(
    catalogDescriptor: CatalogDescriptor,
    elements: CatalogElement[],
  ): void {
    const cat = new Catalog<CatalogElement>(
      this.getCatalogType(),
      catalogDescriptor,
      this._indexationMethod,
    );
    cat.setElements(elements);
    this.getCatalogCollectionComponent().addCatalog(cat);
    // select catalog if none is already selected
    if (this.getCatalogCollectionComponent().getSelectedCatalogId() === null)
      this.getCatalogCollectionComponent().selectCatalog(catalogDescriptor.id);
  }

  private onCOLLECTION_GET_CATALOG_DONE(
    catalogDescriptor: CatalogDescriptor,
    elements: CatalogElement[],
  ): void {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(
      catalogDescriptor.id,
    );
    if (cat) cat.setElements(elements);

    // TODO: ecouter catalog CONTENT_CHANGED
    this.displaySelectedCatalogContent();
  }

  /**
   * Set indexation method
   * @param indexation
   */
  private setIndexMethod(indexation: (el: CatalogElement) => string): void {
    this._indexationMethod = indexation;
  }

  /**
   * Get indexation method
   * @return indexation method
   */
  public getIndexMethod(): (el: CatalogElement) => string {
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
    const catId: string =
      this.getCatalogCollectionComponent().getSelectedCatalogId();
    if (!catId) return;
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catId);
    if (cat == null)
      throw new Error(
        `catalog id ${catId} is not in element catalog collection`,
      );
    if (!cat.getElements()) {
      // ask for catalog content
      this.emit('COLLECTION_GET_CATALOG_CONTENT_REQUEST', {
        catalogId: catId,
      });
    } else {
      // set stored values
      this.setTabulatorData(Object.values(cat.getElements()));
    }
  }

  private setTabulatorData(elements: CatalogElement[]): Promise<void> {
    const tabulatorData: unknown[] = [];
    elements.forEach((element: CatalogElement) => {
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
  public override onDisplay(): boolean {
    this.getTabulator().on('tableBuilt', () => {});
    return true;
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
      this.emit('COLLECTION_ADD_ELEMENTS_REQUEST', {
        catalogId: this.getCatalogCollectionComponent().getSelectedCatalogId(),
        elements: data as CatalogElement[],
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

  public getCatalogCollectionComponent(): CatalogCollectionSelectorComponent {
    if (this._catalogSelector) return this._catalogSelector;
    this._catalogSelector = new CatalogCollectionSelectorComponent();
    this._catalogSelector.setCatalogCollection(this._catColl);
    this._catalogSelector.getUI().classList.add('catalog-selector');
    this._catalogSelector.onCreateNewCatalog((catalogName: string) => {
      this.emit('COLLECTION_CREATE_CATALOG_REQUEST', {
        catalogType: this.getCatalogType(),
        catalogDescriptor: { name: catalogName },
      });
    });
    this._catalogSelector.onSelectedCatalogChange((_: string) => {
      this.displaySelectedCatalogContent();
    });
    return this._catalogSelector;
  }

  private selectCatalog(catId: string): boolean {
    return this.getCatalogCollectionComponent().selectCatalog(catId);
  }
  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._div) return this._div;
    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('catalog-container');
    this._div.appendChild(this.getCatalogCollectionComponent().getUI());
    this._div.appendChild(this.getSatCatDiv());
    // document.body.appendChild(this.getContextMenuDiv());

    return this._div;
  }

  /**
   */
  public getSatCatDiv(): HTMLDivElement {
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
