import {
  ZirconObject,
  ZirconObjectEventRegistry,
  ZirconObjectEvents,
  ZirconObjectState,
} from '../zircon-core/zircon-object';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';

const ZIRCON_STATE_EDITOR_COMPONENT = 'zircon-state-editor-component';

export type ZirconParameterComponentEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<ZirconObjectEvents, 'ZIRCON_OBJECT_STATE_CHANGED'>]
    >;
    outgoing: {};
  },
  ZirconObjectEventRegistry
>;

export abstract class ZirconStateEditor<
  R extends ZirconParameterComponentEventRegistry =
    ZirconParameterComponentEventRegistry,
> extends ZirconObject<R> {
  private _objId: string = null;
  private _objName: string = null;
  private _objType: string = null;
  private __state: ZirconObjectState = null;

  constructor(obj: ZirconObject) {
    super(null);
    if (!obj) {
      throw new Error(`Unable to create an editor for a Null object`);
    }
    this.setEditedObject(obj);
  }

  public override listenToEvents(): void {
    this.addListener('ZIRCON_OBJECT_STATE_CHANGED', (arg) => {
      this.onStateChanged(arg.id, arg.state);
    });
  }

  public override getType(): string {
    return ZIRCON_STATE_EDITOR_COMPONENT;
  }

  public getEditedObjId(): string {
    return this._objId;
  }

  public getEditedObjName(): string {
    return this._objName;
  }

  public getEditedObjType(): string {
    return this._objType;
  }

  private setEditedObject(obj: ZirconObject) {
    if (!obj) {
      this._objId = null;
      this._objName = null;
      this._objType = null;
      this.__state = null;
    } else {
      this._objId = obj.getId();
      this._objName = obj.getName() || obj.getType();
      this._objType = obj.getType();
      this.setEditedObjState(obj.generateCurrentState());
    }
  }

  private onStateChanged(objId: string, state: ZirconObjectState) {
    if (objId !== this._objId) {
      return;
    }
    this.setEditedObjState(state);
  }

  public setEditedObjState(state: ZirconObjectState) {
    if (state.id !== this._objId) {
      throw new Error(
        `Invalid edited object state! edited Id: ${this._objId} state Id: ${state.id}`,
      );
    }
    this.__state = state;
    this.updateUI();
  }

  protected getEditedObjState(): ZirconObjectState {
    return this.__state;
  }

  public abstract getContainer(): HTMLElement;
  public abstract updateUI(): void;
}

export class ZirconStateEditorPre extends ZirconStateEditor {
  private _pre: HTMLPreElement = null;

  constructor(obj: ZirconObject) {
    super(obj);
  }

  public override getContainer(): HTMLElement {
    if (this._pre) {
      return this._pre;
    }
    this._pre = document.createElement('pre');
    this.updateUI();
    return this._pre;
  }

  public override updateUI(): void {
    if (this._pre) {
      this._pre.innerText = JSON.stringify(this.getEditedObjState(), null, 2);
    }
  }
}
