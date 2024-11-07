import * as d3 from 'd3';
import {RadarChart} from './radarChart';

export function initStackedBarChartAsia() {
  // readout json data
  fetch('../../data/asia_region_gdp.json')
    .then((response) => response.json())
    .then((data) => {
        const gdpData = data;

        // set the dimensions and margins of the graph
        const margin = {top: 300, right: 300, bottom: 300, left: 300},
          width = 1650 - margin.left - margin.right,
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

// export function initTop20Barchart() {
//   const margin = {top: 100, right: 100, bottom: 100, left: 100};
//   const width = 1000 - margin.left - margin.right;
//   const height = 900 - margin.top - margin.bottom;
//
//   const svg = d3.select("#region_top20_barchart").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);
//
//
//   fetch('../../data/asia_country_gdp.json')
//     .then((response) => response.json())
//     .then((data) => {
//
//       let yearIndex = 0; // Start from the first year
//       const years = Array.from(new Set(data.map(d => d.Year))).sort();
//       // Create color scale for countries
//       const color = d3.scaleOrdinal(d3.schemeCategory10);
//
//       function update(year) {
//         // Filter top 10 GDP countries for the given year
//         const top10Data = data.filter(d => d.Year === year)
//           .sort((a, b) => b.Value - a.Value)
//           .slice(0, 10);
//
//         // Update scales
//         const x = d3.scaleLinear()
//           .domain([0, d3.max(top10Data, d => d.Value)])
//           .range([0, width]);
//         const y = d3.scaleBand()
//           .domain(top10Data.map(d => d.Country))
//           .range([0, height])
//           .padding(0.1);
//
//         // Bind data to bars
//         const bars = svg.selectAll(".bar")
//           .data(top10Data, d => d.Country);
//
//         // Enter new bars
//         bars.enter().append("rect")
//           .attr("class", "bar")
//           .attr("x", 0)
//           .attr("y", d => y(d.Country))
//           .attr("width", d => x(d.Value))
//           .attr("height", y.bandwidth())
//           .style("fill", d => color(d.Country))
//           .merge(bars) // Merge new and existing bars
//           .transition()
//           .duration(1000) // Smooth transition duration
//           .attr("y", d => y(d.Country)) // Update position
//           .attr("width", d => x(d.Value)); // Update width based on GDP
//
//         // Update text labels for GDP values
//         const labels = svg.selectAll(".label")
//           .data(top10Data, d => d.Country);
//
//         labels.enter().append("text")
//           .attr("class", "label")
//           .attr("x", d => x(d.Value) - 5)
//           .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
//           .attr("text-anchor", "end")
//           .text(d => d.Value)
//           .merge(labels)
//           .transition()
//           .duration(1000)
//           .attr("x", d => x(d.Value) - 5)
//           .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 5)
//           .text(d => d.Value);
//
//         // Exit old bars and labels
//         bars.exit().remove();
//         labels.exit().remove();
//
//         // Update the year label
//         svg.selectAll(".year").remove();
//         svg.append("text")
//           .attr("class", "year")
//           .attr("x", width - 50)
//           .attr("y", height - 20)
//           .style("font-size", "40px")
//           .style("fill", "#333")
//           .text(year);
//       }
//
// // Update chart every second
//       d3.interval(() => {
//         update(years[yearIndex]);
//         yearIndex = (yearIndex + 1) % years.length; // Loop through years
//       }, 1000);
//     })
// }

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
      const width = 1600 - margin.left - margin.right;
      const height = 750 - margin.top - margin.bottom;

      const visibleCountriesCount = 15; // 每页显示的国家数量
      let currentStartIndex = 0; // 当前可见的国家起始索引

      let svg = d3.select("#distribution_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // 添加标题
      svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)  // 居中对齐
        .attr("y", -margin.top / 2) // 将标题放在图表顶部上方
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("GDP per capita (US dollars) in Year 2021");

      // 筛选出 "GDP per capita (US dollars)" 数据
      const filteredData = data.filter(d => d.Series === "GDP per capita (US dollars)" && d.Year === 2021);

      // 创建一个颜色映射，将每个国家名称映射到一个更丰富的颜色集合
      const color = d3.scaleOrdinal()
        .domain(filteredData.map(d => d.Country)) // 设置国家名称作为颜色域
        .range(d3.schemeCategory10); // 使用更丰富的配色方案

      // Y轴：线性比例尺，范围从GDP的最小值到最大值
      let y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function (d) {
          return +d.Value;
        })])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // 创建 tooltip 容器
      const tooltip = d3.select("#distribution_chart")
        .append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("opacity", 0)
        .style("pointer-events", "none");

      // 创建渲染函数，绘制当前范围的国家数据
      function render() {
        // 获取当前可见的国家数据
        const visibleData = filteredData.slice(currentStartIndex, currentStartIndex + visibleCountriesCount);

        // X轴：使用 scaleBand 设置国家名称
        const x = d3.scaleBand()
          .domain(visibleData.map(d => d.Country))
          .range([0, width])
          .padding(0.4);

        // 清除之前的X轴和条形图
        svg.selectAll(".x-axis").remove();
        svg.selectAll("rect").remove();

        // 绘制X轴
        svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x));

        // 绘制垂直条形图并添加 hover 效果
        svg.selectAll("rect")
          .data(visibleData)
          .enter()
          .append("rect")
          .attr("x", d => x(d.Country))
          .attr("y", d => y(d.Value))
          .attr("height", d => height - y(d.Value)) // 根据GDP值计算高度
          .attr("width", x.bandwidth())
          .style("fill", d => color(d.Country))
          .on("mouseover", function (event, d) {
            // 显示 tooltip 并设置内容
            tooltip.style("opacity", 1)
              .html(`Country/Region: ${d.Country}<br>GDP per Capita: $${d.Value.toLocaleString()} USD`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");

            // 高亮当前条形图，加深颜色
            d3.select(this).style("opacity", 1).style("stroke", "black").style("stroke-width", 2);

            // 将其他条形图的透明度降低
            svg.selectAll("rect").filter(e => e !== d).style("opacity", 0.3);
          })
          .on("mousemove", function (event) {
            // 更新 tooltip 位置
            tooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function () {
            // 隐藏 tooltip
            tooltip.style("opacity", 0);

            // 恢复所有条形图的透明度和样式
            svg.selectAll("rect")
              .style("opacity", 1)
              .style("stroke", "none");
          });
      }

      // 初始化渲染
      render();

      // 添加滑动功能按钮
      d3.select("#distribution_chart")
        .append("button")
        .text("Previous Page")
        .on("click", () => {
          if (currentStartIndex > 0) {
            currentStartIndex -= visibleCountriesCount;
            render();
          }
        });

      d3.select("#distribution_chart")
        .append("button")
        .text("Next Page")
        .on("click", () => {
          if (currentStartIndex + visibleCountriesCount < filteredData.length) {
            currentStartIndex += visibleCountriesCount;
            render();
          }
        });
    })
}

