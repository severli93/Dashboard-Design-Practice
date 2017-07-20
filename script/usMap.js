const margin = {top: 20, right: 20, bottom: 30, left: 20};
// MAP SVG //
const width = d3.select(".mapDiv").node().clientWidth;
const widthLeft = d3.select(".productImgDiv").node().clientWidth;
const widthRight = d3.select(".salesDiv").node().clientWidth;
const height = d3.select(".productImgDiv").node().clientHeight;
const plotWidth = width - margin.left - margin.right;
const plotWidthLeft = widthLeft - margin.left - margin.right;
const plotWidthRight = widthRight - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

let colorNow;

const mapSvg = d3.select("#mapUS")
  .append('svg')
  .classed('mapSvg',true)
  .attr("width", width)
  .attr("height", height);

mapSvg.append('text')
  .classed('chartTitle h4', true)
  .text('Map')
  .attr('transform', 'translate('+width/2+','+(height-10)+')');

const projection = d3.geoAlbersUsa()
  .scale(height*1.8)
  .translate([width/2,height/2]);

const path = d3.geoPath().projection(projection);

queue()
  .defer(d3.json,"./data/us.json")
  .await(results);

function results (err,usData) {
  if (err) throw error;
  drawMap(mapSvg,usData,path);
}
function drawMap (mapSvg,usData) {
  mapSvg.selectAll("path")
    .data(usData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('stroke','#061223')
    .on('mouseenter', mouseenterColorPop)
    .on('mouseleave', mouseleaveColorPop);
}

// Sales SVG
// const width2 = d3.select(".salesDiv").node().clientWidth;
// const height2 = d3.select(".productImgDiv").node().clientHeight;
const salesSvg = d3.select("#salesPlot").append('svg')
  .attr("width", widthRight)
  .attr("height", height);
const salesG = salesSvg.append('g')
  .classed('rectShape',true)
  .attr('transform', 'translate('+margin.left+','+margin.top+')');

salesSvg.append('text')
  .classed('chartTitle h4', true)
  .text('Sales')
  .attr('transform', 'translate('+widthRight/2+','+(height-10)+')');

let data = d3.range(0, 20, 1).map(d => Math.random()*200);
const scaleY = d3.scaleLinear().domain([0, data.length]).range([0, plotHeight]);
const scaleX = d3.scaleLinear().domain([0, 200]).range([0, plotWidthRight]);
var color = d3.scaleOrdinal(d3.schemeCategory20c);
// const colorScale = d3.scaleLiner().domain([])
salesG
  .selectAll('rectShape')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', 0)
  .attr('y', (d,i) => scaleY(i))
  .style('fill', function (d,i) { return color(i); })
  .on('mouseenter', mouseenterColorPop)
  .on('mouseleave', mouseleaveColorPop)
  .transition().duration(2500)
  .attr('width', d => scaleX(d))
  .attr('height', plotHeight/data.length - 5);

// Social plot
const socialSvg = d3.select('#socialPlot').append('svg')
  .attr('width', widthLeft).attr('height', height/2);
const socialG = socialSvg.append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');
const media = ['facebook', 'twitter', 'instagram'];
data = d3.range(0, 3, 1).map(i => {
  const obj = { media: media[i] };
  obj.value = 30+Math.random()*60;
  return obj;
});
const radialScale = d3.scaleLinear().domain([0, 100]).range([0, 360]);
const ordScale = d3.scaleOrdinal().domain(media).range(d3.range(0, widthLeft, widthLeft/3));
const d3Arc = d3.arc().innerRadius(height/4-40).outerRadius(height/4-30).startAngle(0);
const socialMediaG = socialG.selectAll('g')
  .data(data)
  .enter()
  .append('g')
  .attr('class', d => (d.media))
  .attr('transform', d => 'translate('+(ordScale(d.media)+height/8)+','+height/4+')');

function polarToCartesian (centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}
function describeArc (x, y, radius, startAngle, endAngle) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;
}
socialMediaG.append('path')
  .classed('socialPath', true)
  .attr('d', d => describeArc(0,0,height*0.15,0,radialScale(d.value)));

socialMediaG
  .append('text')
  .classed('h2 socialNumber',true)
  .attr('x',0)
  .attr('y',height*0.03)
  .transition().duration(200)
  .attr('height',height/4)
  .attr('width',height/4)
  .text(d => { return (d.value/100).toFixed(2)+"%"; });

// Activity plot
const activitySvg = d3.select("#activityPlot").append('svg')
  .attr("width", d3.select("#activityPlot").node().clientWidth)
  .attr("height", height+10);
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
console.log('data',data);
mediaG.append('path')
  .attr('class', 'activity-timeseries')
  .datum(d => d.values)
  .attr('d', line);

activityG.append('text')
  .classed('chartTitle h4', true)
  .text('Social Activities')
  .attr('transform', 'translate('+width/2+','+(plotHeight+margin.bottom)+')');

// activity tooltips
const detailSvg1 = d3.select("#tooltip1").append('svg')
  .attr("width", widthRight)
  .attr("height", plotHeight/3)
  .append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');
detailSvg1
  .append('text')
  .classed('detailTitle h3',true)
  .text('#SummerWithBMW')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');

const detailSvg2 = d3.select("#tooltip2").append('svg')
  .attr("width", widthRight)
  .attr("height", plotHeight/3)
  .append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');
detailSvg2
  .append('text')
  .classed('detailTitle h3',true)
  .text('#SummerWithBMW');
const detailSvg3 = d3.select("#tooltip3").append('svg')
  .attr("width", widthRight)
  .attr("height", plotHeight/3)
  .append('g')
  .attr('transform', 'translate('+margin.left+','+margin.top+')');
detailSvg3
  .append('text')
  .classed('detailTitle h3',true)
  .text('#SummerWithBMW');

const detailSvg = d3.select("#bottomName").append('svg')
  .attr("width", widthRight)
  .attr("height", margin.bottom+10);
detailSvg
  .append('text')
  .classed('chartTitle h4',true)
  .text('Details')
  .attr('transform', 'translate('+widthRight/2+','+(margin.bottom)+')');

// interaction of mapDiv
function mouseenterColorPop (d) {
  colorNow=this.style.fill;
  d3.select(this) // this --> selection
    .transition()
    .duration(100)
    .style('fill','#11f2c6')
    .style('stroke','#fbae17')
    .style('stoke-width','10px');
}
function mouseleaveColorPop (d) {
  d3.select(this)
    .transition()
    .duration(5000)
    .style('fill', colorNow)
    .style('stroke','inherit');
}

function colorPup (selection) {
  selection.on('mouseenter',function (d) {
    colorNow=this.style.fill;
    d3.select(this) // this --> selection
      .transition()
      .duration(200)
      .style('fill','rgba(0,0,255,.1)')
      .style('stroke','#fbae17')
      .style('stoke-width','10px');
  }).on('mouseleave',function (d) {
    d3.select(this)
      .transition()
      .duration(5000)
      .style('fill', colorNow)
      .style('stroke','inherit');
  });
}
