import './zircon-context-menu.css';
import { v4 as uuid } from 'uuid';
import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
  ZirconAppObjectState,
} from '../zircon-core/zircon-app-object';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';
import { ZirconApplication } from '../zircon-core/zircon-app';

export type ZirconContextMenuItem = {
  label: string;
  action?: () => void;
  children?: ZirconContextMenuItem[];
};

//const ZIRCON_CONTEXT_MENU_TYPE: string = 'zircon-context-menu';

export type ZirconContextMenuEventRegistry = ZirconAppObjectEventRegistry;

export class ZirconContextMenu<
  R extends ZirconContextMenuEventRegistry = ZirconContextMenuEventRegistry,
> extends ZirconAppObject<R> {
  private _menu: HTMLDivElement = null;
  private _parentElement: HTMLElement = null;

  /**
   * Constructor
   * @param applicationUI
   */
  constructor(applicationUI: ZirconApplication, state?: ZirconAppObjectState) {
    super(applicationUI, state);
    this._menu = document.createElement('div');
    this._menu.classList.add('zircon-context-menu');
    this._menu.id = `context-menu-${uuid()}`;
    document.body.appendChild(this._menu);
  }

  /**
   * display context menu at given position
   * @param x
   * @param y
   */
  private showMenu(x: number, y: number) {
    this._menu.classList.add('visible');
    const rect = this._menu.getBoundingClientRect();

    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    this._menu.style.left = `${Math.min(x, maxX)}px`;
    this._menu.style.top = `${Math.min(y, maxY)}px`;
  }

  /**
   * Show SubMenu when a menuElement is clicked or overred
   * @param e
   * @returns
   */
  private showMenuElement(e: MouseEvent) {
    const li: HTMLElement = (e.target as HTMLElement).closest(
      'li',
    ) as HTMLElement;
    if (!li) return;

    const submenu = li.querySelector(':scope > ul') as HTMLElement;
    if (!submenu) return;

    submenu.classList.remove('open-left');

    submenu.style.visibility = 'hidden';
    submenu.style.display = 'block';

    const rect = submenu.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
      submenu.classList.add('open-left');
    }

    submenu.style.display = '';
    submenu.style.visibility = '';
  }

  /**
   * Hide Context Menu
   */
  private hideMenu() {
    this._menu.classList.remove('visible');
    console.log('Hide context Menu');
  }

  /**
   * Add a contextMenu to parent Element
   * @param parentElement
   * @returns
   */
  public addContextMenu(parentElement: HTMLElement): void {
    this._parentElement = parentElement;
    if (!this._parentElement) return;

    parentElement.addEventListener('contextmenu', (e) => {
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
   * transform Menu items to HTMLElements hierarchy (ul > li)
   * @param items
   * @returns
   */
  private buildMenuElements(items: ZirconContextMenuItem[]): HTMLElement {
    const ul = document.createElement('ul');

    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.label;

      if (item.children) {
        li.classList.add('has-children');
        li.classList.add('zircon-context-menu-item');
        li.appendChild(this.buildMenuElements(item.children));
        li.addEventListener('mouseover', (e: MouseEvent) =>
          this.showMenuElement(e),
        );
      }

      li.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.action) item.action();
        this.hideMenu();
      });

      ul.appendChild(li);
    });

    return ul;
  }

  /**
   * Create ContextMenu depending on UI visible elements under pointer
   * @param elements
   */
  private createMenu(elements: Element[]): void {
    this._menu.innerHTML = '';

    const menuItems: ZirconContextMenuItem[] = [
      { label: 'Common', action: () => console.log('Action') },
    ];

    elements.forEach((element: Element) => {
      const factories: ZirconContextMenuFactory[] = this.getApplication()
        .getContextMenuFactoryRegistry()
        .getFactories();

      factories?.forEach((factory) => {
        if (!factory.handledThisElement(element)) return;
        const objItems: ZirconContextMenuItem[] =
          factory.getContextMenuElements(element);
        if (!objItems) return;
        objItems.forEach((objItem) => {
          if (objItem) menuItems.push(objItem);
        });
      });
    });

    this._menu.appendChild(this.buildMenuElements(menuItems));
  }
}
