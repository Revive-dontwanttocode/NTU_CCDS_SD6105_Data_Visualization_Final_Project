import {select, json, geoPath, geoMercator, geoOrthographic, geoNaturalEarth1} from 'd3';
import {feature} from 'topojson';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const projection = geoNaturalEarth1() // create a new orthographic projection
const pathGenerator = geoPath().projection(projection);

json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
  const countries = feature(data, data.objects.countries);
  const paths = svg.selectAll('path').data(countries.features);

  paths.enter().append('path') // append path element for each country
    .attr('d', d => pathGenerator(d)) // set d attribute to the path generator function
    .attr('class', 'country');

  console.log(data);
})