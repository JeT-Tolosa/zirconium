import { CatalogCollection } from '../libraries/catalog/catalog-collection';
import { Catalog } from '../libraries/catalog/catalog';
import { v4 as uuid } from 'uuid';
import { IonButton } from '@ionic/core/components/ion-button';
import { addCircle } from 'ionicons/icons';
import './catalog-collection-component.css';
import {
  ZirconInputReturnValue,
  ZirconModal,
} from '../zirconium/zircon-ui/zircon-modal-input';

// export type CatalogCollectionSelectorComponentEvents = {
//   CREATE_NEW_CATALOG: { catalogName: string };
//   CHANGE_SELECTED_CATALOG: { selectedCatalogId: string };
// };

export class CatalogCollectionSelectorComponent {
  private _mainDiv: HTMLDivElement = null;
  private _selectorLabel: HTMLLabelElement = null;
  private _catalogSelect: HTMLSelectElement = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _catColl: CatalogCollection<any> = null;
  private _createNewCatalogButton: IonButton = null;
  private _createNewCatalogButtonIcon: HTMLElement = null;
  private _catIdLabel: HTMLLabelElement = null;
  private _catCountLabel: HTMLLabelElement = null;
  private _onCreateNewCatalog: (catalogName: string) => void = null;
  private _onSelectedCatalogChange: (catalogId: string) => void = null;

  // constructor(eventEmitter: EventEmitter2) {
  //   super(eventEmitter, null);
  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setCatalogCollection(catColl: CatalogCollection<any>): void {
    this._catColl = catColl;
    this.updateOptions();
  }

  public getCatalogType(): string {
    return this._catColl?.getCatalogType();
  }

  /**
   * Set callback when a new catalog is created
   */
  public onCreateNewCatalog(cb: (catalogName: string) => void): void {
    this._onCreateNewCatalog = cb;
  }

  /**
   * Set callback when a new catalog is created
   */
  public onSelectedCatalogChange(cb: (catalogId: string) => void): void {
    this._onSelectedCatalogChange = cb;
  }

  // public setCatalogDescriptor(
  //   catalogDescriptor: CatalogDescriptor<unknown>,
  // ): boolean {
  //   if (!this._catColl) return false;
  //   if (!catalogDescriptor) return false;
  //   if (catalogDescriptor.id === null) return false;

  //   let cat: Catalog<unknown> = this._catColl?.getCatalog(catalogDescriptor.id);
  //   if (!cat) {
  //     this._catColl.addCatalog(new )
  //   }
  //   return true;
  // }

  public getUI(): HTMLElement {
    return this.getMainDiv();
  }

