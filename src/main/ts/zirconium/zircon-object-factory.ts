import { ZirconObject, ZirconObjectState } from './zircon-object';

export abstract class ZirconObjectFactory {
  private _name: string = 'unnamed factory';

  constructor(name: string) {
    this._name = name;
  }

  public getName(): string {
    return this._name;
  }

  /**
   * Look if handeled types contains the state type
   * @param state
   * @returns
   */
  public isHandled(state: ZirconObjectState): boolean {
    if (!state) return false;
    if (!state.type)
      throw new Error(
        `Object states with undefined type are not allowed ID = ${state.id}`,
      );
    if (!this.getHandledTypes())
      throw new Error(
        `Factory ${this.getName()} does not handle any type. This is useless`,
      );
    return this.getHandledTypes().indexOf(state.type) != -1;
  }

  public abstract getHandledTypes(): string[];
  public abstract createInstance(
    state: ZirconObjectState,
  ): Promise<ZirconObject>;
}
