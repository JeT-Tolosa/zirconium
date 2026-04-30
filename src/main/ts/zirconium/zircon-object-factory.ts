import { ZirconObject, ZirconObjectState } from './zircon-object';

export abstract class ZirconObjectFactory {
  public abstract getType(): string;
  public abstract createInstance(
    state: ZirconObjectState,
  ): Promise<ZirconObject>;
}
