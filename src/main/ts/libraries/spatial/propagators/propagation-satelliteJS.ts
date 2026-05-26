import * as satellite from 'satellite.js';
import { PropagationOptions, TLEPropagator } from './propagation';
import { TLE } from '../core/tle';
import { OrbitState } from '../core/spatial-math';
import { IdentityFrameTransformer } from './frame';
import { NadirPointingAttitudeProvider } from './attitude';
import { SimpleSGP4CovarianceProvider } from './covariance';

// import { SatelliteJsPropagator } from '../propagators/SatelliteJsPropagator';
// import { IdentityFrameTransformer } from '../frames/IdentityFrameTransformer';
// import { NadirPointingAttitudeProvider } from '../attitude/NadirPointingAttitudeProvider';
// import { SimpleSGP4CovarianceProvider } from '../covariance/SimpleSGP4CovarianceProvider';

export class SatelliteJsTLEPropagator extends TLEPropagator {
  protected async computeOrbitStates(
    tle: TLE,
    startTime: Date,
    endTime: Date,
    options: PropagationOptions,
  ): Promise<OrbitState[]> {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const states: OrbitState[] = [];
    const stepMs = options.stepMs ?? 60000;

    for (let t = startTime.getTime(); t <= endTime.getTime(); t += stepMs) {
      const currentDate = new Date(t);
      const pv = satellite.propagate(satrec, currentDate);
      if (!pv.position || !pv.velocity) {
        continue;
      }
      states.push({
        time: currentDate,
        frame: 'TEME',
        position: {
          x: pv.position.x,
          y: pv.position.y,
          z: pv.position.z,
        },
        velocity: {
          x: pv.velocity.x,
          y: pv.velocity.y,
          z: pv.velocity.z,
        },
        metadata: {
          source: 'satellite.js',
        },
      });
    }

    return states;
  }
}

export class PropagatorFactory {
  static createSatelliteJS() {
    return new SatelliteJsTLEPropagator(
      new IdentityFrameTransformer(),
      new NadirPointingAttitudeProvider(),
      new SimpleSGP4CovarianceProvider(),
    );
  }
}
