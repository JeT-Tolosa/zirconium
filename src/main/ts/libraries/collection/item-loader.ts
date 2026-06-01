export abstract class ItemLoader<T> {
  private _name: string = 'unknown loader';

  constructor(name: string) {
    this._name = name;
  }

  public getLoaderName(): string {
    return this._name;
  }

  public abstract getData(): Promise<T[]>;
}
