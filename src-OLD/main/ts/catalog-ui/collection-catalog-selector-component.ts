import { v4 as uuid } from 'uuid';
import { IonButton } from '@ionic/core/components/ion-button';
import { addCircle } from 'ionicons/icons';
import './catalog-collection-component.css';
import {
  ZirconInputReturnValue,
  ZirconModal,
} from '../zirconium/zircon-ui/zircon-modal-input';
import { ItemArray } from '../libraries/collection/item-array';
import { ItemDictionary } from '../libraries/collection/item-dictionary';

// export type CollectionSelectorComponentEvents = {
//   CREATE_NEW_CATALOG: { catalogName: string };
//   CHANGE_SELECTED_CATALOG: { selectedCatalogId: string };
// };

export class CollectionCatalogSelectorComponent<T> {
  private _dataType: string = null;
  private __mainDiv: HTMLDivElement = null;
  private __selectorLabel: HTMLLabelElement = null;
  private __collectionSelect: HTMLSelectElement = null;
  private __createNewCollectionButton: IonButton = null;
  private __createNewCollectionButtonIcon: HTMLElement = null;
  private __catIdLabel: HTMLLabelElement = null;
  private __catCountLabel: HTMLLabelElement = null;
  private __catalog: {[id:string]: ItemDictionary<T>} = {};
  private __onCreateNewCollection: (collectionName: string) => void = null;
  private __onSelectedCollectionChange: (collectionId: string) => void = null;

  // constructor(eventEmitter: EventEmitter2) {
  //   super(eventEmitter, null);
  // }

  public getDataType(): string {
    return this._dataType;
  }

  /**
   * Set callback when a new catalog is created
   */
  public onCreateNewCollection(cb: (catalogName: string) => void): void {
    this.__onCreateNewCollection = cb;
  }

  /**
   * Set callback when a new catalog is created
   */
  public onSelectedCatalogChange(cb: (catalogId: string) => void): void {
    this.__onSelectedCollectionChange = cb;
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
    if (this.__mainDiv) return this.__mainDiv;
    this.__mainDiv = document.createElement('div');
    this.__mainDiv.classList.add('catalog-collection-selector');
    this.__mainDiv.appendChild(this.getSelectorLabel());
    this.__mainDiv.appendChild(this.getCatalogSelect());
    this.__mainDiv.appendChild(this.getCreateNewCatalogButton());
    this.__mainDiv.appendChild(this.getCatIdLabel());
    this.__mainDiv.appendChild(this.getCatCountLabel());
    return this.__mainDiv;
  }

  public getSelectorLabel(): HTMLLabelElement {
    if (this.__selectorLabel) return this.__selectorLabel;
    this.__selectorLabel = document.createElement('label');
    this.__selectorLabel.innerHTML = 'Choose catalog:';
    this.__selectorLabel.setAttribute('for', this.getCatalogSelect().id);
    return this.__selectorLabel;
  }

  /**
   */
  public getCatIdLabel(): HTMLLabelElement {
    if (this.__catIdLabel) return this.__catIdLabel;
    this.__catIdLabel = document.createElement('label');
    this.__catIdLabel.innerHTML = `no selected`;
    return this.__catIdLabel;
  }

  /**
   */
  public getCatCountLabel(): HTMLLabelElement {
    if (this.__catCountLabel) return this.__catCountLabel;
    this.__catCountLabel = document.createElement('label');
    this.__catCountLabel.innerHTML = `?`;
    return this.__catCountLabel;
  }

  public getCreateNewCatalogButton(): HTMLElement {
    if (this.__createNewCollectionButton)
      return this.__createNewCollectionButton;

    this.__createNewCollectionButton = document.createElement('ion-button');

    this.__createNewCollectionButtonIcon = document.createElement('img');
    this.__createNewCollectionButtonIcon.setAttribute('src', addCircle);
    this.__createNewCollectionButton.appendChild(
      this.__createNewCollectionButtonIcon,
    );
    this.__createNewCollectionButton.addEventListener(
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
          this.addEmptyCollection?.(modalReturn.input);
        }
      },
    );

    return this.__createNewCollectionButton;
  }


  private addEmptyCollection(name: string): void {
    this.emit('CREATE_NEW_COLLECTION', { catalogName: name });
  }
  
  public getCatalogSelect(): HTMLSelectElement {
    if (this.__collectionSelect) return this.__collectionSelect;
    this.__collectionSelect = document.createElement('select');
    this.__collectionSelect.id = uuid();
    this.__collectionSelect.addEventListener('change', (_ev: Event) => {
      this.selectCatalog(
        this.__collectionSelect.options[this.__collectionSelect.selectedIndex]
          .value,
      );
    });
    return this.__collectionSelect;
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
    this.__onSelectedCollectionChange?.(catId);

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
    // add options
    let newSelectedIndex: number = -1;
    this._itemsCollection.
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
      this.__onSelectedCollectionChange?.(this._catColl?.getCatalogIds()[0]);
    }
  }
}

// /**
//  * Context Menu for CollectionSelectorComponent
//  */
// export class ZirconContextMenuFactoryCollectionSelectorComponent extends ZirconContextMenuFactory {
//   constructor(appUI: ZirconAppUI) {
//     super(appUI);
//   }

//   private getAssociatedCollectionSelectorComponent(
//     element: Element,
//   ): CollectionSelectorComponent {
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
//     if (!(obj instanceof CollectionSelectorComponent)) return null;
//     return obj;
//   }

//   public handledThisElement(element: Element): boolean {
//     return (
//       this.getAssociatedCollectionSelectorComponent(element) !== null
//     );
//   }

//   public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
//     const window: CollectionSelectorComponent =
//       this.getAssociatedCollectionSelectorComponent(element);
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
