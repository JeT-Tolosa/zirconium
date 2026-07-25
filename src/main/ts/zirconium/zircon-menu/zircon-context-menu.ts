// import './zircon-context-menu.css';
import '@ui5/webcomponents/dist/Menu.js';
import '@ui5/webcomponents/dist/MenuItem.js';
import type Menu from '@ui5/webcomponents/dist/Menu.js';
import type MenuItem from '@ui5/webcomponents/dist/MenuItem.js';
import { v4 as uuid } from 'uuid';
import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
} from '../zircon-core/zircon-app-object';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  enableDarkTheme,
  applyModernContextMenuSkin,
} from './zircon-context-menu-theme';

const ZIRCON_CONTEXT_MENU_TYPE: string = 'zircon-context-menu';

// Le thème + le skin custom ne doivent être appliqués qu'une seule fois,
// même si plusieurs ZirconContextMenu sont instanciés dans l'appli.
let themeInitialized = false;
function ensureThemeInitialized(): void {
  if (themeInitialized) {
    return;
  }
  enableDarkTheme();
  applyModernContextMenuSkin();
  themeInitialized = true;
}

export type ZirconContextMenuItem = {
  label: string; // label displayed in menu
  action?: () => void; // action to perform when clicked
  children?: ZirconContextMenuItem[]; // submenus
  classes?: string[]; // adding classes to displayed menu cell
  unavailable?: boolean;
  icon?: string; // optional UI5 icon name (e.g. 'delete', 'edit')
};

export type ZirconContextMenuEventRegistry = ZirconAppObjectEventRegistry;

export class ZirconContextMenu<
  R extends ZirconContextMenuEventRegistry = ZirconContextMenuEventRegistry,
> extends ZirconAppObject<R> {
  private _menu: Menu = null;
  // invisible reference element used to position the ui5-menu at the mouse click
  private _opener: HTMLDivElement = null;
  private _parentElement: HTMLElement = null;
  // maps a ui5-menu-item back to the ZirconContextMenuItem it represents
  private _actionsByItem: WeakMap<MenuItem, ZirconContextMenuItem> =
    new WeakMap();

  /**
   * Constructor
   * @param applicationUI
   */
  constructor(applicationUI: ZirconApplication) {
    super(applicationUI);
    ensureThemeInitialized();

    // "opener" ghost element: ui5-menu positions itself relative to a real
    // DOM element, so we place a 0x0 invisible div at the click coordinates.
    this._opener = document.createElement('div');
    this._opener.id = `context-menu-opener-${uuid()}`;
    this._opener.style.position = 'fixed';
    this._opener.style.width = '0';
    this._opener.style.height = '0';
    this._opener.style.pointerEvents = 'none';
    document.body.appendChild(this._opener);

    this._menu = document.createElement('ui5-menu') as Menu;
    this._menu.id = `context-menu-${uuid()}`;
    this._menu.classList.add('zircon-context-menu');
    document.body.appendChild(this._menu);

    this._menu.addEventListener('item-click', (e) => {
      const clickedItem = (e as CustomEvent<{ item: MenuItem }>).detail.item;
      const zirconItem = this._actionsByItem.get(clickedItem);
      if (zirconItem?.action) {
        zirconItem.action();
      }
    });

    // ui5-menu handles ESC / outside click closing on its own; we still
    // want to close it when the parent scrolls or resizes.
    this._menu.addEventListener('close', () => {
      console.log('Context menu closed');
    });
  }

  public override getType(): string {
    return ZIRCON_CONTEXT_MENU_TYPE;
  }

  /**
   * display context menu at given position
   * @param x
   * @param y
   */
  private showMenu(x: number, y: number) {
    this._opener.style.left = `${x}px`;
    this._opener.style.top = `${y}px`;

    this._menu.opener = this._opener;
    this._menu.open = true;
  }

  /**
   * Hide Context Menu
   */
  private hideMenu() {
    this._menu.open = false;
  }

  /**
   * Add a contextMenu to parent Element
   * @param parentElement
   * @returns
   */
  public addContextMenu(parentElement: HTMLElement): void {
    this._parentElement = parentElement;
    if (!this._parentElement) {
      return;
    }

    parentElement.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      console.log('Display context Menu');
      const elements = document.elementsFromPoint(e.clientX, e.clientY);

      this.createMenu(elements);

      this.showMenu(e.clientX, e.clientY);
    });
    parentElement.addEventListener('click', () => this.hideMenu());
    parentElement.addEventListener('scroll', () => this.hideMenu());
    parentElement.addEventListener('resize', () => this.hideMenu());
  }

  public displayIn(parent: HTMLElement): void {
    this.addContextMenu(parent);
  }

  /**
   * transform Menu items into ui5-menu-item hierarchy
   * @param items
   * @returns array of MenuItem elements (to be appended as children of a
   *          ui5-menu or of a parent ui5-menu-item for submenus)
   */
  private buildMenuElements(items: ZirconContextMenuItem[]): MenuItem[] {
    return items.map((item) => {
      const menuItem = document.createElement('ui5-menu-item') as MenuItem;
      menuItem.text = item.label;

      if (item.icon) {
        menuItem.icon = item.icon;
      }
      if (item.classes) {
        item.classes.forEach((clazz) => menuItem.classList.add(clazz));
      }
      if (item.unavailable) {
        menuItem.disabled = true;
      }
      if (item.children) {
        this.buildMenuElements(item.children).forEach((childEl) =>
          menuItem.appendChild(childEl),
        );
      }

      this._actionsByItem.set(menuItem, item);

      return menuItem;
    });
  }

  // TODO: we should stop using a factory type when it already handles an element
  // -> we want window AND visualizers handled if they are over
  // -> we dont want two windows handled is they are over
  /**
   * Create ContextMenu depending on FIRST UI visible elements under pointer
   * @param elements
   */
  private createMenu(elements: Element[]): void {
    // clear previous items
    this._menu.innerHTML = '';

    const menuItems: ZirconContextMenuItem[] = [
      { label: 'Common', action: () => console.log('Action') },
    ];

    // Stop at FIRST element handled by a context menu factory
    for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
      const element: Element = elements[elementIndex];
      const factories: ZirconContextMenuFactory[] = this.getApplication()
        .getObjectManager()
        .getContextMenuFactories();

      factories?.forEach((factory) => {
        if (!factory?.handledThisElement(element)) {
          return;
        }
        let objItems: ZirconContextMenuItem[] =
          factory.getContextMenuElements(element);
        if (!objItems) {
          return;
        }
        objItems = objItems.concat(
          this.getApplication()
            .getContextMenuFactory()
            ?.getContextMenuElements(element),
        );
        objItems.forEach((objItem) => {
          if (objItem) {
            menuItems.push(objItem);
          }
        });
      });
    }

    this.buildMenuElements(menuItems).forEach((el) =>
      this._menu.appendChild(el),
    );
  }
}

