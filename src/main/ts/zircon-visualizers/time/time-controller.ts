import '@ionic/core/css/ionic.bundle.css';
import { v4 as uuid } from 'uuid';
import { TimeDescriptor } from '../../libraries/timing/timing';
import { IonModal } from '@ionic/core/components/ion-modal';
import { IonButton } from '@ionic/core/components/ion-button';
import { IonToggle } from '@ionic/core/components/ion-toggle';
import { IonDatetime } from '@ionic/core/components/ion-datetime';
import { IonDatetimeButton } from '@ionic/core/components/ion-datetime-button';
import { defineCustomElements } from '@ionic/core/loader';
import {
  ZirconViz,
  ZirconVizEventRegistry,
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

/**
 * State of the Time Controller Visualizer
 */
export interface TimeControllerState {
  type: typeof TimeController.TIME_CONTROLLER_VISUALIZER_TYPE;
  timeDescriptorId: string;
}

export type TimeControllerEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<[]>;
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

/**
 * Time Controller is a UI element to control time
 * It emits a SIMULATED_TIME_CHANGE_REQUEST event when the user changes the time
 */
export class TimeController<
  R extends TimeControllerEventRegistry = TimeControllerEventRegistry,
> extends ZirconViz<R> {
  public static readonly TIME_CONTROLLER_VISUALIZER_TYPE =
    'TIME_CONTROLLER_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _dateInputButton: IonDatetimeButton = null;
  private _dateInput: IonDatetime = null;
  private _setTimeButton: IonButton = null;
  private _runCheckbox: IonToggle = null;
  private _timeFactorInput: HTMLInputElement = null;

  /**
   * Constructor of the Time Controller Visualizer
   * @param state State of the Time Controller Visualizer
   */
  constructor(state: TimeControllerState) {
    super(state);
    // Initialize Ionic Elements
    defineCustomElements(window);
  }

  /**
   * Get Time Controller's div element
   * @returns   Time Controller's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this.addDateTimeEditorDiv(this._mainDiv);
    this.addTimeFactorDiv(this._mainDiv);
    this.addRunCheckboxDiv(this._mainDiv);
    this._mainDiv.appendChild(this.getSetTimeButton());
    return this._mainDiv;
  }

  /**
   * Add Date & Time Buttons
   * @param parent Parent element to add Date & Time editors
   */
  private addDateTimeEditorDiv(parent: HTMLElement): void {
    const dateTimeEditorDiv: HTMLDivElement = document.createElement('div');
    this._dateInput = document.createElement('ion-datetime');
    this._dateInput.id = uuid();
    this._dateInput.value = new Date().toISOString();
    this._dateInputButton = document.createElement('ion-datetime-button');
    this._dateInputButton.setAttribute('datetime', this._dateInput.id);

    dateTimeEditorDiv.appendChild(this._dateInputButton);
    const ionModal: IonModal = document.createElement('ion-modal');
    ionModal.appendChild(this._dateInput);
    dateTimeEditorDiv.appendChild(ionModal);
    parent.appendChild(dateTimeEditorDiv);
  }

  /**
   * Get Time Controller's Set Date Button
   * @returns   Time Controller's set date button
   */
  public getSetTimeButton(): IonButton {
    if (this._setTimeButton) return this._setTimeButton;
    this._setTimeButton = document.createElement('ion-button');
    this._setTimeButton.innerText = 'Set Time';
    this._setTimeButton.setAttribute('size', 'small');
    this._setTimeButton.addEventListener('click', () => this.requestSetTime());

    return this._setTimeButton;
  }

  /**
   * Add Time Factor Div
   * @param parent Parent element to add Time Factor Div to
   */
  private addTimeFactorDiv(parent: HTMLElement): void {
    const timeFactorDiv: HTMLDivElement = document.createElement('div');
    const timeFactorLabel: HTMLLabelElement = document.createElement('label');
    timeFactorLabel.innerText = 'Time Factor';
    timeFactorLabel.htmlFor = this.getTimeFactorInput().id;
    timeFactorDiv.appendChild(this.getTimeFactorInput());
    parent.appendChild(timeFactorDiv);
  }

  /**
   * Get Time Factor Input
   * @returns Time Factor Input
   */
  private getTimeFactorInput(): HTMLInputElement {
    if (this._timeFactorInput) return this._timeFactorInput;
    this._timeFactorInput = document.createElement('input');
    this._timeFactorInput.id = `time-factor-${uuid()}`;
    this._timeFactorInput.type = 'number';
    this._timeFactorInput.value = '1';
    this._timeFactorInput.min = '1';
    this._timeFactorInput.max = '1000000';
    this._timeFactorInput.step = '1';
    return this._timeFactorInput;
  }

  /**
   * Get Run Checkbox Div
   * @returns Run Checkbox Div
   */
  private addRunCheckboxDiv(parent: HTMLElement): void {
    const runCheckboxDiv: HTMLDivElement = document.createElement('div');
    const runLabel: HTMLLabelElement = document.createElement('label');
    runLabel.innerText = 'Running';
    runLabel.htmlFor = this.getRunCheckbox().id;
    runCheckboxDiv.appendChild(this.getRunCheckbox());
    parent.appendChild(runCheckboxDiv);
  }

  /** Get Run Checkbox
   * @returns Run Checkbox
   */
  private getRunCheckbox(): IonToggle {
    if (this._runCheckbox) return this._runCheckbox;
    this._runCheckbox = document.createElement('ion-toggle');
    this._runCheckbox.innerHTML = 'Autorun time';
    this._runCheckbox.checked = true;
    this._runCheckbox.setAttribute('enable-on-off-labels', 'true');
    this._runCheckbox.id = `run-checkbox-${uuid()}`;
    return this._runCheckbox;
  }

  /**
   * Fire an event TIME_CHANGE_REQUEST with the new time descriptor
   */
  private requestSetTime(): void {
    const td: TimeDescriptor = {
      realStartTime: Date.now(),
      simulatedStartTime: new Date(this._dateInput.value as string).getTime(),
      simulatedStopTime: 0,
      timeMultiplicator: Number(this._timeFactorInput.value),
      running: this.getRunCheckbox().checked,
    };
    this.emit('SIMULATED_SET_TIMEDESCRIPTOR_REQUEST', {
      timeSource: TimeManagerEngine.DEFAULT_TIME_SOURCE,
      timeDescriptor: td,
    });
  }
}
