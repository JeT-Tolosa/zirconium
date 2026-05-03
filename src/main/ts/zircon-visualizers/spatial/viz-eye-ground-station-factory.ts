import { ZirconObject } from '../../zirconium/zircon-object';
import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizGroundStationCatalogTabulator,
  VizGroundStationCatalogTabulatorState,
} from './viz-eye-ground-station-catalog-tabulator';
import {
  VizGroundStationLoader,
  VizGroundStationLoaderState,
} from './viz-eye-ground-station-loader';

export class VizGroundStationFactory extends ZirconObjectFactory {
  constructor() {
    super('VizGroundStationFactory');
  }

  public getHandledTypes(): string[] {
    return [
      VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
      VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
    ];
  }

  public override createInstance(
    state: VizGroundStationLoaderState | VizGroundStationCatalogTabulatorState,
  ): Promise<ZirconObject> {
    switch (state.type) {
      case VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE:
        return this.createLoaderInstance(state);
      case VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE:
        return this.createCatalogInstance(state);
    }
    // return Promise.reject(
    //   `Cannot create objects of type ${state.type} in factory ${this.getName()}`,
    // );
  }

  private createLoaderInstance(
    state: VizGroundStationLoaderState,
  ): Promise<VizGroundStationLoader> {
    return Promise.resolve().then(() => {
      const viz = new VizGroundStationLoader(state);
      return viz;
    });
  }

  private createCatalogInstance(
    state: VizGroundStationCatalogTabulatorState,
  ): Promise<VizGroundStationCatalogTabulator> {
    return Promise.resolve().then(() => {
      const viz = new VizGroundStationCatalogTabulator(state);
      return viz;
    });
  }
}
