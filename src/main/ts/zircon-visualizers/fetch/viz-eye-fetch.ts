import { ZirconViz } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { v4 as uuid } from 'uuid';

import './viz-eye-fetch.css';

/**
 */
export const enum DISPLAY_MESSAGE_LEVEL {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

const URLS_DICTIONARY: { [key: string]: string } = {
  'active satellites (celestrak)':
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json',
  'space stations (celestrak)':
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json',
  'weather (open-meteo)':
    'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true',
  'lasts 30 launches':
    'https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=json',
};

export interface VizFetchState {
  type: typeof VizFetch.FETCH_VISUALIZER_TYPE;
  id?: string;
  name?: string;
}

export class VizFetch extends ZirconViz {
  public static readonly FETCH_VISUALIZER_TYPE = 'FETCH_VISUALIZER_TYPE';
  private _div: HTMLDivElement = null;
  private _textArea: HTMLTextAreaElement = null;
  private _urlSelect: HTMLSelectElement = null;
  private _urlInput: HTMLInputElement = null;
  private _output: HTMLParagraphElement = null;
  private _fetchButton: HTMLButtonElement = null;
  private _data: string = null;

  /**
   * constructor
   */
  constructor() {
    super();
  }

  public updateData(): boolean {
    // this.fetchData(URL_CELESTRACK);
    return true;
  }

  public update(): void {}

  public start(): void {}

  public close(): void {}

  private displayMessage(level: DISPLAY_MESSAGE_LEVEL, message: string) {
    this.getOutputElement().classList.remove(
      'info',
      'warning',
      'error',
      'success',
    );
    this.getOutputElement().classList.add(level);
    this.getOutputElement().innerText = message;
  }

  private fetchData(): Promise<unknown> {
    const url: string = this.getInputElement().value;
    this.displayMessage(DISPLAY_MESSAGE_LEVEL.INFO, `Fetching ${url}...`);
    this.setTextAreaContent('');
    return fetch(url)
      .then((response) => response.text())
      .then((data: string) => {
        this._data = data;
        this.setTextAreaContent(this._data);
        this.displayMessage(
          DISPLAY_MESSAGE_LEVEL.SUCCESS,
          `Fetch completed: datat size = ${data.length}`,
        );
      })
      .catch((error) => {
        this.displayMessage(
          DISPLAY_MESSAGE_LEVEL.ERROR,
          `Fetch failed: ${error}`,
        );
      });
  }

  private setTextAreaContent(data: string) {
    this.getTextArea().value = data;
  }

  private getTextArea(): HTMLTextAreaElement {
    if (this._textArea) return this._textArea;
    this._textArea = document.createElement('textarea');
    this._textArea.classList.add('fetch-result');
    return this._textArea;
  }

  public getFetchButton(): HTMLButtonElement {
    if (this._fetchButton) return this._fetchButton;
    this._fetchButton = document.createElement('button');
    this._fetchButton.classList.add('fetch-button');
    this._fetchButton.innerText = 'Fetch';
    this._fetchButton.addEventListener('click', () => this.fetchData());
    //this._fetchButton.onclick = () => this.fetchData();
    return this._fetchButton;
  }

  public getInputElement(): HTMLInputElement {
    if (this._urlInput) return this._urlInput;
    this._urlInput = document.createElement('input');
    this._urlInput.setAttribute('type', 'text');
    this._urlInput.classList.add('fetch-imput');
    this._urlInput.value = Object.values(URLS_DICTIONARY)[0];
    return this._urlInput;
  }

  public getURLSelector(): HTMLSelectElement {
    if (this._urlSelect) return this._urlSelect;
    this._urlSelect = document.createElement('select');
    Object.entries(URLS_DICTIONARY).forEach(([key, url]) => {
      const option = document.createElement('option');
      option.value = url;
      option.text = key;
      this._urlSelect.appendChild(option);
    });
    this._urlSelect.addEventListener(
      'change',
      () =>
        (this.getInputElement().value =
          this._urlSelect.options[this._urlSelect.selectedIndex]?.value),
    );
    return this._urlSelect;
  }

  public getOutputElement(): HTMLParagraphElement {
    if (this._output) return this._output;
    this._output = document.createElement('p');
    this._output.classList.add('fetch-output');
    this._output.innerText = '';
    return this._output;
  }

  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._div) return this._div;
    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('fetch-container');
    this._div.appendChild(this.getFetchButton());
    this._div.appendChild(this.getInputElement());
    this._div.appendChild(this.getURLSelector());
    this._div.appendChild(this.getTextArea());
    this._div.appendChild(this.getOutputElement());
    return this._div;
  }
}
