import { v4 as uuid } from 'uuid';
import './viz-eye-logger.css';
import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';

interface EventDescriptor {
  event: string;
  args: unknown[];
}

export class VizEventLogger extends ZirconViz {
  public static readonly EVENT_LOGGER_VISUALIZER_TYPE =
    'EVENT_LOGGER_VISUALIZER_TYPE';
  private _mainDiv: HTMLDivElement = null;
  private _loggerDiv: HTMLDivElement = null;
  private _detailDiv: HTMLDivElement = null;
  private _selectedParagraph: HTMLParagraphElement = null;
  private _events: EventDescriptor[] = [];

  /**
   * constructor
   */
  constructor(state?: ZirconVizState) {
    super(state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.getEventDispatcher().onAny(
      (event: string | string[], ...values: unknown[]) => {
        const eventDescriptor: EventDescriptor = {
          event: Array.isArray(event) ? event.join('/') : event,
          args: values,
        };
        this.addEvent(eventDescriptor);
      },
    );
  }

  public override getType(): string {
    return VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE;
  }

  public clearEvents(): void {
    this._events = [];
    this.getLoggerDiv().innerHTML = '';
  }

  public addEvent(eventDescriptor: EventDescriptor) {
    this._events.push(eventDescriptor);
    this.displayEvent(eventDescriptor);
  }

  public updateData(): boolean {
    return true;
  }

  public update(): void {}

  public start(): void {}

  public close(): void {}

  private displayEvent(eventDescriptor: EventDescriptor) {
    const p: HTMLParagraphElement = document.createElement('p');
    p.classList.add('event');
    p.innerText = `[${new Date().toLocaleString()}]: ${eventDescriptor.event}`;
    this.getLoggerDiv().appendChild(p);
    p.addEventListener('click', () => {
      this._selectedParagraph?.classList.remove('selected');
      this.displayEventDetail(eventDescriptor);
      p.classList.add('selected');
      this._selectedParagraph = p;
    });
  }

  private displayEventDetail(eventDescriptor: EventDescriptor) {
    this.getDetailDiv().innerHTML = '';
    // date
    let p: HTMLParagraphElement = document.createElement('p');
    p.innerText = `date: ${new Date().toLocaleString()}`;
    this.getDetailDiv().appendChild(p);
    // event name
    p = document.createElement('p');
    p.innerText = `event: ${eventDescriptor.event}`;
    this.getDetailDiv().appendChild(p);
    // event arguments
    const pre = document.createElement('pre');
    pre.innerText = `arg: ${JSON.stringify(eventDescriptor.args[0], null, 2)}`;
    this.getDetailDiv().appendChild(pre);
  }

  /**
   * Get Logger's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.id = uuid();
    this._mainDiv.classList.add('event-logger');
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
    this._loggerDiv.classList.add('event-container');
    return this._loggerDiv;
  }

  /**
   * @returns Log detail div element
   */
  public getDetailDiv(): HTMLDivElement {
    if (this._detailDiv) return this._detailDiv;
    this._detailDiv = document.createElement('div');
    this._detailDiv.classList.add('event-detail');
    return this._detailDiv;
  }
}
