import * as d3 from "d3";

export class vibe {
  constructor(xDomain, yDomain, width, height, margins) {
    this.xDomain = xDomain;
    this.yDomain = yDomain;
    this.width = width - 40; // Subtracting margins from width
    this.height = height - 40; // Subtracting margins from height
    this.margins = margins;
    this.setData();
    // Create an SVG element with appropriate margins
    this.svg = d3.create("svg").attr("width", width).attr("height", height);
    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.margins.left},${this.margins.top})`);
    this.highlightG = this.svg
      .append("g")
      .attr("transform", `translate(${this.margins.left},${this.margins.top})`);
    // invisible rectangle to register hover events but not register click events

    return this;
  }

  // xDomain is an array of strings
  // yDomain is an array with minimum and maximum values of input domain
  setData() {
    // Data initialization
    this.data = xDomain.map((d) => ({ x: d, y: 0 }));
  }

  // set scale based on xDomain and yDomain
  setScale() {}

  // create axis based on xScale and yScale
  createAxis() {}

  // creates event on svg to draw elements
  addDrawEvent() {}

  // adds marks when data is updated
  addMarks() {}

  getData() {
    return this.data;
  }

  // creates the chart and returns svg node, should call setScales, createAxis, addDrawEvent, addHighlightEvent
  create() {
    this.setScales();
    this.createAxis();
    this.addDrawEvent();
    this.addHighlightEvent();
    return this.svg.node();
  }
}
