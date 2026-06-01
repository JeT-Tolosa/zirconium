import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';

import { createSeriesBar } from '.././sharp-eye-panels';
import { VizThreeJSState } from '../../zircon-visualizers/threeJS/viz-eye-threeJS';
import {
  VizCubeSampleThreeJS,
  VizCubeSampleThreeJSState,
} from '../../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS';
import { VizHelmetSampleThreeJS } from '../../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS';
import {
  VizBarJSChart,
  VizBarJSChartState,
} from '../../zircon-visualizers/jschart/bar-jschart';
import {
  AnalogClock,
  AnalogClockState,
} from '../../zircon-visualizers/time/analog-clock';
import { TimingHelper } from '../../libraries/timing/timing';
import {
  VizOpenGlobus,
  VizOpenGlobusState,
} from '../../zircon-visualizers/openglobus/viz-eye-openglobus';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';
import { VizBarJSChartFactory } from '../../zircon-visualizers/jschart/bar-jschart-factory';
import { AnalogClockFactory } from '../../zircon-visualizers/time/analog-clock-factory';
import { VizCubeSampleThreeJSFactory } from '../../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS-factory';
import { VizHelmetSampleThreeJSFactory } from '../../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS-factory';
import { VizOpenGlobusFactory } from '../../zircon-visualizers/openglobus/viz-eye-openglobus-factory';

export async function createDesktop1(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizBarJSChartFactory());
  await app.registerObjectFactory(new AnalogClockFactory());
  await app.registerObjectFactory(new VizCubeSampleThreeJSFactory());
  await app.registerObjectFactory(new VizHelmetSampleThreeJSFactory());
  await app.registerObjectFactory(new VizOpenGlobusFactory());

  // Chart.js Visualizers
  const barChartVizState: VizBarJSChartState = {
    id: 'barChartVizId',
    type: VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE,
    name: 'Bar Chart',
    series: createSeriesBar(),
  };
  app.registerObjectState(barChartVizState);

  const clock2VizState: AnalogClockState = {
    id: 'clock2VizId',
    type: AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
    name: 'Analog Clock',
    timeSource: TimingHelper.MAIN_TIME_SOURCE_ID,
    timeZoneOffset: 0,
  };

  app.registerObjectState(clock2VizState);
  // 3D Visualizers
  const globusVizState: VizOpenGlobusState = {
    id: 'globusVizId',
    type: VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE,
    name: 'OpenGlobus Globe',
  };
  app.registerObjectState(globusVizState);

  // Three.js Visualizers
  const cubeVizState: VizCubeSampleThreeJSState = {
    id: 'cubeVizId',
    type: VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE,
    name: 'Three.js Cube Sample',
  };
  app.registerObjectState(cubeVizState);

  const helmetVizState: VizThreeJSState = {
    id: 'helmetVizId',
    type: VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE,
    name: 'Three.js Helmet Sample',
  };
  app.registerObjectState(helmetVizState);

  const barChartState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Bar Chart',
    left: 10,
    top: 10,
    width: 320,
    height: 520,
    vizId: barChartVizState.id,
  };
  app.registerObjectState(barChartState);
  const helmetState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Helmet 3D',
    left: 350,
    top: 10,
    width: 320,
    height: 520,
    vizId: helmetVizState.id,
  };
  app.registerObjectState(helmetState);
  const cubeState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Cube3D',
    left: 700,
    top: 10,
    width: 320,
    height: 520,
    vizId: cubeVizState.id,
  };
  app.registerObjectState(cubeState);
  const globusState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Globus',
    left: 510,
    top: 550,
    width: 520,
    height: 520,
    vizId: globusVizState.id,
  };
  app.registerObjectState(globusState);

  const clock2State: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Clock2',
    left: 50,
    top: 550,
    width: 385,
    height: 420,
    vizId: clock2VizState.id,
  };
  app.registerObjectState(clock2State);

  const desktop1State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop1-${uuid()}`,
    name: 'Desktop 1',
    windowIds: [
      barChartState.id,
      helmetState.id,
      cubeState.id,
      globusState.id,
      clock2State.id,
    ],
  };
  app.registerObjectState(desktop1State);
  return Promise.resolve(desktop1State);
}
