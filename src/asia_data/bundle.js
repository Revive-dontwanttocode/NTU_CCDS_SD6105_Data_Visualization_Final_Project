import * as d3 from 'd3';

export function initStackedBarChartAsia() {
  // readout json data
  fetch('../../data/asia_region_gdp.json')
    .then((response) => response.json())
    .then((data) => {
        const gdpData = data;

        // set the dimensions and margins of the graph
        const margin = {top: 150, right: 150, bottom: 150, left: 150},
          width = 1500 - margin.left - margin.right,
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

export function initTop20Barchart() {
  const margin = {top: 100, right: 100, bottom: 100, left: 100};
  const width = 1000 - margin.left - margin.right;
  const height = 900 - margin.top - margin.bottom;

  const svg = d3.select("#region_top20_barchart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


  fetch('../../data/asia_country_gdp.json')
    .then((response) => response.json())
    .then((data) => {

      let yearIndex = 0; // Start from the first year
      const years = Array.from(new Set(data.map(d => d.Year))).sort();
      // Create color scale for countries
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      function update(year) {
        // Filter top 10 GDP countries for the given year
        const top10Data = data.filter(d => d.Year === year)
          .sort((a, b) => b.Value - a.Value)
          .slice(0, 10);

        // Update scales
        const x = d3.scaleLinear()
          .domain([0, d3.max(top10Data, d => d.Value)])
          .range([0, width]);
        const y = d3.scaleBand()
          .domain(top10Data.map(d => d.Country))
          .range([0, height])
          .padding(0.1);

        // Bind data to bars
        const bars = svg.selectAll(".bar")
          .data(top10Data, d => d.Country);

        // Enter new bars
        bars.enter().append("rect")
          .attr("class", "bar")
          .attr("x", 0)
          .attr("y", d => y(d.Country))
          .attr("width", d => x(d.Value))
          .attr("height", y.bandwidth())
          .style("fill", d => color(d.Country))
          .merge(bars) // Merge new and existing bars
          .transition()
          .duration(1000) // Smooth transition duration
          .attr("y", d => y(d.Country)) // Update position
          .attr("width", d => x(d.Value)); // Update width based on GDP

        // Update text labels for GDP values
        const labels = svg.selectAll(".label")
          .data(top10Data, d => d.Country);

        labels.enter().append("text")
          .attr("class", "label")
          .attr("x", d => x(d.Value) - 5)
          .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
          .attr("text-anchor", "end")
          .text(d => d.Value)
          .merge(labels)
          .transition()
          .duration(1000)
          .attr("x", d => x(d.Value) - 5)
          .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
          .text(d => d.Value);

        // Exit old bars and labels
        bars.exit().remove();
        labels.exit().remove();

        // Update the year label
        svg.selectAll(".year").remove();
        svg.append("text")
          .attr("class", "year")
          .attr("x", width - 50)
          .attr("y", height - 20)
          .style("font-size", "40px")
          .style("fill", "#333")
          .text(year);
      }

// Update chart every second
      d3.interval(() => {
        update(years[yearIndex]);
        yearIndex = (yearIndex + 1) % years.length; // Loop through years
      }, 1000);
    })
}

export function initTop10Barchart() {
  fetch('../../data/asia_country_gdp.json')
    .then((response) => response.json())
    .then((data) => {
      const filteredData = data.filter(d => d.Series === "GDP in current prices (millions of US dollars)");

      const margin = {top: 100, right: 100, bottom: 100, left: 100};
      const width = 1500 - margin.left - margin.right;
      const height = 900 - margin.top - margin.bottom;

      const svg = d3.select("#region_top10_barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // 添加标题
      svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("Top 15 Asia Countries/Regions by GDP from 1995 to 2021");

      // 动态年份显示
      const yearLabel = svg.append("text")
        .attr("class", "year")
        .attr("x", width - 50)  // 将年份放在右上角
        .attr("y", margin.top)
        .attr("text-anchor", "end")
        .style("font-size", "20px")
        .style("font-weight", "bold");

      const topCountries = 15;
      const barSize = 40;


      // 数据处理，按年份分组并排序，生成 keyframes
      const groupedData = d3.group(filteredData, d => d.Year);

      const keyframes = Array.from(groupedData, ([year, yearData]) => {
        const sortedData = yearData.sort((a, b) => d3.descending(a.Value, b.Value)).slice(0, topCountries);
        return [new Date(year, 0, 1), sortedData.map(d => ({name: d.Country, value: d.Value}))];
      });

      // 定义 x 和 y 轴
      const x = d3.scaleLinear([0, d3.max(data, d => d.Value)], [margin.left, width - margin.right]);
      const y = d3.scaleBand()
        .domain(d3.range(topCountries))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

      const customColors = [
        "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00",
        "#ffff33", "#a65628", "#f781bf", "#999999", "#66c2a5",
        "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f",
      ];

      // 创建一个颜色映射，将每个国家名称映射到一个更丰富的颜色集合
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.Country)) // 设置国家名称作为颜色域
        .range(customColors); // 使用更丰富的配色方案


      // 绘制 X 轴
      const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 100).tickSizeOuter(0));

      // 绘制 Y 轴
      const yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`);

      // 动态条形图函数
      function bars(svg) {
        let bar = svg.append("g")
          .attr("fill-opacity", 0.8)
          .selectAll("rect");

        // 标签部分
        let label = svg.append("g")
          .style("font", "12px sans-serif")
          .style("font-variant-numeric", "tabular-nums")
          .attr("text-anchor", "start")
          .selectAll("text");

        return ([date, data], transition) => {
          bar = bar
            .data(data, d => d.name)
            .join(
              enter => enter.append("rect")
                .attr("fill", d => color(d.name))
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", (d, i) => y(i))
                .attr("width", d => x(d.value) - x(0)),
              update => update,
              exit => exit.transition(transition).remove()
            )
            .call(bar => bar.transition(transition)
              .attr("y", (d, i) => y(i))
              .attr("width", d => x(d.value) - x(0)));

          // 更新 X 轴
          xAxis.transition(transition).call(d3.axisBottom(x).ticks(width / 100));

          // 更新 Y 轴标签
          yAxis.transition(transition)
            .call(d3.axisLeft(y).tickFormat(i => data[i]?.name).tickSizeOuter(0));

          // 更新年份信息
          yearLabel.text(date.getFullYear());

          // 更新标签（显示国家和动态 GDP 值，分为两行）
          label = label
            .data(data, d => d.name)
            .join(
              enter => enter.append("text")
                .attr("transform", (d, i) => `translate(${x(d.value)},${y(i) + y.bandwidth() / 2})`)
                .attr("dy", "0.35em")
                .attr("x", 6)  // 与条形图末尾对齐
                .call(text => text.append("tspan")
                  .style("font-weight", "bold")
                  .attr("x", 6)
                  .attr("dy", "-0.5em")  // 上移以分两行显示
                  .text(d => d.name))
                .call(text => text.append("tspan")
                  .attr("x", 6)
                  .attr("dy", "1.2em")  // 下移显示 GDP 值
                  .text(d => d.value.toFixed(0))),
              update => update,
              exit => exit.transition(transition).remove()
            )
            .call(label => label.transition(transition)
              .attr("transform", (d, i) => `translate(${x(d.value)},${y(i) + y.bandwidth() / 2})`)
              .call(text => text.select("tspan:nth-child(2)")
                .tween("text", function (d) {
                  const i = d3.interpolateRound(this.textContent, d.value);
                  return t => this.textContent = i(t);
                })
              )
            );
        };
      }

      // 调用条形图绘制函数
      const updateBars = bars(svg);

      // 动画展示
      async function animateChart() {
        for (const keyframe of keyframes) {
          const transition = svg.transition().duration(2000).ease(d3.easeLinear);

          x.domain([0, d3.max(keyframe[1], d => d.value)]);

          updateBars(keyframe, transition);

          await transition.end();
        }
      }

      animateChart();
    })
}

export function initDensityChart() {
  fetch('../../data/asia_country_gdp.json')
    .then((response) => response.json())
    .then((data) => {
      const margin = {top: 100, right: 200, bottom: 100, left: 200};
      const width = 1000 - margin.left - margin.right;
      const height = 1000 - margin.top - margin.bottom;

      let svg = d3.select("#distribution_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // 筛选出 "GDP per capita (US dollars)" 数据
      const filteredData = data.filter(d => d.Series === "GDP per capita (US dollars)" && d.Year === 2021);

      // 创建一个颜色映射，将每个国家名称映射到一个更丰富的颜色集合
      const color = d3.scaleOrdinal()
        .domain(filteredData.map(d => d.Country)) // 设置国家名称作为颜色域
        .range(d3.schemeCategory10); // 使用更丰富的配色方案

      // Y轴：使用 scaleBand 设置国家名称
      let y = d3.scaleBand()
        .domain(filteredData.map(function(d) { return d.Country; })) // 设置 Y 轴为国家名称
        .range([0, height])
        .padding(0.1);  // 适当的间距
      svg.append("g")
        .call(d3.axisLeft(y));

      // X轴：线性比例尺，范围从GDP的最小值到最大值
      let x = d3.scaleLinear()
        .domain([d3.min(filteredData, function(d) { return +d.Value; }), d3.max(filteredData, function(d) { return +d.Value; })])
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // 绘制水平条形图
      svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.Country); }) // 确保 y 位置使用正确的比例尺
        .attr("x", x(0)) // 从0开始绘制
        .attr("width", function(d) { return x(d.Value); })
        .attr("height", y.bandwidth())
        .style("fill", function(d) { return color(d.Country); });
    })
}

export function initCountriesRadarChart() {

}