export function initCountriesRadarChart() {
  fetch('../../data/asia_country_gdp.json')
    .then((response) => response.json())
    .then((data) => {
      const filteredData = data.filter(d => (d.Country === 'China' || d.Country === 'Republic of Korea' || d.Country === 'Japan' || d.Country === 'India' || d.Country === 'Singapore') && d.Year === 2021);

      const margin = {top: 100, right: 200, bottom: 100, left: 200};
      const width = 1000 - margin.left - margin.right;
      const height = 1000 - margin.top - margin.bottom;

      function transformData(data) {
        // 定义雷达图的四个固定方向
        const requiredSeries = [
          "GDP in constant 2015 prices (millions of US dollars)",
          "GDP real rates of growth (percent)",
          "GDP in current prices (millions of US dollars)",
          "GDP per capita (US dollars)"
        ];

        // 计算每个方向的最小值和最大值，用于归一化处理
        let minMaxValues = {};
        requiredSeries.forEach(series => {
          const seriesValues = data
            .filter(d => d.Series === series)
            .map(d => +d.Value);
          minMaxValues[series] = {
            min: Math.min(...seriesValues),
            max: Math.max(...seriesValues)
          };
        });

        // 按国家分组，并进行归一化处理
        let radarData = [];
        let groupedData = d3.group(data, d => d.Country);

        groupedData.forEach((values, country) => {
          // 创建一个 Map 来存储当前国家的数据，以便查找特定 Series 的值
          let seriesMap = new Map(values.map(d => [d.Series, d.Value]));

          // 构造当前国家的数据结构，确保包含四个固定的 Series，并进行归一化处理
          let countryData = requiredSeries.map(series => {
            const rawValue = seriesMap.get(series) || 0; // 原始值（如果没有值则填充 0）
            const {min, max} = minMaxValues[series]; // 获取该 Series 的最小值和最大值
            const normalizedValue = (rawValue - min) / (max - min); // 归一化

            return {
              axis: series,
              value: normalizedValue
            };
          });

          // 将国家名称和数据存入 radarData
          radarData.push({country: country, data: countryData});
        });

        return radarData;
      }


      // 数据转换
      let transformedData = transformData(filteredData);

      // 定义颜色比例尺
      let color = d3.scaleOrdinal()
        .domain(transformedData.map(d => d.country))
        .range(d3.schemeCategory10);

      // 设置雷达图选项
      let radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: d3.max(transformedData, d => d3.max(d.data, v => v.value)), // 访问 d.data 中的 value
        levels: 5,
        roundStrokes: true,
        color: color
      };

      // 绘制雷达图
      RadarChart("#countries_radar_chart", transformedData, radarChartOptions);
    })
}

