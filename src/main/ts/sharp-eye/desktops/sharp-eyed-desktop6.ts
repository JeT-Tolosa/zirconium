import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';
import {
  VIZ_JSSANDBOX_TYPE,
  VizJSSandboxState,
} from '../../zircon-visualizers/js-sandbox/js-sandbox';
import { VizJSSandboxFactory } from '../../zircon-visualizers/js-sandbox/js-sandbox-factory';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';

/**
 * DESKTOP6
 */
export async function createDesktop6(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizJSSandboxFactory(app));

  const jsSandBoxVizState: VizJSSandboxState = {
    type: VIZ_JSSANDBOX_TYPE,
    id: 'jsSandboxVizId',
  };
  app.registerObjectState(jsSandBoxVizState);
  const jsSandboxWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'JS Sandbox',
    left: 0,
    top: 10,
    width: 800,
    height: 600,
    vizId: jsSandBoxVizState.id,
  };
  app.registerObjectState(jsSandboxWindowState);

  const desktop6State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop6-${uuid()}`,
    name: 'JS',
    windowIds: [jsSandboxWindowState.id],
  };
  app.registerObjectState(desktop6State);
  return Promise.resolve(desktop6State);
}
