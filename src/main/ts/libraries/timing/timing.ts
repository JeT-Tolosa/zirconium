/**
 * Time Descriptor describes a time span and its speed in a simulated environment
 */
export interface TimeDescriptor {
  realStartTime: number;
  simulatedStartTime: number;
  simulatedStopTime: number; // if > 0, time is limited to this time
  timeMultiplicator: number; // 1 is real time
  running: boolean;
}

export class TimingHelper {
  /**
   * Create a time descriptor for real time
   * @returns a time descriptor for real time
   */
  public static createRealTimeDescriptor(): TimeDescriptor {
    return {
      realStartTime: Date.now(),
      simulatedStartTime: Date.now(),
      simulatedStopTime: 0,
      timeMultiplicator: 1,
      running: true,
    };
  }
}

/**
 * A Time Runner is a class taking a TimeDescriptor and running simulated time
 * according to the descriptor.
 * Two time runners with the same Time Descriptor are ALWAYS at the same simulated time
 */

export class TimeRunner {
  private _timeDescriptor: TimeDescriptor = null;
  private _timeChangeCallbacks: Array<(runner: TimeRunner) => void> = [];
  private _intervalId: NodeJS.Timeout = null;

  /**
   * Constructor
   * @param timeDescriptor
   */
  constructor(timeDescriptor?: TimeDescriptor) {
    this.setTimeDescriptor(timeDescriptor);
  }

  /**
   * Set Time Descriptor
   * @param timeDescriptor
   * @return true if the time descriptor was changed, false otherwise
   */
  public setTimeDescriptor(timeDescriptor: TimeDescriptor): boolean {
    if (timeDescriptor === this._timeDescriptor) return false;
    this._timeDescriptor = timeDescriptor;
    this.run();
    return true;
  }

  /**
   * Get Time Descriptor
   * @returns time descriptor
   */
  public getTimeDescriptor(): TimeDescriptor {
    return this._timeDescriptor;
  }

  /**
   * get simulated time for the current real time
   * @returns current simulated time
   */
  public getCurrentSimulatedTime(): number {
    return this.getSimulatedTime(Date.now());
  }

  /**
   * get simulated time for a given real time
   * @param realTime real time to convert
   * @returns simulated time
   */
  public getSimulatedTime(_realTime: number): number {
    if (!this._timeDescriptor) throw Error('No time descriptor set');
    const currentRealTime: number = Date.now();
    return (
      this._timeDescriptor.simulatedStartTime +
      (currentRealTime - this._timeDescriptor.realStartTime) *
        this._timeDescriptor.timeMultiplicator
    );
  }

  /**
   * Add a callback to be called when time changes
   * @param callback callback to be called when time changes
   */
  public addTimeChangeCallback(callback: (runner: TimeRunner) => void): void {
    this._timeChangeCallbacks.push(callback);
  }

  /**
   * Stop time runner
   */
  public stop(): void {
    if (!this._intervalId) return;
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  /**
   * check if simulated time has reached the end of the simulation
   * @returns
   */
  public isSimulatedTimeReached(): boolean {
    return (
      this._timeDescriptor.simulatedStopTime > 0 &&
      this.getCurrentSimulatedTime() >= this._timeDescriptor.simulatedStopTime
    );
  }

  /**
   * Start time runner
   */
  private run(): void {
    if (this._intervalId) this.stop();

    if (!this._timeDescriptor) return;
    this._intervalId = setInterval(() => {
      // launch all callbacks
      this._timeChangeCallbacks.forEach((callback) => callback(this));
      // check if we are still running
      if (!this._timeDescriptor.running) this.stop();
      // check if we reached the end of the simulation
      if (this.isSimulatedTimeReached()) this.stop();
    }, 100);
  }
}
