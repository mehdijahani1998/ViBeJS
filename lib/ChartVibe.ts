
import * as d3 from 'd3';
import { BarChartDataItem, ChartType, ScatterPlotDataItem, ScatterPlotConfig } from '../types';

// FIX: Removed d3 module augmentation to prevent "module 'd3' cannot be found" error.
// The custom attr_all function has been replaced with standard d3 methods.

interface BarChartVibeProps {
  labels: string[];
  maxValue: number;
  type: ChartType.VERTICAL | ChartType.HORIZONTAL;
  totalSumLimit?: number;
  width: number;
  height: number;
  xAxisLabel: string;
  yAxisLabel: string;
  onSumUpdate: (sum: number) => void;
}

interface ScatterPlotVibeProps {
    config: ScatterPlotConfig;
    width: number;
    height: number;
}

const margin = { top: 20, right: 30, bottom: 60, left: 70 };

export class BarChartVibe {
  private props: BarChartVibeProps;
  private data: BarChartDataItem[];
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private highlightG: d3.Selection<SVGGElement, unknown, null, undefined>;
  
  private width: number;
  private height: number;

  private xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>;
  private yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

  private activeDragLabel: string | null = null;

  constructor(props: BarChartVibeProps) {
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
      this.g.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${this.height})`).call(d3.axisBottom(this.xScale as d3.AxisScale<string>).tickSize(0).tickPadding(10));
      this.g.append("g").attr("class", "axis y-axis").call(d3.axisLeft(this.yScale as d3.AxisScale<number>).tickSize(0).tickPadding(10));
    } else {
      this.g.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${this.height})`).call(d3.axisBottom(this.xScale as d3.AxisScale<number>).tickSize(0).tickPadding(10));
      this.g.append("g").attr("class", "axis y-axis").call(d3.axisLeft(this.yScale as d3.AxisScale<string>).tickSize(0).tickPadding(10));
    }
    this.svg.selectAll(".axis path").attr("stroke", "none");
    this.svg.selectAll(".axis text").attr("fill", "#fdfdfd").attr("fill-opacity", 0.7);

    this.g.insert('g', ':first-child').attr('class', 'grid-lines').call(this.createGridLines.bind(this));
    this.svg.selectAll(".grid-lines path, .grid-lines line").attr("stroke", "#fdfdfd").attr("stroke-opacity", 0.1);

    if (this.props.xAxisLabel) {
        this.g.append("text").attr("text-anchor", "middle").attr("x", this.width / 2).attr("y", this.height + margin.bottom - 20).attr("fill", "#fdfdfd").attr("fill-opacity", 0.8).style("font-size", "14px").text(this.props.xAxisLabel);
    }
    
    if (this.props.yAxisLabel) {
        this.g.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -margin.left + 20).attr("x", -this.height / 2).attr("fill", "#fdfdfd").attr("fill-opacity", 0.8).style("font-size", "14px").text(this.props.yAxisLabel);
    }
  }

  private createGridLines(): d3.Axis<d3.NumberValue> {
    const scale = this.props.type === ChartType.VERTICAL ? this.yScale : this.xScale;
    const size = this.props.type === ChartType.VERTICAL ? -this.width : -this.height;
    const axisGenerator = this.props.type === ChartType.VERTICAL ? d3.axisLeft : d3.axisBottom;

    return axisGenerator(scale as d3.ScaleLinear<number, number>).tickSize(size).tickFormat(() => '');
  }

  private addMarks(): void {
    const bars = this.g.selectAll<SVGGElement, BarChartDataItem>(".bar-group").data(this.data, d => d.label).join("g").attr("class", "bar-group");
    bars.selectAll("rect").remove();
    bars.selectAll("text").remove();

    if (this.props.type === ChartType.VERTICAL) {
        const scaleX = this.xScale as d3.ScaleBand<string>; const scaleY = this.yScale as d3.ScaleLinear<number, number>;
        bars.append("rect").attr("x", d => scaleX(d.label)!).attr("y", d => d.value > 0 ? scaleY(d.value) : scaleY(0)).attr("width", scaleX.bandwidth()).attr("height", d => Math.abs(scaleY(d.value) - scaleY(0))).attr("class", "fill-[#f9dc5c]/70 transition-all duration-150");
        bars.append("text").attr("x", d => scaleX(d.label)! + scaleX.bandwidth() / 2).attr("y", d => scaleY(d.value) - 5).attr("text-anchor", "middle").attr("class", "fill-[#fdfdfd] font-semibold text-xs pointer-events-none").text(d => d.value > 0 ? d.value.toLocaleString() : '');
    } else {
        const scaleX = this.xScale as d3.ScaleLinear<number, number>; const scaleY = this.yScale as d3.ScaleBand<string>;
        bars.append("rect").attr("x", 0).attr("y", d => scaleY(d.label)!).attr("width", d => d.value > 0 ? scaleX(d.value) : 0).attr("height", scaleY.bandwidth()).attr("class", "fill-[#f9dc5c]/70 transition-all duration-150");
        bars.append("text").attr("x", d => scaleX(d.value) + 5).attr("y", d => scaleY(d.label)! + scaleY.bandwidth() / 2).attr("dominant-baseline", "middle").attr("class", "fill-[#fdfdfd] font-semibold text-xs pointer-events-none").text(d => d.value > 0 ? d.value.toLocaleString() : '');
    }
  }

  private addHighlight(barData: BarChartDataItem | null) {
    this.highlightG.selectAll("rect").remove();
    if (!barData) return;
    const { label, value } = barData;
    const rect = this.highlightG.append("rect").attr("class", "fill-[#fdfdfd]/10 pointer-events-none");

    if (this.props.type === ChartType.VERTICAL) {
        const scaleX = this.xScale as d3.ScaleBand<string>;
        const scaleY = this.yScale as d3.ScaleLinear<number, number>;
        rect
            .attr("x", scaleX(label)!)
            .attr("y", value > 0 ? scaleY(value) : scaleY(0))
            .attr("width", scaleX.bandwidth())
            .attr("height", Math.abs(scaleY(value) - scaleY(0)));
    } else {
        const scaleX = this.xScale as d3.ScaleLinear<number, number>;
        const scaleY = this.yScale as d3.ScaleBand<string>;
        rect
            .attr("x", 0)
            .attr("y", scaleY(label)!)
            .attr("width", value > 0 ? scaleX(value) : 0)
            .attr("height", scaleY.bandwidth());
    }
  }

  private getBarDataFromPointer(event: MouseEvent): { label: string; value: number } | null {
    const [mouseX, mouseY] = d3.pointer(event, this.g.node());
    const { labels, maxValue, type, totalSumLimit } = this.props;
    let index = -1, rawValue = 0, label = '';
    if (type === ChartType.VERTICAL) {
        for (let i = 0; i < labels.length; i++) {
            const currentLabel = labels[i], bandStart = (this.xScale as d3.ScaleBand<string>)(currentLabel), bandwidth = (this.xScale as d3.ScaleBand<string>).bandwidth();
            if (bandStart !== undefined && mouseX >= bandStart && mouseX <= bandStart + bandwidth) { index = i; break; }
        }
        if (index === -1) return null;
        label = labels[index]; rawValue = (this.yScale as d3.ScaleLinear<number, number>).invert(mouseY);
    } else {
        for (let i = 0; i < labels.length; i++) {
            const currentLabel = labels[i], bandStart = (this.yScale as d3.ScaleBand<string>)(currentLabel), bandwidth = (this.yScale as d3.ScaleBand<string>).bandwidth();
            if (bandStart !== undefined && mouseY >= bandStart && mouseY <= bandStart + bandwidth) { index = i; break; }
        }
        if (index === -1) return null;
        label = labels[index]; rawValue = (this.xScale as d3.ScaleLinear<number, number>).invert(mouseX);
    }
    let value = Math.max(0, Math.min(maxValue, rawValue));
    if (typeof totalSumLimit === 'number') {
        const otherBarsSum = this.data.reduce((sum, bar) => (bar.label !== label ? sum + bar.value : sum), 0);
        value = Math.min(value, totalSumLimit - otherBarsSum);
    }
    return { label, value: Math.round(Math.max(0, value)) };
  }

  private attachEventListeners(): void {
    this.svg.on('mousedown', (event: MouseEvent) => {
        this.addHighlight(null);
        const barData = this.getBarDataFromPointer(event);
        if (barData) { this.activeDragLabel = barData.label; this.updateData(barData.label, barData.value); this.updateCursor(); }
    });
    this.svg.on('mousemove', (event: MouseEvent) => {
        if (this.activeDragLabel) {
            const barData = this.getBarDataFromPointer(event);
            if (barData && barData.label === this.activeDragLabel) { this.updateData(barData.label, barData.value); }
        } else { this.addHighlight(this.getBarDataFromPointer(event)); }
    });
    this.svg.on('mouseup', () => { this.activeDragLabel = null; this.updateCursor(); });
    this.svg.on('mouseleave', () => { this.activeDragLabel = null; this.addHighlight(null); this.updateCursor(); });
  }
  
  private updateData(label: string, value: number) {
      this.data = this.data.map(d => d.label === label ? { ...d, value } : d);
      this.addMarks();
      this.props.onSumUpdate(this.data.reduce((sum, item) => sum + item.value, 0));
  }

  private updateCursor() { this.svg.style('cursor', this.activeDragLabel ? (this.props.type === ChartType.VERTICAL ? 'ns-resize' : 'ew-resize') : 'crosshair'); }
  public getSvgNode(): SVGSVGElement { return this.svg.node()!; }
  public getData(): BarChartDataItem[] { return this.data; }
  public destroy(): void { this.svg.remove(); }
}