export function initBubbleChart() {
  let margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = 1600 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  let svg = d3.select("#gdp_bubble_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function updateChart(year) {
    // load data
    fetch('../../data/asia_country_gdp.json')
      .then(response => response.json())
      .then((data) => {
        // Filter data for the specific year
        let filteredData = data.filter(d => d.Year === +year);

        // remove previous chart
        svg.selectAll("*").remove();

        // X-axis: GDP real rates of growth (percent) with a power scale for more detail at smaller values
        let x = d3.scalePow()
          .exponent(0.5) // Square root scale for more compression on larger values
          .domain([
            d3.min(filteredData, d => d.Series === "GDP real rates of growth (percent)" ? +d.Value : 0),
            d3.max(filteredData, d => d.Series === "GDP real rates of growth (percent)" ? +d.Value : 0) * 1.1
          ])
          .range([0, width]);

        // Add the X-axis
        const xAxis = svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(5)); // Adjusted to increase tick spacing

        // X-axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", width)
          .attr("y", height + 50)
          .text("GDP real rates of growth (percent)");

        // Y-axis: GDP in constant 2015 prices (millions of US dollars)
        let y = d3.scaleLinear()
          .domain([0, d3.max(filteredData, d => d.Series === "GDP in constant 2015 prices (millions of US dollars)" ? +d.Value : 0) * 1.1])
          .range([height, 0]);

        // Position Y-axis to start from where X=0 on the X-axis
        const yAxis = svg.append("g")
          .attr("transform", "translate(" + x(0) + ",0)")
          .call(d3.axisLeft(y).ticks(10));

        // Y-axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", 0)
          .attr("y", -20)
          .text("GDP in constant 2015 prices (millions of US dollars)")
          .attr("text-anchor", "start");

        // Define the zoomed function before applying it
        function zoomed(event) {
          // Rescale the x-axis range based on zoom
          const newX = event.transform.rescaleX(x);
          // Update X-axis
          xAxis.call(d3.axisBottom(newX).ticks(5));
          // Reposition Y-axis to keep it centered at x = 0
          yAxis.attr("transform", `translate(${newX(0)}, 0)`);
          // Update bubbles' position on X-axis based on zoom
          bubbles.attr("cx", d => newX(d.growthRate));
        }

        // Initialize the zoom behavior
        const zoom = d3.zoom()
          .scaleExtent([1, 10]) // Set zoom limits
          .extent([[0, 0], [width, height]])
          .on("zoom", zoomed);

        // Bubble size scale: GDP per capita (US dollars)
        var z = d3.scaleSqrt()
          .domain([0, d3.max(filteredData, d => d.Series === "GDP per capita (US dollars)" ? +d.Value : 0)])
          .range([2, 30]);

        // Color scale for each country
        var color = d3.scaleOrdinal(d3.schemeSet1);

        // Filter data for each series
        const growthRateData = filteredData.filter(d => d.Series === "GDP real rates of growth (percent)");
        const gdpData = filteredData.filter(d => d.Series === "GDP in constant 2015 prices (millions of US dollars)");
        const perCapitaData = filteredData.filter(d => d.Series === "GDP per capita (US dollars)");

        // Prepare data for visualization
        const processedData = gdpData.map(d => {
          const country = d.Country;
          const gdpValue = +d.Value;
          const growthRate = growthRateData.find(g => g.Country === country)?.Value || 0;
          const perCapitaValue = perCapitaData.find(p => p.Country === country)?.Value || 0;
          return {country, gdpValue, growthRate, perCapitaValue};
        });

        // Tooltip
        var tooltip = d3.select("#gdp_bubble_chart")
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")
          .style("background-color", "black")
          .style("border-radius", "5px")
          .style("padding", "10px")
          .style("color", "white");

        var showTooltip = function (event, d) {
          tooltip.transition().duration(200);
          tooltip
            .style("opacity", 1)
            .html("Country: " + d.country + "<br>GDP: " + d.gdpValue + "<br>Per Capita: " + d.perCapitaValue + "<br>Growth Rate: " + d.growthRate)
            .style("left", (event.pageX + 10) + "px")  // Offset tooltip to the right
            .style("top", (event.pageY - 30) + "px");  // Offset tooltip slightly upwards
        };

        var moveTooltip = function (event) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        };

        var hideTooltip = function () {
          tooltip.transition().duration(200).style("opacity", 0);
        };

        // Plot bubbles
        const bubbles = svg.append('g')
          .selectAll("circle")
          .data(processedData)
          .enter()
          .append("circle")
          .attr("cx", d => x(d.growthRate))
          .attr("cy", d => y(d.gdpValue))
          .attr("r", d => Math.max(0, z(d.perCapitaValue) || 0)) // Ensure non-negative radius
          .style("fill", d => color(d.country))
          .style("opacity", 0.7) // Slight transparency to improve visibility
          .on("mouseover", (event, d) => showTooltip(event, d))
          .on("mousemove", (event) => moveTooltip(event))
          .on("mouseleave", hideTooltip);

        // Add bubble size legend
        const legendSizes = [100, 1_000, 10_000, 100_000]; // Sample values for GDP per capita
        const legendX = width + 30;
        const legendY = height - 30;

        // Create the circles in the legend
        svg.selectAll("legend")
          .data(legendSizes)
          .enter()
          .append("circle")
          .attr("cx", legendX)
          .attr("cy", legendY) // Set the same cy for all circles to align them at the bottom
          .attr("r", d => z(d) * 1.5) // Increase the radius to make them larger
          .style("fill", "none")
          .attr("stroke", "black");

        // Create labels for each circle
        svg.selectAll("legend-label")
          .data(legendSizes)
          .enter()
          .append("text")
          .attr("x", legendX + 35) // Move text further right to match larger circles
          .attr("y", d => legendY - z(d) * 1.5) // Align labels with the top of each circle
          .text(d => d.toLocaleString())
          .attr("alignment-baseline", "middle")
          .style("font-size", "12px"); // Larger font size for labels

        // Add legend title
        svg.append("text")
          .attr("x", legendX)
          .attr("y", legendY + 40) // Position the title slightly below the largest circle
          .style("font-size", "14px") // Larger font size for the title
          .style("font-weight", "bold")
          .text("GDP per capita (US dollars)");

        // add y-axis label
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", 0)
          .attr("y", -20)
          .text("GDP in constant 2015 prices (millions of US dollars)")
          .attr("text-anchor", "start");

        // Apply zoom to the SVG
        d3.select("#gdp_bubble_chart svg").call(zoom);  // Enable zoom on the whole SVG
      });
  }

  // Listen for year selection changes
  d3.select("#yearSelect").on("change", function () {
    const selectedYear = d3.select(this).property("value");
    // add imitated loading time
    setTimeout(() => updateChart(selectedYear), 500);
  });
  updateChart(2021)
}

