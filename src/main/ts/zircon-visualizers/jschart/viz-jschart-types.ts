import {
  ChartType,
  DefaultDataPoint,
  ScatterDataPoint,
  BubbleDataPoint,
} from 'chart.js';

export interface VizJSChartDataRegistryEntry<T extends ChartType> {
  dataType: string;
  validate(data: unknown): data is DefaultDataPoint<T>;
}

const isNumberArray = (data: unknown): data is number[] =>
  Array.isArray(data) && data.every((v) => typeof v === 'number');

const isScatterArray = (data: unknown): data is ScatterDataPoint[] =>
  Array.isArray(data) &&
  data.every(
    (p) =>
      typeof p === 'object' &&
      p !== null &&
      typeof p.x === 'number' &&
      typeof p.y === 'number',
  );

const isBubbleArray = (data: unknown): data is BubbleDataPoint[] =>
  Array.isArray(data) &&
  data.every(
    (p) =>
      typeof p === 'object' &&
      p !== null &&
      typeof p.x === 'number' &&
      typeof p.y === 'number' &&
      typeof p.r === 'number',
  );

export type VizJSChartDataTypeName<T extends ChartType> = T extends 'bar'
  ? 'jschart-bar-data'
  : T extends 'line'
    ? 'jschart-line-data'
    : T extends 'radar'
      ? 'jschart-radar-data'
      : T extends 'pie'
        ? 'jschart-pie-data'
        : T extends 'doughnut'
          ? 'jschart-doughnut-data'
          : T extends 'polarArea'
            ? 'jschart-polar-area-data'
            : T extends 'scatter'
              ? 'jschart-scatter-data'
              : T extends 'bubble'
                ? 'jschart-bubble-data'
                : never;

export type VizJSChartDataRegistry = {
  [T in ChartType]: VizJSChartDataRegistryEntry<T>;
};

export const VIZ_JSCHART_REGISTRY = {
  bar: {
    dataType: 'jschart-bar-data',
    validate: isNumberArray,
  },

  line: {
    dataType: 'jschart-line-data',
    validate: isNumberArray,
  },

  radar: {
    dataType: 'jschart-radar-data',
    validate: isNumberArray,
  },

  pie: {
    dataType: 'jschart-pie-data',
    validate: isNumberArray,
  },

  doughnut: {
    dataType: 'jschart-doughnut-data',
    validate: isNumberArray,
  },

  polarArea: {
    dataType: 'jschart-polar-area-data',
    validate: isNumberArray,
  },

  scatter: {
    dataType: 'jschart-scatter-data',
    validate: isScatterArray,
  },

  bubble: {
    dataType: 'jschart-bubble-data',
    validate: isBubbleArray,
  },
} satisfies VizJSChartDataRegistry;
