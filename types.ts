export enum ChartType {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

export interface ChartDataItem {
  label: string;
  value: number;
}

export interface ChartConfig {
  labels: string[];
  maxValue: number;
  totalSumLimit?: number;
}