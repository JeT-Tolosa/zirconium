// import { ZirconDataProvider, ZirconDataProviderEventRegistry } from '../../../zirconium/zircon-data/zircon-data-provider';
// export const CESIUM_LAYER_TYPE = 'cesium-layer';
// export const CESIUM_PRIMITIVE_DATA_PROVIDER = 'cesium-primitive-data-provider';

// export type CesiumPrimitiveDataProviderEventRegistry = ZirconDataProviderEventRegistry;

// export abstract class CesiumPrimitiveDataProvider<
//   R extends CesiumPrimitiveDataProviderEventRegistry = CesiumPrimitiveDataProviderEventRegistry> extends ZirconDataProvider<unknown, R> {
//   private _onSourceChangeCB: () => void = null;

//   constructor(name: string) {
//     super({
//       name: name,
//       type: CESIUM_PRIMITIVE_DATA_PROVIDER,
//       dataType: CESIUM_LAYER_TYPE,
//     });
//   }

//   /**
//    * Creates the Cesium primitive associated with the data source.
//    * This method must be implemented by subclasses.
//    * @returns A promise resolving to a Cesium primitive
//    */
//   public abstract createPrimitive(): Promise<unknown>;

//   /**
//    * Registers a callback invoked when the source content changes.
//    *
//    * @param onChangeCB Callback function
//    */
//   public onSourceContentChanged(onChangeCB: () => void): void {
//     this._onSourceChangeCB = onChangeCB;
//   }

//   /**
//    * Notifies listeners that the source content has changed.
//    */
//   protected fireSourceContentChanged(): void {
//     if (this._onSourceChangeCB) {
//       this._onSourceChangeCB();
//     }
//   }
// }
