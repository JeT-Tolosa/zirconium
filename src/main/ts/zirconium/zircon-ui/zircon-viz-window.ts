import 'jspanel4/dist/jspanel.min.css';
import 'jsoneditor/dist/jsoneditor.css';
import './zircon-viz-window.css';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ZirconViz, ZirconVizEvents } from './zircon-visualizer';
import {
  ZirconWindow,
  ZirconWindowEventRegistry,
  ZirconWindowState,
} from './zircon-window';
import { IJSPanelInstance } from 'jspanel4';
// import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import { ZIRCON_VISUALIZER_WINDOW_TYPE } from '../zircon-core/zircon-types';
import { ZirconObject } from '../zircon-core/zircon-object';
// ionic elements
import { defineCustomElements } from '@ionic/core/loader';
import '@ionic/core/css/core.css';
import '@ionic/core/css/structure.css';
import '@ionic/core/css/typography.css';
defineCustomElements(window);

export const ZIRCON_VISUALIZER_WINDOW_CLASS: string = 'zircon-viz';

export type ZirconVizWindowEvents = {
  WINDOW_VIZUALIZER_IDS_CHANGED: {
    windowId: string;
    vizIds: string[];
  };
};

export type ZirconVizWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<ZirconVizEvents, 'VISUALIZER_REMOVED_FROM_WINDOW'>]
    >;
    outgoing: MergePickEvents<
      [PickEvents<ZirconVizWindowEvents, 'WINDOW_VIZUALIZER_IDS_CHANGED'>]
    >;
  },
  ZirconWindowEventRegistry
>;

export interface ZirconVizWindowState extends ZirconWindowState {
  type: typeof ZIRCON_VISUALIZER_WINDOW_TYPE;
  vizIds?: string[];
  activeViz?: string;
}

export const DEFAULT_VISUALIZER_WINDOW_STATE: ZirconVizWindowState = {
  type: ZIRCON_VISUALIZER_WINDOW_TYPE,
  title: 'unnamed',
  left: 0,
  top: 0,
  width: 500,
  height: 500,
  vizIds: null,
};

interface VizDock {
  vizId: string;
  viz: ZirconViz;
  headerElement: HTMLIonSegmentButtonElement;
  viewElement: HTMLDivElement;
}

/**
 * A Zircon Frame is a floating window which can be docked in a Zircon Desktop
 */
export class ZirconVizWindow<
  R extends ZirconVizWindowEventRegistry = ZirconVizWindowEventRegistry,
