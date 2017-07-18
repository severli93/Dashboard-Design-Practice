const margin = {top: 20, right: 20, bottom: 40, left: 20};
// MAP SVG //
const width = d3.select(".mapDiv").node().clientWidth;
const height = d3.select(".productImgDiv").node().clientHeight;
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const mapSvg = d3.select("#mapUS").append('svg').attr("width", width).attr("height", height);
mapSvg.append('text')
  .classed('chartTitle', true)
  .text('Map')
  .attr('transform', 'translate('+width/2+','+(height-10)+')');

const projection = d3.geoAlbersUsa()
  .scale(height*1.6)
  .translate([width/2,height/2]);

const path = d3.geoPath().projection(projection);

queue()
  .defer(d3.json,"./data/us.json")
  .await(results);

function results(err,usData){
  if(err) throw error;
  console.log("USMap data!",usData);
  drawMap(mapSvg,usData,path);
}
function drawMap(mapSvg,usData){
  mapSvg.selectAll("path")
  .data(usData.features)
  .enter()
  .append('path')
  .attr('d', path);
}

// Sales SVG
// const width2 = d3.select(".salesDiv").node().clientWidth;
// const height2 = d3.select(".productImgDiv").node().clientHeight;
const salesSvg = d3.select("#salesPlot").append('svg')
  .attr("width", width)
  .attr("height", height);
const salesG = salesSvg.append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');

salesSvg.append('text')
  .classed('chartTitle', true)
  .text('Sales')
  .attr('transform', 'translate('+width/2+','+(height-10)+')');

let data = d3.range(0, 20, 1).map(d => Math.random()*200);
const scaleY = d3.scaleLinear().domain([0, data.length]).range([0, plotHeight]);
const scaleX = d3.scaleLinear().domain([0, 200]).range([0, plotWidth]);

salesG.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', 0)
  .attr('y', (d,i) => scaleY(i))
  .attr('width', d => scaleX(d))
  .attr('height', plotHeight/data.length - 3);

// Social plot
const socialSvg = d3.select('#socialPlot').append('svg')
  .attr('width', width).attr('height', height/2);
const socialG = socialSvg.append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');
const media = ['facebook', 'twitter', 'instagram'];
data = d3.range(0, 3, 1).map(i => {
    const obj = { media: media[i] };
    obj.value = 30+Math.random()*60;
    return obj;
  });
const radialScale = d3.scaleLinear().domain([0, 100]).range([0, 2*Math.PI]);
const ordScale = d3.scaleOrdinal().domain(media).range(d3.range(0, plotWidth, plotWidth/3));
const d3Arc = d3.arc().innerRadius(height/4-40).outerRadius(height/4-30).startAngle(0);
const socialMediaG = socialG.selectAll('g')
  .data(data)
  .enter()
  .append('g')
  .attr('class', d => d.media)
  .attr('transform', d => 'translate('+(ordScale(d.media)+height/4)+',0)');
socialMediaG.append('path')
  .attr('transform', 'translate(0, '+height/4+')')
  .attr('d', d => d3Arc.endAngle(radialScale(d.value))());
socialMediaG.append('image')
    .attr('xlink:href', d=> {
      if(d.media=='facebook'){return "./img/facebookIcon.svg";}
      if(d.media=='twitter'){return "./img/twitterIcon.svg";}
      if(d.media=='instagram'){return "./img/instagramIcon.svg";}
    })
    .attr('x',-height/8)
    .attr('y',height/8)
    .attr('height',100)
    .attr('width',100);


// Activity plot
const activitySvg = d3.select("#activityPlot").append('svg')
  .attr("width", d3.select("#activityPlot").node().clientWidth)
  .attr("height", height);
const activityG = activitySvg.append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');
data = d3.range(0, 3, 1).map(i => {
    const obj = { media: media[i] };
    // assuming chart shows data for 180 days
    obj.values = d3.range(0,180,1).map(d => Math.random()*100);
    return obj;
  });

const scaleXActivity = d3.scaleLinear().domain([0, 180]).range([0, d3.select("#activityPlot").node().clientWidth - margin.left - margin.right]);
const scaleYActivity = d3.scaleLinear().domain([0, 100]).range([0, plotHeight/3]);

const line = d3.line().x((d,i) => scaleXActivity(i)).y(d => scaleYActivity(d));
const mediaG = activityG.selectAll('g')
  .data(data)
  .enter()
  .append('g')
  .attr('class', d => d.media)
  .attr('transform', (d, i) => 'translate(0,'+i*(plotHeight/3)+')');

mediaG.append('path')
  .attr('class', 'activity-timeseries')
  .datum(d => d.values)
  .attr('d', line);
