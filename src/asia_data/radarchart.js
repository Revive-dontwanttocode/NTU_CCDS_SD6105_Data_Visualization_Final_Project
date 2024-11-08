/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

import * as d3 from 'd3';

// export function RadarChart(id, data, options) {
//   var cfg = {
//     w: 800,				//Width of the circle
//     h: 800,				//Height of the circle
//     margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
//     levels: 5,				//How many levels or inner circles should there be drawn
//     maxValue: 0, 			//What is the value that the biggest circle will represent
//     labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
//     wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
//     opacityArea: 0.35, 	//The opacity of the area of the blob
//     dotRadius: 4, 			//The size of the colored circles of each blog
//     opacityCircles: 0.1, 	//The opacity of the circles of each blob
//     strokeWidth: 2, 		//The width of the stroke around each blob
//     roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
//     color: d3.scaleOrdinal(d3.schemeCategory10)	//Color function
//   };
//
//   //Put all of the options into a variable called cfg
//   if('undefined' !== typeof options){
//     for(var i in options){
//       if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
//     }
//   }
//
//   //If the supplied maxValue is smaller than the actual one, replace by the max in the data
//   var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){ return d3.max(i.map(function(o){ return o.value; })); }));
//
//   var allAxis = (data[0].map(function(i, j){ return i.axis; })),	//Names of each axis
//     total = allAxis.length,					//The number of different axes
//     radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
//     Format = d3.format('.0%'),			 	//Percentage formatting
//     angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
//
//   //Scale for the radius
//   var rScale = d3.scaleLinear()
//     .range([0, radius])
//     .domain([0, maxValue]);
//
//   /////////////////////////////////////////////////////////
//   //////////// Create the container SVG and g /////////////
//   /////////////////////////////////////////////////////////
//
//   //Remove whatever chart with the same id/class was present before
//   d3.select(id).select("svg").remove();
//
//   //Initiate the radar chart SVG
//   var svg = d3.select(id).append("svg")
//     .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
//     .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
//     .attr("class", "radar" + id);
//   //Append a g element
//   var g = svg.append("g")
//     .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
//
//   /////////////////////////////////////////////////////////
//   ////////// Glow filter for some extra pizzazz ///////////
//   /////////////////////////////////////////////////////////
//
//   //Filter for the outside glow
//   var filter = g.append('defs').append('filter').attr('id','glow'),
//     feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
//     feMerge = filter.append('feMerge'),
//     feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
//     feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
//
//   /////////////////////////////////////////////////////////
//   /////////////// Draw the Circular grid //////////////////
//   /////////////////////////////////////////////////////////
//
//   //Wrapper for the grid & axes
//   var axisGrid = g.append("g").attr("class", "axisWrapper");
//
//   //Draw the background circles
//   axisGrid.selectAll(".levels")
//     .data(d3.range(1, (cfg.levels+1)).reverse())
//     .enter()
//     .append("circle")
//     .attr("class", "gridCircle")
//     .attr("r", function(d, i) { return radius/cfg.levels * d; })
//     .style("fill", "#CDCDCD")
//     .style("stroke", "#CDCDCD")
//     .style("fill-opacity", cfg.opacityCircles)
//     .style("filter" , "url(#glow)");
//
//   //Text indicating at what % each level is
//   axisGrid.selectAll(".axisLabel")
//     .data(d3.range(1, (cfg.levels+1)).reverse())
//     .enter().append("text")
//     .attr("class", "axisLabel")
//     .attr("x", 4)
//     .attr("y", function(d) { return -d * radius / cfg.levels; })
//     .attr("dy", "0.4em")
//     .style("font-size", "10px")
//     .attr("fill", "#737373")
//     .text(function(d, i) { return Format(maxValue * d / cfg.levels); });
//
//   /////////////////////////////////////////////////////////
//   //////////////////// Draw the axes //////////////////////
//   /////////////////////////////////////////////////////////
//
//   //Create the straight lines radiating outward from the center
//   var axis = axisGrid.selectAll(".axis")
//     .data(allAxis)
//     .enter()
//     .append("g")
//     .attr("class", "axis");
//
//   //Append the lines
//   axis.append("line")
//     .attr("x1", 0)
//     .attr("y1", 0)
//     .attr("x2", function(d, i) { return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI/2); })
//     .attr("y2", function(d, i) { return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI/2); })
//     .attr("class", "line")
//     .style("stroke", "white")
//     .style("stroke-width", "2px");
//
//   //Append the labels at each axis
//   axis.append("text")
//     .attr("class", "legend")
//     .style("font-size", "11px")
//     .attr("text-anchor", "middle")
//     .attr("dy", "0.35em")
//     .attr("x", function(d, i) { return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI/2); })
//     .attr("y", function(d, i) { return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI/2); })
//     .text(function(d) { return d; })
//     .call(wrap, cfg.wrapWidth);
//
//   /////////////////////////////////////////////////////////
//   ///////////// Draw the radar chart blobs ////////////////
//   /////////////////////////////////////////////////////////
//
//   // 定义径向线函数
//   var radarLine = d3.lineRadial()
//     .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed) // Use closed curve
//     .radius(function(d) { return rScale(d.value); })
//     .angle(function(d, i) { return i * angleSlice; });
//
//   //Create a wrapper for the blobs
//   var blobWrapper = g.selectAll(".radarWrapper")
//     .data(data)
//     .enter().append("g")
//     .attr("class", "radarWrapper");
//
//   //Append the backgrounds
//   blobWrapper
//     .append("path")
//     .attr("class", "radarArea")
//     .attr("d", function(d, i) { return radarLine(d); })
//     .style("fill", function(d, i) { return cfg.color(i); })
//     .style("fill-opacity", cfg.opacityArea)
//     .on('mouseover', function (d, i) {
//       d3.selectAll(".radarArea")
//         .transition().duration(200)
//         .style("fill-opacity", 0.1);
//       d3.select(this)
//         .transition().duration(200)
//         .style("fill-opacity", 0.7);
//     })
//     .on('mouseout', function() {
//       d3.selectAll(".radarArea")
//         .transition().duration(200)
//         .style("fill-opacity", cfg.opacityArea);
//     });
//
//   //Create the outlines
//   blobWrapper.append("path")
//     .attr("class", "radarStroke")
//     .attr("d", function(d, i) { return radarLine(d); })
//     .style("stroke-width", cfg.strokeWidth + "px")
//     .style("stroke", function(d, i) { return cfg.color(i); })
//     .style("fill", "none")
//     .style("filter" , "url(#glow)");
//
//   //Append the circles
//   blobWrapper.selectAll(".radarCircle")
//     .data(function(d, i) { return d; })
//     .enter().append("circle")
//     .attr("class", "radarCircle")
//     .attr("r", cfg.dotRadius)
//     .attr("cx", function(d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI/2); })
//     .attr("cy", function(d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI/2); })
//     .style("fill", function(d, i, j) { return cfg.color(j); })
//     .style("fill-opacity", 0.8);
//
//   // Append legend group
//   const legend = svg.append("g")
//     .attr("class", "legend")
//     .attr("transform", `translate(${cfg.w + cfg.margin.left + 20}, ${cfg.margin.top})`);
//
//   // Add legend items
//   legend.selectAll(".legend-item")
//     .data(data)
//     .enter()
//     .append("g")
//     .attr("class", "legend-item")
//     .attr("transform", (d, i) => `translate(0, ${i * 20})`)
//     .each(function(d, i) {
//       const legendItem = d3.select(this);
//
//       // Append color box
//       legendItem.append("rect")
//         .attr("x", 0)
//         .attr("y", 0)
//         .attr("width", 12)
//         .attr("height", 12)
//         .style("fill", cfg.color(i));
//
//       // Append text label
//       legendItem.append("text")
//         .attr("x", 20)
//         .attr("y", 10)
//         .text(d[0].Country) // Assumes each `data` item has a Country field
//         .style("font-size", "12px")
//         .attr("alignment-baseline", "middle");
//     });
//
//   /////////////////////////////////////////////////////////
//   //////// Append invisible circles for tooltip ///////////
//   /////////////////////////////////////////////////////////
//
//   //Wrapper for the invisible circles on top
//   var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
//     .data(data)
//     .enter().append("g")
//     .attr("class", "radarCircleWrapper");
//
//   //Append a set of invisible circles on top for the mouseover pop-up
//   blobCircleWrapper.selectAll(".radarInvisibleCircle")
//     .data(function(d, i) { return d; })
//     .enter().append("circle")
//     .attr("class", "radarInvisibleCircle")
//     .attr("r", cfg.dotRadius * 1.5)
//     .attr("cx", function(d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI/2); })
//     .attr("cy", function(d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI/2); })
//     .style("fill", "none")
//     .style("pointer-events", "all")
//     .on("mouseover", function(d, i) {
//       let newX =  parseFloat(d3.select(this).attr('cx')) - 10;
//       let newY =  parseFloat(d3.select(this).attr('cy')) - 10;
//
//       tooltip
//         .attr('x', newX)
//         .attr('y', newY)
//         .text(Format(d.value))
//         .transition().duration(200)
//         .style('opacity', 1);
//     })
//     .on("mouseout", function(){
//       tooltip.transition().duration(200)
//         .style("opacity", 0);
//     });
//
//   //Set up the small tooltip for when you hover over a circle
//   var tooltip = g.append("text")
//     .attr("class", "tooltip")
//     .style("opacity", 0);
//
//   /////////////////////////////////////////////////////////
//   /////////////////// Helper Function /////////////////////
//   /////////////////////////////////////////////////////////
//
//   //Taken from http://bl.ocks.org/mbostock/7555321
//   //Wraps SVG text
//   function wrap(text, width) {
//     text.each(function() {
//       var text = d3.select(this),
//         words = text.text().split(/\s+/).reverse(),
//         word,
//         line = [],
//         lineNumber = 0,
//         lineHeight = 1.4, // ems
//         y = text.attr("y"),
//         x = text.attr("x"),
//         dy = parseFloat(text.attr("dy")),
//         tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
//
//       while (word = words.pop()) {
//         line.push(word);
//         tspan.text(line.join(" "));
//         if (tspan.node().getComputedTextLength() > width) {
//           line.pop();
//           tspan.text(line.join(" "));
//           line = [word];
//           tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
//         }
//       }
//     });
//   }
//
// }

