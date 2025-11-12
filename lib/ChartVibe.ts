import * as d3 from 'd3';
import { ChartDataItem, ChartType } from '../types';

// Fix: Augment the D3 Selection interface to include our custom `attr_all` method.
declare module 'd3-selection' {
  interface Selection<GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum> {
    attr_all(obj: {[key: string]: any}): this;
  }
}

interface ChartVibeProps {
  labels: string[];
  maxValue: number;
  type: ChartType;
  totalSumLimit?: number;
  width: number;
  height: number;
  onSumUpdate: (sum: number) => void;
}

const margin = { top: 20, right: 30, bottom: 50, left: 60 };

export class ChartVibe {
  private props: ChartVibeProps;
  private data: ChartDataItem[];
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private highlightG: d3.Selection<SVGGElement, unknown, null, undefined>;
  
  private width: number;
  private height: number;

  private xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

  private activeDragLabel: string | null = null;

  constructor(props: ChartVibeProps) {
    this.props = props;
    this.width = props.width - margin.left - margin.right;
    this.height = props.height - margin.top - margin.bottom;
    this.data = this.props.labels.map(label => ({ label, value: 0 }));

    this.svg = d3.create('svg')
      .attr('width', props.width)
      .attr('height', props.height)
      .style('cursor', 'crosshair')
      .style('user-select', 'none');

    this.g = this.svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    this.highlightG = this.svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    
    this.setScales();
    this.createAxis();
    this.addMarks();
    this.attachEventListeners();
  }

  private setScales(): void {
    if (this.props.type === ChartType.VERTICAL) {
      this.xScale = d3.scaleBand<string>().domain(this.props.labels).range([0, this.width]).padding(0.2);
      this.yScale = d3.scaleLinear().domain([0, this.props.maxValue]).range([this.height, 0]);
    } else {
      this.xScale = d3.scaleLinear().domain([0, this.props.maxValue]).range([0, this.width]);
      this.yScale = d3.scaleBand<string>().domain(this.props.labels).range([0, this.height]).padding(0.2);
    }
  }

