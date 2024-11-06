import * as d3 from 'd3';

export function drawGroupedBarChart() {
  // 设置图表尺寸和边距
  var margin = {top: 60, right: 30, bottom: 50, left: 80},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// 创建SVG容器
  var svg = d3.select("#grouped_viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 自定义GDP数据
  var data = [
    {Series: "GDP in constant 2015 prices (millions of US dollars)", Value: 10000, Year: 2010},
    {Series: "GDP per capita (US dollars)", Value: 50000, Year: 2010},
    {Series: "GDP in constant 2015 prices (millions of US dollars)", Value: 12000, Year: 2011},
    {Series: "GDP per capita (US dollars)", Value: 51000, Year: 2011},
    {Series: "GDP in constant 2015 prices (millions of US dollars)", Value: 14000, Year: 2012},
    {Series: "GDP per capita (US dollars)", Value: 52000, Year: 2012}
  ];

// 从数据中提取唯一的Series和Year
  var subgroups = Array.from(new Set(data.map(d => d.Series)));
  var groups = Array.from(new Set(data.map(d => d.Year)));

// X轴：基于年份分组
  var x = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding([0.2]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

// Y轴：基于值设置
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Value) * 1.1])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "12px");

// 设置子组的位置比例尺
  var xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

// 颜色比例
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(["#ff8c00", "#4682b4", "#32cd32", "#d2691e"]);

// 提示框
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// 绘制带有动态效果和hover的柱状图
  svg.append("g")
    .selectAll("g")
    .data(data.reduce((acc, curr) => {
      // 根据年份分组，每组包含该年份的所有系列数据
      let found = acc.find(d => d.Year === curr.Year);
      if (!found) acc.push({Year: curr.Year, values: [curr]});
      else found.values.push(curr);
      return acc;
    }, []))
    .enter()
    .append("g")
    .attr("transform", d => "translate(" + x(d.Year) + ",0)")
    .selectAll("rect")
    .data(d => d.values)
    .enter().append("rect")
    .attr("x", d => xSubgroup(d.Series))
    .attr("y", height)
    .attr("width", xSubgroup.bandwidth())
    .attr("height", 0)
    .attr("fill", d => color(d.Series))
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(d.Series + "<br>Value: " + d.Value)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .attr("y", d => y(d.Value))
    .attr("height", d => height - y(d.Value));

// 添加图表标题
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("GDP Data Visualization by Series and Year");

// 添加图例
  var legend = svg.selectAll(".legend")
    .data(subgroups)
    .enter().append("g")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .text(d => d);
}