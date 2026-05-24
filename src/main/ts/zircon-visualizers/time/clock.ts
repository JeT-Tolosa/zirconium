import {
  TimeRunner,
  TimeDescriptor,
  TimingHelper,
} from '../../libraries/timing/timing';
import {
  TimeManagerEngineEvents,
  TimeManagerEngine,
} from '../../sharp-eye/engines/time-manager/time-manager-engine';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';

export type AbstractClockEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<TimeManagerEngineEvents, 'SIMULATED_TIMEDESCRIPTOR'>]
    >;
    outgoing: MergePickEvents<
      [PickEvents<TimeManagerEngineEvents, 'SIMULATED_TIMEDESCRIPTOR_REQUEST'>]
    >;
  },
  ZirconVizEventRegistry
>;

export interface ClockState extends ZirconVizState {
  timeSource: string;
  timeZoneOffset: number;
}

export abstract class AbstractClock<
  R extends AbstractClockEventRegistry = AbstractClockEventRegistry,
> extends ZirconViz<R> {
  private _timeDescriptor: TimeDescriptor = null;
  private _timeZoneOffset: number = 0; // offset in hours (can be positive or negative. 0 = GMT)
  private _timeRunner: TimeRunner = null;
  private _timeSource: string = TimeManagerEngine.DEFAULT_TIME_SOURCE;

  /**
   * Constructor
   */
  constructor(state?: ClockState) {
    super(state);
    this._timeRunner = null;
    this._timeDescriptor = TimingHelper.createRealTimeDescriptor();
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('SIMULATED_TIMEDESCRIPTOR', (arg) => {
      this.setTimeDescriptor(arg.timeSource, arg.timeDescriptor);
    });
  }

  protected override async setState(state: ClockState): Promise<void> {
    if (!state) return Promise.resolve();
    await super.setState(state);
    this._timeSource = state.timeSource;
    this.setTimeZoneOffset( state.timeZoneOffset );
  }

  
  /**
   * Get Time Zone offset
   */
  public getTimeZoneOffset(): number {
    return this._timeZoneOffset;
  }

  /**
   * Set Time Zone offset
   */
  public setTimeZoneOffset(offset: number): void {
    this._timeZoneOffset = offset;
  }

  /**
   * Get Time Runner
   */
  public getTimeRunner(): TimeRunner {
    if (this._timeRunner) return this._timeRunner;
    this._timeRunner = new TimeRunner();
    this._timeRunner.addTimeChangeCallback(this.onTimeChange.bind(this));
    return this._timeRunner;
  }

  private onTimeChange(runner: TimeRunner): void {
    let simulatedTime = runner.getCurrentSimulatedTime();
    if (this._timeZoneOffset) simulatedTime = simulatedTime + this._timeZoneOffset * TimingHelper.HOUR_IN_MILLISECONDS;
    this.displayTime(new Date(simulatedTime));
  }

  protected getTimeSource(): string {
    return this._timeSource;
  }

  public override generateCurrentState(): ClockState {
    return {
      ...super.generateCurrentState(),
      timeSource: this._timeSource,
      timeZoneOffset: this._timeZoneOffset,
    };
  }

  /**
   * Set Time Descriptor
   * @param timeDescriptor
   */
  public setTimeDescriptor(
    timeSource: string,
    timeDescriptor: TimeDescriptor,
  ): void {
    if (this._timeSource && this._timeSource !== timeSource) return;
    this._timeDescriptor = timeDescriptor;
    this.getTimeRunner().setTimeDescriptor(this._timeDescriptor);
  }

  public override onDisplay(): void {
    this.emit('SIMULATED_TIMEDESCRIPTOR_REQUEST', {
      timeSource: this.getTimeSource(),
    });
    super.onDisplay();
  }

  protected abstract displayTime(simulatedDate: Date): void;
}
