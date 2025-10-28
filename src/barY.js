import * as d3 from "d3";
import { vibe } from "./vibe.js";

export class barY extends vibe {
  constructor(xDomain, yDomain, width, height, margins) {
    super(yDomain, xDomain, width, height, margins); // ← swapped!
    // Now: xDomain = numeric range, yDomain = categories
  }

  setData() {
    this.data = this.yDomain.map(y => ({ x: 0, y })); // y = category
  }

  setScales() {
    this.yScale = d3.scaleBand()
      .domain(this.yDomain)
      .range([0, this.height])
      .padding(0.1);

    this.xScale = d3.scaleLinear()
      .domain(this.xDomain)
      .range([0, this.width]);

    return this;
  }

  createAxis() {
    this.g.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));

    this.g.append("g")
      .call(d3.axisLeft(this.yScale));

    return this;
  }

  findClosestIndex(x, y) {
    const yIndex = Math.floor(y / this.yScale.step());
    const yValue = this.yScale.domain()[yIndex];
    const xValue = this.xScale.invert(x);
    const index = this.data.findIndex(d => d.y === yValue);
    return { xValue, yValue, index };
  }

  addDrawEvent() {
    this.svg.on("click", (event) => {
      const [x, y] = d3.pointer(event, this.g.node());
      const { xValue, yValue, index } = this.findClosestIndex(x, y);
      if (index !== -1) {
        this.data[index].x = xValue;
        this.addMarks();
      }
    });
    return this;
  }

  addHighlightEvent() {
    this.svg.on("mousemove", (event) => {
      const [x, y] = d3.pointer(event, this.g.node());
      const { xValue, yValue, index } = this.findClosestIndex(x, y);
      const highlightData = index !== -1 ? [{ x: xValue, y: yValue }] : [];

      this.highlightG.selectAll("rect")
        .data(highlightData)
        .join("rect")
        .attr("x", this.xScale(this.xDomain[0]))
        .attr("y", d => this.yScale(d.y))
        .attr("height", this.yScale.bandwidth())
        .attr("width", d => this.xScale(d.x) - this.xScale(this.xDomain[0]))
        .attr("fill", "grey")
        .attr("fill-opacity", 0.5);
    });
    return this;
  }

  addMarks() {
    this.g.selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", this.xScale(this.xDomain[0]))
      .attr("y", d => this.yScale(d.y))
      .attr("height", this.yScale.bandwidth())
      .attr("width", d => this.xScale(d.x) - this.xScale(this.xDomain[0]))
      .attr("fill", "steelblue");
    return this;
  }
}
