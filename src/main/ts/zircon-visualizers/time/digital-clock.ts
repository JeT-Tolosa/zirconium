import { v4 as uuid } from 'uuid';
import { AbstractClock } from './clock';
import './digital-clock.css';

export interface DigitalClockState {
  type: typeof DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE;
}

export class DigitalClock extends AbstractClock {
  public static readonly DIGITAL_CLOCK_VISUALIZER_TYPE = 'DIGITAL_CLOCK_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _hourElement: HTMLParagraphElement = null;
  private _dateElement: HTMLParagraphElement = null;

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Get clock's div element
   * @returns   Clock's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.id = uuid();
    this._mainDiv.classList.add('digital-clock-container');
    this._mainDiv.appendChild(this.getClockElement());
    this._mainDiv.appendChild(this.getDateElement());
    return this._mainDiv;
  }

  public getClockElement(): HTMLElement {
    if (this._hourElement) return this._hourElement;
    this._hourElement = document.createElement('div');
    this._hourElement.classList.add('digital-clock-time');
    this._hourElement.innerText = '00:00:00';
    return this._hourElement;
  }

  public getDateElement(): HTMLElement {
    if (this._dateElement) return this._dateElement;
    this._dateElement = document.createElement('div');
    this._dateElement.classList.add('digital-clock-date');
    this._dateElement.innerText = '?';
    return this._dateElement;
  }

  protected displayTime(simulatedDate: Date): void {
    const h = simulatedDate.getHours();
    const m = simulatedDate.getMinutes();
    const s = simulatedDate.getSeconds();
    this.getClockElement().innerHTML = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;
    this.getDateElement().innerHTML = `${simulatedDate.toLocaleDateString()}`;
  }
}
