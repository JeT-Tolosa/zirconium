import { EventEmitter2 } from 'eventemitter2';

/**
 * Base options (extendable per implementation)
 */
export interface GlobeViewerOptions {
  [key: string]: unknown;
}

/**
 * Default event map (can be extended by subclasses)
 */
export interface GlobeViewerEvents {
  optionsChanged: {
    options: Record<string, unknown>;
  };

  optionChanged: {
    optionName: string;
    optionValue: unknown;
  };
}

/**
 * Generic abstract viewer
 * - Cesium / Three / Globe.gl compatible design
 */
export abstract class GlobeViewer<
  O extends GlobeViewerOptions = GlobeViewerOptions,
  E extends GlobeViewerEvents = GlobeViewerEvents,
> {
  private readonly _emitter: EventEmitter2;
  private _options: Partial<O>;

  protected constructor() {
    this._emitter = new EventEmitter2({
      wildcard: false,
      maxListeners: 50,
    });

    this._options = {};
  }

  // =========================================================
  // ABSTRACT API
  // =========================================================

  public abstract displayIn(parent: HTMLDivElement): void;
  public abstract updateResize(): void;

  // =========================================================
  // OPTIONS API
  // =========================================================

  /**
   * Replace all options
   */
  public setOptions(options: O): void {
    this._options = { ...options };

    this.emitEvent('optionsChanged', {
      options: this._options,
    });
  }

  /**
   * Update single option safely
   */
  public setOption<K extends keyof O>(optionName: K, optionValue: O[K]): void {
    this._options[optionName] = optionValue;

    this.emitEvent('optionChanged', {
      optionName: String(optionName),
      optionValue,
    });
  }

  /**
   * Get option value
   */
  public getOption<K extends keyof O>(optionName: K): O[K] | undefined {
    return this._options[optionName];
  }

  /**
   * Get full options snapshot (immutable copy)
   */
  public getOptions(): Partial<O> {
    return { ...this._options };
  }

  // =========================================================
  // EVENTS API
  // =========================================================

  /**
   * Subscribe to events (typed safe wrapper)
   */
  public on<K extends keyof E>(
    eventName: K,
    handler: (payload: E[K]) => void,
  ): void {
    this._emitter.on(eventName as string, handler);
  }

  /**
   * Unsubscribe
   */
  public off<K extends keyof E>(
    eventName: K,
    handler: (payload: E[K]) => void,
  ): void {
    this._emitter.off(eventName as string, handler);
  }

  /**
   * Internal emit helper
   */
  protected emitEvent<K extends keyof E>(eventName: K, payload: E[K]): void {
    this._emitter.emit(eventName as string, payload);
  }

  // =========================================================
  // UTILITIES
  // =========================================================

  /**
   * Safe destroy hook (override if needed)
   */
  public destroy(): void {
    this._emitter.removeAllListeners();
    this._options = {};
  }
}
