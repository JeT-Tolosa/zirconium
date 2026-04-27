import {
  TimeRunner,
  TimeDescriptor,
  TimingHelper,
} from '../../sharp-eye/engines/timing/timing';
import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-viz-ui';

export interface ClockState extends ZirconVizState {}

export abstract class AbstractClock extends ZirconViz {
  private _timeDescriptor: TimeDescriptor = null;
  private _timeRunner: TimeRunner = null;
  // private _intervalId: unknown = null;

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
    this.getEventDispatcher().addListener('SIMULATED_TIME_CHANGED', (arg) => {
      this.setTimeDescriptor(arg.TimeDescriptor);
    });
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
    this.displayTime(new Date(runner.getCurrentSimulatedTime()));
  }

  /**
   * Set Time Descriptor
   * @param timeDescriptor
   */
  public setTimeDescriptor(timeDescriptor: TimeDescriptor): void {
    this._timeDescriptor = timeDescriptor;
    this.getTimeRunner().setTimeDescriptor(this._timeDescriptor);
  }

  protected abstract displayTime(simulatedDate: Date): void;
}
