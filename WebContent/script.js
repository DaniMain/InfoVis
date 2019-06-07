// set the dimensions and margins of the graph
var margin = {top: 10, right: 60, bottom: 260, left: 50},
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
d3.json("https://raw.githubusercontent.com/DaniMain/InfoVis1/master/data/mydata.json", function(data) {

  // maxHeight = value of bar with max height
  // is used as top range in all scales
  var maxHeight = 0;
  for (var i = 0; i < data.length; i++) {
    var newData = data[i];
    var values = Object.values(newData);
    var totalHeight = 0;
    for (var j = 1; j < values.length; j++) {
      totalHeight += parseInt(values[j]);
    }
    if (totalHeight>maxHeight)
      maxHeight = totalHeight;
  }
  maxHeight += (maxHeight/10);

  // List of subgroups = groups of json file
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
  d3.selectAll("line").remove();

  // Y axis
  var y = d3.scaleLinear()
    .domain([0, maxHeight])
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

    var alldata = d3.select(this.parentNode).datum(); // all data in json file
    var scale = d3.scaleLinear().domain([0,maxHeight]).range([height,0]);
    var scaleLabel = d3.scaleLinear().domain([0,maxHeight]).range([0,height]);

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
          var realHeight = scale(newHeight);
          offset+=stateValue;
          d3.select("."+state)
            .selectAll("#"+group).transition().ease(d3.easeSin).duration(1000)
            .attr("y",realHeight);
        }

        d3.selectAll("text")
          .filter(function(){
            return d3.select(this).text()==group;
          }).transition().ease(d3.easeSin).duration(1000)
          .attr("y",scaleLabel(bottom)+9);

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

  //show legend
  var keys = [];
  for (key in data[0]) {
  	if (key != "id")
  		keys.push(key);
  }
  var legend = svg.append("g")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", 10)
                  .attr("text-anchor", "end")
                  .selectAll("g")
                    .data(keys.slice())
                      .enter().append("g")
                        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")";});
  legend.append("rect")
        .data(stackedData)
        .attr("x", width + margin.right - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function(d) { return color(d.key); });
  legend.append("text")
        .data(stackedData)
        .attr("x", width + margin.right - 24)
        .attr("y", 9.5)
        .attr("dy","0.32em")
        .text(function(d) { return d.key; });

})
