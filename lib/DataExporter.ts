
import { ChartData, BarChartDataItem, ScatterPlotDataItem } from '../types';

// Abstract base class for file exporting (Abstraction & Inheritance)
export abstract class FileExporter {
  abstract getExtension(): string;
  abstract formatData(data: ChartData): string;

  // Overloaded save method (Overloading)
  // Signature 1: Save with default filename
  save(data: ChartData): void;
  // Signature 2: Save with custom filename
  save(data: ChartData, filename: string): void;

  // Implementation
  save(data: ChartData, filename?: string): void {
    const content = this.formatData(data);
    const ext = this.getExtension();
    const name = filename || `vibe_chart_${Date.now()}.${ext}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export class JsonExporter extends FileExporter {
  getExtension(): string {
    return 'json';
  }

  formatData(data: ChartData): string {
    return JSON.stringify(data, null, 2);
  }
}

export class CsvExporter extends FileExporter {
  getExtension(): string {
    return 'csv';
  }

  formatData(data: ChartData): string {
    const { points, xAxisLabel, yAxisLabel } = data;
    if (points.length === 0) return '';

    const rows: string[] = [];
    
    // Type guard helper
    const isBar = (p: any): p is BarChartDataItem => 'label' in p;
    
    // Header
    rows.push(`${xAxisLabel},${yAxisLabel}`);

    if (isBar(points[0])) {
      (points as BarChartDataItem[]).forEach(p => {
        rows.push(`"${p.label}",${p.value}`);
      });
    } else {
       (points as ScatterPlotDataItem[]).forEach(p => {
         rows.push(`${p.x},${p.y}`);
       });
    }
    return rows.join('\n');
  }
}
