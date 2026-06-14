import { v4 as uuid } from 'uuid';
import {
  ZIRCON_DROPPABLE_CLASS,
  ZIRCON_TARGET_DESKTOP_ID,
  ZirconApplication,
  ZirconApplicationEvents,
} from './zircon-app';
import {
  ZirconDesktop,
  ZirconDesktopEvents,
} from '../zircon-ui/zircon-desktop';
import {
  ZirconObject,
  ZirconObjectEvents,
  ZirconObjectState,
} from './zircon-object';
import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
} from './zircon-app-object';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ArrayComparisonResult, Zircon } from '../zircon';
import { ZirconWindow } from '../zircon-ui/zircon-window';
import {
  ACTIVE_DESKTOP_CLASS,
  DESKTOP_SELECTOR_CLASS,
  DESKTOPS_CONTAINER_CLASS,
  DESKTOPS_MANAGER_CLASS,
  DESKTOPS_MANAGER_HEADER_CLASS,
  DESKTOPS_SELECTOR_CLASS,
  TOOLBAR_CONTAINER_CLASS,
  ZIRCON_DESKTOP_MANAGER_TYPE,
} from './zircon-types';
import { ToolbarElement as ToolbarElementDescriptor } from './zircon-desktop-manager-toolbar';

export interface ZirconDesktopManagerState extends ZirconObjectState {
  type: typeof ZIRCON_DESKTOP_MANAGER_TYPE;
  desktopIds: string[];
}

export type ZirconDesktopManagerEvents = {
  // DESKTOP_MANAGER_STATE_REQUEST: { desktopManagerId: string };
  // DESKTOP_MANAGER_STATE: { state: ZirconDesktopManagerState };
  DESKTOP_MANAGER_DESKTOP_IDS_CHANGED: {
    desktopManagerId: string;
    desktopIds: string[];
  };
};

// TODO: faire un evenement pour l'ajout et la suppression de desktop

export type ZirconDesktopManagerEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconDesktopEvents,
          | 'DESKTOP_ACTIVATED'
          | 'DESKTOP_DEACTIVATED'
          | 'DESKTOP_ACTIVATE_REQUEST'
        >,
        // PickEvents<ZirconDesktopManagerEvents, 'DESKTOP_MANAGER_STATE'>,
        PickEvents<ZirconObjectEvents, 'OBJECT_NAME_CHANGED'>,
        PickEvents<ZirconApplicationEvents, 'OBJECT_STATE_REGISTERED'>,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconDesktopEvents,
          'DESKTOP_ACTIVATE_REQUEST' | 'DESKTOP_DEACTIVATE_REQUEST'
        >,
        PickEvents<
          ZirconDesktopManagerEvents,
          // | 'DESKTOP_MANAGER_STATE_REQUEST'
          // | 'DESKTOP_MANAGER_STATE_REQUEST'
          'DESKTOP_MANAGER_DESKTOP_IDS_CHANGED'
        >,
      ]
    >;
  },
  ZirconAppObjectEventRegistry
>;

interface ZirconDesktopManagerUI {
  desktop: ZirconDesktop;
  desktopElement: HTMLElement;
  desktopSelectorElement: HTMLElement;
}

/**
 * A Zircon View Region is a collection  of managed Zircon Desktops
 */
export class ZirconDesktopManager<
  R extends ZirconDesktopManagerEventRegistry =
    ZirconDesktopManagerEventRegistry,
