import * as d3 from 'd3'

export function loadCSVData(filepath) {
  let csv_data = []
  d3.csv(filepath).then(data => {
    console.log(data)
    csv_data = data
  })

  return csv_data
}

export async function loadCSVDataAsync(filepath) {
  const data = await d3.csv(filepath)
  showData(data)
  return data
}

function showData(data) {
  console.log(data)
}
