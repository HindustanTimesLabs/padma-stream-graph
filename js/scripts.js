/* function to group by multiple properties in underscore.js */
_.groupByMulti = function (obj, values, context) {
    if (!values.length)
        return obj;
    var byFirst = _.groupBy(obj, values[0], context),
        rest = values.slice(1);
    for (var prop in byFirst) {
        byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
    }
    return byFirst;
};

function awardPlural(x){
  if (x==1){
    return 'award'
  } else {
    return 'awards'
  }
}

function century(x){

  if (x<100){
    return '19'+x;
  } else {
    return '20'+(x.toString().substring(1));
  }
}

function tipX(x){
  var winWidth = $(window).width();
  var tipWidth = $('.tip').width();
  if (x > winWidth-150){
    return x-40-tipWidth;
  } else {
    return x;
  }
}

chart("data/awards.csv", "qualitative");

var datearray = [];
var colorrange = [];

var selectBy = 'state2';

function chart(csvpath, color) {

  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  }
  else if (color == "qualitative") {
    colorrange = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3'];
  }
  strokecolor = "#3A403D";

  var margin = {top: 20, right: 40, bottom: 30, left: 30};
  var width = $('.chart-wrapper').width() - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var chartTop = $('.chart').offset().top;

  var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tip")
      .style("position", "absolute")
      .style("z-index", "20")
      .style("visibility", "hidden")
      .style("top", 30+chartTop+"px");

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height-10, 0]);

  var z = d3.scale.ordinal()
      .range(colorrange);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.years, 5);

  var yAxis = d3.svg.axis()
      .scale(y);

  var yAxisr = d3.svg.axis()
      .scale(y);

  var stack = d3.layout.stack()
      .offset("silhouette")
      .order("inside-out")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  var nest = d3.nest()
      .key(function(d) { return d.key; });

  var area = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0)-.2; })
      .y1(function(d) { return y(d.y0 + d.y)+.2; });

  var svg = d3.select(".chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function parse(data){
      // group by
      var group = _.groupByMulti(data, ['year', selectBy])

      var newData = [];
      for (var i = 1954;i<2018;i++){

        var currYear = group[i];

        // no data for a year
        if (currYear == undefined) {
          currYear = {};
        }

        var areaPivot = _(data).chain().flatten().pluck(selectBy).unique().value().reverse();

        areaPivot.forEach(function(area){

          var obj = {};
          if (currYear[area] == undefined){
            // if the year does not have any in a particular category
            obj.key = area;
            obj.value = 0;
            obj.date = moment(i.toString())._d;
          } else {
            obj.key = currYear[area][0][selectBy];
            obj.value = currYear[area].length;
            obj.date = moment(currYear[area][0].year)._d;
          }

          newData.push(obj);
        });

      }

      data = newData;

      return data;
  }

  var format = d3.time.format("%m/%d/%y");

  var graph = d3.csv(csvpath, function(data) {

    data = parse(data);

    var layers = stack(nest.entries(data));

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

    /*data.forEach(function(d){
      var year = Number(d.date.getYear());
      if (year == 78 || year == 79 || (year >= 93 && year <= 97)){
        console.log('what?');
        area.interpolate("basis");
      } else {
        area.interpolate("cardinal");
      }
    })*/

    svg.selectAll(".layer")
        .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxis.orient("right"));

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.orient("left"));

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
          .duration(100)
          .attr("opacity", function(d, j) {
            return j != i ? 0.6 : 1;
      })})
      .on("mousemove", function(d, i) {

        var color = d3.select(this).style('fill');

        mouse = d3.mouse(this);
        mousex = mouse[0];
        var invertedx = x.invert(mousex);
        var xDate = century(invertedx.getYear());
        d.values.forEach(function(f){
          var year = (f.date.toString()).split(' ')[3];
          if (xDate == year){
              tooltip
                .style("left", tipX(mousex+46) +"px")
                .html( "<div class='year'>" + year + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + f.key + "</div><div class='value'>" + f.value + " " + awardPlural((f.value)) + "</div>" )
                .style("visibility", "visible");
          }
        });
      })
      .on("mouseout", function(d, i) {
        svg.selectAll(".layer").transition()
          .duration(100)
          .attr("opacity", '1');
        tooltip.style("visibility", "hidden");
    })

    var vertical = d3.select(".chart")
          .append("div")
          .attr("class", "remove")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width", "2px")
          .style("height", "460px")
          .style("top", "10px")
          .style("bottom", "30px")
          .style("left", "0px")
          .style("background", "#fcfcfc");

    d3.select(".chart")
        .on("mousemove", function(){
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px")});

     /* Add 'curtain' rectangle to hide entire graph */
   var curtain = svg.append('rect')
     .attr('x', -1 * width)
     .attr('y', -1 * height)
     .attr('height', height)
     .attr('width', width)
     .attr('class', 'curtain')
     .attr('transform', 'rotate(180)')
     .style('fill', '#fcfcfc')

   /* Optionally add a guideline */
   var guideline = svg.append('line')
     .attr('stroke', '#333')
     .attr('stroke-width', 0)
     .attr('class', 'guide')
     .attr('x1', 1)
     .attr('y1', 1)
     .attr('x2', 1)
     .attr('y2', height)

   /* Create a shared transition for anything we're animating */
   var t = svg.transition()
     .delay(100)
     .duration(1000)
     .ease('linear')
     .each('end', function() {
       d3.select('line.guide')
         .transition()
         .style('opacity', 0)
         .remove()
     });

   t.select('rect.curtain')
     .attr('width', 0);
   t.select('line.guide')
     .attr('transform', 'translate(' + width + ', 0)')

   d3.select("#show_guideline").on("change", function(e) {
     guideline.attr('stroke-width', this.checked ? 1 : 0);
     curtain.attr("opacity", this.checked ? 0.75 : 1);
   })
  });
}
