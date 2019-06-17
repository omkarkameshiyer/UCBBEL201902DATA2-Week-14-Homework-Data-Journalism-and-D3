var width = parseInt(d3.select("#scatter").style("width"));

var height = width - width / 3;

var margin = 50;

var labelArea = 150;

var tPadBot = 50;
var tPadLeft = 50;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");


var circRadius;

function crGet() {
    if (width <= 530) {
        circRadius = 5;
    } else {
        circRadius = 15;
    }
}
crGet();

svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

function xTextRefresh() {
    xText.attr(
        "transform",
        "translate(" +
        ((width - labelArea) / 2 + labelArea) +
        ", " +
        (height - margin - tPadBot) +
        ")"
    );
}
xTextRefresh();

// 1. Poverty
xText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
// 2. Age
xText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");
// 3. Income
xText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");


var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

svg.append("g").attr("class", "yText");

var yTextValue = d3.select(".yText");


function yTextRefresh() {
    yTextValue.attr(
        "transform",
        "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
    );
}
yTextRefresh();


yTextValue
    .append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

// 2. Smokes
yTextValue
    .append("text")
    .attr("x", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

// 3. Lacks Healthcare
yTextValue
    .append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");


d3.csv("assets/data/data.csv").then(function(data) {
    // Visualize the data
    visualizeData(data);
});

function visualizeData(theData) {

    var currentX = "poverty";
    var currentY = "obesity";


    var xMin;
    var xMax;
    var yMin;
    var yMax;

    var toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function(d) {
            var theX;
            var theState = "<div>" + d.state + "</div>";
            var theY = "<div>" + currentY + ": " + d[currentY] + "%</div>";
            if (currentX === "poverty") {
                theX = "<div>" + currentX + ": " + d[currentX] + "%</div>";
            } else {
                theX = "<div>" +
                    currentX +
                    ": " +
                    parseFloat(d[currentX]).toLocaleString("en") +
                    "</div>";
            }
            return theState + theX + theY;
        });
    svg.call(toolTip);



    function xValueMinMax() {
        xMin = d3.min(theData, function(d) {
            return parseFloat(d[currentX]) * 0.90;
        });

        xMax = d3.max(theData, function(d) {
            return parseFloat(d[currentX]) * 1.10;
        });
    }

    function yValueMinMax() {
        yMin = d3.min(theData, function(d) {
            return parseFloat(d[currentY]) * 0.90;
        });

        yMax = d3.max(theData, function(d) {
            return parseFloat(d[currentY]) * 1.10;
        });
    }

    function changeLabel(axis, clickedText) {
        d3
            .selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);

        clickedText.classed("inactive", false).classed("active", true);
    }


    xValueMinMax();
    yValueMinMax();


    var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);


    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);


    function tickerCount() {
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        } else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    tickerCount();

    svg
        .append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
    svg
        .append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

    var theCircles = svg.selectAll("g theCircles").data(theData).enter();

    theCircles
        .append("circle")
        // These attr's specify location, size and class.
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", circRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            // Show the tooltip
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#3232");
        })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            // Remve highlight
            d3.select(this).style("stroke", "#e3e3e3");
        });

    theCircles
        .append("text")
        .text(function(d) {
            return d.abbr;
        })

    .attr("dx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("dy", function(d) {

            return yScale(d[currentY]) + circRadius / 2.5;
        })
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        // Hover Rules
        .on("mouseover", function(d) {
            // Show the tooltip
            toolTip.show(d);
            // Highlight the state circle's border
            d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            // Remove tooltip
            toolTip.hide(d);
            // Remove highlight
            d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });


    d3.selectAll(".aText").on("click", function() {
        var self = d3.select(this);

        if (self.classed("inactive")) {
            var axis = self.attr("data-axis");
            var name = self.attr("data-name");

            if (axis === "x") {
                // Make curX the same as the data name.
                currentX = name;

                // Change the min and max of the x-axis
                xValueMinMax();

                // Update the domain of x.
                xScale.domain([xMin, xMax]);

                svg.select(".xAxis").transition().duration(100).call(xAxis);

                d3.selectAll("circle").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("cx", function(d) {
                            return xScale(d[currentX]);
                        })
                        .duration(300);
                });

                d3.selectAll(".stateText").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dx", function(d) {
                            return xScale(d[currentX]);
                        })
                        .duration(300);
                });

                changeLabel(axis, self);
            } else {

                currentY = name;
                yValueMinMax();
                yScale.domain([yMin, yMax]);
                svg.select(".yAxis").transition().duration(300).call(yAxis);

                d3.selectAll("circle").each(function() {

                    d3
                        .select(this)
                        .transition()
                        .attr("cy", function(d) {
                            return yScale(d[currentY]);
                        })
                        .duration(300);
                });

                d3.selectAll(".stateText").each(function() {
                    d3
                        .select(this)
                        .transition()
                        .attr("dy", function(d) {
                            return yScale(d[currentY]) + circRadius / 3;
                        })
                        .duration(300);
                });
                changeLabel(axis, self);
            }
        }
    });


    d3.select(window).on("resize", resize);

    function resize() {
        width = parseInt(d3.select("#scatter").style("width"));
        height = width - width / 3.9;
        leftTextY = (height + labelArea) / 2 - labelArea;

        svg.attr("width", width).attr("height", height);

        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);

        svg
            .select(".xAxis")
            .call(xAxis)
            .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

        svg.select(".yAxis").call(yAxis);

        tickerCount();

        xTextRefresh();
        yTextRefresh();

        crGet();

        d3
            .selectAll("circle")
            .attr("cy", function(d) {
                return yScale(d[currentY]);
            })
            .attr("cx", function(d) {
                return xScale(d[currentX]);
            })
            .attr("r", function() {
                return circRadius;
            });

        d3
            .selectAll(".stateText")
            .attr("dy", function(d) {
                return yScale(d[currentY]) + circRadius / 3;
            })
            .attr("dx", function(d) {
                return xScale(d[currentX]);
            })
            .attr("r", circRadius / 3);
    }
}