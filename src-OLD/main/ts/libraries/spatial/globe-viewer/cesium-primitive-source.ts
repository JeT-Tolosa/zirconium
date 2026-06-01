import { ZirconDataProvider } from '../../../zirconium/zircon-data/zircon-data-provider';

/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class CesiumPrimitiveDataProvider extends ZirconDataProvider<any> {
  private _onSourceChangeCB: () => void = null;

  constructor(name: string) {
    super(name);
  }

  /**
   * Creates the Cesium primitive associated with the data source.
   * This method must be implemented by subclasses.
   * @returns A promise resolving to a Cesium primitive
   */
  public abstract createPrimitive(): Promise<any>;

  /**
   * Registers a callback invoked when the source content changes.
   *
   * @param onChangeCB Callback function
   */
  public onSourceContentChanged(onChangeCB: () => void): void {
    this._onSourceChangeCB = onChangeCB;
  }

  /**
   * Notifies listeners that the source content has changed.
   */
  protected fireSourceContentChanged(): void {
    if (this._onSourceChangeCB) {
      this._onSourceChangeCB();
    }
  }
}
