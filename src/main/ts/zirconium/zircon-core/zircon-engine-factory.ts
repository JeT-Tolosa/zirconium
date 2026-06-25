import { ZirconApplication } from './zircon-app';
import { ZirconAppObjectFactory } from './zircon-app-object-factory';

export abstract class ZirconEngineFactory extends ZirconAppObjectFactory {
  constructor(app: ZirconApplication, name: string) {
    super(app, name);
  }
}
