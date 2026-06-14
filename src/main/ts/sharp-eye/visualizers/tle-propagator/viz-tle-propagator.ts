import './viz-tle-propagator.css';
import { v4 as uuid } from 'uuid';

import { MergeZirconRegistries } from '../../../zirconium/zircon-event';

import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../../zirconium/zircon-ui/zircon-visualizer';

import { IonButton } from '@ionic/core/components/ion-button';
import { IonTextarea } from '@ionic/core/components/ion-textarea';
import { TLEPropagator } from '../../../libraries/spatial/propagators/propagation';
import { SatelliteJsTLEPropagator } from '../../../libraries/spatial/propagators/propagation-satelliteJS';
import { IdentityFrameTransformer } from '../../../libraries/spatial/propagators/frame';
import { NadirPointingAttitudeProvider } from '../../../libraries/spatial/propagators/attitude';
import { SimpleSGP4CovarianceProvider } from '../../../libraries/spatial/propagators/covariance';
import { TLE, TLEHelper } from '../../../libraries/spatial/core/tle';

export const VIZ_TLE_PROPAGATOR_TYPE: string = 'tle-propagator';

export interface VizTLEPropagatorState extends ZirconVizState {
  type: typeof VIZ_TLE_PROPAGATOR_TYPE;
}

export type VizTLEPropagatorEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconVizEventRegistry
>;

export class VizTLEPropagator<
  R extends VizTLEPropagatorEventRegistry = VizTLEPropagatorEventRegistry,
> extends ZirconViz<R> {
  private __container: HTMLDivElement = null;
  private __tleDiv: HTMLFieldSetElement = null;
  private __resultDiv: HTMLFieldSetElement = null;
  private __propagateButton: IonButton = null;
  private __tleTextArea: IonTextarea = null;
  private __resultTextArea: IonTextarea = null;

  /**
   * constructor
   */
  constructor(state?: VizTLEPropagatorState) {
    super(state);
  }

  protected override async setState(
    state?: VizTLEPropagatorState,
  ): Promise<void> {
    if (!state) {
      return;
    }
    await super.setState(state);
  }

  public override getType(): string {
    return VIZ_TLE_PROPAGATOR_TYPE;
  }

  // =========================================================
  // TLE TEXTAREA
  // =========================================================

  public getTLETextArea(): IonTextarea {
    if (this.__tleTextArea) {
      return this.__tleTextArea;
    }

    this.__tleTextArea = document.createElement('ion-textarea');
    this.__tleTextArea.rows = 3;
    this.__tleTextArea.autoGrow = true;
    this.__tleTextArea.value = `INTELSAT 902 (IS-902)   
1 26900U 01039A   26144.17307196 -.00000287  00000+0  00000+0 0  9997
2 26900   6.0579  72.0702 0004516 346.9090 195.0037  1.00270259 90450`;

    return this.__tleTextArea;
  }

  // =========================================================
  // RESULT TEXTAREA
  // =========================================================

  public getResultTextArea(): IonTextarea {
    if (this.__resultTextArea) {
      return this.__resultTextArea;
    }
    this.__resultTextArea = document.createElement('ion-textarea');
    this.__resultTextArea.rows = 10;
    this.__resultTextArea.autoGrow = true;
    return this.__resultTextArea;
  }

  // =========================================================
  // RUN BUTTON
  // =========================================================

  private async propagate(): Promise<void> {
    let tle: TLE = null;
    try {
      tle = TLEHelper.parseTLE(this.getTLETextArea().value);
    } catch (error) {
      this.displayError(error);
    }

    // propagator should be chosen from a select list
    const propagator: TLEPropagator = new SatelliteJsTLEPropagator(
      new IdentityFrameTransformer(),
      new NadirPointingAttitudeProvider(),
      new SimpleSGP4CovarianceProvider(),
    );
    const duration = 10 * 60 * 1000;
    // dates should be chosen by the user (at least a range around TLE date)
    const tleDate: Date = TLEHelper.getTLEEpoch(tle);
    const startDate = new Date(tleDate.getTime() - duration);
    const endDate = new Date(tleDate.getTime() + duration);
    try {
      const result = await propagator.propagate(tle, startDate, endDate, {
        stepMs: 60000,
      });

      this.displayValidResult(`start time = ${startDate}
end time = ${endDate}
propagation result =
${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      this.displayError(err);
      this.getResultTextArea().value =
        err instanceof Error ? err.stack || err.message : String(err);
      throw err;
    }
  }

  private displayValidResult(result: unknown): void {
    if (!this.__resultTextArea) {
      return;
    }
    this.getResultTextArea().value =
      result instanceof Object
        ? JSON.stringify(result, null, 2)
        : String(result);
    this.__resultDiv?.classList.add('ok');
    this.__resultDiv?.classList.remove('nok');
  }

  private displayError(err: unknown): void {
    if (!this.__resultTextArea) {
      return;
    }
    this.getResultTextArea().value =
      err instanceof Error ? err.stack || err.message : String(err);
    this.__resultDiv?.classList.remove('ok');
    this.__resultDiv?.classList.add('nok');
  }

  public getRunButton(): HTMLElement {
    if (this.__propagateButton) {
      return this.__propagateButton;
    }

    this.__propagateButton = document.createElement('ion-button');
    this.__propagateButton.classList.add('button');
    this.__propagateButton.innerText = 'Propagate';

    this.__propagateButton.addEventListener('click', () => {
      this.propagate();
    });

    return this.__propagateButton;
  }

  // =========================================================
  // MAIN DIV
  // =========================================================

  public getContainer(): HTMLDivElement {
    if (this.__container) {
      return this.__container;
    }

    this.__container = document.createElement('div');
    this.__container.id = uuid();
    this.__container.classList.add('tle-propagator-container');
    // SOURCE
    this.__tleDiv = document.createElement('fieldset');
    const sourceLegend = document.createElement('legend');
    sourceLegend.innerText = 'TLE  --   2 or 3 lines --';
    this.__tleDiv.appendChild(sourceLegend);
    this.__tleDiv.classList.add('tle-propagator-code');
    this.__tleDiv.appendChild(this.getTLETextArea());
    this.__container.appendChild(this.__tleDiv);
    // BUTTON
    const buttonDiv = document.createElement('div');
    buttonDiv.appendChild(this.getRunButton());
    this.__container.appendChild(buttonDiv);
    // RESULT
    this.__resultDiv = document.createElement('fieldset');
    const resultLegend = document.createElement('legend');
    resultLegend.innerText = 'Trajectory';
    this.__resultDiv.appendChild(resultLegend);
    this.__resultDiv.classList.add('tle-propagator-result');
    this.__resultDiv.appendChild(this.getResultTextArea());
    this.__container.appendChild(this.__resultDiv);
    return this.__container;
  }

  public override updateResize(): boolean {
    return true;
  }
}
