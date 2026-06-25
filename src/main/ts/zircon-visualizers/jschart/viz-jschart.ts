import { Chart, ChartData, ChartOptions, ChartType } from 'chart.js';
import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { v4 as uuid } from 'uuid';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import {
  ZirconDataProvider,
  ZirconDataProviderDescriptor,
  ZirconDataProviderEvents,
} from '../../zirconium/zircon-data/zircon-data-provider';
import { VIZ_JSCHART_REGISTRY } from './viz-jschart-types';

export interface VizJSChartState<
  TType extends ChartType,
> extends ZirconVizState {
  dataProviderId: string;
  chartOptions?: ChartOptions<TType>;
  chartType: TType;
}

/**
 * Event registry
 */
export type VizJSChartRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderEvents,
          'DATA_PROVIDER_CHANGED' | 'DATA_PROVIDER_FULL_CONTENT'
        >,
        // PickEvents<
        //   ZirconDataProviderManagerEvents,
        //   | ''
        // >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderEvents,
          | 'DATA_PROVIDER_FULL_CONTENT_REQUEST'
          | 'DATA_PROVIDER_DIFF_CONTENT_REQUEST'
        >,
      ]
    >;
  },
  ZirconVizEventRegistry
>;

const DEFAULT_OPTIONS: ChartOptions = {
  plugins: {
    filler: {
      propagate: false,
    },
    title: {
      display: true,
    },
  },
  interaction: {
    intersect: false,
  },
};
/**
 * Visualizer based on JSChart library
 * https://www.chartjs.org/docs/latest/samples/information.html
 */
export abstract class VizJSChart<
  TType extends ChartType,
  R extends VizJSChartRegistry = VizJSChartRegistry,
