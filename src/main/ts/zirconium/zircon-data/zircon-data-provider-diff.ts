// import { ZIRCON_DATA_PROVIDER_DIFF_TYPE } from '../zircon-core/zircon-types';
// import {
//   ZirconDataProvider,
//   ZirconDataProviderEventRegistry,
//   ZirconDataProviderState,
// } from './zircon-data-provider';

// export interface ZirconDataProviderDiffState extends ZirconDataProviderState {
//   type: typeof ZIRCON_DATA_PROVIDER_DIFF_TYPE;
// }

// /* eslint-disable @typescript-eslint/no-explicit-any */
// export class ZirconDataProviderDiff<
//   T = any,
//   R extends ZirconDataProviderEventRegistry = ZirconDataProviderEventRegistry,
// > extends ZirconDataProvider<T, R> {
//   constructor(dataType: string, name: string, ) {
//     super(dataType, { name: name}, , ZIRCON_DATA_PROVIDER_DIFF_TYPE);
//   }

//   // -----------------------
//   // CORE DATA
//   // -----------------------

//   public async getData(): Promise<T> {
//     return this._data;
//   }

//   public getSnapshot(): { data: T; version: number } {
//     return {
//       data: this._data,
//       version: this._version,
//     };
//   }

//   public getDataType(): string {
//     return this._dataType;
//   }

//   public setDataType(dataType: string): void {
//     this._dataType = dataType;
//   }

//   public getType(): string {
//     return ZIRCON_DATA_PROVIDER_DIFF_TYPE;
//   }

//   // -----------------------
//   // EVENTS
//   // -----------------------

//   protected override listenToEvents(): void {
//     super.listenToEvents();

//     this.addListener('DATA_PROVIDER_CONTENT_REQUEST', (arg) =>
//       this.onContentRequest(arg.dataProviderId),
//     );
//   }

//   // -----------------------
//   // UPDATE DATA (IMPORTANT)
//   // -----------------------

//   public setData(data: T): void {
//     this._data = data;
//     this._version++;

//     const descriptor = this.getDescriptor();

//     // 1. event change léger (for Cesium diff systems)
//     this.emit('DATA_PROVIDER_CHANGED', {
//       dataProviderDescriptor: descriptor,
//       version: this._version,
//     });

//     // 2. full payload (legacy compatibility)
//     this.emit('DATA_PROVIDER_CONTENT', {
//       dataProviderDescriptor: descriptor,
//       data: this._data,
//       version: this._version,
//     });
//   }

//   public override getDataProviderSubtype(): string {
//     return ZIRCON_DATA_PROVIDER_DIFF_TYPE;
//   }
//   // -----------------------
//   // DESCRIPTOR
//   // -----------------------

//   public getDescriptor(): ZirconDataProviderDescriptor {
//     return {
//       id: this.getId(),
//       name: this.getName(),
//       type: this.getType(),
//       dataProviderSubtype: this.getDataProviderSubtype(),
//       dataType: this.getDataType(),
//     };
//   }
// }
