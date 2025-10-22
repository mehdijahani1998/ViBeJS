import * as d3 from "d3";
import { vibe } from "./vibe.js";

export class barX extends vibe {
  constructor(xDomain, yDomain, width, height, margins) {
    super(xDomain, yDomain, width, height, margins);
    return this;
  }

  setData() {
    // Data initialization
    this.data = this.xDomain.map((d) => ({ x: d, y: 0 }));
  }

  setScales() {
    this.xScale = d3
      .scaleBand()
      .domain(this.xDomain)
      .range([0, this.width])
      .padding(0.1);

    this.yScale = d3.scaleLinear().domain(this.yDomain).range([this.height, 0]);
    return this;
  }

  findClosestIndex(x, y) {
    // Find the closest x domain value by comparing the clicked position
    const xIndex = Math.floor(x / this.xScale.step());
    const xValue = this.xScale.domain()[xIndex];
    const yValue = this.yScale.invert(y);
    const index = this.data.findIndex((d) => d.x === xValue);

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
          .attr("x", (d) => this.xScale(d.x))
          .attr("y", (d) => this.yScale(d.y))
          .attr("width", this.xScale.bandwidth())
          .attr("height", (d) => this.height - this.yScale(d.y))
          .attr("fill", "grey")
          .attr("fill-opacity", 0.5);
      }
    });

    return this;
  }

  addMarks() {
    // Add rectangles (bars)
    this.g
      .selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", (d) => this.xScale(d.x))
      .attr("y", (d) => this.yScale(d.y))
      .attr("width", this.xScale.bandwidth())
      .attr("height", (d) => this.height - this.yScale(d.y))
      .attr("fill", "steelblue");

    return this;
  }

  createAxis() {
    console.log(this.xScale);
    // Add x-axis
    this.g
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale));

    // Add y-axis
    this.g.append("g").call(d3.axisLeft(this.yScale));

    return this;
  }

  create() {
    this.setScales();
    this.createAxis();
    this.addDrawEvent();
    this.addHighlightEvent();
    return this.svg.node();
  }
}
