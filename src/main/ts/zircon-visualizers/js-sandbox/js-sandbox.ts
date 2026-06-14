import './js-sandbox.css';
import { v4 as uuid } from 'uuid';

import { MergeZirconRegistries } from '../../zirconium/zircon-event';

import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';

import { IonButton } from '@ionic/core/components/ion-button';
import { IonTextarea } from '@ionic/core/components/ion-textarea';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';

export const VIZ_JSSANDBOX_TYPE: string = 'js-sandbox';

export interface VizJSSandboxState extends ZirconVizState {
  type: typeof VIZ_JSSANDBOX_TYPE;
  code?: string;
}

export type VizJSSandboxEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconVizEventRegistry
>;

export class VizJSSandbox<
  R extends VizJSSandboxEventRegistry = VizJSSandboxEventRegistry,
> extends ZirconViz<R> {
  private _code: string = `const a = 10; const b = 20; return a + b;`;

  private __app: ZirconApplication = null;
  private __container: HTMLDivElement = null;
  private __sourceDiv: HTMLFieldSetElement = null;
  private __resultDiv: HTMLFieldSetElement = null;
  private __runButton: IonButton = null;
  private __sourceTextArea: IonTextarea = null;
  private __resultTextArea: IonTextarea = null;

  /**
   * constructor
   */
  constructor(app: ZirconApplication, state?: VizJSSandboxState) {
    super(state);
    this.__app = app;
  }

  public getCode(): string {
    return this._code;
  }

  public setCode(code: string): void {
    this._code = code;
    if (this.__sourceTextArea) {this.__sourceTextArea.innerText = this.getCode();}
    if (this.__resultTextArea)
      {this.__resultTextArea.innerText = 'click run to see the result';}
    if (this.__resultDiv) {
      this.__resultDiv.classList.remove('ok');
      this.__resultDiv.classList.remove('nok');
    }
  }

  protected override async setState(state?: VizJSSandboxState): Promise<void> {
    if (!state) {return;}
    await super.setState(state);
    this.setCode(state?.code);
  }

  public override getType(): string {
    return VIZ_JSSANDBOX_TYPE;
  }

  private getApplication(): ZirconApplication {
    return this.__app;
  }

  // =========================================================
  // SOURCE TEXTAREA
  // =========================================================

  public getSourceTextArea(): IonTextarea {
    if (this.__sourceTextArea) {
      return this.__sourceTextArea;
    }

    this.__sourceTextArea = document.createElement('ion-textarea');
    this.__sourceTextArea.rows = 10;
    this.__sourceTextArea.autoGrow = true;
    this.__sourceTextArea.value = `const a = 10; const b = 20; return a + b;`;

    return this.__sourceTextArea;
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

  private async run(): Promise<void> {
    const source: string = this.getSourceTextArea().value;

    try {
      // sandbox execution

      // app is used as string in function arguments
       
      const app: ZirconApplication = this.getApplication();
      const fn = new Function('app', ` "use strict";    ${source}  `);
      const result = fn(app);

      this.getResultTextArea().value =
        typeof result === 'object'
          ? JSON.stringify(result, null, 2)
          : String(result);
      this.__resultDiv?.classList.add('ok');
      this.__resultDiv?.classList.remove('nok');
    } catch (err) {
      this.__resultDiv?.classList.remove('ok');
      this.__resultDiv?.classList.add('nok');
      this.getResultTextArea().value =
        err instanceof Error ? err.stack || err.message : String(err);
      throw err;
    }
  }

  public getRunButton(): HTMLElement {
    if (this.__runButton) {
      return this.__runButton;
    }

    this.__runButton = document.createElement('ion-button');
    this.__runButton.classList.add('button');
    this.__runButton.innerText = 'Run';

    this.__runButton.addEventListener('click', () => {
      this.run();
    });

    return this.__runButton;
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
    this.__container.classList.add('js-sandbox-container');
    // SOURCE
    this.__sourceDiv = document.createElement('fieldset');
    const sourceLegend = document.createElement('legend');
    sourceLegend.innerText = 'Code';
    this.__sourceDiv.appendChild(sourceLegend);
    this.__sourceDiv.classList.add('js-sandbox-code');
    this.__sourceDiv.appendChild(this.getSourceTextArea());
    this.__container.appendChild(this.__sourceDiv);
    // BUTTON
    const buttonDiv = document.createElement('div');
    buttonDiv.appendChild(this.getRunButton());
    this.__container.appendChild(buttonDiv);
    // RESULT
    this.__resultDiv = document.createElement('fieldset');
    const resultLegend = document.createElement('legend');
    resultLegend.innerText = 'Result';
    this.__resultDiv.appendChild(resultLegend);
    this.__resultDiv.classList.add('js-sandbox-result');
    this.__resultDiv.appendChild(this.getResultTextArea());
    this.__container.appendChild(this.__resultDiv);
    return this.__container;
  }

  public override updateResize(): boolean {
    return true;
  }
}
