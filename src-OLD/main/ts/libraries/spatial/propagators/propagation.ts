import { OrbitState, Quaternion, Vector3 } from '../core/spatial-math';
import { TLE } from '../core/tle';
import { PropagationQuality } from '../core/trajectories';
import { AttitudeProvider } from './attitude';
import { CovarianceProvider } from './covariance';
import { FrameTransformer } from './frame';

export interface PropagationOptions {
  stepMs?: number;
  frame?: 'ECI' | 'ECEF' | 'TEME';
  interpolation?: boolean;
  computeAttitude?: boolean;
  computeCovariance?: boolean;
  computeOrientation?: boolean;
  attitudeModel?: string;
  minStepMs?: number;
  maxStepMs?: number;
}

export type ReferenceFrame = 'TEME' | 'ECI' | 'ECEF' | 'ITRF' | 'LVLH' | 'RIC';

export interface TrajectorySample {
  time: Date;
  position: Vector3;
  velocity?: Vector3;
  orientation?: Quaternion;
  covariance?: CovarianceMatrix;
  quality?: PropagationQuality;
}

export interface TrajectoryMetadata {
  propagator: string;
  generatedAt: Date;
}

export interface Trajectory {
  metadata: TrajectoryMetadata;
  states: OrbitState[];
}

export interface CovarianceMatrix {
  frame: ReferenceFrame;

  /**
   * 6x6 covariance matrix
   * [x,y,z,vx,vy,vz]
   */
  values: Float64Array;
}

export abstract class TLEPropagator {
  constructor(
    protected readonly frameTransformer: FrameTransformer,
    protected readonly attitudeProvider?: AttitudeProvider,
    protected readonly covarianceProvider?: CovarianceProvider,
  ) {}

  public async propagate(
    tle: TLE,
    startTime: Date,
    endTime: Date,
    options: PropagationOptions = {},
  ): Promise<Trajectory> {
    this.validateDates(startTime, endTime);

    const rawStates: OrbitState[] = await this.computeOrbitStates(
      tle,
      startTime,
      endTime,
      options,
    );

    const enrichedStates = rawStates.map((state) => {
      let enriched = state;

      // attitude
      if (options.computeAttitude && this.attitudeProvider) {
        enriched.orientation =
          this.attitudeProvider.computeOrientation(enriched);
      }

      // covariance
      if (options.computeCovariance && this.covarianceProvider) {
        enriched.covariance =
          this.covarianceProvider.computeCovariance(enriched);
      }

      // frame transform
      if (options.frame && options.frame !== enriched.frame) {
        enriched = this.frameTransformer.transform(enriched, options.frame);
      }

      return enriched;
    });

    return {
      metadata: {
        propagator: this.constructor.name,
        generatedAt: new Date(),
      },

      states: enrichedStates,
    } as Trajectory;
  }

  protected abstract computeOrbitStates(
    tle: TLE,
    startTime: Date,
    endTime: Date,
    options: PropagationOptions,
  ): Promise<OrbitState[]>;

  protected validateDates(startTime: Date, endTime: Date): void {
    if (endTime <= startTime) {
      throw new Error('endTime must be after startTime');
    }
  }
}
