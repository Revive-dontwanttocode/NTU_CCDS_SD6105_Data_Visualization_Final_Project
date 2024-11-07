import * as d3 from 'd3'

export function initBubbleChart() {
  // set the dimensions and margins of the graph
  const margin = {top: 150, right: 150, bottom: 150, left: 150},
    width = 1000 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Provided data
  const data = [
    {"Year": 1995, "GDP_current": 31269041, "GDP_constant": 40355817, "growth": 3.1},
    {"Year": 2005, "GDP_current": 47775404, "GDP_constant": 56455926, "growth": 4.0},
    {"Year": 2010, "GDP_current": 66578017, "GDP_constant": 64907975, "growth": 4.5},
    {"Year": 2015, "GDP_current": 75283835, "GDP_constant": 75283835, "growth": 3.1},
    {"Year": 2019, "GDP_current": 87728744, "GDP_constant": 84504873, "growth": 2.5},
    {"Year": 2020, "GDP_current": 85311030, "GDP_constant": 81844942, "growth": -3.1},
    {"Year": 2021, "GDP_current": 96698005, "GDP_constant": 86675773, "growth": 5.9}
  ];

  // Add X axis (Year)
  const x = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, width])
    .padding(0.1);  // Optional: Controls the padding between bands
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));  // Format as integer for Year


  // Add Y axis (GDP growth)
  const y = d3.scaleLinear()
    .domain([-4, 6])  // Adjusted range for GDP growth values
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add X axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 100)  // Position below the x-axis
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Year");

// Add Y axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 100)  // Position to the left of the y-axis
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("GDP Growth (%)");

  // Add a scale for bubble size based on GDP_current
  const z = d3.scaleLinear()
    .domain([30000000, 100000000])
    .range([4, 40]);

  // Add a color scale based on GDP_constant
  const myColor = d3.scaleLinear()
    .domain([40000000, 90000000])
    .range(["lightblue", "darkblue"]);

// Tooltip setup
  const tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "5px")  // Reduced padding for compact size
    .style("color", "white")
    .style("font-size", "12px")  // Smaller font size
    .style("position", "absolute");