  private createAxis(): void {
    if (this.props.type === ChartType.VERTICAL) {
      this.g.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${this.height})`).call(d3.axisBottom(this.xScale as d3.AxisScale<string>));
      this.g.append("g").attr("class", "axis y-axis").call(d3.axisLeft(this.yScale as d3.AxisScale<number>));
    } else {
      this.g.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${this.height})`).call(d3.axisBottom(this.xScale as d3.AxisScale<number>));
      this.g.append("g").attr("class", "axis y-axis").call(d3.axisLeft(this.yScale as d3.AxisScale<string>));
    }
    this.svg.selectAll(".axis path, .axis line").attr("stroke", "#4A5568");
    this.svg.selectAll(".axis text").attr("fill", "#A0AEC0");
  }

  private addMarks(): void {
    const bars = this.g.selectAll<SVGGElement, ChartDataItem>(".bar-group")
      .data(this.data, d => d.label)
      .join("g")
      .attr("class", "bar-group");

    bars.selectAll("rect").remove();
    bars.selectAll("text").remove();

    if (this.props.type === ChartType.VERTICAL) {
        const scaleX = this.xScale as d3.ScaleBand<string>;
        const scaleY = this.yScale as d3.ScaleLinear<number, number>;
        bars.append("rect")
            .attr("x", d => scaleX(d.label)!)
            .attr("y", d => d.value > 0 ? scaleY(d.value) : scaleY(0))
            .attr("width", scaleX.bandwidth())
            .attr("height", d => Math.abs(scaleY(d.value) - scaleY(0)))
            .attr("class", "fill-teal-400 transition-all duration-150");

        bars.append("text")
            .attr("x", d => scaleX(d.label)! + scaleX.bandwidth() / 2)
            .attr("y", d => scaleY(d.value) - 5)
            .attr("text-anchor", "middle")
            .attr("class", "fill-white font-semibold text-xs pointer-events-none")
            .text(d => d.value > 0 ? d.value.toLocaleString() : '');
    } else {
        const scaleX = this.xScale as d3.ScaleLinear<number, number>;
        const scaleY = this.yScale as d3.ScaleBand<string>;
        bars.append("rect")
            .attr("x", 0)
            .attr("y", d => scaleY(d.label)!)
            .attr("width", d => d.value > 0 ? scaleX(d.value) : 0)
            .attr("height", scaleY.bandwidth())
            .attr("class", "fill-teal-400 transition-all duration-150");

        bars.append("text")
            .attr("x", d => scaleX(d.value) + 5)
            .attr("y", d => scaleY(d.label)! + scaleY.bandwidth() / 2)
            .attr("dominant-baseline", "middle")
            .attr("class", "fill-white font-semibold text-xs pointer-events-none")
            .text(d => d.value > 0 ? d.value.toLocaleString() : '');
    }
  }

  private addHighlight(barData: ChartDataItem | null) {
    this.highlightG.selectAll("rect").remove();
    if (!barData) return;

    const { label, value } = barData;
    let barProps: any;

    if (this.props.type === ChartType.VERTICAL) {
        const scaleX = this.xScale as d3.ScaleBand<string>;
        const scaleY = this.yScale as d3.ScaleLinear<number, number>;
        barProps = {
            x: scaleX(label)!,
            y: value > 0 ? scaleY(value) : scaleY(0),
            width: scaleX.bandwidth(),
            height: Math.abs(scaleY(value) - scaleY(0)),
        };
    } else {
        const scaleX = this.xScale as d3.ScaleLinear<number, number>;
        const scaleY = this.yScale as d3.ScaleBand<string>;
        barProps = {
            x: 0,
            y: scaleY(label)!,
            width: value > 0 ? scaleX(value) : 0,
            height: scaleY.bandwidth(),
        };
    }
    this.highlightG.append("rect").attr("class", "fill-gray-500/50 pointer-events-none").attr_all(barProps);
  }

  private getBarDataFromPointer(event: MouseEvent): { label: string; value: number } | null {
    const [mouseX, mouseY] = d3.pointer(event, this.g.node());
    const { labels, maxValue, type, totalSumLimit } = this.props;

    let index = -1;
    let rawValue = 0;
    let label = '';

    if (type === ChartType.VERTICAL) {
        for (let i = 0; i < labels.length; i++) {
            const currentLabel = labels[i];
            const bandStart = (this.xScale as d3.ScaleBand<string>)(currentLabel);
            const bandwidth = (this.xScale as d3.ScaleBand<string>).bandwidth();
            if (bandStart !== undefined && mouseX >= bandStart && mouseX <= bandStart + bandwidth) {
                index = i; break;
            }
        }
        if (index === -1) return null;
        label = labels[index];
        rawValue = (this.yScale as d3.ScaleLinear<number, number>).invert(mouseY);
    } else { // HORIZONTAL
        for (let i = 0; i < labels.length; i++) {
            const currentLabel = labels[i];
            const bandStart = (this.yScale as d3.ScaleBand<string>)(currentLabel);
            const bandwidth = (this.yScale as d3.ScaleBand<string>).bandwidth();
            if (bandStart !== undefined && mouseY >= bandStart && mouseY <= bandStart + bandwidth) {
                index = i; break;
            }
        }
        if (index === -1) return null;
        label = labels[index];
        rawValue = (this.xScale as d3.ScaleLinear<number, number>).invert(mouseX);
    }
    
    let value = Math.max(0, Math.min(maxValue, rawValue));

    if (typeof totalSumLimit === 'number') {
        const otherBarsSum = this.data.reduce((sum, bar) => (bar.label !== label ? sum + bar.value : sum), 0);
        const maxAllowedValue = totalSumLimit - otherBarsSum;
        value = Math.min(value, maxAllowedValue);
    }

    return { label, value: Math.round(Math.max(0, value)) };
  }

  private attachEventListeners(): void {
    this.svg.on('mousedown', (event: MouseEvent) => {
        this.addHighlight(null);
        const barData = this.getBarDataFromPointer(event);
        if (barData) {
            this.activeDragLabel = barData.label;
            this.updateData(barData.label, barData.value);
            this.updateCursor();
        }
    });

    this.svg.on('mousemove', (event: MouseEvent) => {
        if (this.activeDragLabel) {
            const barData = this.getBarDataFromPointer(event);
            if (barData && barData.label === this.activeDragLabel) {
                this.updateData(barData.label, barData.value);
            }
        } else {
            this.addHighlight(this.getBarDataFromPointer(event));
        }
    });

    this.svg.on('mouseup', () => {
        this.activeDragLabel = null;
        this.updateCursor();
    });

    this.svg.on('mouseleave', () => {
        this.activeDragLabel = null;
        this.addHighlight(null);
        this.updateCursor();
    });
  }
  
  private updateData(label: string, value: number) {
      this.data = this.data.map(d => d.label === label ? { ...d, value } : d);
      this.addMarks();
      const currentSum = this.data.reduce((sum, item) => sum + item.value, 0);
      this.props.onSumUpdate(currentSum);
  }

  private updateCursor() {
    const cursor = this.activeDragLabel ? (this.props.type === ChartType.VERTICAL ? 'ns-resize' : 'ew-resize') : 'crosshair';
    this.svg.style('cursor', cursor);
  }

  public getSvgNode(): SVGSVGElement {
    return this.svg.node()!;
  }

  public getData(): ChartDataItem[] {
    return this.data;
  }

  public destroy(): void {
    this.svg.remove();
  }
}

// Helper to set multiple attributes at once, useful for d3 selections
d3.selection.prototype.attr_all = function(obj) {
  for (const key in obj) {
    this.attr(key, obj[key]);
  }
  return this;
};