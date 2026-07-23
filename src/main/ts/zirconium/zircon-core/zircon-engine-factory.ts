import { ZirconEngine, ZirconEngineState } from './zircon-engine';
import { SimpleZirconObjectFactory } from './zircon-object-factory';
import { ZIRCON_APP_OBJECT_TYPE, ZIRCON_ENGINE_TYPE } from './zircon-types';

export class ZirconEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      ZIRCON_ENGINE_TYPE,
      ZIRCON_APP_OBJECT_TYPE,
      async (state: ZirconEngineState): Promise<ZirconEngine> => {
        return new ZirconEngine(state);
      },
      null,
    );
  }
}
