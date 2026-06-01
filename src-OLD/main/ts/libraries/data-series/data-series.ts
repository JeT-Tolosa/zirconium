import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';

export interface DataType {}

/**
 * Series event types
 */
export type DataSeriesEvents = {
  SERIES_NAME_CHANGED: {};
  SERIES_DATA_CHANGED: {};
  SERIES_DATA_ADDED: {};
};

export class DataSeries<DataType> {
  private _id: string = uuid();
  private _name: string = 'series';
  private _nonFiredSeriesDataChanged: boolean = false; // if true, some changes don't have triggered events
  private _dataChangeEventDelai: number = 100; // minimum delay between two SERIES_DATA_CHANGED event in ms (>!0);
  private _incomingSeriesDataChangedCallback: () => void = null;
  private _eventEmitter: EventEmitter = new EventEmitter();
  private _data: DataType = null;


  /**
   * Constructor
   * @param id
   * @param name
   */
  public constructor(id?: string, name?: string) {
    this._id = id ? id : uuid();
    this._name ||= name;
  }

  public getId(): string {
    return this._id;
  }

  public getName(): string {
    return this._name;
  }

  public setName(name: string): boolean {
    if (this._name === name) return false;
    this._name = name;
    this._eventEmitter.emit('SERIES_NAME_CHANGED');
    return true;
  }

  /**
   * retrieve data
   */
  public getData(): DataType {
    return this._data;
  }

  /**
   * modify data
   */
  public setData(data: DataType): void {
    this._data = data;
    this.emitDataChanged();
  }


  /**
   * Json format export
   */
  public toJson(): string {
    return JSON.stringify(this.getData());
  }

  /**
   * send an event of type 'data changed'
   */
  public emitDataChanged(): void {
    // // incomingCallback != NULL => delai between now and previous event is too short: Do not emit event
    // if (this._incomingSeriesDataChangedCallback !== null) {
    //   this._nonFiredSeriesDataChanged = true;
    // } else {
    //   // emit event and set timeout
    //   this._nonFiredSeriesDataChanged = false;
    //   setTimeout(() => {
    //     // when timeout is reached, check if event have been missed. If true, resend a changed event
    //     this._incomingSeriesDataChangedCallback = null;
    //     if (!this._nonFiredSeriesDataChanged) {
    //       this.emitDataChanged();
    //     }
    //   }, this._dataChangeEventDelai);
    this._eventEmitter.emit('SERIES_DATA_CHANGED');
    // }
  }

  /**
   * add Series listener
   * @param eventName event to listen to
   * @param cb callback
   * @returns
   */
  public addListener<K extends keyof DataSeriesEvents>(
    eventName: K,
    cb: (arg: DataSeriesEvents[K]) => void,
  ): EventEmitter {
    return this._eventEmitter.addListener(eventName, cb);
  }
  /**
   * remove Series listener
   * @param eventName event to listen to
   * @param cb callback
   * @returns
   */
  public removeListener<K extends keyof DataSeriesEvents>(
    eventName: K,
    cb: (arg: DataSeriesEvents[K]) => void,
  ): EventEmitter {
    return this._eventEmitter.removeListener(eventName, cb);
  }
}
