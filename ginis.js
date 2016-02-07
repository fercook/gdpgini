function prepareData(gdps, ginis, settings, countryList) {

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
    var toErase = []; // We are missing important data for this
    for (var country in countryList) {
        ["gdp", "gini"].forEach(function (property) {
            if (!countryList[country][property]) {
                toErase.push(country);
            } else { // check if empty
                var hasSomething = Object.keys(countryList[country][property]).reduce(function (prev, cur) {
                    if (!isNaN(+prev)) {
                        return prev || (+countryList[country][property][cur] > 0)
                    } else {
                        return prev;
                    };
                }, false);
                if (!hasSomething) {
                    toErase.push(country);
                }
            }
        });
        if (!countryList[country].color) {
            countryList[country].color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    }
    toErase.forEach(function (country) {
        delete countryList[country];
    });
    var flatdata = [];
    for (var country in countryList) {
        var lastValidYear = 0;
        var minYear = d3.min(Object.keys(countryList[country].gdp), function (d) {
            return +d
        });
        minYear = Math.max(minYear, d3.min(Object.keys(countryList[country].gini), function (d) {
            return +d
        }));
        var maxYear = d3.max(Object.keys(countryList[country].gdp), function (d) {
            return +d
        });
        maxYear = Math.min(maxYear, d3.max(Object.keys(countryList[country].gini), function (d) {
            return +d
        }));
        for (var year = minYear; year <= maxYear; year++) {
            var gdp = +countryList[country].gdp[year];
            var gini = +countryList[country].gini[year];
            if (gini != 0) {
                if (!(lastValidYear == 0 || lastValidYear == year - 1)) { // we need to interpolate
                    var inigini = +countryList[country].gini[lastValidYear];
                    for (var altyear = lastValidYear + 1; altyear < year; altyear++) {
                        var altgdp = +countryList[country].gdp[altyear];
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
            countryList[d.country].refgdp = d.gdp;
            countryList[d.country].refgini = d.gini;
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
    return flatdata;
}

function normalizeData(flatdata) {
    if (options.percent) {
        flatdata.forEach(function (d) {
            d.y = d.dgini;
            d.x = d.dgdp;
        });
    } else {
        flatdata.forEach(function (d) {
            d.y = d.gini;
            d.x = d.gdp;
        });
    }
    if (options.normalize) {
        flatdata.forEach(function (d) {
            d.x = d.gdp / allCountries[d.country].refgdp;
            d.y = d.gini / allCountries[d.country].refgini;
        });
    }
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
                    year: dt + countryData[n].year,
                    president: president.name
                }); //interpolate
            } else if (countryData[n].year >= period[0] && countryData[n + 1].year < period[1]) { // middle
                segment.push({
                    x: countryData[n].x,
                    y: countryData[n].y,
                    year: countryData[n].year,
                    president: president.name
                });
            } else if (countryData[n].year < period[1] && countryData[n + 1].year >= period[1]) { //end
                segment.push({
                    x: countryData[n].x,
                    y: countryData[n].y,
                    year: countryData[n].year,
                    president: president.name
                });
                var dt = period[1] - countryData[n].year;
                var dx = dt * (countryData[n + 1].x - countryData[n].x);
                var dy = dt * (countryData[n + 1].y - countryData[n].y);
                segment.push({
                    x: dx + countryData[n].x,
                    y: dy + countryData[n].y,
                    year: dt + countryData[n].year,
                    president: president.name
                }); //interpolate
            } else if (countryData[n].year > period[0] && countryData[n].year < period[1]) {
                segment.push({
                    x: countryData[n].x,
                    y: countryData[n].y,
                    year: countryData[n].year,
                    president: president.name
                });
            }
        }
        if (countryData[countryData.length - 1].year <= period[1]) {
            segment.push({
                x: countryData[countryData.length - 1].x,
                y: countryData[countryData.length - 1].y,
                year: countryData[countryData.length - 1].year,
                president: president.name
            });
        }
        if (segment.length > 1) segments.push(segment);
    });
    return segments;
}

