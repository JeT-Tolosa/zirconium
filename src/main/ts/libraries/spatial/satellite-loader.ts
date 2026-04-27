export abstract class ElementLoader<CatalogElement> {
  private _name: string = 'unknown loader';

  constructor(name: string) {
    this._name = name;
  }

  public getLoaderName(): string {
    return this._name;
  }

  public abstract loadLocalJson(
    fileLocation: string,
  ): Promise<CatalogElement[]>;
}
