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
  timeDescriptorId: string;
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
          'SIMULATED_SET_TIMEDESCRIPTOR_REQUEST'
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
    'TIME_CONTROLLER_VISUALIZER_TYPE';

  private _mainDiv: HTMLDivElement = null;

  private _endDateEnabledCheckbox: HTMLIonCheckboxElement = null;
  private _endDurationSelect: HTMLIonSelectElement = null;

  private _timeSlider: HTMLIonRangeElement = null;
  private _sliderDateLabel: HTMLDivElement = null;

  private _startDateReadableLabel: HTMLDivElement = null;
  private _endDateReadableLabel: HTMLDivElement = null;

  private _startButton: HTMLIonButtonElement = null;
  private _stopButton: HTMLIonButtonElement = null;
  private _restartButton: HTMLIonButtonElement = null;

  private _timeFactorSelect: HTMLIonSelectElement = null;
  private _timeFactor = 1;

  private _startDatePicker: HTMLIonDatetimeElement = null;
  private _endDatePicker: HTMLIonDatetimeElement = null;

  private _startDateModal: HTMLIonModalElement = null;
  private _endDateModal: HTMLIonModalElement = null;

  private _liveNowInterval: any = null;
  private _isLiveNow = false;
  private _timeRunner: TimeRunner = null;

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

  constructor(state: TimeControllerState) {
    super(state);
    defineCustomElements(window);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('SIMULATED_TIMEDESCRIPTOR', (arg) => {
      this.setTimeDescriptor(arg.timeSource, arg.timeDescriptor);
    });
  }

  private getStartTime(): number {
    return new Date(this._startDatePicker?.value as string)?.getTime();
  }

  private getEndTime(): number {
    return new Date(this._endDatePicker?.value as string)?.getTime();
  }

  private getCurrentTime(): number {
    return Number(this._timeSlider.value);
  }

  private setCurrentTime(value: number): void {
    if (this._timeSlider.value !== value) this._timeSlider.value = value;
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
    this.setCurrentTime(runner.getCurrentSimulatedTime());
  }

  /**
   * Set Time Descriptor
   * @param timeDescriptor
   */
  public setTimeDescriptor(
    _timeSource: string,
    timeDescriptor: TimeDescriptor,
  ): void {
    this.getTimeRunner()?.setTimeDescriptor(timeDescriptor);
  }

  public getContainer(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;

    this._mainDiv = document.createElement('div');
    this._mainDiv.classList.add('time-controller-range');

    this.addStartDateEditor(this._mainDiv);
    this.addEndDateEditor(this._mainDiv);
    this.addCurrentTime(this._mainDiv);
    this.addControlButtons(this._mainDiv);

    return this._mainDiv;
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

    this._startDateReadableLabel = document.createElement('div');
    this._startDateReadableLabel.classList.add('time-display');

    this._startDatePicker = document.createElement('ion-datetime');
    this._startDatePicker.value = new Date().toISOString();

    this._startDateModal = document.createElement('ion-modal');
    this._startDateModal.keepContentsMounted = true;
    this._startDateModal.appendChild(this._startDatePicker);

    const updateStart = (ts: number) => {
      this._startDateReadableLabel.textContent = this.formatTimestamp(ts);
      this.updateEndDateFromDuration();
      this.updateSliderBounds();
    };

    this._startDateReadableLabel.addEventListener('click', () => {
      this._startDateModal.present();
    });

    nowBtn.addEventListener('click', () => {
      this.stopLiveNow();
      const now = Date.now();
      this._startDatePicker.value = new Date(now).toISOString();
      updateStart(now);
    });

    liveNowBtn.addEventListener('click', () => {
      if (this._isLiveNow) {
        this.stopLiveNow();
        liveNowBtn.color = 'warning';
        return;
      }
      this.startLiveNow(liveNowBtn);
    });

    this._startDatePicker.addEventListener('ionChange', () => {
      const ts = this.getStartTime();
      updateStart(ts);
    });

    header.appendChild(nowBtn);
    header.appendChild(liveNowBtn);
    header.appendChild(this._startDateReadableLabel);

    container.appendChild(header);
    container.appendChild(this._startDateModal);

    parent.appendChild(container);

    const ts = this.getStartTime();
    this._startDateReadableLabel.textContent = this.formatTimestamp(ts);
  }

  // =====================================================
  // LIVE NOW
  // =====================================================
  private startLiveNow(btn: HTMLIonButtonElement): void {
    this._isLiveNow = true;
    btn.color = 'danger';

    this._liveNowInterval = setInterval(() => {
      const now = Date.now();

      this._startDatePicker.value = new Date(now).toISOString();
      this._startDateReadableLabel.textContent = this.formatTimestamp(now);

      this.updateEndDateFromDuration();
      this.updateSliderBounds();
    }, 1000);
  }

  private stopLiveNow(): void {
    this._isLiveNow = false;

    if (this._liveNowInterval) {
      clearInterval(this._liveNowInterval);
      this._liveNowInterval = null;
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

    this._endDateEnabledCheckbox = document.createElement('ion-checkbox');
    this._endDateEnabledCheckbox.checked = true;
    this._endDateEnabledCheckbox.id = uuid();

    legend.setAttribute('for', this._endDateEnabledCheckbox.id);

    this._endDateReadableLabel = document.createElement('div');
    this._endDateReadableLabel.classList.add('time-display');

    this._endDatePicker = document.createElement('ion-datetime');

    this._endDateModal = document.createElement('ion-modal');
    this._endDateModal.keepContentsMounted = true;
    this._endDateModal.appendChild(this._endDatePicker);

    this._endDateReadableLabel.addEventListener('click', () => {
      if (!this._endDateEnabledCheckbox.checked) return;
      this._endDateModal.present();
    });

    this._endDatePicker.addEventListener('ionChange', () => {
      const ts = this.getEndTime();
      this._endDateReadableLabel.textContent = this.formatTimestamp(ts);
      this.updateSliderBounds();
    });

    const durationRow = document.createElement('div');
    durationRow.style.display = 'flex';
    durationRow.style.alignItems = 'center';
    durationRow.style.gap = '5px';

    const durationLabel = document.createElement('label');
    durationLabel.textContent = 'Duration';

    this._endDurationSelect = document.createElement('ion-select');
    this._endDurationSelect.interface = 'popover';

    this._durations.forEach((d) => {
      const opt = document.createElement('ion-select-option');
      opt.value = d.ms;
      opt.textContent = d.label;
      this._endDurationSelect.appendChild(opt);
    });

    this._endDurationSelect.value = this._durations[2].ms;

    this._endDurationSelect.addEventListener('ionChange', () => {
      this.updateEndDateFromDuration();
      this.updateSliderBounds();
    });

    this._endDateEnabledCheckbox.addEventListener('ionChange', (e: any) => {
      const checked = e.detail.checked;

      this._endDatePicker.disabled = !checked;

      if (!checked) {
        this._endDurationSelect.value =
          this._durations[this._durations.length - 1].ms;

        this.updateEndDateFromDuration();
      }

      this.updateSliderBounds();
    });

    legend.appendChild(this._endDateEnabledCheckbox);
    legend.appendChild(label);

    durationRow.appendChild(durationLabel);
    durationRow.appendChild(this._endDurationSelect);

    container.appendChild(durationRow);
    container.appendChild(this._endDateModal);
    container.appendChild(this._endDateReadableLabel);

    parent.appendChild(container);

    this.updateEndDateFromDuration();
  }

  private updateEndDateFromDuration(): void {
    const start = this.getStartTime();
    const duration = Number(this._endDurationSelect.value);
    const end = new Date(start + duration);

    this._endDatePicker.value = end.toISOString();

    this._endDateReadableLabel.textContent = this.formatTimestamp(
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

    this._sliderDateLabel = document.createElement('div');
    this._sliderDateLabel.classList.add('time-display');

    header.appendChild(this._sliderDateLabel);

    this._timeSlider = document.createElement('ion-range');

    const start = this.getStartTime();
    const end = this.getEndTime();

    this._timeSlider.min = start;
    this._timeSlider.max = end;
    this._timeSlider.value = start;

    this._sliderDateLabel.textContent = this.formatTimestamp(start);

    this._timeSlider.addEventListener('ionInput', (e: any) => {
      this._sliderDateLabel.textContent = this.formatTimestamp(e.detail.value);
    });

    this._timeSlider.addEventListener('mousedown', () => {
      this.requestSetTime(false);
    });

    this._timeSlider.addEventListener('ionChange', () => {
      this.requestSetTime(false);
    });

    container.appendChild(header);
    container.appendChild(this._timeSlider);

    parent.appendChild(container);
  }

  private updateSliderBounds(): void {
    const start = this.getStartTime();
    const end = this.getEndTime();

    this._timeSlider.min = start;
    this._timeSlider.max = end;

    let v = Number(this._timeSlider.value);

    if (v < start) v = start;
    if (v > end) v = end;

    this._timeSlider.value = v;
    this._sliderDateLabel.textContent = this.formatTimestamp(v);
  }

  // =====================================================
  // TIME FACTOR
  // =====================================================
  private addTimeFactorSelect(parent: HTMLElement): void {
    const container = document.createElement('div');
    container.classList.add('time-factor');

    const label = document.createElement('label');
    label.textContent = 'Time Factor';

    this._timeFactorSelect = document.createElement('ion-select');
    this._timeFactorSelect.interface = 'popover';

    const values = [0.5, 0.75, 1, 1.5, 2, 5, 10, 100];

    values.forEach((v) => {
      const o = document.createElement('ion-select-option');
      o.value = v;
      o.textContent = `x${v}`;
      this._timeFactorSelect.appendChild(o);
    });

    this._timeFactorSelect.value = 1;

    this._timeFactorSelect.addEventListener('ionChange', (e: any) => {
      this._timeFactor = Number(e.detail.value);
    });

    container.appendChild(label);
    container.appendChild(this._timeFactorSelect);

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

    this._startButton = document.createElement('ion-button');
    this._startButton.color = 'success';
    this._startButton.textContent = 'Run from current';

    this._stopButton = document.createElement('ion-button');
    this._stopButton.color = 'danger';
    this._stopButton.textContent = 'Stop';

    this._restartButton = document.createElement('ion-button');
    this._restartButton.color = 'warning';
    this._restartButton.textContent = 'Run from start';

    this._startButton.addEventListener('click', () =>
      this.requestSetTime(true),
    );

    this._restartButton.addEventListener('click', () => {
      this._timeSlider.value = this.getStartTime();
      this.requestSetTime(true);
    });

    this._stopButton.addEventListener('click', () =>
      this.requestSetTime(false),
    );

    const buttonsContainer = document.createElement('div');
    buttonsContainer.appendChild(this._restartButton);
    buttonsContainer.appendChild(this._startButton);
    buttonsContainer.appendChild(this._stopButton);

    container.appendChild(buttonsContainer);
    parent.appendChild(container);
  }

  private requestSetTime(running: boolean): void {
    const start = this.getStartTime();
    const current = this.getCurrentTime();

    let stop = 0;

    if (this._endDateEnabledCheckbox.checked) {
      stop = this.getEndTime();
    }

    const td: TimeDescriptor = {
      realStartTime: TimingHelper.computeRealStartTime(
        start,
        current,
        this._timeFactor,
      ),
      simulatedStartTime: start,
      simulatedCurrentTime: current,
      simulatedStopTime: stop,
      timeMultiplicator: this._timeFactor,
      running,
    };

    this.emit('SIMULATED_SET_TIMEDESCRIPTOR_REQUEST', {
      timeSource: TimeManagerEngine.DEFAULT_TIME_SOURCE,
      timeDescriptor: td,
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
