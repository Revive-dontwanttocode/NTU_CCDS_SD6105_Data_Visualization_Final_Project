import * as d3 from 'd3';

export function initStackedBarChartAsia() {
  // readout json data
  fetch('../../data/asia_region_gdp.json')
    .then((response) => response.json())
    .then((data) => {
        const gdpData = data;

        // set the dimensions and margins of the graph
        const margin = {top: 150, right: 150, bottom: 150, left: 150},
          width = 1000 - margin.left - margin.right,
          height = 850 - margin.top - margin.bottom;


        // 过滤出 "GDP in current prices" 数据
        const filteredData = gdpData.filter(d => d.Series === "GDP in current prices (millions of US dollars)");


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
          .attr("class", d => "myRect " + d.key)  // Add a class to each subgroup: their name
          .selectAll("rect")
          .data(d => d)
          .join("rect")
          .attr("x", d => x(d.data.Year))  // Use `Year` for x-position
          .attr("y", d => y(d[1]))  // Top of the rectangle
          .attr("height", d => y(d[0]) - y(d[1]))  // Height based on difference
          .attr("width", x.bandwidth())
          .attr("stroke", "grey")
          .on("mouseover", function (event, d) {
            // 获取当前悬停的分组名称
            const subGroupName = d3.select(this.parentNode).datum().key;
            // 将所有条形图的透明度降低
            d3.selectAll(".myRect").style("opacity", 0.2);
            // 高亮当前分组的条形图
            d3.selectAll("." + subGroupName).style("opacity", 1);
            // 显示tooltip并更新内容
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Region: ${subGroupName}<br>GDP: $${(d[1] - d[0]).toLocaleString()}M<br>Year: ${d.data.Year}`)
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
      }
    );
}
