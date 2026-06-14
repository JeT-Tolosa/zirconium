import { v4 as uuid } from 'uuid';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  ZIRCON_VISUALIZER_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconObject } from '../zircon-core/zircon-object';
import {
  ZirconVizWindow,
  ZirconVizWindowState,
} from '../zircon-ui/zircon-viz-window';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';
import { ZirconVizState } from '../zircon-ui/zircon-visualizer';

/**
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryVizWindow extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconVizWindow(element: Element): ZirconVizWindow {
    if (!element) {
      return null;
    }
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    const htmlElement: HTMLElement = element;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) {
      return null;
    }
    const obj: ZirconObject = this.getApplication()
      .getObjectManager()
      .getExistingInstance(zirconObjectId);
    if (!obj) {
      return null;
    }
    if (
      !this.getApplication()
        .getObjectManager()
        .isTypeOf(obj.getType(), ZIRCON_VISUALIZER_WINDOW_TYPE)
    ) {
      return null;
    }
    if (!(obj instanceof ZirconVizWindow)) {
      return null;
    }
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconVizWindow(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const window: ZirconVizWindow = this.getAssociatedZirconVizWindow(element);
    if (!window) {
      return null;
    }
    return [
      {
        label: `viz window ${window.getName()}`,
        children: [
          {
            label: 'parameters',
            action: () => {
              window.displayParameterWindow();
            },
          },

          // {
          //   label: 'change visualizer',
          //   children: Object.keys(
          //     this.getApplication().getRegisteredObjectStates(),
          //   ).map((objId: string) => {
          //     const obj: ZirconViz =
          //       this.getApplication().getExistingViz(objId);
          //     return {
          //       label: `${objId} (${obj == null ? 'not used' : `used in ${obj.getParentWindow()?.getId()}`})`,
          //       action: () => {
          //         this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
          //           objectId: window.getId(),
          //           state: {
          //             ...window.generateCurrentState(),
          //             vizId: objId,
          //           } as ZirconVizWindowState,
          //         });
          //       },
          //     };
          //   }),
          // },
          {
            label: 'new visualizer',
            children: this.getApplication()
              .getObjectManager()
              .getChildrenObjectTypes(ZIRCON_VISUALIZER_TYPE)
              .map((vizType: string) => {
                return this.createMenuElementNewViz(window, vizType);
              }),
          },
        ],
      },
    ];
  }

  private createMenuElementNewViz(
    window: ZirconVizWindow,
    vizType: string,
  ): ZirconContextMenuItem {
    return {
      label: `${vizType}`,
      action: () => {
        this.addVisualizerToVizWindow(window, vizType);
      },
    };
  }

  private addVisualizerToVizWindow(
    window: ZirconVizWindow,
    vizType: string,
  ): void {
    const vizState: ZirconVizState = {
      name: vizType,
      type: vizType,
      id: `${vizType}-${uuid()}`,
    };

    this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
      objectId: vizState.id,
      state: vizState,
    });
    const windowState: ZirconVizWindowState = window.generateCurrentState();
    windowState.vizId = vizState.id;
    this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
      objectId: windowState.id,
      state: windowState,
    });
  }
}