> extends ZirconAppObject<R> {
  // private __parent: HTMLElement = null;
  private __mainDiv: HTMLDivElement = null;
  private __headerDiv: HTMLDivElement = null;
  private __toolbarContainer: HTMLDivElement = null;
  private __desktopContainer: HTMLDivElement = null;
  private __desktopsSelectorContainer: HTMLDivElement = null;
  private __desktopNameContainer: HTMLDivElement = null;
  private __desktopNameSpan: HTMLSpanElement = null;
  private __toolbarElements: { [id: string]: ToolbarElementDescriptor } = {};
  // private _currentD: { desktop: ZirconDesktop; button: HTMLElement } = null;
  private _desktopIds: string[] = [];

  private __displayedDesktops: {
    [id: string]: ZirconDesktopManagerUI;
  } = {};

  private _desktopSelectorElementParams: {
    timer: NodeJS.Timeout;
    startX: number;
    startY: number;
  } = {
    timer: null,
    startX: 0,
    startY: 0,
  };

  /**
   * Constructor for ZirconDesktopManager
   * @param appUI The Zircon application instance
   */
  constructor(appUI: ZirconApplication, state?: ZirconDesktopManagerState) {
    super(appUI, state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('DESKTOP_ACTIVATE_REQUEST', (arg) =>
      this.onDESKTOP_ACTIVATE_REQUEST(arg.desktopId),
    );
    this.addListener('DESKTOP_DEACTIVATED', (arg) =>
      this.onDESKTOP_DEACTIVATE_REQUEST(arg.desktopId),
    );
    this.addListener('OBJECT_NAME_CHANGED', (arg) =>
      this.onOBJECT_NAME_CHANGED(arg.id, arg.name),
    );

    this.addListener('OBJECT_STATE_REGISTERED', (arg) =>
      this.onOBJECT_DESKTOP_MANAGER_STATE_REGISTERED(arg.state),
    );
  }

  /**
   * Handles desktop activation request event
   * @param desktopId The ID of the desktop to activate
   */
  private onDESKTOP_ACTIVATE_REQUEST(desktopId: string): void {
    this.setActiveDesktop(desktopId);
  }

  /**
   * Handles desktop deactivation request event
   * @param desktopId The ID of the desktop to deactivate
   */
  private onDESKTOP_DEACTIVATE_REQUEST(_desktopId: string): void {
    //this.deactivateDesktop(desktopId);
  }

  /**
   * Check if the state registration is the desktop manager
   */
  private onOBJECT_DESKTOP_MANAGER_STATE_REGISTERED(
    state: ZirconObjectState,
  ): void {
    if (state.type === ZIRCON_DESKTOP_MANAGER_TYPE) {
      this.setState(state as ZirconDesktopManagerState);
      return;
    }
  }

  /**
   * Handles object name change event
   * @param id The ID of the object whose name changed
   * @param name The new name of the object
   */
  private onOBJECT_NAME_CHANGED(id: string, name: string): void {
    const ui: ZirconDesktopManagerUI = this.__displayedDesktops[id];
    if (ui) {
      ui.desktopSelectorElement.innerHTML = `<span>${name}</span>`; // TODO: this should be in a method from a UI element
    }
  }

  /**
   * Handles desktop manager state update event
   * @param state The new state of the desktop manager
   */
  private onDESKTOP_MANAGER_STATE(state: ZirconDesktopManagerState): void {
    if (this.getId() !== state.id) {
      return;
    }
    this.setState(state);
  }

  /**
   * Gets the type identifier for this desktop manager
   * @returns The desktop manager type string
   */
  public override getType(): string {
    return ZIRCON_DESKTOP_MANAGER_TYPE;
  }

  /**
   * Sets the state of the desktop manager
   * @param state The new state to apply
   * @returns A promise that resolves when the state is set
   */
  protected override async setState(
    state: ZirconDesktopManagerState,
  ): Promise<void> {
    if (!state) {
      return;
    }
    await super.setState(state);
    this.setDesktopIds(state.desktopIds);
  }

  public isDisplayed(): boolean {
    return this.__desktopContainer !== null;
  }
  /**
   * Sets the desktop IDs managed by this desktop manager
   * @param desktopIds Array of desktop IDs to manage
   */
  private setDesktopIds(desktopIds: string[]): void {
    const res: ArrayComparisonResult = Zircon.arrayComparison(
      this.getDesktopIds(),
      desktopIds,
    );
    this._desktopIds = desktopIds;
    if (this.isDisplayed()) {
      res.inserted?.forEach((desktopId) => {
        this.displayDesktop(desktopId);
      });
      res.deleted?.forEach((desktopId) => {
        this.undisplayDesktop(desktopId);
      });
    }
    this.emit('DESKTOP_MANAGER_DESKTOP_IDS_CHANGED', {
      desktopManagerId: this.getId(),
      desktopIds: desktopIds,
    });
  }

  /**
   * Displays a desktop in the UI
   * @param desktopId The ID of the desktop to display
   * @returns A promise that resolves when the desktop is displayed
   */
  private displayDesktop(desktopId: string): Promise<void> {
    if (!desktopId) {
      return Promise.resolve();
    }
    const ui: ZirconDesktopManagerUI = this.__displayedDesktops[desktopId];
    if (ui) {
      return Promise.resolve();
    }
    return this.getApplication()
      .getInstance(desktopId)
      .then((obj: ZirconObject) => {
        if (!(obj instanceof ZirconDesktop)) {
          throw new Error(
            `Cannot display desktop with id ${desktopId} object is not a desktop: type ${obj.getType()}`,
          );
        }
        const desktop: ZirconDesktop = obj;
        // add desktop in desktop container
        const desktopElement = desktop.getContainer();
        this.getDesktopsContainer().appendChild(desktopElement);
        // add desktop selector element in desktop selector container
        const desktopSelectorElement =
          this.createDesktopSelectorElement(desktop);
        this.getDesktopsSelectorsContainer().appendChild(
          desktopSelectorElement,
        );
        this.__displayedDesktops[desktopId] = {
          desktop: desktop,
          desktopElement: desktopElement,
          desktopSelectorElement: desktopSelectorElement,
        };
      });
  }

  /**
   * Removes a desktop from the UI display
   * @param desktopId The ID of the desktop to undisplay
   * @returns True if the desktop was successfully undisplayed, false otherwise
   */
  private undisplayDesktop(desktopId: string): boolean {
    if (!desktopId) {
      return false;
    }
    const ui: ZirconDesktopManagerUI = this.__displayedDesktops[desktopId];
    if (ui) {
      return false;
    }
    this.getDesktopsContainer().removeChild(ui.desktopElement);
    this.getDesktopsSelectorsContainer().removeChild(ui.desktopSelectorElement);
    delete this.__displayedDesktops[desktopId];
    return true;
  }

  /**
   * Displays all managed desktops in the UI
   * @returns A promise that resolves when all desktops are displayed
   */
  private displayDesktops(): Promise<void> {
    return Promise.all(
      this._desktopIds.map((id) => this.displayDesktop(id)),
    ).then(null);
  }

  /**
   * Generates the current state of this desktop manager
   * @returns The current state object
   */
  public override generateCurrentState(): ZirconDesktopManagerState {
    return {
      ...super.generateCurrentState(),
      desktopIds: [...this._desktopIds],
      type: ZIRCON_DESKTOP_MANAGER_TYPE,
    };
  }

  /**
   * Gets the array of desktop IDs managed by this desktop manager
   * @returns Array of desktop IDs
   */
  public getDesktopIds(): string[] {
    return this._desktopIds;
  }

  /**
   * Gets the array of currently displayed desktops
   * @returns Array of displayed desktop UI objects
   */
  public getDisplayedDesktops(): ZirconDesktop[] {
    return Object.values(this.__displayedDesktops).map((ui) => ui.desktop);
  }

  public temporaryMoveWindowPanelToDesktopManager(window: ZirconWindow): void {
    this.getApplication()
      ?.getDesktopManager()
      ?.getDesktopsContainer()
      ?.appendChild(window.getContainer());
  }

  public temporaryUnmoveWindowPanelFromDesktopManager(
    window: ZirconWindow,
  ): void {
    window
      ?.getParentDesktop()
      ?.getContainer()
      ?.appendChild(window.getContainer());
  }

  /**
   * Displays the UI in the specified parent element
   * @param parent The parent HTML element to display in
   * @returns True if something was added to the DOM, false otherwise
   */
  public async displayUIIn(parent: HTMLElement): Promise<boolean> {
    if (!parent) {
      return false;
    }
    const mainDiv = this.getMainDiv();
    if (!mainDiv) {
      return false;
    }
    if (parent.contains(mainDiv)) {
      return false;
    }
    // append app mainDiv in given parent
    parent.appendChild(mainDiv);
    // append desktopManager UI in app mainDiv
    await this.displayDesktops();
    return true;
  }

  /**
   * Gets the main container HTML element
   * @returns The main container element
   */
  private getContainer(): HTMLElement {
    return this.getMainDiv();
  }
  /**
   * Gets the main div element for the desktop manager
   * @returns The main div element
   */
  private getMainDiv(): HTMLDivElement {
    if (this.__mainDiv) {
      return this.__mainDiv;
    }
    this.__mainDiv = document.createElement('div');
    this.__mainDiv.setAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
      this.getId(),
    );
    this.__mainDiv.classList.add(DESKTOPS_MANAGER_CLASS);
    this.__mainDiv.appendChild(this.getHeaderDiv());
    this.__mainDiv.appendChild(this.getDesktopsContainer());
    return this.__mainDiv;
  }

  /**
   * Gets the container element for desktops
   * @returns The desktops container div element
   */
  private getDesktopsContainer(): HTMLDivElement {
    if (this.__desktopContainer) {
      return this.__desktopContainer;
    }
    this.__desktopContainer = document.createElement('div');
    this.__desktopContainer.classList.add(DESKTOPS_CONTAINER_CLASS);
    this.__desktopContainer.id = `desktop-container-${this.getId()}`;
    this.__desktopNameContainer = document.createElement('div');
    this.__desktopNameContainer.classList.add('desktop-name-container');
    this.__desktopNameSpan = document.createElement('span');
    this.__desktopNameSpan.classList.add('desktop-name');
    this.__desktopContainer.appendChild(this.__desktopNameContainer);
    this.__desktopNameContainer.appendChild(this.__desktopNameSpan);
    this.__desktopNameSpan.innerHTML = 'Desktop Name';
    return this.__desktopContainer;
  }

  private getToolbarContainer(): HTMLDivElement {
    if (this.__toolbarContainer) {
      return this.__toolbarContainer;
    }
    this.__toolbarContainer = document.createElement('div');
    this.__toolbarContainer.classList.add(TOOLBAR_CONTAINER_CLASS);
    this.__toolbarContainer.id = `toolbar-container-${this.getId()}`;
    this.__toolbarContainer.innerHTML =
      '<div>A</div><div>B</div><div>C</div><div>D</div>';
    Object.keys(this.__toolbarElements).forEach((toolbarElementId: string) => {
      this.displayToolbarElement(toolbarElementId);
    });
    return this.__toolbarContainer;
  }

  /**
   * Gets the container element for desktop selectors
   * @returns The desktop selectors container div element
   */
  private getDesktopsSelectorsContainer(): HTMLDivElement {
    if (this.__desktopsSelectorContainer) {
      return this.__desktopsSelectorContainer;
    }
    this.__desktopsSelectorContainer = document.createElement('div');
    this.__desktopsSelectorContainer.classList.add(DESKTOPS_SELECTOR_CLASS);
    this.__desktopsSelectorContainer.id = `desktop-selector-${this.getId()}`;
    this.__desktopsSelectorContainer.setAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
      this.getId(),
    );

    return this.__desktopsSelectorContainer;
  }

  private getHeaderDiv(): HTMLDivElement {
    if (this.__headerDiv) {
      return this.__headerDiv;
    }
    this.__headerDiv = document.createElement('div');
    this.__headerDiv.classList.add(DESKTOPS_MANAGER_HEADER_CLASS);
    this.__headerDiv.id = `desktops-manager-header-${this.getId()}`;
    this.__headerDiv.setAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
      this.getId(),
    );
    this.__headerDiv.appendChild(this.getDesktopsSelectorsContainer());
    this.__headerDiv.appendChild(this.getToolbarContainer());
    return this.__headerDiv;
  }

  /**
   * Creates the selector element for a desktop with event handlers
   * @param desktop The desktop instance
   * @returns The created selector HTML element
   */
  private createDesktopSelectorElement(desktop: ZirconDesktop): HTMLElement {
    const desktopSelectorElement = document.createElement('div');
    desktopSelectorElement.classList.add(DESKTOP_SELECTOR_CLASS);
    desktopSelectorElement.classList.add(ZIRCON_DROPPABLE_CLASS);
    desktopSelectorElement.innerHTML = `<span>${desktop.getName()}</span>`;
    desktopSelectorElement.setAttribute(
      ZIRCON_TARGET_DESKTOP_ID,
      desktop.getId(),
    );
    this._desktopSelectorElementParams.timer = null;
    this._desktopSelectorElementParams.startX = 0;
    this._desktopSelectorElementParams.startY = 0;

    const delay = 500; // durée (ms)
    const tolerance = 10; // pixels max autorisés

    desktopSelectorElement.addEventListener('mouseenter', (e: MouseEvent) => {
      this._desktopSelectorElementParams.startX = e.clientX;
      this._desktopSelectorElementParams.startY = e.clientY;

      this._desktopSelectorElementParams.timer = setTimeout(() => {
        console.log(
          'Hover stable détecté ! switch to desktop ' + desktop.getId(),
        );
        this.emit('DESKTOP_ACTIVATE_REQUEST', { desktopId: desktop.getId() });
      }, delay);
    });
    desktopSelectorElement.addEventListener('mousemove', (e: MouseEvent) => {
      const dx = Math.abs(
        e.clientX - this._desktopSelectorElementParams.startX,
      );
      const dy = Math.abs(
        e.clientY - this._desktopSelectorElementParams.startY,
      );

      if (dx > tolerance || dy > tolerance) {
        clearTimeout(this._desktopSelectorElementParams.timer);

        // reset point de référence
        this._desktopSelectorElementParams.startX = e.clientX;
        this._desktopSelectorElementParams.startY = e.clientY;

        this._desktopSelectorElementParams.timer = setTimeout(() => {
          this.setActiveDesktop(desktop.getId());
        }, delay);
      }
    });

    desktopSelectorElement.addEventListener('mouseleave', () => {
      clearTimeout(this._desktopSelectorElementParams.timer);
      this._desktopSelectorElementParams.timer = null;
    });

    desktopSelectorElement.addEventListener('click', () =>
      this.emit('DESKTOP_ACTIVATE_REQUEST', { desktopId: desktop.getId() }),
    );
    return desktopSelectorElement;
  }

  /**
   * Activates a desktop by adding the active class to its UI elements and updating the display name
   * @param desktopId The ID of the desktop to activate
   * @returns True if the desktop was successfully activated, false otherwise
   */
  private setActiveDesktop(desktopId: string): boolean {
    if (!desktopId) {
      return false;
    }
    const ui = this.__displayedDesktops[desktopId];
    if (!ui) {
      return;
    }

    Object.values(this.__displayedDesktops).forEach(
      (ui: ZirconDesktopManagerUI) => {
        ui?.desktopSelectorElement?.classList.toggle(
          ACTIVE_DESKTOP_CLASS,
          ui.desktop?.getId() === desktopId,
        );
        ui?.desktopElement?.classList.toggle(
          ACTIVE_DESKTOP_CLASS,
          ui.desktop?.getId() === desktopId,
        );
      },
    );
    // update desktop name display
    const desktop: ZirconDesktop = this.__displayedDesktops[desktopId]?.desktop;
    if (this.__desktopNameSpan) {
      this.__desktopNameSpan.classList.remove('highlight');
      this.__desktopNameSpan.innerHTML = desktop?.getName();
      this.__desktopNameSpan.classList.add('highlight');
    }
    return true;
  }

  public addToolbarElement(toolbarElement: ToolbarElementDescriptor): string {
    if (!toolbarElement) {
      return;
    }
    const id = `toolber-element-${uuid()}`;
    this.__toolbarElements[id] = toolbarElement;
    this.displayToolbarElement(id);
    return id;
  }

  private displayToolbarElement(id: string): void {
    const toolbarElement: ToolbarElementDescriptor = this.__toolbarElements[id];
    if (!toolbarElement) {
      return;
    }
    if (!this.__toolbarContainer) {
      return;
    }
    const toolDiv = document.createElement('div');
    toolDiv.id = id;
    toolDiv.appendChild(toolbarElement.content);
    this.__toolbarContainer.append(toolDiv);
  }
}
