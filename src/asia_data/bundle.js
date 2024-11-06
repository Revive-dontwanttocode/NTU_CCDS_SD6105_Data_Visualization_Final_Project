import * as d3 from 'd3';

export function initStackedBarChartAsia() {
  // readout json data
  fetch('../../data/asia_region_gdp.json')
    .then((response) => response.json())
    .then((data) => {
        const gdpData = data;

        // set the dimensions and margins of the graph
        const margin = {top: 150, right: 150, bottom: 150, left: 150},
          width = 1100 - margin.left - margin.right,
          height = 850 - margin.top - margin.bottom;


        // 过滤出 "GDP in current prices" 数据
        const filteredData = gdpData.filter(d => d.Series === "GDP in current prices (millions of US dollars)" && d.Region !== "Asia");


        // 数据转换为堆叠格式
        const regions = Array.from(new Set(filteredData.map(d => d.Region)));
        const years = Array.from(new Set(filteredData.map(d => d.Year))).sort();

        const stackedData = years.map(year => {
          const yearData = {Year: year};
          regions.forEach(region => {
            const regionData = filteredData.find(d => d.Year === year && d.Region === region);
            yearData[region] = regionData ? regionData.Value : 0;
          });
          return yearData;
        });

        console.log('=============> stackedData:', stackedData);

        // 创建SVG容器
        const svg = d3.select("#region_stacked_barchart")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis (year)
        const x = d3.scaleBand()
          .domain(years)  // Use `years` here to ensure unique years in order
          .range([0, width])
          .padding(0.1);

        svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).tickFormat(d3.format("d")));  // Format as integer for Year

        // Add Y axis (GDP)
        const y = d3.scaleLinear()
          .domain([0, d3.max(stackedData, d => d3.sum(regions, r => d[r]))])
          .range([height, 0]);

        svg.append("g")
          .call(d3.axisLeft(y));

        // 添加 X 轴标签
        svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)  // 居中放置
          .attr("y", height + margin.bottom - 100)  // 放在 X 轴下方
          .text("Year");  // X 轴标签文字

        // 添加 Y 轴标签
        svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "middle")
          .attr("x", -height / 2)  // 垂直居中
          .attr("y", -margin.left + 50)  // 放在 Y 轴左侧
          .attr("transform", "rotate(-90)")  // 旋转文本以垂直显示
          .text("GDP in Current Prices (Millions of US Dollars)");  // Y 轴标签文字

        // 添加图表标题
        svg.append("text")
          .attr("class", "chart-title")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)  // 居中放置
          .attr("y", -margin.top / 2)  // 放在图表顶部上方
          .style("font-size", "18px")  // 字体大小
          .style("font-weight", "bold")  // 粗体显示
          .text("Asia Regional GDP Over Time");  // 图表标题文字

        // 颜色比例
        const color = d3.scaleOrdinal()
          .domain(regions)
          .range(d3.schemeSet2);

        // 堆叠布局
        const stack = d3.stack().keys(regions);
        const series = stack(stackedData);  // `series` now contains the properly stacked data


        // 创建提示框
        const tooltip = d3.select("#tooltip");

        // Show the bars
        svg.append("g")
          .selectAll("g")
          // Enter in the stacked series data (each `g` represents a region)
          .data(series)
          .join("g")
          .attr("fill", d => color(d.key))  // Apply color for each region
          .attr("class", d => "myRect " + d.key.replace(/\s+/g, "_"))  // 替换空格为下划线
          .selectAll("rect")
          .data(d => d)
          .join("rect")
          .attr("x", d => x(d.data.Year))  // Use `Year` for x-position
          .attr("y", d => y(d[1]))  // Top of the rectangle
          .attr("height", d => y(d[0]) - y(d[1]))  // Height based on difference
          .attr("width", x.bandwidth())
          .attr("stroke", "grey")
          .on("mouseover", function (event, d) {
            // 获取当前悬停的分组名称，并替换空格为下划线
            const subGroupName = d3.select(this.parentNode).datum().key.replace(/\s+/g, "_");

            // 将所有条形图的透明度降低
            d3.selectAll(".myRect").style("opacity", 0.2);

            // 高亮当前悬停的分组
            d3.selectAll("." + subGroupName).style("opacity", 1);

            // 显示tooltip并更新内容
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Region: ${d3.select(this.parentNode).datum().key}<br>GDP: $${(d[1] - d[0]).toLocaleString()}M<br>Year: ${d.data.Year}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mousemove", function (event) {
            // 更新tooltip的位置
            tooltip.style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseleave", function () {
            // 恢复所有条形图的透明度
            d3.selectAll(".myRect").style("opacity", 1);

            // 隐藏tooltip
            tooltip.transition().duration(500).style("opacity", 0);
          });

        // 创建图例容器
        const legend = svg.append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${width + 25}, 0)`);  // 将图例放在图表的右侧

        // 为每个区域创建图例条目
        regions.forEach((region, i) => {
          const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);  // 每个条目在垂直方向上有一定间距

          // 添加颜色方块
          legendRow.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(region));

          // 添加文本标签
          legendRow.append("text")
            .attr("x", 24)  // 文本标签稍微向右偏移
            .attr("y", 14)  // 调整文本垂直位置以对齐方块
            .text(region)
            .style("font-size", "12px")
            .style("alignment-baseline", "middle");
        });
      }
    );
}
