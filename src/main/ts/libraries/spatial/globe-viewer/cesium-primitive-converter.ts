/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class ToCesiumPrimitiveConverter<T extends object> {
  /**
   * Creates the Cesium primitive associated with the data source.
   * This method must be implemented by subclasses.
   * @returns A promise resolving to a Cesium primitive
   */
  public abstract createPrimitive(source: T): Promise<any>;
}
