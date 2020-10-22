// Dimension constants
const WIDTH = 1000;
const HEIGHT = 600;
const PADDING = 20;

const SVGHEIGHT = HEIGHT - 2 * PADDING;
const SVGWIDTH = WIDTH - 2 * PADDING;

// URL constants
const COUNTRIES = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const EDUCATION = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

// SVG
const svg = d3.select('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

// colors
const bachelorExtent = [2.6, 75.1];
const colors = [
    '#F2F3F8', '#CED1E3',
    '#B1B5D2', '#878CBA',
    '#5B629F', '#474C7B', '#3A3E64'
];

const colorScale = d3.scaleQuantize()
    .domain(bachelorExtent)
    .range(colors);

// counties data display
async function data(){
    const path = d3.geoPath();
    const topoJSON = await fetch(COUNTRIES).then(res => res.json());
    const geoJSON = topojson.feature(topoJSON, topoJSON.objects.counties);
    const education = await fetch(EDUCATION).then(res => res.json());
    const idArray = education.map(d => d.fips);

    const usaMap = svg.selectAll('path')
        .data(geoJSON.features, d => d).enter().append('path')
        .attr('class', 'county')
        .attr('data-fips', d => d.id)
        .attr('data-education', d => getEducationValue(d))
        .attr('d', path)
        .attr('fill', d => colorScale(getEducationValue(d)))
        .on('mouseover', function(e, d) {
            const countyData = getCountyData(d);
            const educationValue = getEducationValue(d);
            const textContent = `${countyData.area_name}, ${countyData.state}: ${educationValue}%`;
            const width = 6.67 * textContent.length;
            const height = 25;
            const mouseX = e.offsetX < 760 ? e.offsetX: e.offsetX - 50 - width;
            const mouseY = e.offsetY;

            const tooltip = svg.append('g')
                .attr('id', 'tooltip')
                .attr('data-education', d3.select(this).attr('data-education'))
                .attr('transform', `translate(${mouseX + 25}, ${mouseY})`);

            const rect = tooltip.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('rx', 3)
                .attr('fill', '#F18F01')
                .attr('fill-opacity', 0.8);
            
            const text = tooltip.append('text')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', 12)
                .attr('x', width / 2)
                .attr('y', height / 2)
                .text(textContent);
        })
        .on('mouseout', function(e, d){
            d3.selectAll('#tooltip').remove();
        });
    

// utility functions for data
/**
 * Returns education value for a county
 * @param  {data} - county entry from geoJSON 
 * @return {Float} - education value of a county
 */
function getEducationValue(data){
    const countyData = getCountyData(data);
    return countyData.bachelorsOrHigher;
}

/**
 * Returns county data 
 * @param  {data} - county entry from geoJSON 
 * @return {Object} - county data
 */
function getCountyData(data){
    const id = data.id;
    const index  = idArray.indexOf(id);
    return education[index];
}
}

data();

// legend
const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('width', 250)
    .attr('height', 30)
    .attr('transform', `translate(645, 60)`);;

const rect = legend.selectAll('.legend-color')
    .data(colors).enter().append('rect')
    .attr('class', 'legend-color')
    .attr('width', 30)
    .attr('height', 10)
    .attr('x', (d, i) => i * 30)
    .attr('y', 5)
    .attr('fill', d => d);

const textMarkersArr = [...colors.map(d => colorScale.invertExtent(d)[0]), colorScale.invertExtent(colors[colors.length - 1])[1]];

const separationLines = legend.selectAll('.separation-lines')
    .data(textMarkersArr).enter().append('rect')
    .attr('class', 'separation-lines')
    .attr('width', 1)
    .attr('height', 16)
    .attr('x', (d, i) => i * 30)
    .attr('y', 5)
    .attr('fill', '#333333');

const textMarkers = legend.selectAll('.text-markers')
    .data(textMarkersArr).enter().append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'text-markers')
    .attr('font-size', 11)
    .attr('x', (d, i) => i * 30)
    .attr('y', 30)
    .text(d => `${d.toFixed(0)}%`);