> extends ZirconViz<R> {
  private _chartType: TType = null;
  private _dataProviderId: string = null;

  // necessary cast
  private _chartOptions: ChartOptions<TType> =
    DEFAULT_OPTIONS as ChartOptions<TType>;

  private __chart: Chart<TType> = null;
  private __dataProvider: ZirconDataProvider<ChartData<TType>> = null;
  private __data: ChartData<TType> = null;
  private __dataVersion: number = null; // data content version stored in _data for _dataProviderId
  private __mainDiv: HTMLDivElement = null;
  private __canvas: HTMLCanvasElement = null;

  /**
   * constructor
   */
  constructor(state?: VizJSChartState<TType>) {
    super(state);
  }

  protected override listenToEvents(): void {
    this.addListener('DATA_PROVIDER_CHANGED', (arg) => {
      // data have changed => request new content
      if (arg.dataProviderDescriptor.id === this._dataProviderId) {
        this.emit('DATA_PROVIDER_FULL_CONTENT_REQUEST', {
          dataProviderId: this._dataProviderId,
        });
      }
    });
    this.addListener('DATA_PROVIDER_FULL_CONTENT', (arg) => {
      this.onDATA_PROVIDER_FULL_CONTENT(
        arg.dataProviderDescriptor,
        arg.version,
        arg.data,
      );
    });
  }

  private onDATA_PROVIDER_FULL_CONTENT(
    dataProviderDescriptor: ZirconDataProviderDescriptor,
    dataVersion: number,
    data: unknown,
  ) {
    if (dataProviderDescriptor.id !== this._dataProviderId) {
      return;
    }
    if (this.__dataVersion === dataVersion) {
      return;
    }
    // TODO: 'bar-jschart': create a constant value for bar jschart input data type
    if (dataProviderDescriptor.outputDataType !== this.getDataType()) {
      throw new Error(
        `expected data type for ${this.constructor.name} should be ${'bar-jschart'} not ${dataProviderDescriptor.outputDataType} from data provider Id ${this._dataProviderId}`,
      );
    }
    this.setData(data as ChartData<TType>);
  }

  public override getType(): string {
    return `jschart-visualizer-${this.getChartType()}-type`;
  }

  public getChartType(): TType {
    return this._chartType;
  }

  public getDataType(): string {
    return VIZ_JSCHART_REGISTRY[this.getChartType()].dataType;
  }

  protected override async setState(
    state: VizJSChartState<TType>,
  ): Promise<void> {
    await super.setState(state);
    if (!state) {
      return;
    }
    this.setChartType(state.chartType);
    this.setDataProviderId(state.dataProviderId);
    await this.setChartOptions(state.chartOptions);
    // if (state.series) {
    //   this.setSeries(state.series);
    // }
  }

  private setChartType(chartType: TType): void {
    if (this._chartType && chartType !== this._chartType) {
      throw new Error(
        `Unable to change dynamically chart type from ${this._chartType} to ${chartType}`,
      );
    }
    this._chartType = chartType;
  }

  private setDataProviderId(id: string): void {
    if (typeof id === typeof undefined) {
      return;
    }
    this.__dataProvider = null;
    this.__dataVersion = null;
    this._dataProviderId = id;
    this.requestDataProviderContent();
  }

  private getDataProviderId(): string {
    return this._dataProviderId;
  }

  public override generateCurrentState(): VizJSChartState<TType> {
    return {
      ...super.generateCurrentState(),
      type: this.getType(),
      chartType: this.getChartType(),
      dataProviderId: this.getDataProviderId(),
      chartOptions: this.getChartOptions(),
    };
  }

  private setData(data: ChartData<TType>): void {
    this.__data = data;
    this.refreshChart();
  }
  /**
   * Create and insert chart into given canvas
   * @param canvas Canvas to insert chart into
   * type: string (chart type),
   * data: this.eries.getData()
   * options: this.getOptions()
   */
  private createChart(canvas: HTMLCanvasElement): void {
    if (!canvas) {
      throw new Error(`Cannot create a chart without a valid canvas`);
    }
    this.__chart = new Chart(canvas, {
      type: this.getChartType(),
      data: this.__data,
      options: this.getChartOptions(),
    });
    this.requestDataProviderContent();
  }

  private requestDataProviderContent(): void {
    if (this._dataProviderId) {
      this.emit('DATA_PROVIDER_FULL_CONTENT_REQUEST', {
        dataProviderId: this.getDataProviderId(),
      });
    }
  }
  /**
   * get input data
   */
  public getDataProvider(): ZirconDataProvider<ChartData<TType>> {
    return this.__dataProvider;
  }

  private refreshChart = async () => this.updateData();

  /**
   * set input data
   * @param dataProvider
   */
  public setDataProvider(
    dataProvider: ZirconDataProvider<ChartData<TType>>,
  ): void {
    if (this.__dataProvider === dataProvider) {
      return;
    }
    if (this.__dataProvider) {
      this.__dataProvider.removeListener(
        'SERIES_DATA_CHANGED',
        this.refreshChart,
      );
    }
    this.__dataProvider = dataProvider;
    if (this.__dataProvider) {
      this.__dataProvider.addListener('SERIES_DATA_CHANGED', this.refreshChart);
    }
    //this.emit('VIZ_INPUT_SERIES_CHANGED', { id: this.series.getId() });
  }

  protected getChart(): Chart<TType> {
    return this.__chart;
  }

  public getChartOptions(): ChartOptions<TType> {
    return this._chartOptions;
  }

  public async setChartOptions(options: ChartOptions<TType>): Promise<boolean> {
    if (!options) {
      return false;
    }
    this._chartOptions = options;
    if (this.__chart) {
      this.__chart.options = options;
      this.__chart?.update();
    }
    return true;
  }

  public updateData(): boolean {
    if (!this.__chart || !this.__chart.data) {
      return false;
    }
    this.__chart.data = this.__data;
    this.update();
    return true;
  }

  public update(): void {
    this.__chart?.update();
  }

  public start(): void {}

  public close(): void {
    this.__chart?.destroy();
  }

  /**
   * Create chart and dock it into given parent
   * @param parent  Parent element to dock chart into
   * @returns   true if chart was created and docked, false otherwise
   */
  public override async onDisplay(): Promise<void> {
    await this.createChart(this.getCanvas());
  }

  private getCanvas(): HTMLCanvasElement {
    if (this.__canvas) {
      return this.__canvas;
    }
    this.__canvas = document.createElement('canvas');
    this.__canvas.style.width = '100%';
    this.__canvas.style.height = '100%';
    this.__canvas.id = uuid();
    return this.__canvas;
  }

  /**
   * Get Logger's div element
   */
  public getContainer(): HTMLDivElement {
    if (this.__mainDiv) {
      return this.__mainDiv;
    }
    this.__mainDiv = document.createElement('div');
    this.__mainDiv.id = uuid();
    this.__mainDiv.classList.add('event-logger');
    this.__mainDiv.appendChild(this.getCanvas());
    return this.__mainDiv;
  }
}