export class ScatterPlotVibe {
    private props: ScatterPlotVibeProps;
    private data: ScatterPlotDataItem[] = [];
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private g: d3.Selection<SVGGElement, unknown, null, undefined>;
    private width: number;
    private height: number;
    private xScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;
    private yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>;

    constructor(props: ScatterPlotVibeProps) {
        this.props = props;
        this.width = props.width - margin.left - margin.right;
        this.height = props.height - margin.top - margin.bottom;
        this.svg = d3.create('svg').attr('width', props.width).attr('height', props.height).style('cursor', 'crosshair');
        this.g = this.svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        
        this.setScales();
        this.createAxis();
        this.attachEventListeners();
    }

    private setScales() {
        const { xAxis, yAxis } = this.props.config;
        this.xScale = xAxis.type === 'numerical' ? d3.scaleLinear().domain([0, xAxis.maxValue]).range([0, this.width]) : d3.scaleBand<string>().domain(xAxis.values).range([0, this.width]).padding(0.1);
        this.yScale = yAxis.type === 'numerical' ? d3.scaleLinear().domain([0, yAxis.maxValue]).range([this.height, 0]) : d3.scaleBand<string>().domain(yAxis.values).range([this.height, 0]).padding(0.1);
    }
    
    private createAxis() {
        this.g.append("g").attr("transform", `translate(0,${this.height})`).call(d3.axisBottom(this.xScale as d3.AxisScale<any>));
        this.g.append("g").call(d3.axisLeft(this.yScale as d3.AxisScale<any>));
        this.svg.selectAll(".axis path, .axis line").attr("stroke", "#fdfdfd").attr("stroke-opacity", 0.3);
        this.svg.selectAll(".axis text").attr("fill", "#fdfdfd").attr("fill-opacity", 0.7);

        this.g.append("text").attr("text-anchor", "middle").attr("x", this.width / 2).attr("y", this.height + margin.bottom - 20).text(this.props.config.xAxis.label).attr("fill", "#fdfdfd").attr("fill-opacity", 0.8).style("font-size", "14px");
        this.g.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", -margin.left + 20).attr("x", -this.height / 2).text(this.props.config.yAxis.label).attr("fill", "#fdfdfd").attr("fill-opacity", 0.8).style("font-size", "14px");
    }

