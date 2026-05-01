import {
  ZirconEngine,
  ZirconEngineEventRegistry,
  ZirconEngineState,
} from '../../../zirconium/zircon-core/zircon-engine';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../../zirconium/zircon-event';
import {
  TimeDescriptor,
  TimeRunner,
  TimingHelper,
} from '../../../libraries/timing/timing';
import { ArrayComparisonResult, Zircon } from '../../../zirconium/zircon';

export interface TimeManagerEngineState extends ZirconEngineState {
  type: typeof TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE;
  timeDescriptors?: { [timeSource: string]: TimeDescriptor };
}

export type TimeManagerEngineEvents = {
  SIMULATED_TIME_SOURCE_ADDED: {
    timeSource: string;
    timeDescriptor: TimeDescriptor;
  };
  SIMULATED_TIME_SOURCE_ADD_REQUEST: {
    timeSource: string;
    timeDescriptor: TimeDescriptor;
  };
  SIMULATED_TIME_SOURCE_DELETED: {
    timeSource: string;
  };
  SIMULATED_TIME_SOURCE_DELETE_REQUEST: {
    timeSource: string;
  };
  SIMULATED_SET_TIMEDESCRIPTOR_REQUEST: {
    timeSource: string;
    timeDescriptor: TimeDescriptor;
  };
  SIMULATED_TIMEDESCRIPTOR: {
    timeSource: string;
    timeDescriptor: TimeDescriptor;
  };
  SIMULATED_TIMEDESCRIPTOR_REQUEST: {
    timeSource: string;
  };
};

export type TimeManagerEngineEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          TimeManagerEngineEvents,
          | 'SIMULATED_TIMEDESCRIPTOR_REQUEST'
          | 'SIMULATED_SET_TIMEDESCRIPTOR_REQUEST'
          | 'SIMULATED_TIME_SOURCE_ADD_REQUEST'
          | 'SIMULATED_TIME_SOURCE_DELETE_REQUEST'
        >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          TimeManagerEngineEvents,
          | 'SIMULATED_TIMEDESCRIPTOR'
          | 'SIMULATED_TIME_SOURCE_ADDED'
          | 'SIMULATED_TIME_SOURCE_DELETED'
        >,
      ]
    >;
  },
  ZirconEngineEventRegistry
>;

/**
 * A Time Manager is a class managing a Time Descriptor and a Time Runner
 * It emits a TIME_CHANGED event when the time descriptor is changed
 * It receives SIMULATED_TIME_CHANGE_REQUEST events and change the time descriptor accordingly
 */
export class TimeManagerEngine<
  R extends TimeManagerEngineEventRegistry = TimeManagerEngineEventRegistry,
