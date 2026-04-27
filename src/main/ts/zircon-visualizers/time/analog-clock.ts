import { v4 as uuid } from 'uuid';
import './analog-clock.css';
import clockPng from './analog-clock.png';
import { AbstractClock } from './clock';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';

export interface AnalogClockState extends ZirconVizState {
  type: typeof AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE;
}

export class AnalogClock extends AbstractClock {
  public static readonly ANALOG_CLOCK_VISUALIZER_TYPE =
    'ANALOG_CLOCK_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _clockDiv: HTMLDivElement = null;
  private _hourDiv: HTMLDivElement = null;
  private _hrDiv: HTMLDivElement = null;
  private _minDiv: HTMLDivElement = null;
  private _mnDiv: HTMLDivElement = null;
  private _secDiv: HTMLDivElement = null;
  private _scDiv: HTMLDivElement = null;

  constructor(state?: AnalogClockState) {
    super(state);
  }

  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.id = uuid();
    this._mainDiv.classList.add('analog-clock-container');
    this._mainDiv.appendChild(this.getClockDiv());
    return this._mainDiv;
  }

  public getClockDiv(): HTMLDivElement {
    if (this._clockDiv) return this._mainDiv;
    this._clockDiv = document.createElement('div');
    this._clockDiv.id = uuid();
    this._clockDiv.classList.add('clock');
    this._clockDiv.style.backgroundImage = `url(${clockPng})`;

    this._hourDiv = document.createElement('div');
    this._hourDiv.classList.add('hour');
    this._hrDiv = document.createElement('div');
    this._hrDiv.classList.add('hr');
    this._hourDiv.appendChild(this._hrDiv);

    this._minDiv = document.createElement('div');
    this._minDiv.classList.add('min');
    this._mnDiv = document.createElement('div');
    this._mnDiv.classList.add('mn');
    this._minDiv.appendChild(this._mnDiv);

    this._secDiv = document.createElement('div');
    this._secDiv.classList.add('sec');
    this._scDiv = document.createElement('div');
    this._scDiv.classList.add('sc');
    this._secDiv.appendChild(this._scDiv);

    this._clockDiv.appendChild(this._hourDiv);
    this._clockDiv.appendChild(this._minDiv);
    this._clockDiv.appendChild(this._secDiv);
    return this._clockDiv;
  }

  protected displayTime(day: Date): void {
    const deg = 6; // 360 / (12 * 5);

    const hh: number = day.getHours() * 30;
    const mm: number = day.getMinutes() * deg;
    const ss: number = day.getSeconds() * deg;

    this._hrDiv.style.transform = `rotateZ(${hh + mm / 12}deg)`;
    this._mnDiv.style.transform = `rotateZ(${mm}deg)`;
    this._scDiv.style.transform = `rotateZ(${ss}deg)`;

    // gives the smooth transitioning effect, but there's a bug here!
    // sc.style.transition = `1s`;
  }
}
