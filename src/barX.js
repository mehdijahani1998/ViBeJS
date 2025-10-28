import * as d3 from "d3";
import { vibe } from "./vibe.js";

export class barX extends vibe {
  constructor(xDomain, yDomain, width, height, margins) {
    super(xDomain, yDomain, width, height, margins);
  }

  setScales() {
    this.xScale = d3.scaleBand()
      .domain(this.xDomain)
      .range([0, this.width])
      .padding(0.1);

    this.yScale = d3.scaleLinear()
      .domain(this.yDomain)
      .range([this.height, 0]);

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
    const xIndex = Math.floor(x / this.xScale.step());
    const xValue = this.xScale.domain()[xIndex];
    const yValue = this.yScale.invert(y);
    const index = this.data.findIndex(d => d.x === xValue);
    return { xValue, yValue, index };
  }

  addDrawEvent() {
    this.svg.on("click", (event) => {
      const [x, y] = d3.pointer(event, this.g.node());
      const { xValue, yValue, index } = this.findClosestIndex(x, y);
      if (index !== -1) {
        this.data[index].y = yValue;
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
        .attr("x", d => this.xScale(d.x))
        .attr("y", d => this.yScale(d.y))
        .attr("width", this.xScale.bandwidth())
        .attr("height", d => this.height - this.yScale(d.y))
        .attr("fill", "grey")
        .attr("fill-opacity", 0.5);
    });
    return this;
  }

  addMarks() {
    this.g.selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", d => this.xScale(d.x))
      .attr("y", d => this.yScale(d.y))
      .attr("width", this.xScale.bandwidth())
      .attr("height", d => this.height - this.yScale(d.y))
      .attr("fill", "steelblue");
    return this;
  }
}