export function initGroupedBarChart() {
  // Set up the SVG and margins
  const margin = {top: 100, right: 200, bottom: 100, left: 200};
  const width = 1600 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  // Create the SVG element
  const svg = d3.select("#gdp_grouped_bar_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // 添加图表标题
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("GDP in Current Prices by Region and Year");


  // Load the data
  d3.json("../../data/asia_region_gdp.json").then(function (data) {
    // Filter data to only include "GDP in current prices" series
    var filteredData = data.filter(d => d.Series === "GDP in current prices (millions of US dollars)");

    // List of regions
    var regions = Array.from(new Set(filteredData.map(d => d.Region)));

    // List of years
    var years = Array.from(new Set(filteredData.map(d => d.Year)));

    // X axis: scale and draw
    var x = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding([0.2]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(0))
      .append("text")
      .attr("y", 40)
      .attr("x", width / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", "14px")
      .text("Year");

    // Y axis: scale and draw
    var y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.Value)])
      .nice()
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -100)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", "14px")
      .text("GDP in current prices (millions of US dollars)");


    // Color scale for regions
    var color = d3.scaleOrdinal()
      .domain(regions)
      .range(d3.schemeSet2);

    // Grouped bars
    var xSubgroup = d3.scaleBand()
      .domain(regions)
      .range([0, x.bandwidth()])
      .padding([0.05]);

    // 创建黑底悬停提示框
    var tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background-color", "black")
      .style("color", "white")
      .style("border", "solid 1px white")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("display", "none");

    // 显示条形图
    svg.append("g")
      .selectAll("g")
      .data(filteredData)
      .enter()
      .append("g")
      .attr("transform", d => "translate(" + x(d.Year) + ",0)")
      .selectAll("rect")
      .data(d => regions.map(region => ({
        region: region,
        value: filteredData.find(item => item.Year === d.Year && item.Region === region)?.Value || 0
      })))
      .enter()
      .append("rect")
      .attr("x", d => xSubgroup(d.region))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.region))
      .attr("class", d => "bar-" + d.region.replace(/\s+/g, "-"))
      .on("mouseover", function (event, d) {
        tooltip.style("display", "inline");
        tooltip.html("Region: " + d.region + "<br>GDP: " + d.value.toLocaleString() + " Million USD")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");

        // 淡化所有条形图，突出显示当前条形图所属的区域
        svg.selectAll("rect")
          .style("opacity", 0.2);
        svg.selectAll(".bar-" + d.region.replace(/\s+/g, "-"))
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseleave", function () {
        tooltip.style("display", "none");

        // 恢复所有条形图的透明度
        svg.selectAll("rect")
          .style("opacity", 1);
      });

    // Add legend
    var legend = svg.append("g")
      .attr("transform", "translate(" + (width + 20) + ",0)");

    regions.forEach((region, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color(region));

      legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 9)
        .text(region)
        .attr("text-anchor", "start")
        .style("alignment-baseline", "middle");
    });
  });
}