  public getSelectedCatalogId(): string {
    if (
      !this.getCatalogSelect().options ||
      this.getCatalogSelect().options.length <= 0
    )
      return null;
    const selectedIndex = this.getCatalogSelect().selectedIndex;
    if (selectedIndex < 0) return null;
    return this.getCatalogSelect().options[selectedIndex]?.value;
  }

  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.classList.add('catalog-collection-selector');
    this._mainDiv.appendChild(this.getSelectorLabel());
    this._mainDiv.appendChild(this.getCatalogSelect());
    this._mainDiv.appendChild(this.getCreateNewCatalogButton());
    this._mainDiv.appendChild(this.getCatIdLabel());
    this._mainDiv.appendChild(this.getCatCountLabel());
    return this._mainDiv;
  }

  public getSelectorLabel(): HTMLLabelElement {
    if (this._selectorLabel) return this._selectorLabel;
    this._selectorLabel = document.createElement('label');
    this._selectorLabel.innerHTML = 'Choose catalog:';
    this._selectorLabel.setAttribute('for', this.getCatalogSelect().id);
    return this._selectorLabel;
  }

  /**
   */
  public getCatIdLabel(): HTMLLabelElement {
    if (this._catIdLabel) return this._catIdLabel;
    this._catIdLabel = document.createElement('label');
    this._catIdLabel.innerHTML = `no selected`;
    return this._catIdLabel;
  }

  /**
   */
  public getCatCountLabel(): HTMLLabelElement {
    if (this._catCountLabel) return this._catCountLabel;
    this._catCountLabel = document.createElement('label');
    this._catCountLabel.innerHTML = `?`;
    return this._catCountLabel;
  }

  public getCreateNewCatalogButton(): HTMLElement {
    if (this._createNewCatalogButton) return this._createNewCatalogButton;

    this._createNewCatalogButton = document.createElement('ion-button');

    this._createNewCatalogButtonIcon = document.createElement('img');
    this._createNewCatalogButtonIcon.setAttribute('src', addCircle);
    this._createNewCatalogButton.appendChild(this._createNewCatalogButtonIcon);
    this._createNewCatalogButton.addEventListener(
      'click',
      async (_ev: Event) => {
        const modalReturn: ZirconInputReturnValue = await ZirconModal.openInput(
          {
            header: 'New Satellite Catalog Name',
            buttons: { ok: 'Create', cancel: 'Cancel' },
            defaultInput: 'Enter Catalog Name',
          },
        );
        if (modalReturn.button === 'ok') {
          this._onCreateNewCatalog?.(modalReturn.input);
        }
      },
    );

    return this._createNewCatalogButton;
  }

  public getCatalogSelect(): HTMLSelectElement {
    if (this._catalogSelect) return this._catalogSelect;
    this._catalogSelect = document.createElement('select');
    this._catalogSelect.id = uuid();
    this._catalogSelect.addEventListener('change', (_ev: Event) => {
      this.selectCatalog(
        this._catalogSelect.options[this._catalogSelect.selectedIndex].value,
      );
    });
    return this._catalogSelect;
  }

  public selectCatalog(catId: string): boolean {
    let newSelectedIndex: number = -1;
    for (let i = 0; i < this.getCatalogSelect().options.length; i++)
      if (catId === this.getCatalogSelect().options[i].value)
        newSelectedIndex = i;
    if (newSelectedIndex < 0) return false;
    this.getCatalogSelect().selectedIndex = newSelectedIndex;
    this.getCatIdLabel().innerHTML = `ID = ${catId}
    index = ${newSelectedIndex}`;
    this._onSelectedCatalogChange?.(catId);

    return true;
  }

  /**
   * Add a catalog in catalog selector
   * @param catalogId
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addCatalog(catalog: Catalog<any>): boolean {
    if (!this._catColl) return false;
    const returnValue: boolean = this._catColl.addCatalog(catalog);
    if (!returnValue) return false;
    this.updateOptions();
    return true;
  }

  // /**
  //  * Add a catalog in catalog selector
  //  * @param catalogId
  //  * @returns
  //  */
  // public addCatalogDescriptor(
  //   catalogDescriptor: CatalogDescriptor<unknown>,
  // ): boolean {
  //   const returnValue: boolean = this._catColl.addCatalog(catalog);
  //   this.updateOptions();
  //   return returnValue;
  // }

  public updateOptions(): void {
    const previousSelectedCatalogId: string = this.getSelectedCatalogId();
    this.getCatalogSelect().innerHTML = '';
    if (!this._catColl) return;
    // add options
    let newSelectedIndex: number = -1;
    this._catColl
      .getCatalogs()
      .forEach((cat: Catalog<unknown>, index: number) => {
        const option: HTMLOptionElement = document.createElement('option');
        if (cat.getId() == previousSelectedCatalogId) newSelectedIndex = index;
        option.value = cat.getId();
        option.innerHTML = cat.getName();
        this.getCatalogSelect().appendChild(option);
      });
    // reselect previous selection
    if (newSelectedIndex >= 0) {
      this.getCatalogSelect().selectedIndex = newSelectedIndex;
    }
    if (this._catColl?.getCatalogIds().length == 1) {
      // special case if there is only one element onChange is not fired
      this._onSelectedCatalogChange?.(this._catColl?.getCatalogIds()[0]);
    }
  }
}

// /**
//  * Context Menu for CatalogCollectionSelectorComponent
//  */
// export class ZirconContextMenuFactoryCatalogCollectionSelectorComponent extends ZirconContextMenuFactory {
//   constructor(appUI: ZirconAppUI) {
//     super(appUI);
//   }

//   private getAssociatedCatalogCollectionSelectorComponent(
//     element: Element,
//   ): CatalogCollectionSelectorComponent {
//     if (!element) return null;
//     if (!(element instanceof HTMLElement)) return null;
//     const htmlElement: HTMLElement = element;
//     const zirconObjectId = htmlElement.getAttribute(
//       ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
//     );
//     if (!zirconObjectId) return null;
//     const obj: ZirconObject =
//       this.getApplication().getManagedObject(zirconObjectId);
//     if (!obj) return;
//     if (!(obj instanceof CatalogCollectionSelectorComponent)) return null;
//     return obj;
//   }

//   public handledThisElement(element: Element): boolean {
//     return (
//       this.getAssociatedCatalogCollectionSelectorComponent(element) !== null
//     );
//   }

//   public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
//     const window: CatalogCollectionSelectorComponent =
//       this.getAssociatedCatalogCollectionSelectorComponent(element);
//     return [
//       {
//         label: 'window',
//         children: [
//           {
//             label: 'normalize',
//             action: () => {
//               window.emit('WINDOW_NORMALIZE_REQUEST', {
//                 windowId: window.getId(),
//               });
//             },
//           },
//           {
//             label: 'minimize',
//             action: () => {
//               window.emit('WINDOW_MINIMIZE_REQUEST', {
//                 windowId: window.getId(),
//               });
//             },
//           },
//           {
//             label: 'maximize',
//             action: () => {
//               window.emit('WINDOW_MAXIMIZE_REQUEST', {
//                 windowId: window.getId(),
//               });
//             },
//           },
//           {
//             label: 'close',
//             action: () => {
//               window.emit('WINDOW_CLOSE_REQUEST', { windowId: window.getId() });
//             },
//           },
//         ],
//       },
//     ];
//   }
// }
