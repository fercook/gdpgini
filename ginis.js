var options = {
    normalize: false,
    percent: false,
    lines: true,
    textdist: {
        a: 17,
        b: 10
    },
    referenceYear: 2000,
    colorBy: "country", // "president"
    margin: {
        left: 30,
        right: 30,
        top: 30,
        bottom: 20
    },
    height: function () {
        return 300 - this.margin.left - this.margin.right
    },
    width: function () {
        return 1000 - this.margin.top - this.margin.bottom
    }
};

function prepareData(gdps, ginis, settings) {

    /* 
    We need to interpolate missing data in Gini DB.
     For this, we go through the list and we might get
     Gini == 0 --> 1) no Gini has been found yet (lastValidYear != year-1 (or equal to initial_value))
                        --> do nothing
                   2) we are inside a data hole  (lastValidYear != year-1)
                        --> do nothing
                   3) we have a previous Gini value (lastValidYear == year-1)
                        --> mark previous year as beginning of hole
     Gini != 0 --> 1) no Gini has been found yet (lastValidYear == initial_value)
                        --> insert data normally and mark data begin (lastValidYear = year)
                   2) we had one Gini value for the year before (lastValidYear == year-1)
                        --> insert data normally (lastValidYear = year)
                   3) we had a Gini value many years ago (lastValidYear != year-1 && != initial_value)
                        --> insert interpolated data and mark end of hole
    */

    var flatdata = [];
    for (var country in countries) {
        var lastValidYear = 0;
        for (var year = 1970; year < 2015; year++) {
            var gdp = +countries[country].gdp[year];
            var gini = +countries[country].gini[year];
            if (gini != 0) {
                if (!(lastValidYear == 0 || lastValidYear == year - 1)) { // we need to interpolate
                    var inigini = +countries[country].gini[lastValidYear];
                    for (var altyear = lastValidYear + 1; altyear < year; altyear++) {
                        var altgdp = +countries[country].gdp[altyear];
                        var altgini = inigini + (gini - inigini) * (altyear - lastValidYear) / (1 + year - lastValidYear);
                        flatdata.push({
                            "country": country,
                            "year": altyear,
                            "gdp": altgdp,
                            "gini": altgini,
                            "category": "Interpolated"
                        });
                    }
                }
                flatdata.push({
                    "country": country,
                    "year": year,
                    "gdp": gdp,
                    "gini": gini,
                    "category": "Original"
                });
                lastValidYear = year;
            }
        }
    }

    flatdata.forEach(function (d) {
        if (d.year == settings.referenceYear) {
            countries[d.country].refgdp = d.gdp;
            countries[d.country].refgini = d.gini;
        }
    });
    var country = null;
    for (var i = 0; i < flatdata.length; i++) {
        if (flatdata[i].country != country) {
            country = flatdata[i].country;
            flatdata[i].dgdp = 0;
            flatdata[i].dgini = 0;
        } else {
            tempgdp = flatdata[i].gdp;
            tempgini = flatdata[i].gini;
            flatdata[i].dgdp = 100 * (flatdata[i].gdp / flatdata[i - 1].gdp - 1);
            flatdata[i].dgini = 100 * (flatdata[i].gini / flatdata[i - 1].gini - 1);
        }
    }
    //Print to copy
    //console.log(flatdata);

    if (settings.normalize) {
        flatdata.forEach(function (d) {
            d.gdp = d.gdp / countries[d.country].refgdp;
            d.gini = d.gini / countries[d.country].refgini;
        });
    }
    if (settings.percent) {
        flatdata.forEach(function (d) {
            d.x = d.dgdp;
            d.y = d.gdini;
        });
    } else {
        flatdata.forEach(function (d) {
            d.y = d.gini;
            d.x = d.gdp;
        });
    }

    return flatdata;
}

