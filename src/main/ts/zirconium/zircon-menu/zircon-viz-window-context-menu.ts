import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-object';
import { ZirconViz } from '../zircon-ui/zircon-visualizer';
import {
  ZirconVizWindow,
  ZirconVizWindowState,
} from '../zircon-ui/zircon-viz-window';
import { ZirconContextMenuItem } from './zircon-context-menu';
import { ZirconContextMenuFactory } from './zircon-context-menu-factory';

/**
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryVizWindow extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconVizWindow(element: Element): ZirconVizWindow {
    if (!element) return null;
    if (!(element instanceof HTMLElement)) return null;
    const htmlElement: HTMLElement = element;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) return null;
    const obj: ZirconVizWindow =
      this.getApplication().getExistingVizWindow(zirconObjectId);
    if (!obj) return;
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconVizWindow(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const window: ZirconVizWindow = this.getAssociatedZirconVizWindow(element);
    if (!window) return null;
    return [
      {
        label: 'viz window',
        children: [
          {
            label: 'parameters',
            action: () => {
              window.displayParameterWindow();
            },
          },

          {
            label: 'change visualizer',
            children: Object.keys(
              this.getApplication().getRegisteredObjectStates(),
            ).map((objId: string) => {
              const obj: ZirconViz =
                this.getApplication().getExistingViz(objId);
              return {
                label: `${objId} (${obj == null ? 'not used' : `used in ${obj.getParentWindow()?.getId()}`})`,
                action: () => {
                  this.getApplication().emit('SET_OBJECT_STATE_REQUEST', {
                    objectId: window.getId(),
                    state: {
                      ...window.generateCurrentState(),
                      vizId: objId,
                    } as ZirconVizWindowState,
                  });
                },
              };
            }),
          },
        ],
      },
    ];
  }
}
