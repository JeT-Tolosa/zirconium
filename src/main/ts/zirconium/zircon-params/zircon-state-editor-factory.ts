import { ZirconObject } from '../zircon-core/zircon-object';
import { ZirconStateEditor } from './zircon-state-editor';

export abstract class ZirconStateEditorFactory {
  constructor() {}

  public abstract generateNewEditor(obj: ZirconObject): ZirconStateEditor;
}