function positionLabels(flatdata, category, textdist) {

    function norm(vec) {
        var n = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        return n == 0 ? [0, 0] : [vec[0] / n, vec[1] / n];
    }

    function substract(v, w) {
        return [v[0] - w[0], v[1] - w[1]];
    }

    function add(v, w) {
        return [v[0] + w[0], v[1] + w[1]];
    }

    var currentCategory = null;
    for (var i = 0; i < flatdata.length; i++) {
        var p1, p2;
        var p = [textdist.x(flatdata[i].x), textdist.y(flatdata[i].y)];
        if (flatdata[i][category] == currentCategory) {
            p1 = norm(substract(p, [textdist.x(flatdata[i - 1].x), textdist.y(flatdata[i - 1].y)]));
        } else {
            p1 = [0, 0];
        }
        if (i < flatdata.length - 1 && flatdata[i + 1][category] == flatdata[i][category]) {
            p2 = norm(substract(p, [textdist.x(flatdata[i + 1].x), textdist.y(flatdata[i + 1].y)]));
        } else {
            p2 = [0, 0];
        }
        var pos = norm(add(p1, p2));
        flatdata[i].text = {
            x: pos[0] * textdist.a,
            y: pos[1] * textdist.b
        };
        currentCategory = flatdata[i][category];
    }
}

function splitLineIntoSegments(countryData) {
    var country = countryData[0].country;
    var segments = [];
    countries[country].presidents.forEach(function (president, i) {
        var segment = [],
            period = president.period;
        for (var n = 0; n < countryData.length - 1; n++) {
            if (countryData[n].year < period[0] && countryData[n + 1].year >= period[0]) { //start
                var dt = period[0] - countryData[n].year;
                var dx = dt * (countryData[n + 1].x - countryData[n].x);
                var dy = dt * (countryData[n + 1].y - countryData[n].y);
                segment.push({
                    x: dx + countryData[n].x,
                    y: dy + countryData[n].y,
                    year: dt + countryData[n].year
                }); //interpolate      
            } else if (countryData[n].year >= period[0] && countryData[n + 1].year < period[1]) { // middle
                segment.push(countryData[n]);
            } else if (countryData[n].year < period[1] && countryData[n + 1].year >= period[1]) { //end
                segment.push(countryData[n]);
                var dt = period[1] - countryData[n].year;
                var dx = dt * (countryData[n + 1].x - countryData[n].x);
                var dy = dt * (countryData[n + 1].y - countryData[n].y);
                segment.push({
                    x: dx + countryData[n].x,
                    y: dy + countryData[n].y,
                    year: dt + countryData[n].year
                }); //interpolate      
            } else if (countryData[n].year > period[0] && countryData[n].year < period[1]) {
                segment.push(countryData[n]);
            }
        }
        if (countryData[countryData.length - 1].year <= period[1]) {
            segment.push(countryData[countryData.length - 1]);
        }
        segments.push(segment);
    });
    return segments;
}

