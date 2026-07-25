/* eslint-disable @typescript-eslint/no-explicit-any */
import '@ionic/core/css/ionic.bundle.css';
import { v4 as uuid } from 'uuid';
import './time-controller.css';
import { defineCustomElements } from '@ionic/core/loader';
import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import {
  TimeManagerEngine,
  TimeManagerEngineEvents,
} from '../../sharp-eye/engines/time-manager/time-manager-engine';
import {
  TimeDescriptor,
  TimeRunner,
  TimingHelper,
} from '../../libraries/timing/timing';

export interface TimeControllerState extends ZirconVizState {
  type: typeof TimeController.TIME_CONTROLLER_VISUALIZER_TYPE;
  timeSource: string;
}

export type TimeControllerEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<TimeManagerEngineEvents, 'SIMULATED_TIMEDESCRIPTOR'>]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          TimeManagerEngineEvents,
          | 'SIMULATED_SET_TIMEDESCRIPTOR_REQUEST'
          | 'SIMULATED_TIMEDESCRIPTOR_REQUEST'
        >,
      ]
    >;
  },
  ZirconVizEventRegistry
>;

export class TimeController<
  R extends TimeControllerEventRegistry = TimeControllerEventRegistry,
> extends ZirconViz<R> {
  public static readonly TIME_CONTROLLER_VISUALIZER_TYPE =
    'time-controller-visualizer-type';

  private __mainDiv: HTMLDivElement = null;

  private __headerDiv: HTMLDivElement = null;
  private __timeSourceLabel: HTMLLabelElement = null;
  private __timeDescriptorStatusLabel: HTMLLabelElement = null;

  private __endDateEnabledCheckbox: HTMLIonCheckboxElement = null;
  private __endDurationSelect: HTMLIonSelectElement = null;

  private __timeSlider: HTMLIonRangeElement = null;
  private __sliderDateLabel: HTMLDivElement = null;

  private __startDateReadableLabel: HTMLDivElement = null;
  private __endDateReadableLabel: HTMLDivElement = null;

  private __startButton: HTMLIonButtonElement = null;
  private __stopButton: HTMLIonButtonElement = null;
  private __restartButton: HTMLIonButtonElement = null;

  private __timeFactorSelect: HTMLIonSelectElement = null;
  private __timeFactor = 1;

  private __startDatePicker: HTMLIonDatetimeElement = null;
  private __endDatePicker: HTMLIonDatetimeElement = null;

  private __startDateModal: HTMLIonModalElement = null;
  private __endDateModal: HTMLIonModalElement = null;

  private __liveNowInterval: any = null;
  private __isLiveNow = false;
  private __timeRunner: TimeRunner = null;

  private _timeSource: string = null;

  private readonly _durations = [
    { label: '10 minutes', ms: 10 * 60 * 1000 },
    { label: '30 minutes', ms: 30 * 60 * 1000 },
    { label: '1 hour', ms: 1 * 60 * 60 * 1000 },
    { label: '12 hours', ms: 12 * 60 * 60 * 1000 },
    { label: '24 hours', ms: 24 * 60 * 60 * 1000 },
    { label: '5 days', ms: 5 * 24 * 60 * 60 * 1000 },
    { label: '1 month', ms: 30 * 24 * 60 * 60 * 1000 },
    { label: '1 year', ms: 365 * 24 * 60 * 60 * 1000 },
  ];

  constructor() {
    super();
    defineCustomElements(window);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('SIMULATED_TIMEDESCRIPTOR', (arg) => {
      this.setTimeDescriptor(arg.timeSource, arg.timeDescriptor);
    });
  }

  public override getType(): string {
    return TimeController.TIME_CONTROLLER_VISUALIZER_TYPE;
  }

  public override async setState(state: TimeControllerState): Promise<void> {
    await super.setState(state);
    if (!state) {
      return;
    }
    this.setTimeSource(state.timeSource);
  }

  private getStartTime(): number {
    return new Date(this.__startDatePicker?.value as string)?.getTime();
  }

  private getEndTime(): number {
    return new Date(this.__endDatePicker?.value as string)?.getTime();
  }

  private getCurrentTime(): number {
    return Number(this.__timeSlider.value);
  }

  private setCurrentTime(value: number): void {
    if (this.__timeSlider.value !== value) {
      this.__timeSlider.value = value;
    }
  }

  /**
   * Get Time Runner
   */
  public getTimeRunner(): TimeRunner {
    if (this.__timeRunner) {
      return this.__timeRunner;
    }
    this.__timeRunner = new TimeRunner();
    this.__timeRunner.addTimeChangeCallback(this.onTimeChange.bind(this));
    return this.__timeRunner;
  }

  private onTimeChange(runner: TimeRunner): void {
    this.setCurrentTime(runner.getCurrentSimulatedTime());
  }

  private setTimeSource(timeSource: string): boolean {
    if (this._timeSource === timeSource) {
      return false;
    }
    this._timeSource = timeSource;
    this.displayTimeSource(this._timeSource);
    this.getTimeRunner().setTimeDescriptor(null);
    this.requestTimeDescriptor();
    return true;
  }

  public getTimeSource(): string {
    return this._timeSource;
  }

  /**
   * Set Time Descriptor
   * @param timeDescriptor
   */
  public setTimeDescriptor(
    timeSource: string,
    timeDescriptor: TimeDescriptor,
  ): void {
    this.displayTimeDescriptorStatus(`time descriptor ${timeSource} received`);
    this.getTimeRunner()?.setTimeDescriptor(timeDescriptor);
  }

  public getContainer(): HTMLDivElement {
    if (this.__mainDiv) {
      return this.__mainDiv;
    }

    this.__mainDiv = document.createElement('div');
    this.__mainDiv.classList.add('time-controller-range');

    this.addHeader(this.__mainDiv);
    this.addStartDateEditor(this.__mainDiv);
    this.addEndDateEditor(this.__mainDiv);
    this.addCurrentTime(this.__mainDiv);
    this.addControlButtons(this.__mainDiv);

    return this.__mainDiv;
  }

  private addHeader(parent: HTMLElement): void {
    this.__headerDiv = document.createElement('div');

    const timeSourceFieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.innerText = 'Time Source';
    timeSourceFieldset.appendChild(legend);
    this.__timeSourceLabel = document.createElement('label');
    this.__timeSourceLabel.innerText = this.getTimeSource();
    timeSourceFieldset.appendChild(this.__timeSourceLabel);
    this.__headerDiv.appendChild(timeSourceFieldset);

    const timeDescriptorStatusFieldset = document.createElement('fieldset');
    const legend2 = document.createElement('legend');
    legend.innerText = 'Status';
    timeDescriptorStatusFieldset.appendChild(legend2);
    this.__timeDescriptorStatusLabel = document.createElement('label');
    this.__timeDescriptorStatusLabel.innerText = 'unknown';
    timeDescriptorStatusFieldset.appendChild(this.__timeDescriptorStatusLabel);
    this.__headerDiv.appendChild(timeDescriptorStatusFieldset);

    parent.appendChild(this.__headerDiv);
  }

  private displayTimeDescriptorStatus(status: string): void {
    if (!this.__timeDescriptorStatusLabel) {
      return;
    }
    this.__timeDescriptorStatusLabel.innerText = status;
  }

  private displayTimeSource(timeSource: string): void {
    if (!this.__timeSourceLabel) {
      return;
    }
    this.__timeSourceLabel.innerText = timeSource;
  }

  // =====================================================
  // START DATE (LABEL CLICKABLE + LIVE NOW)
  // =====================================================
  private addStartDateEditor(parent: HTMLElement): void {
    const container = document.createElement('fieldset');
    container.classList.add('start-date');

    const legend = document.createElement('legend');
    legend.innerText = 'Start Date/Time';
    container.appendChild(legend);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '8px';

    const nowBtn = document.createElement('ion-button');
    nowBtn.size = 'small';
    nowBtn.textContent = 'Now';

    const liveNowBtn = document.createElement('ion-button');
    liveNowBtn.size = 'small';
    liveNowBtn.color = 'warning';
    liveNowBtn.textContent = 'Live now';

    this.__startDateReadableLabel = document.createElement('div');
    this.__startDateReadableLabel.classList.add('time-display');

    this.__startDatePicker = document.createElement('ion-datetime');
    this.__startDatePicker.value = new Date().toISOString();

    this.__startDateModal = document.createElement('ion-modal');
    this.__startDateModal.keepContentsMounted = true;
    this.__startDateModal.appendChild(this.__startDatePicker);

    const updateStart = (ts: number) => {
      this.__startDateReadableLabel.textContent = this.formatTimestamp(ts);
      this.updateEndDateFromDuration();
      this.updateSliderBounds();
    };

    this.__startDateReadableLabel.addEventListener('click', () => {
      this.__startDateModal.present();
    });

    nowBtn.addEventListener('click', () => {
      this.stopLiveNow();
      const now = Date.now();
      this.__startDatePicker.value = new Date(now).toISOString();
      updateStart(now);
    });

    liveNowBtn.addEventListener('click', () => {
      if (this.__isLiveNow) {
        this.stopLiveNow();
        liveNowBtn.color = 'warning';
        return;
      }
      this.startLiveNow(liveNowBtn);
    });

    this.__startDatePicker.addEventListener('ionChange', () => {
      const ts = this.getStartTime();
      updateStart(ts);
    });

    header.appendChild(nowBtn);
    header.appendChild(liveNowBtn);
    header.appendChild(this.__startDateReadableLabel);

    container.appendChild(header);
    container.appendChild(this.__startDateModal);

    parent.appendChild(container);

    const ts = this.getStartTime();
    this.__startDateReadableLabel.textContent = this.formatTimestamp(ts);
  }

  // =====================================================
  // LIVE NOW
  // =====================================================
  private startLiveNow(btn: HTMLIonButtonElement): void {
    this.__isLiveNow = true;
    btn.color = 'danger';

    this.__liveNowInterval = setInterval(() => {
      const now = Date.now();

      this.__startDatePicker.value = new Date(now).toISOString();
      this.__startDateReadableLabel.textContent = this.formatTimestamp(now);

      this.updateEndDateFromDuration();
      this.updateSliderBounds();
    }, 1000);
  }

  private stopLiveNow(): void {
    this.__isLiveNow = false;

    if (this.__liveNowInterval) {
      clearInterval(this.__liveNowInterval);
      this.__liveNowInterval = null;
    }
  }

  // =====================================================
  // END DATE (LABEL CLICKABLE)
  // =====================================================
  private addEndDateEditor(parent: HTMLElement): void {
    const container = document.createElement('fieldset');
    container.classList.add('end-time');

    const legend = document.createElement('legend');
    const label = document.createElement('label');
    label.innerText = 'End Date/Time';
    container.appendChild(legend);

    this.__endDateEnabledCheckbox = document.createElement('ion-checkbox');
    this.__endDateEnabledCheckbox.checked = true;
    this.__endDateEnabledCheckbox.id = uuid();

    legend.setAttribute('for', this.__endDateEnabledCheckbox.id);

    this.__endDateReadableLabel = document.createElement('div');
    this.__endDateReadableLabel.classList.add('time-display');

    this.__endDatePicker = document.createElement('ion-datetime');

    this.__endDateModal = document.createElement('ion-modal');
    this.__endDateModal.keepContentsMounted = true;
    this.__endDateModal.appendChild(this.__endDatePicker);

    this.__endDateReadableLabel.addEventListener('click', () => {
      if (!this.__endDateEnabledCheckbox.checked) {
        return;
      }
      this.__endDateModal.present();
    });

    this.__endDatePicker.addEventListener('ionChange', () => {
      const ts = this.getEndTime();
      this.__endDateReadableLabel.textContent = this.formatTimestamp(ts);
      this.updateSliderBounds();
    });

    const durationRow = document.createElement('div');
    durationRow.style.display = 'flex';
    durationRow.style.alignItems = 'center';
    durationRow.style.gap = '5px';

    const durationLabel = document.createElement('label');
    durationLabel.textContent = 'Duration';

    this.__endDurationSelect = document.createElement('ion-select');
    this.__endDurationSelect.interface = 'popover';

    this._durations.forEach((d) => {
      const opt = document.createElement('ion-select-option');
      opt.value = d.ms;
      opt.textContent = d.label;
      this.__endDurationSelect.appendChild(opt);
    });

    this.__endDurationSelect.value = this._durations[2].ms;

    this.__endDurationSelect.addEventListener('ionChange', () => {
      this.updateEndDateFromDuration();
      this.updateSliderBounds();
    });

    this.__endDateEnabledCheckbox.addEventListener('ionChange', (e: any) => {
      const checked = e.detail.checked;

      this.__endDatePicker.disabled = !checked;

      if (!checked) {
        this.__endDurationSelect.value =
          this._durations[this._durations.length - 1].ms;

        this.updateEndDateFromDuration();
      }

      this.updateSliderBounds();
    });

    legend.appendChild(this.__endDateEnabledCheckbox);
    legend.appendChild(label);

    durationRow.appendChild(durationLabel);
    durationRow.appendChild(this.__endDurationSelect);

    container.appendChild(durationRow);
    container.appendChild(this.__endDateModal);
    container.appendChild(this.__endDateReadableLabel);

    parent.appendChild(container);

    this.updateEndDateFromDuration();
  }

  private updateEndDateFromDuration(): void {
    const start = this.getStartTime();
    const duration = Number(this.__endDurationSelect.value);
    const end = new Date(start + duration);

    this.__endDatePicker.value = end.toISOString();

    this.__endDateReadableLabel.textContent = this.formatTimestamp(
      end.getTime(),
    );
  }

  // =====================================================
  // SLIDER
  // =====================================================
  private addCurrentTime(parent: HTMLElement): void {
    const container = document.createElement('fieldset');

    const legend = document.createElement('legend');
    legend.innerText = 'Current Date/Time';
    container.appendChild(legend);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';

    this.__sliderDateLabel = document.createElement('div');
    this.__sliderDateLabel.classList.add('time-display');

    header.appendChild(this.__sliderDateLabel);

    this.__timeSlider = document.createElement('ion-range');

    const start = this.getStartTime();
    const end = this.getEndTime();

    this.__timeSlider.min = start;
    this.__timeSlider.max = end;
    this.__timeSlider.value = start;

    this.__sliderDateLabel.textContent = this.formatTimestamp(start);

    this.__timeSlider.addEventListener('ionInput', (e: any) => {
      this.__sliderDateLabel.textContent = this.formatTimestamp(e.detail.value);
    });

    this.__timeSlider.addEventListener('mousedown', () => {
      this.requestSetTime(false);
    });

    this.__timeSlider.addEventListener('ionChange', () => {
      this.requestSetTime(false);
    });

    container.appendChild(header);
    container.appendChild(this.__timeSlider);

    parent.appendChild(container);
  }

  private updateSliderBounds(): void {
    const start = this.getStartTime();
    const end = this.getEndTime();

    this.__timeSlider.min = start;
    this.__timeSlider.max = end;

    let v = Number(this.__timeSlider.value);

    if (v < start) {
      v = start;
    }
    if (v > end) {
      v = end;
    }

    this.__timeSlider.value = v;
    this.__sliderDateLabel.textContent = this.formatTimestamp(v);
  }

  // =====================================================
  // TIME FACTOR
  // =====================================================
  private addTimeFactorSelect(parent: HTMLElement): void {
    const container = document.createElement('div');
    container.classList.add('time-factor');

    const label = document.createElement('label');
    label.textContent = 'Time Factor';

    this.__timeFactorSelect = document.createElement('ion-select');
    this.__timeFactorSelect.interface = 'popover';

    const values = [0.5, 0.75, 1, 1.5, 2, 5, 10, 100];

    values.forEach((v) => {
      const o = document.createElement('ion-select-option');
      o.value = v;
      o.textContent = `x${v}`;
      this.__timeFactorSelect.appendChild(o);
    });

    this.__timeFactorSelect.value = 1;

    this.__timeFactorSelect.addEventListener('ionChange', (e: any) => {
      this.__timeFactor = Number(e.detail.value);
    });

    container.appendChild(label);
    container.appendChild(this.__timeFactorSelect);

    parent.appendChild(container);
  }

  // =====================================================
  // BUTTONS
  // =====================================================
  private addControlButtons(parent: HTMLElement): void {
    const container = document.createElement('fieldset');
    container.classList.add('time-control');

    const legend = document.createElement('legend');
    legend.innerText = 'Time Controller';
    container.appendChild(legend);

    this.addTimeFactorSelect(container);

    this.__startButton = document.createElement('ion-button');
    this.__startButton.color = 'success';
    this.__startButton.textContent = 'Run from current';

    this.__stopButton = document.createElement('ion-button');
    this.__stopButton.color = 'danger';
    this.__stopButton.textContent = 'Stop';

    this.__restartButton = document.createElement('ion-button');
    this.__restartButton.color = 'warning';
    this.__restartButton.textContent = 'Run from start';

    this.__startButton.addEventListener('click', () =>
      this.requestSetTime(true),
    );

    this.__restartButton.addEventListener('click', () => {
      this.__timeSlider.value = this.getStartTime();
      this.requestSetTime(true);
    });

    this.__stopButton.addEventListener('click', () =>
      this.requestSetTime(false),
    );

    const buttonsContainer = document.createElement('div');
    buttonsContainer.appendChild(this.__restartButton);
    buttonsContainer.appendChild(this.__startButton);
    buttonsContainer.appendChild(this.__stopButton);

    container.appendChild(buttonsContainer);
    parent.appendChild(container);
  }

  private requestSetTime(running: boolean): void {
    const start = this.getStartTime();
    const current = this.getCurrentTime();

    let stop = 0;

    if (this.__endDateEnabledCheckbox.checked) {
      stop = this.getEndTime();
    }

    const td: TimeDescriptor = {
      realStartTime: TimingHelper.computeRealStartTime(
        start,
        current,
        this.__timeFactor,
      ),
      simulatedStartTime: start,
      simulatedCurrentTime: current,
      simulatedStopTime: stop,
      timeMultiplicator: this.__timeFactor,
      running,
    };
    this.emit('SIMULATED_SET_TIMEDESCRIPTOR_REQUEST', {
      timeSource: TimeManagerEngine.DEFAULT_TIME_SOURCE,
      timeDescriptor: td,
    });
  }

  private requestTimeDescriptor(): void {
    this.displayTimeDescriptorStatus(
      `time descriptor ${this.getTimeSource()} requested`,
    );

    this.emit('SIMULATED_TIMEDESCRIPTOR_REQUEST', {
      timeSource: this.getTimeSource(),
    });
  }
  // =====================================================
  // FORMAT
  // =====================================================
  private formatTimestamp(ts: number): string {
    const date = new Date(ts);

    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(date);
  }
}