> extends ZirconWindow<R> {
  private __visualizerDocks: { [vizId: string]: VizDock } = {};
  private _vizIds: string[] = [];
  private _activeVizId: string = null;
  private __mainContainer: HTMLDivElement = null;
  private __viewContainer: HTMLDivElement = null;
  private __segment: HTMLIonSegmentElement = null; // tabs container

  constructor(app: ZirconApplication, state?: ZirconVizWindowState) {
    super(app, state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    // TODO: shouldn't we only uses vizIds config ?
    // this.addListener('VISUALIZER_REMOVED_FROM_WINDOW', (arg) =>
    //   this.onVISUALIZER_REMOVED_FROM_WINDOW(arg.windowId, arg.vizId),
    // );
  }

  // private onVISUALIZER_REMOVED_FROM_WINDOW(
  //   windowId: string,
  //   vizId: string,
  // ): void {
  //   if (this.getId() === windowId) {
  //     if (this._vizIds.indexOf(vizId) === -1) {
  //       console.warn(
  //         `Incoherence vizId ${vizId} cannot be removed from window ${windowId}. Current vizIds are ${JSON.stringify(this._vizIds)}`,
  //       );
  //       return;
  //     }
  //     this.removeVisualizer(vizId);
  //   }
  // }

  public override getType(): string {
    return ZIRCON_VISUALIZER_WINDOW_TYPE;
  }

  protected override async setState(
    state: ZirconVizWindowState,
  ): Promise<void> {
    if (!state) {
      return;
    }
    await super.setState(state);
    await this.setVisualizerIds(state.vizIds);
    this.setActiveVizId(state.activeViz);
  }

  private setActiveVizId(vizId: string) {
    if (this._activeVizId === vizId) {
      return;
    }
    this._activeVizId = vizId;
    this.displayActiveViz();
    this.stateModified();
  }

  private async setVisualizerIds(vizIds: string[]): Promise<boolean> {
    if (!vizIds) {
      vizIds = [];
    }
    // let changes: boolean = false;
    // const res: ArrayComparisonResult = Zircon.arrayComparison(
    //   this.getVisualizerIds(),
    //   vizIds,
    // );
    // this._vizIds = vizIds.slice();
    // res.inserted?.forEach((vizId) => {
    //   this.addVisualizerDock(vizId);
    //   changes = true;
    // });
    // res.deleted?.forEach((vizId) => {
    //  this.removeVisualizerDock(vizId);
    //   changes = true;
    // });
    // if (changes) {
    //   this.emit('WINDOW_VIZUALIZER_IDS_CHANGED', {
    //     windowId: this.getId(),
    //     vizIds: vizIds,
    //   });
    // }
    this._vizIds = vizIds.slice();
    // TODO: we may reconstruct only modified docks...
    this.stateModified();
    await this.reconstructUI();
    return true;
  }

  public getVisualizerIds(): string[] {
    return this._vizIds.slice();
  }

  /**
   * Get the state of this window Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconVizWindowState {
    return {
      ...super.generateCurrentState(),
      vizIds: this._vizIds,
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    };
  }

  public override getEditedIds(): string[] {
    return this.getVisualizerIds();
  }

  protected override async onPanelCreated(
    panel: IJSPanelInstance,
  ): Promise<void> {
    super.onPanelCreated(panel);
    if (!panel) {
      throw new Error(
        `panel should not be null in Visualizer window Creation ID: ${this.getId()}`,
      );
    }
    panel.classList.add(ZIRCON_VISUALIZER_WINDOW_CLASS);

    this.getWindowContent().appendChild(this.getMainContainer());
    this.reconstructUI();
  }

  public addVisualizer(vizId: string) {
    if (!vizId) {
      return;
    }
    if (this._vizIds.indexOf(vizId) !== -1) {
      return;
    }
    const myState = this.generateCurrentState();
    myState.vizIds.push(vizId);
    this.setState(myState);
  }

  public removeVisualizer(vizId: string) {
    if (!vizId) {
      return;
    }
    if (this._vizIds.indexOf(vizId) === -1) {
      return;
    }
    const myState = this.generateCurrentState();
    myState.vizIds = myState.vizIds.filter((id) => id !== vizId);
    this.setState(myState);
  }

  public async getVisualizer(vizId: string): Promise<ZirconViz> {
    if (!vizId) {
      return null;
    }
    if (this.__visualizerDocks[vizId]?.viz) {
      return this.__visualizerDocks[vizId].viz;
    }

    const instance: ZirconObject =
      await this.getApplication().getInstance(vizId);
    if (!instance) {
      throw new Error(
        `Unable to retrieve Visualizer Id ${this._vizIds} in window ${this.getName()} / ${this.getId()}`,
      );
    }
    if (!(instance instanceof ZirconViz)) {
      const availableViz: string[] = this.getApplication()
        .getObjectManager()
        .getExistingObjects()
        .filter((obj) => obj instanceof ZirconViz)
        .map((obj) => obj.getId());
      throw new Error(
        `Retrieved Object Id ${this._vizIds} in window ${this.getId()} is not a visualizer: type = ${(instance as ZirconObject).getType()} available viz = ${JSON.stringify(availableViz)}`,
      );
    }
    return instance;
  }

  private removeVisualizerDock(vizId: string): void {
    const dock = this.__visualizerDocks[vizId];
    if (!dock) {
      return;
    }
    dock.viz?.unsetParent();
    this.getHeaderContainer().removeChild(dock.headerElement);
    this.getViewContainer().removeChild(dock.viewElement);
    delete this.__visualizerDocks[vizId];
  }

  private displayDock(dock: VizDock): void {
    if (!dock) {
      return;
    }
    dock.viz?.setParent(this);
    this.getHeaderContainer().appendChild(dock.headerElement);
    this.getViewContainer().appendChild(dock.viewElement);
    dock.viz?.onDisplay();
  }

  private async addVizualizerDock(vizId: string): Promise<VizDock> {
    if (!vizId) {
      return;
    }
    if (this.__visualizerDocks[vizId]) {
      return;
    }
    const viz = await this.getVisualizer(vizId);
    const viewElement = this.generateViewElement(viz);

    const vizDock: VizDock = {
      vizId: vizId,
      headerElement: this.generateHeaderElement(viz),
      viewElement: viewElement,
      viz: viz,
    };
    this.__visualizerDocks[vizId] = vizDock;

    this.displayDock(vizDock);
    return vizDock;
  }

  // private async removeVizualizerDock(vizId: string): Promise<VizDock> {
  //   if (!vizId) {
  //     return;
  //   }
  //   const dock = this.__visualizerDocks[vizId];
  //   if (!dock) {
  //     return;
  //   }
  //   this.undisplayDock(dock);
  //   delete this.__visualizerDocks[vizId];
  // }

  // public override getWindowContent(): HTMLDivElement {
  //   return this.getViewContainer();
  // }

  private generateViewElement(viz: ZirconViz): HTMLDivElement {
    if (!viz) {
      return null;
    }
    const viewElement = document.createElement('div');
    viewElement.appendChild(viz.getContainer());
    return viewElement;
  }

  private generateHeaderElement(viz: ZirconViz): HTMLIonSegmentButtonElement {
    if (!viz) {
      return null;
    }
    const headerElement = document.createElement('ion-segment-button');
    headerElement.value = viz.getId();
    headerElement.textContent = viz.getName();
    return headerElement;
  }

  private getHeaderContainer(): HTMLIonSegmentElement {
    if (this.__segment) {
      return this.__segment;
    }
    // SEGMENT (tabs)
    this.__segment = document.createElement('ion-segment');
    this.__segment.addEventListener('ionChange', (ev: CustomEvent) => {
      const vizId = ev.detail.value;
      console.log(`ion-changed vizId = ${vizId}`);
      this.setActiveVizId(vizId);
    });
    return this.__segment;
  }

  private displayActiveViz() {
    if (!this._activeVizId) {
      return;
    }
    this.__segment.value = this._activeVizId;
    Object.values(this.__visualizerDocks).forEach((dock) => {
      if (dock?.vizId === this._activeVizId) {
        this.showDock(dock);
      } else {
        this.hideDock(dock);
      }
    });
  }

  private showDock(dock: VizDock) {
    if (!dock) {
      return;
    }
    dock.viewElement.style.display = 'block';
  }

  private hideDock(dock: VizDock) {
    if (!dock) {
      return;
    }
    dock.viewElement.style.display = 'none';
  }

  private getViewContainer(): HTMLDivElement {
    if (this.__viewContainer) {
      return this.__viewContainer;
    }
    this.__viewContainer = document.createElement('div');
    this.__viewContainer.classList.add('zircon-window-view');

    // this.__viewContainer.style.flex = '1';
    // this.__viewContainer.style.position = 'relative';
    return this.__viewContainer;
  }

  private getMainContainer(): HTMLElement {
    if (this.__mainContainer) {
      return this.__mainContainer;
    }
    this.__mainContainer = document.createElement('div');
    this.__mainContainer.classList.add('zircon-window-tabs');
    // this.__tabContainer.style.display = 'flex';
    // this.__tabContainer.style.flexDirection = 'column';
    // this.__tabContainer.style.height = '100%';
    this.__mainContainer.appendChild(this.getHeaderContainer());
    this.__mainContainer.appendChild(this.getViewContainer());
    return this.__mainContainer;
  }

  private async reconstructUI(): Promise<void> {
    if (!this.isDisplayed()) {
      return;
    }

    super.getWindowContent().innerHTML = '';
    super.getWindowContent().appendChild(this.getMainContainer());
    this._vizIds.forEach((vizId) => {
      this.addVizualizerDock(vizId);
    });
    // default activation if none is activated
    if (!this._activeVizId && this._vizIds.length > 0) {
      this.setActiveVizId(this._vizIds[this._vizIds.length - 1]);
    }
    return;

    // if (!this.isDisplayed()) {
    //   return;
    // }
    // this.getWindowContent().innerHTML = '';
    // if (!this._vizIds) {
    //   this.getWindowContent().innerHTML = `<p>No Visualizer defined (vizId = null)</p>`;
    //   this.getWindowContent().style.background = `orange`;
    //   return;
    // }
    // this.getVisualizer()
    //   .then(async (viz: ZirconViz) => {
    //     if (viz) {
    //       await viz.setParent(this);
    //       this.__viz = viz;
    //     }
    //   })
    //   .catch((error) => {
    //     this.getWindowContent().innerHTML = `<p>${error.toString()}</p>`;
    //     this.getWindowContent().style.background = `red`;
    //   });
  }

  // public override getParameterComponents(): ZirconParameterComponent[] {
  //   super.getParameterComponent();
  //   let h2: HTMLHeadingElement = document.createElement('h2');
  //   h2.innerText = `Window ${this.getId()}`;
  //   container.appendChild(h2);

  //   const options: JSONEditorOptions = {
  //     mode: 'form',
  //     modes: ['tree', 'view', 'form', 'code', 'text', 'preview'],
  //     onChange: () => {
  //       this.setState(editor.get());
  //     },
  //   };
  //   const editor = new JSONEditor(container, options);
  //   editor.set(this.generateCurrentState());

  //   h2 = document.createElement('h2');
  //   h2.innerText = `Display multiple visualizers...`;
  //   // h2.innerText = this.__viz
  //   //   ? `Visualizer ${this.__viz.getId()} [${this.__viz.getType()}]`
  //   //   : `No Visualizer Id ${this._vizIds}`;

  //   // container.appendChild(h2);
  //   // if (this.__viz) {
  //   //   const editor = new JSONEditor(container, options);
  //   //   editor.set(this.__viz.generateCurrentState());
  //   // }
  // }
}