// export function RadarChart(id, radarData, options) {
//   var cfg = {
//     w: 600,				// Width of the circle
//     h: 600,				// Height of the circle
//     margin: {top: 20, right: 100, bottom: 20, left: 20}, // Increase right margin for legend
//     levels: 3,				// How many levels or inner circles should there be drawn
//     maxValue: 0, 			// What is the value that the biggest circle will represent
//     labelFactor: 1.25, 	// How much farther than the radius of the outer circle should the labels be placed
//     wrapWidth: 60, 		// The number of pixels after which a label needs to be given a new line
//     opacityArea: 0.35, 	// The opacity of the area of the blob
//     dotRadius: 4, 			// The size of the colored circles of each blob
//     opacityCircles: 0.1, 	// The opacity of the circles of each blob
//     strokeWidth: 2, 		// The width of the stroke around each blob
//     roundStrokes: false,	// If true the area and stroke will follow a round path (cardinal-closed)
//     color: d3.scaleOrdinal(d3.schemeCategory10)	// Color function
//   };
//
//   // Merge options into cfg
//   if ('undefined' !== typeof options) {
//     for (var i in options) {
//       if ('undefined' !== typeof options[i]) { cfg[i] = options[i]; }
//     }
//   }
//
//   // Set up SVG container
//   var svg = d3.select(id).append("svg")
//     .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
//     .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
//     .attr("class", "radar" + id);
//
//   var g = svg.append("g")
//     .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");
//
//   // Set up color scale for legend and radar chart
//   const color = cfg.color;
//
//   // Draw radar chart blobs
//   var angleSlice = Math.PI * 2 / radarData[0].data.length; // Calculate angle slice based on data length
//
//   // Create radial scale for radius
//   var maxValue = Math.max(cfg.maxValue, d3.max(radarData, d => d3.max(d.data, o => o.value)));
//   var rScale = d3.scaleLinear()
//     .range([0, Math.min(cfg.w / 2, cfg.h / 2)])
//     .domain([0, maxValue]);
//
//   /////////////////////////////////////////////////////////
//   ///////////// Draw the radar chart blobs ////////////////
//   /////////////////////////////////////////////////////////
//
//   // 定义径向线函数
//   var radarLine = d3.lineRadial()
//     .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed)
//     .radius(d => rScale(d.value))
//     .angle((d, i) => i * angleSlice);
//
//   // Create a wrapper for the blobs
//   var blobWrapper = g.selectAll(".radarWrapper")
//     .data(radarData)
//     .enter().append("g")
//     .attr("class", "radarWrapper");
//
//   // Append the backgrounds
//   blobWrapper
//     .append("path")
//     .attr("class", "radarArea")
//     .attr("d", d => radarLine(d.data)) // Access `data` field within each country object
//     .style("fill", (d, i) => color(i))
//     .style("fill-opacity", cfg.opacityArea)
//     .on('mouseover', function () {
//       d3.selectAll(".radarArea")
//         .transition().duration(200)
//         .style("fill-opacity", 0.1);
//       d3.select(this)
//         .transition().duration(200)
//         .style("fill-opacity", 0.7);
//     })
//     .on('mouseout', function () {
//       d3.selectAll(".radarArea")
//         .transition().duration(200)
//         .style("fill-opacity", cfg.opacityArea);
//     });
//
//   // Create the outlines
//   blobWrapper.append("path")
//     .attr("class", "radarStroke")
//     .attr("d", d => radarLine(d.data)) // Access `data` field within each country object
//     .style("stroke-width", cfg.strokeWidth + "px")
//     .style("stroke", (d, i) => color(i))
//     .style("fill", "none");
//
//   // Append the circles
//   blobWrapper.selectAll(".radarCircle")
//     .data(d => d.data) // Access `data` field within each country object
//     .enter().append("circle")
//     .attr("class", "radarCircle")
//     .attr("r", cfg.dotRadius)
//     .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
//     .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
//     .style("fill", (d, i, j) => color(j))
//     .style("fill-opacity", 0.8);
//
//   /////////////////////////////////////////////////////////
//   ///////////////////// Draw the Legend ////////////////////
//   /////////////////////////////////////////////////////////
//
//   // Append legend group
//   const legend = svg.append("g")
//     .attr("class", "legend")
//     .attr("transform", `translate(${cfg.w + cfg.margin.left + 20}, ${cfg.margin.top})`);
//
//   // Add legend items
//   legend.selectAll(".legend-item")
//     .data(radarData)
//     .enter()
//     .append("g")
//     .attr("class", "legend-item")
//     .attr("transform", (d, i) => `translate(0, ${i * 20})`)
//     .each(function (d, i) {
//       const legendItem = d3.select(this);
//
//       // Append color box
//       legendItem.append("rect")
//         .attr("x", 0)
//         .attr("y", 0)
//         .attr("width", 12)
//         .attr("height", 12)
//         .style("fill", color(i));
//
//       // Append text label with country name
//       legendItem.append("text")
//         .attr("x", 20)
//         .attr("y", 10)
//         .text(d.country) // 使用 `country` 字段
//         .style("font-size", "12px")
//         .attr("alignment-baseline", "middle");
//     });
// }

