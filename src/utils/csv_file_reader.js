// csv file data reader
import * as d3 from 'd3';

export async function readCSVFile(filepath) {
  const data = await d3.csv(filepath)
  return data
}