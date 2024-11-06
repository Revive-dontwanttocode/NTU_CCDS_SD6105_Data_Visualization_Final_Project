import * as d3 from 'd3';

import {readCSVFile} from '../utils/csv_file_reader'
import {getSeriesData} from '../utils/get_series_data'

// read csv file from data folder

const filePath = '../../data/csv/Africa_GDP_data.csv'

// load data
let africaData = await readCSVFile(filePath) // this will get an array

let africaGDPCurrentPrices = getSeriesData(africaData, 'GDP in current prices (millions of US dollars)', 'Africa')

drawAnimationBarPlot(africaGDPCurrentPrices)


function drawAnimationBarPlot(data) {
  // set the dimensions and margins of the graph
  let margin = {top: 100, right: 200, bottom: 100, left: 100},
    width = 750 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
  let svg = d3.select("#basic_bar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
  let x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(function (d) {
      return d.Year;
    }))
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(0,10)")
    .style("text-anchor", "end");

// Add Y axis
  let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Value)])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // 添加图表标题
  d3.select("#basic_bar svg")
    .append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Yearly GDP in Current Prices");

// 绘制柱状图条形
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Year))
    .attr("width", x.bandwidth())
    .attr("fill", "#69b3a2")
    .attr("y", height) // 初始位置在底部，用于动画效果
    .attr("height", 0) // 初始高度为0
    .transition()
    .duration(800)
    .attr("y", d => y(parseFloat(d.Value)))  // 动态绑定每个条形的 y 值
    .attr("height", d => height - y(parseFloat(d.Value)));  // 动态绑定条形高度

  // 添加图例
  let legend = svg.append("g")
    .attr("transform", "translate(" + (width + 20) + "," + (height / 2) + ")");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", -10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#69b3a2");

  legend.append("text")
    .attr("x", 30)
    .attr("y", 5)
    .attr("text-anchor", "start")
    .style("font-size", "14px")
    .text("GDP in millions USD");
}

