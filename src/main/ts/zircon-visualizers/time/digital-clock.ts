import { v4 as uuid } from 'uuid';
import { AbstractClock, ClockState } from './clock';
import './digital-clock.css';

export interface DigitalClockState extends ClockState {
  type: typeof DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE;
  locationName: string;
}

export class DigitalClock extends AbstractClock {
  public static readonly DIGITAL_CLOCK_VISUALIZER_TYPE =
    'DIGITAL_CLOCK_VISUALIZER_TYPE';
  private _locationName: string = '';
  private _mainDiv: HTMLDivElement = null;
  private _locationElement: HTMLParagraphElement = null;
  private _hourElement: HTMLParagraphElement = null;
  private _dateElement: HTMLParagraphElement = null;

  /**
   * Constructor
   */
  constructor(state?: DigitalClockState) {
    super(state);
  }

  protected override async setState(state: DigitalClockState): Promise<void> {
    if (!state) {return Promise.resolve();}
    await super.setState(state);
    this._locationName = state.locationName;
  }

  /**
   * Get clock's div element
   * @returns   Clock's div element
   */
  public getContainer(): HTMLDivElement {
    if (this._mainDiv) {return this._mainDiv;}
    this._mainDiv = document.createElement('div');
    this._mainDiv.id = uuid();
    this._mainDiv.classList.add('digital-clock-container');
    this._mainDiv.appendChild(this.getClockElement());
    this._mainDiv.appendChild(this.getDateElement());
    this._mainDiv.appendChild(this.getLocationElement());
    return this._mainDiv;
  }

  private getClockElement(): HTMLElement {
    if (this._hourElement) {return this._hourElement;}
    this._hourElement = document.createElement('div');
    this._hourElement.classList.add('digital-clock-time');
    this._hourElement.innerText = '00:00:00';
    return this._hourElement;
  }

  private getDateElement(): HTMLElement {
    if (this._dateElement) {return this._dateElement;}
    this._dateElement = document.createElement('div');
    this._dateElement.classList.add('digital-clock-date');
    this._dateElement.innerText = 'no date';
    return this._dateElement;
  }

  private getLocationElement(): HTMLElement {
    if (this._locationElement) {return this._locationElement;}
    this._locationElement = document.createElement('div');
    this._locationElement.classList.add('digital-clock-location');
    this._locationElement.innerText = `${this.getLocationName()} (UTC ${this.getTimeZoneOffset() >= 0 ? '+' : ''}${this.getTimeZoneOffset()})`;
    return this._locationElement;
  }

  public getLocationName(): string {
    return this._locationName || '';
  }

  protected displayTime(simulatedDate: Date): void {
    const h = simulatedDate.getHours();
    const m = simulatedDate.getMinutes();
    const s = simulatedDate.getSeconds();
    this.getClockElement().innerHTML = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;
    this.getDateElement().innerHTML = `${simulatedDate.toLocaleDateString()}`;
  }

  public override generateCurrentState(): DigitalClockState {
    return {
      ...super.generateCurrentState(),
      type: DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE,
      locationName: this._locationName,
    };
  }
}