function makeCairoChart(div, title, flatdata, options) {

    var tooltip = d3.select("#" + div).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    tooltip.style('display', 'none');

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
        .orient("bottom")
        .ticks(7);

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
                    ]).nice();

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
                                    return countryColor(country);
                                }
                            })
                            .classed(country, true)
                            .classed("passive", false)
                            .attr("stroke-width", 3)
                            .attr("fill", "none")
                            .on("mouseover", function () {
                                // PRESISEGMENT
                                var mouse = d3.mouse(this.parentNode);
                                //showTooltip(mouse,
                                tooltip.style('display', null);
                                tooltip.html("<div>" + segment[1].president + "</div>")
                                    .style("top", (mouse[1] - 20) + "px")
                                    .style("left", function () {
                                        if (mouse[0] + 25 + 50 > width) {
                                            var newx = mouse[0] - 25 - 50;
                                        } else {
                                            var newx = mouse[0] + 25;
                                        }
                                        return newx + "px"
                                    }) //(mouse[0]+radius/2+5)+"px")
                                .transition()
                                    .duration(200)
                                    .style("opacity", 0.8);
                            })
                            .on("mouseout", function () {
                                tooltip.style('display', 'none');
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
        })
        .attr("class", " no_interaction");

    groups.append("circle")
        .attr("id", function (d) {
            return "circle_" + d.country + d.year
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
                color = countryColor(d.country);
            }
            return d.category == "Original" ? color : "white";
            //return d.category == "Original" ? "black" : "white";
        })
        .style("stroke", function (d) {
            if (options.colorBy == "president") {
                return countryColor(d.country, d.year);
            } else {
                return countryColor(d.country);
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
        .attr("class", "yearlabel")
        .classed("passive", false)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.year;
        });

    svg.append("text")
        .style("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 2 * options.margin.bottom / 3)
        .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
    //.style("fill", "black")
    .text("PBI per capita (ajust. infl.)");

    svg.append("text")
        .style("text-anchor", "middle")
    //.attr("x", width/2)
    //.attr("y", height+2*options.margin.bottom/3)
    .attr("dx", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .attr("transform", "translate(-" + 5 * options.margin.left / 6 + "," + (height / 2) + ")rotate(-90)")
    //.style("fill", "black")
    .text("Coeficiente Gini");


    var caption = svg.append("g")
        .attr("transform", "translate(" + width + ",0)");

    if (title != "") { // we are plotting a single chart
        caption.append("text")
            .attr("x", -14)
            .attr("y", 0)
            .attr("dx", 0)
            .attr("dy", "0.35em")
            .attr("class", "media-heading")
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .style("fill", "black")
            .style("font", "bold")
            .text(title);
        
        var cross = caption.append("g")
                .attr("transform", "translate(-12,-12)")
        .on("click", function (d) {
                delete usedCountries[title];
                fillCountryList();
                drawCharts();
            });
        cross.append("path")
            .attr("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z")
            .attr("fill","#888");
        cross.append("path").attr("d","M0 0h24v24H0z").attr("fill","none");
        
    } else {
        var nn = 0,
            deltaY = 16;
        for (var country in usedCountries) {
            caption.append("text")
                .attr("x", -15)
                .attr("y", nn * deltaY)
                .attr("dx", 0)
                .attr("dy", "0.35em")
                .attr("class", "media-heading")
                .style("text-anchor", "end")
                .style("font-size", "16px")
                .style("fill", countryColor(country))
                .style("font", "bold")
                .text(country);
            var cross = caption.append("g")
                        .attr("transform", "translate(-12,"+(-11+nn*deltaY)+")")
                        .on("click", function (d) {
                            delete usedCountries[title];
                            fillCountryList();
                            drawCharts();
                        });
            cross.append("path")
                .attr("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z")
                .attr("fill","#888");
            cross.append("path").attr("d","M0 0h24v24H0z").attr("fill","none");            
            nn++;
        }
    }

}

function makeDirectionChart(flatdata, options) {

    function category(gdp, gini) {
        var cat = null;
        if (gdp > 0 && gini < 0) {
            cat = 0
        } else if (gdp > 0 && gini >= 0) {
            cat = 1
        } else if (gdp <= 0 && gini < 0) {
            cat = 2
        } else if (gdp <= 0 && gini >= 0) {
            cat = 3
        } else {
            return "white"
        }
        return colorbrewer.PuOr[4][cat];
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

    var baseyear = d3.min(flatdata, function (d) {
        return d.year
    });
    var endyear = d3.max(flatdata, function (d) {
        return d.year
    });

    d3.selectAll(".multichartH svg").remove();
    d3.selectAll(".multichartV svg").remove();

    var isScreenSmall = $(window).width() < 768;
    var orientation = isScreenSmall ? "V" : "H";
    var width = $(".multichart" + orientation).width() - options.margin.left - options.margin.right; //, height=$(".thumbnail").height();


    var heightH = options.height() - options.margin.top - options.margin.bottom;
    var heightV = 800;
    var height = options.margin.top + 30 * Object.keys(usedCountries).length; //isScreenSmall ? heightV : heightH;

    var chart = d3.select(".multichart" + orientation).append("svg")
        .attr("width", width + options.margin.left + options.margin.right)
        .attr("height", height + options.margin.top + options.margin.bottom + (isScreenSmall ? 50 : 0)) //just in case 50px more...
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + options.margin.left + "," + options.margin.top + ")";
        });

    var offset = {},
        matrix = {};
    var rectangles, countryTitles;
    var cidx = {},
        c = 0;
    for (var country in usedCountries) {
        cidx[country] = c++
    }
    if (isScreenSmall) { //phones and such
        $('div[id=horizontalChart]').hide();
        $('div[id=verticalChart]').show();
        offset.x = 5;
        offset.y = 65;
        matrix.h = (height - offset.x) / (endyear - baseyear + 1);
        matrix.w = Math.max(width / c, 228 / c);
        rectangles = chart.selectAll("rect")
            .data(flatdata)
            .enter().append("g")
            .attr("transform", function (d) {
                return "translate(" + (offset.x + matrix.w * cidx[d.country]) + "," + (offset.y + (d.year - baseyear) * matrix.h) + ")";
            });
        countryTitles = chart.selectAll("countryTitles")
            .data(Object.keys(usedCountries))
            .enter().append("g")
            .attr("transform", function (d) {
                return "translate(" + (offset.x + matrix.w * cidx[d] + matrix.w / 2) + "," + (offset.y - 5) + ")rotate(-90)";
            })
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dx", 0)
            .attr("dy", "0.35em")
            .style("text-anchor", "start")
            .text(function (d) {
                return d;
            });
        var y = d3.scale.linear()
            .range([offset.y + matrix.h / 2, offset.y + (endyear - baseyear) * matrix.h + matrix.h / 2])
            .domain([baseyear, endyear]);

        var yaxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            //.ticks(endyear-baseyear)
            .ticks(Math.floor(((endyear - baseyear) * matrix.h) / 34))
            .tickFormat(d3.format(".0f"));

        chart.append("g")
            .attr("transform", "translate(" + offset.x + "," + 0 + ")")
            .attr("class", "years")
            .call(yaxis);

    } else { //tablets and larger
        $('div[id=horizontalChart]').show();
        $('div[id=verticalChart]').hide();

        offset.x = 40;
        offset.y = 12;
        matrix.w = (width - offset.x) / (endyear - baseyear + 1);
        matrix.h = 30;
        rectangles = chart.selectAll("rect")
            .data(flatdata)
            .enter().append("g")
            .attr("transform", function (d) {
                return "translate(" + (offset.x + (d.year - baseyear) * matrix.w) + "," + (offset.y + matrix.h * cidx[d.country]) + ")";
            });
        countryTitles = chart.selectAll("countryTitles")
            .data(Object.keys(usedCountries))
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
        var x = d3.scale.linear()
            .range([offset.x + matrix.w / 2, offset.x + (endyear - baseyear) * matrix.w + matrix.w / 2])
            .domain([baseyear, endyear]);

        var xaxis = d3.svg.axis()
            .scale(x)
            .orient("top")
            //.ticks(endyear-baseyear)
            .ticks(Math.floor(((endyear - baseyear + 1) * matrix.w) / (50))) // basically (width - offset.x) / smallestTickSeparation
            .tickFormat(d3.format(".0f"));

        chart.append("g")
            .attr("transform", "translate(0," + (options.margin.top + 2) + ")")
            .attr("class", "years")
            .call(xaxis);

    };


    rectangles.append("rect")
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