// import './zircon-context-menu.css';
// import { v4 as uuid } from 'uuid';
// import {
//   ZirconAppObject,
//   ZirconAppObjectEventRegistry,
//   ZirconAppObjectState,
// } from '../zircon-core/zircon-app-object';
// import { ZirconContextMenuFactory } from './zircon-context-menu-factory';
// import { ZirconApplication } from '../zircon-core/zircon-app';

// const ZIRCON_CONTEXT_MENU_TYPE: string = 'zircon-context-menu';

// export type ZirconContextMenuItem = {
//   label: string; //label displayed in menu
//   action?: () => void; // action to perform when clicked
//   children?: ZirconContextMenuItem[]; // submenus
//   classes?: string[]; // adding classes to displayed menu cell
//   unavailable?: boolean;
// };

// //const ZIRCON_CONTEXT_MENU_TYPE: string = 'zircon-context-menu';

// export type ZirconContextMenuEventRegistry = ZirconAppObjectEventRegistry;

// export class ZirconContextMenu<
//   R extends ZirconContextMenuEventRegistry = ZirconContextMenuEventRegistry,
// > extends ZirconAppObject<R> {
//   private _menu: HTMLDivElement = null;
//   private _parentElement: HTMLElement = null;

//   /**
//    * Constructor
//    * @param applicationUI
//    */
//   constructor(applicationUI: ZirconApplication, state?: ZirconAppObjectState) {
//     super(applicationUI, state);
//     this._menu = document.createElement('div');
//     this._menu.classList.add('zircon-context-menu');
//     this._menu.id = `context-menu-${uuid()}`;
//     document.body.appendChild(this._menu);
//   }

//   public override getType(): string {
//     return ZIRCON_CONTEXT_MENU_TYPE;
//   }

//   /**
//    * display context menu at given position
//    * @param x
//    * @param y
//    */
//   private showMenu(x: number, y: number) {
//     this._menu.classList.add('visible');
//     const rect = this._menu.getBoundingClientRect();

//     const maxX = window.innerWidth - rect.width;
//     const maxY = window.innerHeight - rect.height;

//     this._menu.style.left = `${Math.min(x, maxX)}px`;
//     this._menu.style.top = `${Math.min(y, maxY)}px`;
//   }

//   /**
//    * Show SubMenu when a menuElement is clicked or overred
//    * @param e
//    * @returns
//    */
//   private showMenuElement(e: MouseEvent) {
//     const li: HTMLElement = (e.target as HTMLElement).closest(
//       'li',
//     ) as HTMLElement;
//     if (!li) {
//       return;
//     }

//     const submenu = li.querySelector(':scope > ul') as HTMLElement;
//     if (!submenu) {
//       return;
//     }

//     submenu.classList.remove('open-left');

//     submenu.style.visibility = 'hidden';
//     submenu.style.display = 'block';

