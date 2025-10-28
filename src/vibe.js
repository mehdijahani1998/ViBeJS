import * as d3 from "d3";

export class vibe {
  constructor(xDomain, yDomain, width, height, margins) {
    this.xDomain = xDomain;
    this.yDomain = yDomain;
    this.width = width - margins.left - margins.right;
    this.height = height - margins.top - margins.bottom;
    this.margins = margins;

    this.setData(); // ← NOW CALLED

    this.svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height);

    this.g = this.svg.append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);

    this.highlightG = this.svg.append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);
  }

  setData() {
    // Default: zero-filled data
    this.data = this.xDomain.map(d => ({ x: d, y: 0 }));
  }

  setScales() { /* override */ }
  createAxis() { /* override */ }
  addDrawEvent() { /* override */ }
  addHighlightEvent() { /* override */ }
  addMarks() { /* override */ }

  getData() {
    return this.data;
  }

  create() {
    this.setScales();
    this.createAxis();
    this.addDrawEvent();
    this.addHighlightEvent();
    this.addMarks(); // ← NOW IN BASE
    return this.svg.node();
  }
}