export function RadarChart(id, radarData, options) {
  var cfg = {
    w: 600,				// Width of the circle
    h: 600,				// Height of the circle
    margin: {top: 100, right: 100, bottom: 100, left: 100}, // Increase right margin for legend
    levels: 3,				// How many levels or inner circles should there be drawn
    maxValue: 0, 			// What is the value that the biggest circle will represent
    labelFactor: 1.25, 	// How much farther than the radius of the outer circle should the labels be placed
    wrapWidth: 60, 		// The number of pixels after which a label needs to be given a new line
    opacityArea: 0.35, 	// The opacity of the area of the blob
    dotRadius: 4, 			// The size of the colored circles of each blob
    opacityCircles: 0.1, 	// The opacity of the circles of each blob
    strokeWidth: 2, 		// The width of the stroke around each blob
    roundStrokes: false,	// If true the area and stroke will follow a round path (cardinal-closed)
    color: d3.scaleOrdinal(d3.schemeCategory10)	// Color function
  };

  // Merge options into cfg
  if ('undefined' !== typeof options) {
    for (var i in options) {
      if ('undefined' !== typeof options[i]) {
        cfg[i] = options[i];
      }
    }
  }

  // Set up SVG container
  let svg = d3.select(id).append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar" + id);

  // 添加标题
  svg.append("text")
    .attr("class", "title")
    .attr("x", cfg.w - 100)
    .attr("y", cfg.margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("5 Countries Comparison Chart");


  var g = svg.append("g")
    .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

  // Set up color scale for legend and radar chart
  const color = cfg.color;

  // Draw radar chart blobs
  var angleSlice = Math.PI * 2 / radarData[0].data.length; // Calculate angle slice based on data length

// 定义 radius，使用图表宽高的较小值作为最大半径
  var radius = Math.min(cfg.w / 2, cfg.h / 2);

  // Create radial scale for radius
  var maxValue = Math.max(cfg.maxValue, d3.max(radarData, d => d3.max(d.data, o => o.value)));
  var rScale = d3.scaleLinear()
    .range([0, Math.min(cfg.w / 2, cfg.h / 2)])
    .domain([0, maxValue]);

  var Format = d3.format(".2f"); // 这里保留两位小数

  /////////////////////////////////////////////////////////
  /////////////// Draw the Circular grid //////////////////
  /////////////////////////////////////////////////////////

  //Wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");

  //Draw the background circles
  axisGrid.selectAll(".levels")
    .data(d3.range(1, (cfg.levels + 1)).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function (d, i) {
      return radius / cfg.levels * d;
    })
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles)
    .style("filter", "url(#glow)");

  //Text indicating at what % each level is
  axisGrid.selectAll(".axisLabel")
    .data(d3.range(1, (cfg.levels + 1)).reverse())
    .enter().append("text")
    .attr("class", "axisLabel")
    .attr("x", 4)
    .attr("y", function (d) {
      return -d * radius / cfg.levels;
    })
    .attr("dy", "0.4em")
    .style("font-size", "10px")
    .attr("fill", "#737373")
    .text(function (d, i) {
      return Format(maxValue * d / cfg.levels);
    });

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  // 获取所有轴的名称
  var allAxis = radarData[0].data.map(d => d.axis); // 假设每个国家的数据结构包含一个 `data` 数组，其中 `axis` 是指标名称
  var total = allAxis.length; // 总的轴数
  var angleSlice = Math.PI * 2 / total; // 每个轴的角度


  //Create the straight lines radiating outward from the center
  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");

  //Append the lines
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function (d, i) {
      return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("y2", function (d, i) {
      return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");

  //Append the labels at each axis
  axis.append("text")
    .attr("class", "legend")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function (d, i) {
      return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("y", function (d, i) {
      return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .text(function (d) {
      return d;
    })
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////

  // 定义径向线函数
  var radarLine = d3.lineRadial()
    .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed)
    .radius(d => rScale(d.value))
    .angle((d, i) => i * angleSlice);

  // Create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(radarData)
    .enter().append("g")
    .attr("class", "radarWrapper");

  // Append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", d => radarLine(d.data)) // Access `data` field within each country object
    .style("fill", (d, i) => color(i))
    .style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function () {
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", 0.1);
      d3.select(this)
        .transition().duration(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function () {
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  // Create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", d => radarLine(d.data)) // Access `data` field within each country object
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", (d, i) => color(i))
    .style("fill", "none");

  // Append the circles
  blobWrapper.selectAll(".radarCircle")
    .data(d => d.data) // Access `data` field within each country object
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("fill", (d, i, j) => color(j))
    .style("fill-opacity", 0.8);

  /////////////////////////////////////////////////////////
  ///////////////////// Draw the Legend ////////////////////
  /////////////////////////////////////////////////////////

  // Append legend group
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${cfg.w + cfg.margin.left + 20}, ${cfg.margin.top})`);

  // Add legend items
  legend.selectAll(".legend-item")
    .data(radarData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .each(function (d, i) {
      const legendItem = d3.select(this);

      // Append color box
      legendItem.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color(i));

      // Append text label with country name
      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d.country) // 使用 `country` 字段
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });

    /////////////////////////////////////////////////////////
  /////////////////// Helper Function /////////////////////
  /////////////////////////////////////////////////////////

  //Taken from http://bl.ocks.org/mbostock/7555321
  //Wraps SVG text
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}