function makeCairoChart(div, flatdata, options) {

    d3.selectAll("#" + div + " svg").remove();
    var width = $("#" + div).width() - options.margin.left - options.margin.right; //, height=$(".thumbnail").height(); 
    var height = options.height() - options.margin.top - options.margin.bottom;
    svg = d3.select("#" + div).append("svg")
        .attr("width", width + options.margin.left + options.margin.right)
        .attr("height", height + options.margin.top + options.margin.bottom)
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + options.margin.left + "," + options.margin.top + ")";
        });


    x = d3.scale.linear()
        .range([0, width]);

    y = d3.scale.linear()
        .range([height, 0]);


    xaxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    yaxis = d3.svg.axis()
        .scale(y)
        .orient("left");



    var offset = 0.02;
    x.domain([
        (1 - offset) * d3.min(flatdata, function (d) {
            return d.x;
        }),
        (1 + offset) * d3.max(flatdata, function (d) {
            return d.x;
        })
                    ]);
    y.domain([
        (1 - offset) * d3.min(flatdata, function (d) {
            return d.y;
        }),
        (1 + offset) * d3.max(flatdata, function (d) {
            return d.y;
        })
                    ]);

    if (options.lines) {

        var lineFunction = d3.svg.line()
            .x(function (d) {
                return x(d.x);
            })
            .y(function (d) {
                return y(d.y);
            })
            .interpolate("cardinal");

        for (var country in countries) {
            var countryData = flatdata.filter(function (d) {
                return d.country == country;
            });
            if (countryData.length > 0) {
                var segments = splitLineIntoSegments(countryData);
                segments.forEach(function (segment) {
                    if (segment.length > 0) {
                        svg.append("g").append("path")
                            .attr("d", lineFunction(segment))
                            .attr("stroke", function () {
                                if (options.colorBy == "president") {
                                    return countryColor(country, segment[1].year);
                                } else {
                                    return countries[country].color;
                                }
                            })
                            .classed(country, true)
                            .classed("passive", false)
                            .attr("stroke-width", 3)
                            .attr("fill", "none")
                            .on("mouseover", function (d) {

                            });
                    }

                });
            }

        }
    }


    svg.append("g")
        .attr("transform", "translate(0," + (height) + ")")
        .attr("class", "x axis")
        .call(xaxis);

    
    svg.append("g")
        .attr("class", "y axis")
        .call(yaxis);

    var groups = svg.selectAll(".datagroups")
        .data(flatdata)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });

    groups.append("circle")
        .attr("id", function (d) {
            return "circle_" + d.country + d.year
        })
        .attr("class", function (d) {
            d.country;
        })
        .classed("passive", false)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 3)
        .style("fill", function (d) {
            var color;
            if (options.colorBy == "president") {
                color = countryColor(d.country, d.year);
            } else {
                color = countries[d.country].color;
            }
            return d.category == "Original" ? color : "white";
            //return d.category == "Original" ? "black" : "white";
        })
        .style("stroke", function (d) {
            if (options.colorBy == "president") {
                return countryColor(d.country, d.year);
            } else {
                return countries[d.country].color;
            }

        })
        .style("stroke-width", 2)
    /*      .on("mouseover",function(d) {
                    chart.selectAll("#rect_"+d.country + d.year)
                        .classed("highlight",true);
                    d3.select(this)
                        .transition(250)
                        .attr("r",6);
                })
            */
    .on("mouseout", function (d) {
        d3.selectAll("#rect_" + d.country + d.year)
            .classed("highlight", false);
        d3.select(this).transition(250)
            .attr("r", 3);
    })
        .on("mouseover", function (d) {
            var classes = Object.keys(countries).filter(function (k) {
                return d.country != k
            }).map(function (k) {
                return "." + k
            }).join(" ");
            console.log(classes);
            d3.selectAll(classes)
                .classed("passive", true);
        });;

    options.textdist.x = x;
    options.textdist.y = y;
    positionLabels(flatdata, "country", options.textdist);
    groups.append("text")
        .attr("x", function (d) {
            return d.text.x
        })
        .attr("y", function (d) {
            return d.text.y
        })
        .attr("class", function (d) {
            d.country;
        })
        .classed("passive", false)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.year;
        });

    svg.append("text")
        .attr("x", width)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .attr("class", "media-heading")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .style("fill", "black")
        .style("font", "bold")
        .text(div);
}