    private addMarks() {
        this.g.selectAll("circle").data(this.data).join("circle")
            .attr("cx", d => this.getXPosition(d.x))
            .attr("cy", d => this.getYPosition(d.y))
            .attr("r", 5)
            .attr("fill", "#f9dc5c");
    }

    private getXPosition(value: string | number): number {
        if (this.props.config.xAxis.type === 'numerical') {
            return (this.xScale as d3.ScaleLinear<number, number>)(value as number);
        }
        const scale = this.xScale as d3.ScaleBand<string>;
        return (scale(value as string) ?? 0) + scale.bandwidth() / 2;
    }

    private getYPosition(value: string | number): number {
        if (this.props.config.yAxis.type === 'numerical') {
            return (this.yScale as d3.ScaleLinear<number, number>)(value as number);
        }
        const scale = this.yScale as d3.ScaleBand<string>;
        return (scale(value as string) ?? 0) + scale.bandwidth() / 2;
    }

    private getDataFromPointer(event: MouseEvent): ScatterPlotDataItem | null {
        const [mouseX, mouseY] = d3.pointer(event, this.g.node());
        const { xAxis, yAxis } = this.props.config;

        let xValue, yValue;

        if (xAxis.type === 'numerical') {
            xValue = (this.xScale as d3.ScaleLinear<number, number>).invert(mouseX);
            if (xValue < 0 || xValue > xAxis.maxValue) return null;
        } else {
            const scale = this.xScale as d3.ScaleBand<string>;
            const eachBand = scale.step();
            const index = Math.floor(mouseX / eachBand);
            xValue = scale.domain()[index];
            if (!xValue) return null;
        }

        if (yAxis.type === 'numerical') {
            yValue = (this.yScale as d3.ScaleLinear<number, number>).invert(mouseY);
            if (yValue < 0 || yValue > yAxis.maxValue) return null;
        } else {
            const scale = this.yScale as d3.ScaleBand<string>;
            const eachBand = scale.step();
            const index = Math.floor(mouseY / eachBand);
            yValue = scale.domain()[index];
            if (!yValue) return null;
        }

        return {
            x: typeof xValue === 'number' ? parseFloat(xValue.toFixed(2)) : xValue,
            y: typeof yValue === 'number' ? parseFloat(yValue.toFixed(2)) : yValue,
        };
    }

    private attachEventListeners() {
        this.svg.on('click', (event: MouseEvent) => {
            const pointData = this.getDataFromPointer(event);
            if (pointData) {
                this.data.push(pointData);
                this.addMarks();
            }
        });
    }

    public getSvgNode(): SVGSVGElement { return this.svg.node()!; }
    public getData(): ScatterPlotDataItem[] { return this.data; }
    public destroy(): void { this.svg.remove(); }
}
