import * as d3 from 'd3';
import {geoRobinson} from "d3-geo-projection";

// 初始化 SVG 和地图
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// 添加标题
svg.append("text")
  .attr("x", width / 2)
  .attr("y", 30)  // 标题的位置
  .attr("text-anchor", "middle")
  .attr("class", "title")
  .style("font-size", "24px")
  .style("font-weight", "bold")
  .text("World Map GDP Visualization (2021)");  // 标题内容

var path = d3.geoPath();
var projection = geoRobinson()
  .scale(150)  // 设置缩放比例
  .translate([width / 2, height / 2]);  // 将投影中心平移到画布中心

// 使用 JavaScript Map 存储 GDP 数据和颜色比例尺
var gdpData = new Map();
var colorScale = d3.scaleSequential(function (value) {
  return d3.interpolatePurples(0.4 + 0.7 * (value / 2000000)); // 自定义颜色比例
});

// 使用 Promise.all 加载外部数据和地图文件
Promise.all([
  // 使用带有 ISO 3166-1 Alpha-3 代码的地图 GeoJSON 文件
  d3.json("../../data/geoJson.json"), // 替换为实际文件路径
  d3.json("../../data/gdp_2021_with_code.json") // 替换为 GDP 数据的文件路径
]).then(function ([topo, gdpJson]) {
  // 将 GDP 数据存储到 Map 中，使用 Alpha-3 代码作为键
  gdpJson.forEach(function (d) {
    gdpData.set(d.Code, +d.Value); // 使用 GDP 数据中的 "Code" 字段作为键
  });

  // 设置 tooltip 提示
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // 绘制地图
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", function (d) {
      // 使用三字母代码 d.id 进行匹配
      var gdp = gdpData.get(d.id) || 0;
      return colorScale(gdp);
    })
    .style("stroke", "#4b0082") // 设置轮廓颜色为深紫色
    .style("stroke-width", "0.5px") // 设置轮廓宽度
    .style("opacity", .8)
    .on("mouseover", function(event, d) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5);
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("Country: " + d.properties.name + "<br>GDP: " + (gdpData.get(d.id) || "N/A"))
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseleave", function(d) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8);
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent");
      tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    });


  // 添加图例
  var legendWidth = 300,
    legendHeight = 10;

  // 创建图例的渐变
  var defs = svg.append("defs");
  var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
    .data([
      {offset: "0%", color: d3.interpolatePurples(0.3)}, // 设置较深的浅紫色
      {offset: "50%", color: d3.interpolatePurples(0.65)},
      {offset: "100%", color: d3.interpolatePurples(1)}
    ])
    .enter().append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  // 将图例添加到 SVG
  svg.append("rect")
    .attr("x", width / 2 - legendWidth / 2)
    .attr("y", height - 30)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient)");

  // 添加图例的文本
  svg.append("text")
    .attr("class", "legend-text")
    .attr("x", width / 2 - legendWidth / 2)
    .attr("y", height - 35)
    .attr("dy", "-0.5em")
    .style("text-anchor", "middle")
    .text("Low GDP");

  svg.append("text")
    .attr("class", "legend-text")
    .attr("x", width / 2 + legendWidth / 2)
    .attr("y", height - 35)
    .attr("dy", "-0.5em")
    .style("text-anchor", "middle")
    .text("High GDP");

}).catch(function (error) {
  console.error('Error loading files:', error);
});