function makeDirectionChart(flatdata, options) {

    function category(gdp, gini) {
        var cat = null;
        if (gdp > 0 && gini < 0) {
            cat = 3
        } else if (gdp > 0 && gini >= 0) {
            cat = 2
        } else if (gdp <= 0 && gini < 0) {
            cat = 1
        } else if (gdp <= 0 && gini >= 0) {
            cat = 0
        } else {
            return "white"
        }
        return colorbrewer.PiYG[4][cat];
    };

    function range(start, end) {
        if (arguments.length == 1) {
            count = end;
            start = 0;
        }

        var foo = [];
        for (var i = start; i < end; i++) {
            foo.push(i);
        }
        return foo;
    }

    d3.selectAll(".multichart svg").remove();
    d3.selectAll(".legend svg").remove();

    var width = $(".multichart").width() - options.margin.left - options.margin.right; //, height=$(".thumbnail").height(); 
    var height = options.height() - options.margin.top - options.margin.bottom;
    
    var chart = d3.select(".multichart").append("svg")
        .attr("width", width + options.margin.left + options.margin.right)
        .attr("height", height + options.margin.top + options.margin.bottom)
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + options.margin.left + "," + options.margin.top + ")";
        });

    var baseyear = d3.min(flatdata, function (d) {
        return d.year
    });
    var endyear = d3.max(flatdata, function (d) {
        return d.year
    });

    var offset = {
        x: 40,
        y: 10
    };
    var matrix = {
        w: (width - offset.x) / (endyear - baseyear + 1),
        h: 30
    };

    var cidx = {},
        c = 0;
    for (var country in countries) {
        cidx[country] = c++
    }
    chart.selectAll("rect")
        .data(flatdata)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + (offset.x + (d.year - baseyear) * matrix.w) + "," + (offset.y + matrix.h * cidx[d.country]) + ")";
        })
        .append("rect")
        .attr("id", function (d) {
            return "rect_" + d.country + d.year
        })
        .classed("highlight", false)
        .attr("class", function (d) {
            d.country;
        })
        .classed("passive", false)
        .attr("width", matrix.w)
        .attr("height", matrix.h)
        .style("fill", function (d) {
            return category(d.dgdp, d.dgini);
        })
        .on("mouseover", function (d) {
            d3.selectAll("#circle_" + d.country + d.year)
                .transition(250)
                .attr("r", 6);
            d3.select(this).classed("highlight", true);
        })
        .on("mouseout", function (d) {
            d3.selectAll("#circle_" + d.country + d.year)
                .transition(250)
                .attr("r", 3);
            d3.select(this).classed("highlight", false);
        });

    chart.selectAll("countryTitles")
        .data(Object.keys(countries))
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + 0 + "," + (offset.y + matrix.h * cidx[d]) + ")";
        })
        .append("text")
        .attr("x", offset.x - 5)
        .attr("y", matrix.h / 2)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });

    chart.selectAll("years")
        .data(range(baseyear, endyear + 1))
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + (offset.x + (d - baseyear) * matrix.w) + "," + 0 + ")";
        })
        .append("text")
        .attr("class", "years")
        .attr("x", matrix.w / 2)
        .attr("y", 0)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d;
        });

    var legendW = 80,
        legendH = 30;
    var legendsvg = d3.selectAll(".legend").append("svg")
        .attr("width", 2 * legendW)
        .attr("height", 2 * legendH);
    var legends = [{
            title: "Todo mejor",
            dgdp: 1,
            dgini: -1
        },
        {
            title: "Todo peor",
            dgdp: -1,
            dgini: 1
        },
        {
            title: "PBI mejor",
            dgdp: 1,
            dgini: 1
        },
        {
            title: "GINI mejor",
            dgdp: -1,
            dgini: -1
        }];

    var legendChart = legendsvg.selectAll("legends").data(legends).enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + ((d.dgdp + 1) * legendW / 2) + "," + (-(d.dgini - 1) * legendH / 2) + ")";
        });

    legendChart.append("rect")
        .attr("width", legendW)
        .attr("height", legendH)
        .style("fill", function (d) {
            return category(d.dgdp, d.dgini);
        });

    legendChart.append("text")
        .text(function (d) {
            return d.title
        })
        .attr("x", legendW / 2)
        .attr("y", legendH / 2)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle");


}

function freq(arr) {
    var re = {};
    arr.forEach(function (year) {
        if (re[year]) {
            re[year] = re[year] + 1;
        } else {
            re[year] = 1;
        }
    });
    return re;
}

// Finally we do something

queue()
    .defer(d3.csv, "data/GDP.csv")
    .defer(d3.csv, "data/GINI.csv")
    .await(function (error, gdps, ginis) {
        gdps.forEach(function (row) {
            if (row["Country Name"] in countries) {
                countries[row["Country Name"]]["gdp"] = row;
            }
        });
        ginis.forEach(function (row) {
            if (row["Country Name"] in countries) {
                countries[row["Country Name"]]["gini"] = row;
            }
        });
        flatdata = prepareData(gdps, ginis, options);
        drawCharts();
    });

function drawCharts() {
    for (var country in countries) {
        oneCountryData = flatdata.filter(function (d) {
            return d.year >= 1986 && d.country == country;
        });
        makeCairoChart(country, oneCountryData, options);
    };

    makeDirectionChart(flatdata, options);
}

/*
    var yearpp = flatdata.filter(function (d) {
        return d.gdp > 0 && d.gini > 0
    }).map(function (d) {
        return {
            year: d.year,
            country: d.country,
            category: "pp"
        }
    });
    var yearpm = flatdata.filter(function (d) {
        return d.gdp > 0 && d.gini <= 0
    }).map(function (d) {
        return {
            year: d.year,
            country: d.country,
            category: "pp"
        }
    });
    var yearmp = flatdata.filter(function (d) {
        return d.gdp <= 0 && d.gini > 0
    }).map(function (d) {
        return {
            year: d.year,
            country: d.country,
            category: "pp"
        }
    });
    var yearmm = flatdata.filter(function (d) {
        return d.gdp <= 0 && d.gini <= 0
    }).map(function (d) {
        return {
            year: d.year,
            country: d.country,
            category: "pp"
        }
    });


    function label(gdp, gini) {
        return ((gdp > 0) ? "p" : "m") + ((gini > 0) ? "p" : "m");
    };

    console.log(flatdata.map(function (d) {
        return {
            year: d.year,
            country: d.country,
            gdp: d.dgdp,
            gini: d.dgini
        }
    }));
*/