> extends ZirconEngine<R> {
  public static readonly TIME_MANAGER_ENGINE_TYPE = 'time-manager-engine';
  public static readonly DEFAULT_TIME_SOURCE = 'main-time-source';
  public static readonly DEFAULT_TIME_RUNNER = new TimeRunner(
    TimingHelper.createRealTimeDescriptor(),
  );
  private _timeRunners: { [timeSource: string]: TimeRunner } = {};

  constructor(state?: TimeManagerEngineState) {
    super(state);
    this._timeRunners[TimeManagerEngine.DEFAULT_TIME_SOURCE] =
      TimeManagerEngine.DEFAULT_TIME_RUNNER;
  }

  public override getType(): string {
    return TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE;
  }

  protected override listenToEvents(): void {
    super.listenToEvents();

    this.addListener('SIMULATED_SET_TIMEDESCRIPTOR_REQUEST', (arg) => {
      this.onSIMULATED_SET_TIMEDESCRIPTOR_REQUEST(
        arg.timeSource,
        arg.timeDescriptor,
      );
    });
    this.addListener('SIMULATED_TIMEDESCRIPTOR_REQUEST', (arg) => {
      this.onSIMULATED_TIMEDESCRIPTOR_REQUEST(arg.timeSource);
    });
    this.addListener('SIMULATED_TIME_SOURCE_ADD_REQUEST', (arg) => {
      this.onSIMULATED_TIME_SOURCE_ADD_REQUEST(
        arg.timeSource,
        arg.timeDescriptor,
      );
    });
    this.addListener('SIMULATED_TIME_SOURCE_DELETE_REQUEST', (arg) => {
      this.onSIMULATED_TIME_SOURCE_DELETE_REQUEST(arg.timeSource);
    });
  }

  private onSIMULATED_TIME_SOURCE_ADD_REQUEST(
    timeSource: string,
    timeDescriptor: TimeDescriptor,
  ): void {
    if (this._timeRunners[timeSource]) return;
    this.setTimeDescriptor(timeSource, timeDescriptor);
  }

  private onSIMULATED_TIME_SOURCE_DELETE_REQUEST(timeSource: string): void {
    if (this._timeRunners[timeSource]) return;
    this.removeTimeSource(timeSource);
  }

  private onSIMULATED_TIMEDESCRIPTOR_REQUEST(timeSource: string): void {
    if (!this._timeRunners[timeSource]) return;
    this.emit('SIMULATED_TIMEDESCRIPTOR', {
      timeSource: timeSource,
      timeDescriptor: this._timeRunners[timeSource].getTimeDescriptor(),
    });
  }

  private onSIMULATED_SET_TIMEDESCRIPTOR_REQUEST(
    timeSource: string,
    timeDescriptor: TimeDescriptor,
  ): void {
    this.setTimeDescriptor(timeSource, timeDescriptor);
  }

  protected override async setState(
    state: TimeManagerEngineState,
  ): Promise<void> {
    if (!state) return;
    await super.setState(state);
    this.setTimeDescriptors(state?.timeDescriptors);
  }

  private setTimeDescriptors(timeDescriptors: {
    [timeSource: string]: TimeDescriptor;
  }): void {
    // always set default time runner
    if (!timeDescriptors) timeDescriptors = {};
    timeDescriptors[TimeManagerEngine.DEFAULT_TIME_SOURCE] =
      TimeManagerEngine.DEFAULT_TIME_RUNNER.getTimeDescriptor();

    const res: ArrayComparisonResult = Zircon.arrayComparison(
      Object.keys(this._timeRunners),
      Object.keys(timeDescriptors),
    );

    res.deleted?.forEach((timeSource) => {
      this.removeTimeSource(timeSource);
    });
    res.inserted?.forEach((timeSource) => {
      this.setTimeDescriptor(timeSource, timeDescriptors[timeSource]);
    });
    res.common?.forEach((timeSource) => {
      this.setTimeDescriptor(timeSource, timeDescriptors[timeSource]);
    });
  }

  private removeTimeSource(timeSource: string): void {
    if (!this._timeRunners[timeSource]) return;
    this._timeRunners[timeSource]?.stop();
    delete this._timeRunners[timeSource];
    this.emit('SIMULATED_TIME_SOURCE_DELETED', { timeSource: timeSource });
  }

  public override generateCurrentState(): TimeManagerEngineState {
    const descriptors: { [timeSource: string]: TimeDescriptor } = {};
    Object.keys(this._timeRunners).forEach((timeSource) => {
      descriptors[timeSource] =
        this._timeRunners[timeSource].getTimeDescriptor();
    });

    return {
      type: TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE,
      timeDescriptors: descriptors,
    };
  }

  private setTimeDescriptor(
    timeSource: string,
    timeDescriptor: TimeDescriptor,
  ): void {
    if (!this._timeRunners[timeSource])
      this._timeRunners[timeSource] = new TimeRunner();
    if (this._timeRunners[timeSource].setTimeDescriptor(timeDescriptor))
      this.getEventDispatcher()?.emit('SIMULATED_TIMEDESCRIPTOR', {
        timeSource: timeSource,
        timeDescriptor: timeDescriptor,
      });
  }
}