//     const rect = submenu.getBoundingClientRect();

//     if (rect.right > window.innerWidth) {
//       submenu.classList.add('open-left');
//     }

//     submenu.style.display = '';
//     submenu.style.visibility = '';
//   }

//   /**
//    * Hide Context Menu
//    */
//   private hideMenu() {
//     this._menu.classList.remove('visible');
//     console.log('Hide context Menu');
//   }

//   /**
//    * Add a contextMenu to parent Element
//    * @param parentElement
//    * @returns
//    */
//   public addContextMenu(parentElement: HTMLElement): void {
//     this._parentElement = parentElement;
//     if (!this._parentElement) {
//       return;
//     }

//     parentElement.addEventListener('contextmenu', (e) => {
//       e.preventDefault();
//       console.log('Display context Menu');
//       const elements = document.elementsFromPoint(e.clientX, e.clientY);

//       this.createMenu(elements);

//       this.showMenu(e.clientX, e.clientY);
//     });
//     parentElement.addEventListener('click', () => this.hideMenu());
//     parentElement.addEventListener('scroll', () => this.hideMenu());
//     parentElement.addEventListener('resize', () => this.hideMenu());
//   }

//   public displayIn(parent: HTMLElement): void {
//     this.addContextMenu(parent);
//   }

//   /**
//    * transform Menu items to HTMLElements hierarchy (ul > li)
//    * @param items
//    * @returns
//    */
//   private buildMenuElements(items: ZirconContextMenuItem[]): HTMLElement {
//     const ul = document.createElement('ul');

//     items.forEach((item) => {
//       const li = document.createElement('li');
//       li.textContent = item.label;
//       if (item.classes) {
//         item.classes.forEach((clazz) => {
//           li.classList.add(clazz);
//         });
//       }
//       if (item.unavailable) {
//         li.setAttribute('disabled', 'true');
//       }
//       if (item.children) {
//         li.classList.add('has-children');
//         li.classList.add('zircon-context-menu-item');
//         li.appendChild(this.buildMenuElements(item.children));
//         li.addEventListener('mouseover', (e: MouseEvent) =>
//           this.showMenuElement(e),
//         );
//       }

//       li.addEventListener('click', (e) => {
//         e.stopPropagation();
//         if (item.action) {
//           item.action();
//         }
//         this.hideMenu();
//       });

//       ul.appendChild(li);
//     });

//     return ul;
//   }

//   // TODO: we should stop using a factory type when it already handles an element
//   // -> we want window AND visualizers handled if they are over
//   // -> we dont want two windows handled is they are over
//   /**
//    * Create ContextMenu depending on FIRST UI visible elements under pointer
//    * @param elements
//    */
//   private createMenu(elements: Element[]): void {
//     this._menu.innerHTML = '';

//     const menuItems: ZirconContextMenuItem[] = [
//       { label: 'Common', action: () => console.log('Action') },
//     ];

//     // Stop at FIRST element handled by a context menu factory
//     for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
//       const element: Element = elements[elementIndex];
//       const factories: ZirconContextMenuFactory[] = this.getApplication()
//         .getObjectManager()
//         .getContextMenuFactories();

//       factories?.forEach((factory) => {
//         if (!factory?.handledThisElement(element)) {
//           return;
//         }
//         let objItems: ZirconContextMenuItem[] =
//           factory.getContextMenuElements(element);
//         if (!objItems) {
//           return;
//         }
//         objItems = objItems.concat(
//           this.getApplication()
//             .getContextMenuFactory()
//             ?.getContextMenuElements(element),
//         );
//         objItems.forEach((objItem) => {
//           if (objItem) {
//             menuItems.push(objItem);
//           }
//         });
//       });
//     }

//     this._menu.appendChild(this.buildMenuElements(menuItems));
//   }

//   // /**
//   //  * Create ContextMenu depending on UI visible elements under pointer
//   //  * @param elements
//   //  */
//   // private createMenu(elements: Element[]): void {
//   //   this._menu.innerHTML = '';

//   //   const menuItems: ZirconContextMenuItem[] = [
//   //     { label: 'Common', action: () => console.log('Action') },
//   //   ];

//   //   elements.forEach((element: Element) => {
//   //     const factories: ZirconContextMenuFactory[] = this.getApplication()
//   //       .getContextMenuFactoryRegistry()
//   //       .getFactories();

//   //     factories?.forEach((factory) => {
//   //       if (!factory.handledThisElement(element)) return;
//   //       const objItems: ZirconContextMenuItem[] =
//   //         factory.getContextMenuElements(element);
//   //       if (!objItems) return;
//   //       objItems.forEach((objItem) => {
//   //         if (objItem) menuItems.push(objItem);
//   //       });
//   //     });
//   //   });

//   //   this._menu.appendChild(this.buildMenuElements(menuItems));
//   // }
// }
