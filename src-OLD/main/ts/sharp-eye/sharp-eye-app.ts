import './sharp-eye.css';
import { v4 as uuid } from 'uuid';
import { ZirconDesktopState } from '../zirconium/zircon-ui/zircon-desktop';
import { ZirconApplication } from '../zirconium/zircon-core/zircon-app';
import {
  SatelliteCatalogEngine,
  SatelliteCatalogEngineState,
} from './engines/spatial/satellite-catalog-engine';
import {
  GroundStationCatalogEngine,
  GroundStationCatalogEngineState,
} from './engines/spatial/ground-station-catalog-engine';
import { TimingHelper } from '../libraries/timing/timing';
import { ZirconDesktopManagerState } from '../zirconium/zircon-core/zircon-desktop-manager';

import { SatelliteCatalogEngineFactory } from './engines/spatial/satellite-catalog-engine-factory';
import { GroundStationCatalogEngineFactory } from './engines/spatial/ground-station-catalog-engine-factory';
import { TimeManagerEngineFactory } from './engines/time-manager/time-manager-factory';
import {
  TimeManagerEngine,
  TimeManagerEngineState,
} from './engines/time-manager/time-manager-engine';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZIRCON_ENGINE_TYPE,
  ZIRCON_VISUALIZER_TYPE,
} from '../zirconium/zircon-core/zircon-types';
import { AISCatalogEngineFactory } from './engines/maritime/ais-catalog-engine-factory';
import {
  AISCatalogEngine,
  AISCatalogEngineState,
} from './engines/maritime/ais-catalog-engine';
import { UserConnectUIZirconPlugin } from '../zircon-plugins/connect-ui/connect-ui-plugin';
import { createDesktop1 } from './desktops/sharp-eyed-desktop1';
import { createDesktop2 } from './desktops/sharp-eyed-desktop2';
import { createDesktop3 } from './desktops/sharp-eyed-desktop3';
import { createDesktop4 } from './desktops/sharp-eyed-desktop4';
import { createDesktop5 } from './desktops/sharp-eyed-desktop5';
import { createDesktop6 } from './desktops/sharp-eyed-desktop6';

export const SHARP_EYE_ENGINE_TYPE = ZIRCON_ENGINE_TYPE;
export const SHARP_EYE_VIZ_TYPE = ZIRCON_VISUALIZER_TYPE;

export class SharpEyedApp extends ZirconApplication {
  /**
   * constructor
   */
  constructor() {
    super('Sharp Eye');
    this.setUIClass('sharp-eye-ui');
  }

  /**
   * APP START
   */
  public async create(): Promise<void> {
    await this.registerPlugins();
    await this.registerEngines();
    await this.createDesktops();
  }

  /**
   * DESKTOPS
   */
  public async createDesktops(): Promise<void> {
    const desktop1State: ZirconDesktopState = await createDesktop1(this);
    const desktop2State: ZirconDesktopState = await createDesktop2(this);
    const desktop3State: ZirconDesktopState = await createDesktop3(this);
    const desktop4State: ZirconDesktopState = await createDesktop4(this);
    const desktop5State: ZirconDesktopState = await createDesktop5(this);
    const desktop6State: ZirconDesktopState = await createDesktop6(this);

    const desktopManagerState: ZirconDesktopManagerState = {
      type: ZIRCON_DESKTOP_MANAGER_TYPE,
      id: this.getDesktopManagerId(),
      desktopIds: [
        desktop1State.id,
        desktop2State.id,
        desktop3State.id,
        desktop4State.id,
        desktop5State.id,
        desktop6State.id,
      ],
    };
    this.registerObjectState(desktopManagerState);
  }

  /**
   * PLUGINS
   */
  private async registerPlugins(): Promise<void> {
    this.getPluginManager().registerPlugin(new UserConnectUIZirconPlugin());
  }

  /**
   * ENGINES
   */
  private async registerEngines(): Promise<void> {
    await this.registerObjectFactory(new SatelliteCatalogEngineFactory());
    await this.registerObjectFactory(new GroundStationCatalogEngineFactory());
    await this.registerObjectFactory(new TimeManagerEngineFactory());
    await this.registerObjectFactory(new AISCatalogEngineFactory());

    const timeManagerEngineState: TimeManagerEngineState = {
      id: `time-manager-engine-${uuid()}`,
      type: TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE,
      timeDescriptors: {
        [TimingHelper.MAIN_TIME_SOURCE_ID]:
          TimingHelper.createRealTimeDescriptor(),
      },
    };
    this.registerObjectState(timeManagerEngineState);

    const satelliteCatalogEngineState: SatelliteCatalogEngineState = {
      id: `satellite-catalog-engine-${uuid()}`,
      type: SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE,
    };
    this.registerObjectState(satelliteCatalogEngineState);

    const aisCatalogEngineState: AISCatalogEngineState = {
      id: `ais-catalog-engine-${uuid()}`,
      type: AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE,
    };
    this.registerObjectState(aisCatalogEngineState);

    const groundStationCatalogEngineState: GroundStationCatalogEngineState = {
      id: `gs-catalog-engine-${uuid()}`,
      type: GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE,
    };
    this.registerObjectState(groundStationCatalogEngineState);
  }
}
