import { ChartData, ChartType } from 'chart.js';
import {
  ZirconDataProvider,
  ZirconDataProviderState,
} from '../../zirconium/zircon-data/zircon-data-provider';
import { VIZ_JSCHART_REGISTRY } from './viz-jschart-types';

export function getChartDataType(chartType: ChartType): string {
  return `${chartType}-data`;
}

export class DataProviderChartJS<
  TType extends ChartType,
> extends ZirconDataProvider<ChartData<TType>> {
  private _chartType: TType = null;

  constructor(chartType: TType, state: ZirconDataProviderState) {
    super(
      VIZ_JSCHART_REGISTRY[chartType].dataType,
      state,
      (a: ChartData<TType>, b: ChartData<TType>) => {
        this._chartType = chartType;
        return this.compareChartDataType(a, b);
      },
    );
  }

  public getChartType(): TType {
    return this._chartType;
  }

  public getChartDataType(): string {
    return `${this._chartType}-data`;
    // return getChartDataType(this._chartType):
  }

  private compareChartDataType(
    a: ChartData<TType>,
    b: ChartData<TType>,
  ): number {
    return a === b ? 0 : 1;
  }
}