export function initTop15PerBarchart() {
  fetch('../../data/asia_country_gdp.json')
    .then((response) => response.json())
    .then((data) => {
      const filteredData = data.filter(d => d.Series === "GDP per capita (US dollars)");

      const margin = {top: 100, right: 100, bottom: 100, left: 100};
      const width = 1500 - margin.left - margin.right;
      const height = 900 - margin.top - margin.bottom;

      const svg = d3.select("#top15_countries_gdp_per_capita").append("svg")
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
        .text("Top 15 Asia Countries/Regions by GDP per capita(US Dollars) from 1995 to 2021");

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

export function initTop15GDPRateBarchart() {
  fetch('../../data/asia_country_gdp.json')
    .then((response) => response.json())
    .then((data) => {
      const filteredData = data.filter(d => d.Series === "GDP real rates of growth (percent)");

      const margin = {top: 100, right: 100, bottom: 100, left: 100};
      const width = 1500 - margin.left - margin.right;
      const height = 900 - margin.top - margin.bottom;

      const svg = d3.select("#top15_countries_gdp_rate").append("svg")
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
        .text("Top 15 Asia Countries/Regions by GDP real rates of growth (percent) from 1995 to 2021");

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

      // 创建一个颜色映射，将每个国家名称映射到一个更丰富的颜色集合
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.Country)) // 设置国家名称作为颜色域
        .range( d3.schemeSet1 ); // 使用更丰富的配色方案


      // 绘制 X 轴
      const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 100).tickSizeOuter(0));

      // 绘制 Y 轴
      const yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`);

      // add x label in the middle
      svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .text("GDP real rates of growth (percent)")
        .attr("text-anchor", "middle");

      // add Y label vertically
      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)  // 垂直居中
        .attr("y", -margin.left + 75)  // 放在 Y 轴左侧
        .attr("transform", "rotate(-90)")  // 旋转文本以垂直显示
        .text("Top15 Countries");  // Y 轴标签文字

      // 创建悬停提示框
      const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", "black")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("display", "none");

      function bars(svg) {
        let bar = svg.append("g")
          .attr("fill-opacity", 0.9)
          .selectAll("rect");


        return ([date, data], transition) => {
          bar = bar
            .data(data, d => d.name)
            .join(
              enter => enter.append("rect")
                .attr("fill", d => color(d.name))
                .attr("height", y.bandwidth())
                .attr("x", x(0) - 20)  // 从更左侧滑入
                .attr("y", (d, i) => y(i))
                .attr("width", 0)  // 初始宽度为 0
                .on("mouseover", (event, d) => {
                  d3.select(event.currentTarget)
                    .attr("stroke", "black") // 添加黑色边框高亮效果
                    .attr("stroke-width", 2);
                  tooltip.style("display", "block")
                    .html(`Country: ${d.name}<br>Growth Rate: ${d.value.toFixed(2)}%`);
                })
                .on("mousemove", (event) => {
                  tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseleave", (event) => {
                  d3.select(event.currentTarget)
                    .attr("stroke", "none"); // 移除边框高亮
                  tooltip.style("display", "none");
                })
                .call(enter => enter.transition(transition)
                  .attr("x", x(0))
                  .attr("width", d => x(d.value) - x(0))
                  .attr("fill", d => color(d.name))),

              update => update
                .transition(transition)
                .attr("x", x(0))
                .attr("y", (d, i) => y(i))
                .attr("width", d => x(d.value) - x(0))
                .attr("fill", d => d3.interpolateRgb("#ffffff", color(d.name))(Math.random() * 0.5)), // 添加颜色渐变

              exit => exit.transition().duration(500)  // 设置快速淡出的持续时间
                .style("fill-opacity", 0)  // 仅调整透明度，不移动位置
                .remove()
            );

          // 更新年份信息
          yearLabel.text(date.getFullYear());


          // 更新 X 轴
          xAxis.transition(transition).call(d3.axisBottom(x).ticks(width / 100));

          // 更新 Y 轴标签
          yAxis.transition(transition)
            .call(d3.axisLeft(y).tickFormat(i => data[i]?.name).tickSizeOuter(0));
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
