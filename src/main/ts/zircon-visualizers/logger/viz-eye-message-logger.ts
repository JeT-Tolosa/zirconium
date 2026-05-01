import { v4 as uuid } from 'uuid';
import './viz-eye-logger.css';
import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';

/**
 * Messages levels
 */
export const enum DISPLAY_MESSAGE_LEVEL {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

interface MessageDescriptor {
  level: string;
  message: string;
  date: string;
}

export class VizMessageLogger extends ZirconViz {
  public static readonly MESSAGE_LOGGER_VISUALIZER_TYPE =
    'MESSAGE_LOGGER_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _loggerDiv: HTMLDivElement = null;
  private _detailDiv: HTMLDivElement = null;
  private _messages: MessageDescriptor[] = [];

  /**
   * constructor
   */
  constructor(state?: ZirconVizState) {
    super(state);
    this.getEventDispatcher().onAny(
      (event: string | string[], ..._values: unknown[]) => {
        if (event === 'MESSAGE') {
          const messageDescriptor: MessageDescriptor = {
            level: DISPLAY_MESSAGE_LEVEL.ERROR,
            message: 'Messages are not yet implemented',
            date: 'unknown',
          };
          this.addMessage(messageDescriptor);
          this.displayMessage(messageDescriptor);
        }
      },
    );
  }

  public addMessage(messageDescriptor: MessageDescriptor): void {
    this._messages.push(messageDescriptor);
  }

  public updateData(): boolean {
    return true;
  }

  public update(): void {}

  public start(): void {}

  public close(): void {}

  private displayMessage(messageDescriptor: MessageDescriptor) {
    const p: HTMLParagraphElement = document.createElement('p');
    p.classList.add('message');
    p.classList.add(messageDescriptor.level);
    p.innerText = `date: ${new Date().toLocaleString()} [${messageDescriptor.level}]: ${messageDescriptor.message}`;
    this.getLoggerDiv().appendChild(p);
    p.addEventListener('mouseover', () => {
      this.displayMessageDetail(messageDescriptor);
    });
  }

  private displayMessageDetail(messageDescriptor: MessageDescriptor) {
    this.getDetailDiv().innerHTML = '';
    // date
    let p: HTMLParagraphElement = document.createElement('p');
    p.innerText = `date: ${new Date().toLocaleString()}`;
    this.getDetailDiv().appendChild(p);
    // event name
    p = document.createElement('p');
    p.innerText = `event: ${messageDescriptor.level}`;
    this.getDetailDiv().appendChild(p);
    // event arguments
    p = document.createElement('p');
    p.innerText = `arg: ${messageDescriptor.message}`;
    this.getDetailDiv().appendChild(p);
  }

  /**
   * Get Logger's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.id = uuid();
    this._mainDiv.classList.add('logger-container');
    this._mainDiv.appendChild(this.getLoggerDiv());
    this._mainDiv.appendChild(this.getDetailDiv());
    return this._mainDiv;
  }

  /**
   * @returns Logs div element
   */
  public getLoggerDiv(): HTMLDivElement {
    if (this._loggerDiv) return this._loggerDiv;
    this._loggerDiv = document.createElement('div');
    this._loggerDiv.classList.add('logger');
    return this._loggerDiv;
  }

  /**
   * @returns Log detail div element
   */
  public getDetailDiv(): HTMLDivElement {
    if (this._detailDiv) return this._detailDiv;
    this._detailDiv = document.createElement('div');
    this._detailDiv.classList.add('log-detail');
    return this._detailDiv;
  }
}
