import { v4 as uuid } from 'uuid';
import './analog-clock.css';
import clockPng from './analog-clock.png';
import { AbstractClock, ClockState } from './clock';

export interface AnalogClockState extends ClockState {
  type: typeof AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE;
}

export class AnalogClock extends AbstractClock {
  public static readonly ANALOG_CLOCK_VISUALIZER_TYPE =
    'ANALOG_CLOCK_VISUALIZER_TYPE';
  private __mainDiv: HTMLDivElement = null;
  private __clockDiv: HTMLDivElement = null;
  private __hourDiv: HTMLDivElement = null;
  private __hrDiv: HTMLDivElement = null;
  private __minDiv: HTMLDivElement = null;
  private __mnDiv: HTMLDivElement = null;
  private __secDiv: HTMLDivElement = null;
  private __scDiv: HTMLDivElement = null;

  constructor(state?: AnalogClockState) {
    super(state);
  }

  public getMainDiv(): HTMLDivElement {
    if (this.__mainDiv) return this.__mainDiv;
    this.__mainDiv = document.createElement('div');
    this.__mainDiv.id = uuid();
    this.__mainDiv.classList.add('analog-clock-container');
    this.__mainDiv.appendChild(this.getClockDiv());
    return this.__mainDiv;
  }

  public getClockDiv(): HTMLDivElement {
    if (this.__clockDiv) return this.__mainDiv;
    this.__clockDiv = document.createElement('div');
    this.__clockDiv.id = uuid();
    this.__clockDiv.classList.add('clock');
    this.__clockDiv.style.backgroundImage = `url(${clockPng})`;

    this.__hourDiv = document.createElement('div');
    this.__hourDiv.classList.add('hour');
    this.__hrDiv = document.createElement('div');
    this.__hrDiv.classList.add('hr');
    this.__hourDiv.appendChild(this.__hrDiv);

    this.__minDiv = document.createElement('div');
    this.__minDiv.classList.add('min');
    this.__mnDiv = document.createElement('div');
    this.__mnDiv.classList.add('mn');
    this.__minDiv.appendChild(this.__mnDiv);

    this.__secDiv = document.createElement('div');
    this.__secDiv.classList.add('sec');
    this.__scDiv = document.createElement('div');
    this.__scDiv.classList.add('sc');
    this.__secDiv.appendChild(this.__scDiv);

    this.__clockDiv.appendChild(this.__hourDiv);
    this.__clockDiv.appendChild(this.__minDiv);
    this.__clockDiv.appendChild(this.__secDiv);
    return this.__clockDiv;
  }

  protected displayTime(day: Date): void {
    const deg = 6; // 360 / (12 * 5);

    const hh: number = day.getHours() * 30;
    const mm: number = day.getMinutes() * deg;
    const ss: number = day.getSeconds() * deg;

    this.__hrDiv.style.transform = `rotateZ(${hh + mm / 12}deg)`;
    this.__mnDiv.style.transform = `rotateZ(${mm}deg)`;
    this.__scDiv.style.transform = `rotateZ(${ss}deg)`;

    // gives the smooth transitioning effect, but there's a bug here!
    // sc.style.transition = `1s`;
  }

  public override generateCurrentState(): AnalogClockState {
    return {
      ...super.generateCurrentState(),
      type: AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
    };
  }
}
