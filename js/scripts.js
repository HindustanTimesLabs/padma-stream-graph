// Check breakpoint
function breakCalc(x){
  x <= 480 ? y = 'xs' : y = 'md';
  return y;
}

var breakpoint = breakCalc($(window).width());

$(window).resize(function(){
  var breakpoint = breakCalc($(window).width());
})

function breakHeight(bp){
  bp == 'xs' ? y = 250 : y = 500;
  return y;
}

//logo
function logoSrc(){
  breakpoint == 'xs' ? img = 'img/ht-logo-sq.png' : img = 'img/navlogo.png';
  $('.navbar-brand img').attr('src',img)
}
logoSrc();
$(window).resize(function(){
  logoSrc();
})

//sharing
var url = window.location.href;
var twitterShare = 'https://twitter.com/home?status=A visual history of India\'s top civilian awards ' + url + ' %23PadmaAwards @htTweets';
$('.twitter-share').attr('href', twitterShare);
var facebookShare = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
$('.facebook-share').attr('href', facebookShare);



/* functions to check if a chart is scrolled into view */
function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
function Utils() {

}

Utils.prototype = {
    constructor: Utils,
    isElementInView: function (element, fullyInView) {
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = $(element).offset().top;
        var elementBottom = elementTop + $(element).height();

        if (fullyInView === true) {
            return ((pageTop < elementTop) && (pageBottom > elementBottom));
        } else {
            return ((elementBottom <= pageBottom) && (elementTop >= pageTop));
        }
    }
};

var Utils = new Utils();


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
  x == 1 ? y = 'award' : y = 'awards';
  return y;
}

function century(x){
  x<100 ? y = '19'+x : y = '20'+(x.toString().substring(1));
  return y;
}

function tipX(x){
  var winWidth = $(window).width();
  var tipWidth = $('.tip').width();
  if (breakpoint == 'xs'){
    x > winWidth - tipWidth - 20 ? y = x-tipWidth : y = x;
  } else {
    x > winWidth - tipWidth - 30 ? y = x-45-tipWidth : y = x+10;
  }
  return y;
}

var colorrange = [];

function chart(column, filterBy, groupBy) {

  var csvpath = "data/awards.csv";
  var colorrange = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3'];

  function margRtCalc(bp){
    bp == 'xs' ? y = 1 : y = -15;
    return y;
  }

  var margin = {top: 20, right: 1, bottom: 30, left: 0};
  var width = $('.chart-wrapper').width() - margin.left - margin.right;
  var height = breakHeight(breakpoint) - margin.top - margin.bottom;

  var chartTop = $('.chart.'+groupBy+'.'+filterBy).offset().top;

  var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tip")
      .style("position", "absolute")
      .style("z-index", "20")
      .style("visibility", "hidden")
      .style("top", 40+chartTop+"px");

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

  var stack = d3.layout.stack()
      .offset("silhouette")
      .order("reverse")
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

  var svg = d3.select(".chart."+groupBy+'.'+filterBy).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // generate a legend
  function legend(layers){

    // generate the legend title
    function titler(filter,group){
      if (group == 'gender'){
        return "Gender";
      }

      if (group == 'place') {
        if (filter == 'india'){
          return "State";
        } else {
          return "Country";
        }
      }

      if (group == 'state') {
        return "State / Country"
      }

      if (group == 'field' || group == 'area') {
        return "Discipline"
      }
    }

    $('.chart.'+groupBy+'.'+filterBy).prepend('<div class="legend"><div class="title">'+titler(filterBy,groupBy)+'</div></div>');
    $('.legend').hide();
    var legend = []
    layers.forEach(function(d,i){
      var obj = {};
      if (i<7){
        obj.key = d.key;
        obj.color = colorrange[i];
        legend.push(obj);
      }
    });

    // others
    if (layers.length>7){legend.push({key: "Other",color: "#b3b3b3"});}

    legend.forEach(function(d,i){
      $('.chart.'+groupBy+'.'+filterBy+' .legend').append('<div class="item"><div class="swatch" style="background: '+d.color+'"></div>'+d.key+'</div>');
    });

    $('.legend').fadeIn();

  }// end legend function

  // parse the data
  function parse(data){

    var filter;
    var searchObj = {};
    searchObj[column] = filterBy;

    if (column=="none"){
      filter=data;
    } else {
      filter = _.where(data,searchObj);
    }

    var categories = _.chain(filter)
        .countBy(groupBy)
        .pairs()
        .sortBy(1).reverse()
        .pluck(0)
        .value();

    var sort = _.sortBy(filter,categories);

    // group by
    var group = _.groupByMulti(sort, ['year', groupBy])

    var newData = [];
    for (var i = 1954;i<2018;i++){

      var currYear = group[i];

      // no data for a year
      if (currYear == undefined) {
        currYear = {};
      }

      categories.forEach(function(area){

        var obj = {};
        if (currYear[area] == undefined){
          // if the year does not have any in a particular category
          obj.key = area;
          obj.value = 0;
          obj.date = moment(i.toString())._d;
        } else {
          obj.key = currYear[area][0][groupBy];
          obj.value = currYear[area].length;
          obj.date = moment(currYear[area][0].year)._d;
        }

        newData.push(obj);
      });

    }

    data = newData;

    return data;
  }

  var graph = d3.csv(csvpath, function(data) {

    data = parse(data);

    var layers = stack(nest.entries(data));

    legend(layers);

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

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

    // abbreviate axis tick text on small screens
    if (breakpoint == 'xs') {

      $('.x.axis text').each(function(){
        var curTxt = $(this).text();
        var newTxt = "'"+curTxt.substr(2);
        $(this).text(newTxt);
      });

    }

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
                .style("left", tipX(mousex) +"px")
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
    });

    var vertical = d3.select(".chart."+groupBy+'.'+filterBy)
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

    d3.select(".chart."+groupBy+'.'+filterBy)
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

    /* Create a shared transition for anything we're animating */
    var t = svg.transition()
     .delay(100)
     .duration(1500)
     .ease('exp')
     .each('end', function() {
       d3.select('line.guide')
         .transition()
         .style('opacity', 0)
         .remove()
     });

    t.select('rect.curtain')
      .attr('width', 0);
    t.select('line.guide')
      .attr('transform', 'translate(' + width + ', 0)');

  });

}

$('.chart').each(function(i){

    var column = $(this).attr("column");
    var groupBy = $(this).attr("groupBy");
    var filterBy = $(this).attr("filterBy");
    $(this).addClass(groupBy).addClass(filterBy);

    if (i==0){
      chart(column,filterBy,groupBy);
    }

});

$(window).scroll(function(){
  $('.chart').each(function(i){

      // test if chart already exists
      var exist = $(this).height();
      if (exist == 0){

        var column = $(this).attr("column");
        var groupBy = $(this).attr("groupBy");
        var filterBy = $(this).attr("filterBy");

        var isElementInView = Utils.isElementInView($(this), false);

        if (isElementInView && $(this)) {
            chart(column,filterBy,groupBy);
        }
      }
  });
})
