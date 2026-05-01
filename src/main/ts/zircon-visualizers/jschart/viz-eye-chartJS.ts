import { Chart, ChartData, ChartTypeRegistry, ChartOptions } from 'chart.js';
import {
  ZirconViz,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { v4 as uuid } from 'uuid';
import { DataSeries } from '../../libraries/data-series/data-series';

export interface VizJSChartState<
  TType extends keyof ChartTypeRegistry,
> extends ZirconVizState {
  series?: DataSeries<ChartData<TType>>;
  options?: ChartOptions<TType>;
  chartType?: string;
}

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
  TType extends keyof ChartTypeRegistry,
> extends ZirconViz {
  private _chart: Chart<TType> = null;
  private _series: DataSeries<ChartData<TType>> = null;

  // necessary cast
  private _chartOptions: ChartOptions<TType> =
    DEFAULT_OPTIONS as ChartOptions<TType>;
  private _mainDiv: HTMLDivElement = null;
  private _canvas: HTMLCanvasElement = null;

  /**
   * constructor
   */
  constructor(state?: VizJSChartState<TType>) {
    super(state);
  }

  public abstract getChartType(): TType;

  protected override async setState(
    state: VizJSChartState<TType>,
  ): Promise<void> {
    await super.setState(state);
    if (!state) return;
    if (state.chartType && state.chartType !== this.getChartType())
      throw new Error(
        `Invalid chart type ${state.chartType} for this visualizer`,
      );
    if (state.series) this.setSeries(state.series);
    if (state.options) this.setChartOptions(state.options);
  }

  public override generateCurrentState(): VizJSChartState<TType> {
    return {
      ...super.generateCurrentState(),
      chartType: this.getChartType(),
      series: this.getSeries(),
      options: this.getChartOptions(),
      type: this.getType(),
    };
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
    this._chart = new Chart(canvas, {
      type: this.getChartType(),
      data: this.getSeries().getData(),
      options: this.getChartOptions(),
    });
  }

  /**
   * get input data
   */
  public getSeries(): DataSeries<ChartData<TType>> {
    return this._series;
  }

  private onSeriesChange = () => this.updateData();

  /**
   * set input data
   * @param series
   */
  public setSeries(series: DataSeries<ChartData<TType>>): void {
    if (this._series === series) return;
    if (this._series)
      this._series.removeListener('SERIES_DATA_CHANGED', this.onSeriesChange);

    this._series = series;
    if (this._series)
      this._series.addListener('SERIES_DATA_CHANGED', this.onSeriesChange);

    //this.emit('VIZ_INPUT_SERIES_CHANGED', { id: this.series.getId() });
  }

  protected getChart(): Chart<TType> {
    return this._chart;
  }

  public getChartOptions(): ChartOptions<TType> {
    return this._chartOptions;
  }

  public setChartOptions(value: ChartOptions<TType>): boolean {
    if (!value) return false;
    this._chartOptions = value;
    if (this._chart) {
      this._chart.options = value;
      this._chart?.update();
    }
    return true;
  }

  public updateData(): boolean {
    if (!this._chart || !this._chart.data) return false;
    this._chart.data = this.getSeries().getData();
    this.update();
    return true;
  }

  public update(): void {
    this._chart?.update();
  }

  public start(): void {}

  public close(): void {
    this._chart?.destroy();
  }

  /**
   * Create chart and dock it into given parent
   * @param parent  Parent element to dock chart into
   * @returns   true if chart was created and docked, false otherwise
   */
  public override onDisplay(): boolean {
    this.createChart(this.getCanvas());
    return true;
  }

  private getCanvas(): HTMLCanvasElement {
    if (this._canvas) return this._canvas;
    this._canvas = document.createElement('canvas');
    this._canvas.style.width = '100%';
    this._canvas.style.height = '100%';
    this._canvas.id = uuid();
    return this._canvas;
  }

  /**
   * Get Logger's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._mainDiv) return this._mainDiv;
    this._mainDiv = document.createElement('div');
    this._mainDiv.id = uuid();
    this._mainDiv.classList.add('event-logger');
    this._mainDiv.appendChild(this.getCanvas());
    return this._mainDiv;
  }
}
