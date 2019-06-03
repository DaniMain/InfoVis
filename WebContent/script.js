// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 260, left: 50},
    width = 1280 - margin.left - margin.right,
    height = 540 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.json("https://raw.githubusercontent.com/DaniMain/InfoVis/master/data/mydata.json", function(data) {

  // List of subgroups = grops of json file
  var subgroups = new Array(5);
  var all = data[0];
  var i = 0;
  for (var group in all) {
    if (group!="group") {
      subgroups[i]=group;
      i++;
    }
  }

  // List of groups = value of the first column called group
  var groups = d3.map(data, function(d){return(d.group)}).keys()

  // X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Y axis
  var y = d3.scaleLinear()
    .domain([0, 4000])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(d3.schemeSet2);

  // stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // What happens when user click a bar
  var onclick = function(d) {

    var alldata=d3.select(this.parentNode).datum(); // all data in json file
    var scale = d3.scaleLinear().domain([0,1000]).range([height,0]);

    for (var i = 0; i < alldata.length; i++) {
      var bottom=alldata[i][0];
      var top=alldata[i][1];
      var group = alldata[i].data.group;

      var states=alldata[i].data;
      var offset=0;

      for (var state in states) {
        if(state!="group"){
          var stateValue = parseInt(alldata[i].data[state]);
          var stateHeight = (stateValue + offset);
          var newHeight = (stateHeight-bottom);
          var realHeight = scale(newHeight/4);
          offset+=stateValue;
          d3.select("."+state)
            .selectAll("#"+group).transition().ease(d3.easeSin).duration(1000)
            .attr("y",realHeight);
        }

      }

    }

  }

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("id", function(d){ return d.data.group; })
        .attr("x", function(d) { return x(d.data.group); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
        .attr("stroke", "grey")
      .on("click", onclick)

})
