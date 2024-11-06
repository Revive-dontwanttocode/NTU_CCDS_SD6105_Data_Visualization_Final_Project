// get series data

export function getSeriesData(data, seriesName, regionName) {
  let seriesData = []

  // get series data by series name
  seriesData = data
    .filter(item => item.Series === seriesName && item["Region/Country/Area"] === regionName)
    .map(item => ({
      Year: item.Year,
      Value: parseFloat(item.Value)
    }));

  return seriesData
} // get series data