// Tooltip functions
  const showTooltip = function (event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 1);

    tooltip
      .html(`Year: ${d.Year}<br>GDP Current: ${d.GDP_current.toLocaleString()}<br>GDP Constant: ${d.GDP_constant.toLocaleString()}<br>Growth: ${d.growth}%`)
      .style("left", (event.pageX + 15) + "px")  // Offset to the right of the cursor
      .style("top", (event.pageY - 40) + "px");  // Offset slightly above the cursor
  };

  const moveTooltip = function (event, d) {
    tooltip
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 40) + "px");
  };

  const hideTooltip = function (event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0);
  };

  // Draw bubbles
  svg.append('g')
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("class", "bubbles")
    .attr("cx", d => x(d.Year) + x.bandwidth() / 2)  // Center the bubble in the middle of the band
    .attr("cy", d => y(d.growth))
    .attr("r", d => z(d.GDP_current))  // Size based on GDP_current
    .style("fill", d => myColor(d.GDP_constant))  // Color based on GDP_constant
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);

  // Add chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Worldwide GDP Growth Rate and GDP Values(millions of US dollars) from 1995 to 2021");

  // Add legend for bubble size (GDP_current)
  const sizeLegend = svg.append("g")
    .attr("class", "sizeLegend")
    .attr("transform", `translate(${width + 20}, 30)`);

  const valuesToShow = [30000000, 65000000, 100000000];
  const legendCircleY = [60, 40, 20];
  const legendCircleX = 30;

  sizeLegend.selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", legendCircleX)
    .attr("cy", (d, i) => legendCircleY[i])
    .attr("r", d => z(d))
    .style("fill", "none")
    .attr("stroke", "black");

  sizeLegend.selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', d => legendCircleX + z(d))
    .attr('x2', legendCircleX + 50)
    .attr('y1', (d, i) => legendCircleY[i])
    .attr('y2', (d, i) => legendCircleY[i])
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'));

  sizeLegend.selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', legendCircleX + 55)
    .attr('y', (d, i) => legendCircleY[i] + 5)
    .text(d => d3.format(",")(d))
    .style("font-size", "10px")
    .attr('alignment-baseline', 'middle');

  sizeLegend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text("GDP in Current Price")
    .attr("text-anchor", "left")
    .style("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle");

  // Add legend for color scale (GDP_constant)
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  // Horizontal gradient
  linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  // Color stops
  linearGradient.selectAll("stop")
    .data([
      {offset: "0%", color: myColor(40000000)},
      {offset: "50%", color: myColor(65000000)},
      {offset: "100%", color: myColor(90000000)}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  // Draw the rectangle and fill with gradient
  svg.append("rect")
    .attr("x", width + 20)
    .attr("y", 150)
    .attr("width", 100)
    .attr("height", 10)
    .style("fill", "url(#linear-gradient)");

  // Add color legend labels
  svg.append("text")
    .attr("x", width + 20)
    .attr("y", 140)
    .text("GDP in Constant Price")
    .attr("text-anchor", "left")
    .style("font-size", "12px")
    .attr("font-weight", "bold");

  svg.append("text")
    .attr("x", width + 20)
    .attr("y", 175)
    .text("40M")
    .attr("text-anchor", "start")
    .style("font-size", "10px");

  svg.append("text")
    .attr("x", width + 70)
    .attr("y", 175)
    .text("65M")
    .attr("text-anchor", "middle")
    .style("font-size", "10px");

  svg.append("text")
    .attr("x", width + 120)
    .attr("y", 175)
    .text("90M")
    .attr("text-anchor", "end")
    .style("font-size", "10px");
}

export function initLineChart() {
  // set the dimensions and margins of the graph
  const margin = {top: 150, right: 150, bottom: 150, left: 150},
    width = 1000 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  const svg = d3.select("#gdp_per_capita")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) // Position above the chart
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("GDP(millions of US dollars) and Economic Indicators Over Time");

  // Tooltip div
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

  // Provided data
  const data = [
    {"Year": 1995, "GDP_current": 31269041, "GDP_constant": 40355817, "growth": 3.1, "GDP_per_capita": 5446},
    {"Year": 2005, "GDP_current": 47775404, "GDP_constant": 56455926, "growth": 4.0, "GDP_per_capita": 7287},
    {"Year": 2010, "GDP_current": 66578017, "GDP_constant": 64907975, "growth": 4.5, "GDP_per_capita": 9533},
    {"Year": 2015, "GDP_current": 75283835, "GDP_constant": 75283835, "growth": 3.1, "GDP_per_capita": 10140},
    {"Year": 2019, "GDP_current": 87728744, "GDP_constant": 84504873, "growth": 2.5, "GDP_per_capita": 11301},
    {"Year": 2020, "GDP_current": 85311030, "GDP_constant": 81844942, "growth": -3.1, "GDP_per_capita": 10883},
    {"Year": 2021, "GDP_current": 96698005, "GDP_constant": 86675773, "growth": 5.9, "GDP_per_capita": 12229}
  ];

  // List of groups for the select button
  const allGroup = ["GDP_current", "GDP_constant", "growth", "GDP_per_capita"];
  // Color scale
  const myColor = d3.scaleOrdinal()
    .domain(allGroup)
    .range(d3.schemeSet2);

  // X axis (Year) with `scalePoint` for even distribution of points
  const x = d3.scalePoint()
    .domain(data.map(d => d.Year))
    .range([0, width])
    .padding(0.5); // Adds padding on both ends of the axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));  // Format as integer for Year


  // Y axis (initial with GDP_current)
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.GDP_current)])
    .range([height, 0]);
  const yAxis = svg.append("g")
    .call(d3.axisLeft(y));

  // X and Y axis labels
  svg.append("text")
    .attr("class", "x label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 100)
    .style("text-anchor", "middle")
    .text("Year");

  const yAxisLabel = svg.append("text")
    .attr("class", "y label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 50)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("GDP (current)"); // Initial label for Y-axis

  // Line generator
  const line = svg.append("path")
    .datum(data)
    .attr("d", d3.line()
      .x(d => x(d.Year))
      .y(d => y(d.GDP_current))
    )
    .attr("stroke", myColor("GDP_current"))
    .style("stroke-width", 2)
    .style("fill", "none");

  // Data points with hover tooltip
  const dots = svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Year))
    .attr("cy", d => y(d.GDP_current))
    .attr("r", 4)
    .attr("fill", myColor("GDP_current"))
    .on("mouseover", function(event, d) {
      tooltip.style("display", "block")
        .html(`<strong>Year:</strong> ${d.Year}<br><strong>Value:</strong> ${d.GDP_current}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("display", "none");
    });


  // update function
  function update(selectedGroup) {
    // Update Y-axis domain based on selected group
    const yMax = d3.max(data, d => Math.abs(d[selectedGroup]));
    y.domain(selectedGroup === "growth" ? [-yMax, yMax] : [0, yMax]);

    // Update Y-axis label
    yAxisLabel.text(() => {
      switch (selectedGroup) {
        case "GDP_current":
          return "GDP (current)";
        case "GDP_constant":
          return "GDP (constant)";
        case "growth":
          return "Growth Rate (%)";
        case "GDP_per_capita":
          return "GDP per Capita";
      }
    });

    // Transition for Y-axis
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Update line
    line
      .datum(data)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(d => x(d.Year))
        .y(d => y(d[selectedGroup]))
      )
      .attr("stroke", myColor(selectedGroup));

    // Update data points
    dots
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", d => x(d.Year))
      .attr("cy", d => y(d[selectedGroup]))
      .attr("fill", myColor(selectedGroup));

    // Update tooltip content to reflect selected group
    dots.on("mouseover", function(event, d) {
      tooltip.style("display", "block")
        .html(`<strong>Year:</strong> ${d.Year}<br><strong>Value:</strong> ${d[selectedGroup]}`);
    });
  }

  // Event listener for the dropdown
  d3.select("#selectButton").on("change", function () {
    const selectedOption = d3.select(this).property("value");
    update(selectedOption);
  });
}

export function initDensityChart() {
  // set the dimensions and margins of the graph
  const margin = {top: 150, right: 150, bottom: 150, left: 150},
    width = 1000 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;

}
