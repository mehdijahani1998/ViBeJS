export enum ChartType {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  SCATTER = 'scatter',
}

// For Bar Charts
export interface BarChartDataItem {
  label: string;
  value: number;
}

export interface BarChartConfig {
  labels: string[];
  maxValue: number;
  totalSumLimit?: number;
  xAxisLabel: string;
  yAxisLabel: string;
}

// For Scatter Plots
export interface ScatterPlotDataItem {
    x: string | number;
    y: string | number;
}

export type AxisType = 'numerical' | 'categorical';

export interface NumericalAxis {
    type: 'numerical';
    label: string;
    maxValue: number;
}

export interface CategoricalAxis {
    type: 'categorical';
    label: string;
    values: string[];
}

export type AxisConfig = NumericalAxis | CategoricalAxis;

export interface ScatterPlotConfig {
    xAxis: AxisConfig;
    yAxis: AxisConfig;
}

// Union types
export type ChartConfig = BarChartConfig | ScatterPlotConfig;
export type ChartData = BarChartDataItem[] | ScatterPlotDataItem[];