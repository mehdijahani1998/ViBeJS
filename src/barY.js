// barY version based on barX

import * as d3 from "d3";
import { vibe } from "./vibe.js";

export class barY extends vibe {
  constructor(xDomain, yDomain, width, height, margins) {
    super(xDomain, yDomain, width, height, margins);
    return this;
  }

  setData() {
    // Data initialization
    this.data = this.yDomain.map((d) => ({ x: 0, y: d }));
    console.log(this.data);
  }

  setScales() {
    this.yScale = d3
      .scaleBand()
      .domain(this.yDomain)
      .range([0, this.height])
      .padding(0.1);

    this.xScale = d3.scaleLinear().domain(this.xDomain).range([0, this.width]);
    return this;
  }

  createAxis() {
    this.g
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));

    // Add y-axis
    this.g.append("g").call(d3.axisLeft(this.yScale));
    return this;
  }

  findClosestIndex(x, y) {
    // Find the closest x domain value by comparing the clicked position
    const yIndex = Math.floor(y / this.yScale.step());
    const yValue = this.yScale.domain()[yIndex];
    const xValue = this.xScale.invert(x);
    const index = this.data.findIndex((d) => d.y === yValue);

    return { xValue, yValue, index };
  }

  addDrawEvent() {
    this.svg.on("click", (event) => {
      const x = event.offsetX - this.margins.left;
      const y = event.offsetY - this.margins.top;

      // Find the closest x domain value by comparing the clicked position
      const { xValue, yValue, index } = this.findClosestIndex(x, y);

      if (index !== -1) {
        this.data[index].x = xValue;
        this.data[index].y = yValue;
        this.addMarks();
      }
    });

    return this;
  }

  addHighlightEvent() {
    this.svg.on("mousemove", (event) => {
      const x = event.offsetX - this.margins.left;
      const y = event.offsetY - this.margins.top;

      // Find the closest x domain value by comparing the clicked position
      const { xValue, yValue, index } = this.findClosestIndex(x, y);
      //   const highlightData = this.data.map((d) => ({ x: d.x, y: 0 }));
      //   if (index !== -1) {
      //     highlightData[index].x = xValue;
      //     highlightData[index].y = yValue;
      //   }
      const highlightData = index !== -1 ? [{ x: xValue, y: yValue }] : [];

      if (index !== -1) {
        this.highlightG
          .selectAll("rect")
          .data(highlightData)
          .join("rect")
          .attr("x", (d) => this.xScale(xDomain[0]))
          .attr("y", (d) => this.yScale(d.y))
          .attr("height", this.yScale.bandwidth())
          .attr("width", (d) => this.xScale(d.x))
          .attr("fill", "grey")
          .attr("fill-opacity", 0.5);
      }
    });
  }

  addMarks() {
    // Add rectangles (bars)
    console.log(this.data);
    this.g
      .selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", (d) => this.xScale(xDomain[0]))
      .attr("y", (d) => this.yScale(d.y))
      .attr("height", this.yScale.bandwidth())
      .attr("width", (d) => this.xScale(d.x))
      .attr("fill", "steelblue");

    return this;
  }

  create() {
    this.setScales();
    this.createAxis();
    this.addDrawEvent();
    this.addHighlightEvent();
    this.addMarks();
    return this.svg.node();
  }
}
