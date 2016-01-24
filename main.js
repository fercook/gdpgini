var options = {
    normalize: false,
    percent: false,
    lines: true,
    textdist: {
        a: 17,
        b: 10
    },
    referenceYear: 2000,
    colorBy: "country", //"president", //
    margin: {
        left: 40,
        right: 10,
        top: 10,
        bottom: 40
    },
    height: function () {
        return 300 - this.margin.left - this.margin.right
    },
    width: function () {
        return 1000 - this.margin.top - this.margin.bottom
    },
    separateCountries: true,
    onlyLatinoAmerica: true
};

function init() {

    $.fn.bootstrapSwitch.defaults.size = 'mini';
    $.fn.bootstrapSwitch.defaults.onText = 'on';
    $.fn.bootstrapSwitch.defaults.offText = 'off';
    $.fn.bootstrapSwitch.defaults.handleWidth = 12;

    // Separate presidential periods
    function switchPresidentOptions() {
        if (options.colorBy == "president") {
            options.colorBy = "country";
        } else {
            options.colorBy = "president";
        }
    }
    $("[name='presidentsMulti']").bootstrapSwitch();
    $("[name='presidentsSeparate']").bootstrapSwitch();
    $('input[name="presidentsSeparate"]').on('switchChange.bootstrapSwitch', function (event, state) {
        $("[name='presidentsMulti']").bootstrapSwitch('toggleState', true);
        switchPresidentOptions();
        drawCharts();
    });
    $('input[name="presidentsMulti"]').on('switchChange.bootstrapSwitch', function (event, state) {
        $("[name='presidentsSeparate']").bootstrapSwitch('toggleState', true);
        switchPresidentOptions();
        drawCharts();
    });

    // Separate charts into small multiples
    function switchSmallMultiples() {
        options.separateCountries = !options.separateCountries;
        if (options.separateCountries) {
            $("div[id=separatecountriesPanel]").show();
            $("div[id=multicountryPanel]").hide();
            $(".depends").hide();
            options.height = function () {
                return 300 - this.margin.left - this.margin.right
            };
            var d = document.getElementById("countrySelector");
            d.className += " col-md-offset-3";

        } else {
            $("div[id=separatecountriesPanel]").hide();
            $("div[id=multicountryPanel]").show();
            $(".depends").show();
            options.height = function () {
                return 600 - this.margin.left - this.margin.right
            };
            var d = document.getElementById("countrySelector");
            d.className = "form-group col-md-3 ";
        }
    }
    $("[name='multicountryMulti']").bootstrapSwitch();
    $("[name='multicountrySeparate']").bootstrapSwitch();
    $('input[name="multicountryMulti"]').on('switchChange.bootstrapSwitch', function (event, state) {
        $("[name='multicountrySeparate']").bootstrapSwitch('toggleState', true);
        switchSmallMultiples();
        drawCharts();
    });
    $('input[name="multicountrySeparate"]').on('switchChange.bootstrapSwitch', function (event, state) {
        $("[name='multicountryMulti']").bootstrapSwitch('toggleState', true);
        switchSmallMultiples();
        drawCharts();
    });

    // Draw percent change yr to tr and not values
    $("[name='percent']").bootstrapSwitch();
    $('input[name="percent"]').on('switchChange.bootstrapSwitch', function (event, state) {
        options.percent = !options.percent;
        normalizeData();
        drawCharts();
    });

    // Allow all countrues
    $("[name='allcountries']").bootstrapSwitch();
    $('input[name="allcountries"]').on('switchChange.bootstrapSwitch', function (event, state) {
        options.onlyLatinoAmerica = !options.onlyLatinoAmerica;
        if (options.onlyLatinoAmerica) {
            allowOnlyLatinAmerica();
        } else {
            allowAllCountries();
        }
        normalizeData();
        drawCharts();
    });

    // Draw normalized values (CAREFUL SOME DONT HAVE YEAR 2000)
    $("[name='reference']").bootstrapSwitch();
    $('input[name="reference"]').on('switchChange.bootstrapSwitch', function (event, state) {
        options.normalize = !options.normalize;
        normalizeData();
        // I should turn off the percent switch
        drawCharts();
    });

    d3.selectAll(".countryList").on("change", function () {
        var $dropdown = $(this);
        var newCountry = $dropdown.val();
        usedCountries[newCountry] = countries[newCountry];
        fillCountryList();
        drawCharts();
    });

    $("div[id=multicountryPanel]").hide();
    //$("div[id=directionPlot]").hide();
    $(".depends").hide();

}

function initColors() {
    countries["Argentina"].scale = colorbrewer.Blues[8];
    countries["Argentina"].color = "#092dc6";
    countries["Brazil"].scale = colorbrewer.YlGn[8];
    countries["Brazil"].color = "#ffd800";
    countries["Bolivia"].scale = colorbrewer.Greens[8];
    countries["Bolivia"].color = "#029d02";
    countries["Chile"].scale = colorbrewer.Reds[8];
    countries["Chile"].color = "#e00000";
    countries["Uruguay"].scale = colorbrewer.RdPu[8];
    countries["Uruguay"].color = "#05b4ed";
    countries["Paraguay"].scale = colorbrewer.Greys[8];
    countries["Paraguay"].color = "#d300a2";
}

function fillCountryList() {
    var $dropdown = $(".countryList");
    var vals = [];
    for (var country in countries) {
        if (!(country in usedCountries)) {
            vals.push(country);
        }
    }
    vals.sort();
    $dropdown.empty();
    if (vals.length > 0) {
        $dropdown.show();
        $dropdown.append('<option selected disabled value="base">Agregar pa&iacute;s</option>');
        $.each(vals, function (index, country) {
            $dropdown.append("<option value='" + country + "'>" + country + "</option>");
        });
    } else {
        $dropdown.hide();
    }
}

function allowOnlyLatinAmerica() {
    usedCountries = {};
    countries = {};
    latinAmerica.forEach(function (country) {
        countries[country] = allCountries[country];
    });
    usedCountries["Argentina"] = countries["Argentina"];
    usedCountries["Brazil"] = countries["Brazil"];
    usedCountries["Uruguay"] = countries["Uruguay"];

}

function allowAllCountries() {
    usedCountries = {};
    countries = allCountries;
    usedCountries["Argentina"] = countries["Argentina"];
    usedCountries["Brazil"] = countries["Brazil"];
    usedCountries["Uruguay"] = countries["Uruguay"];

}
// Finally we do something

//fillCountryList();

queue()
    .defer(d3.csv, "data/GDP.csv")
    .defer(d3.csv, "data/GINI.csv")
    .defer(d3.json, "data/presidents.json")
    .await(function (error, gdps, ginis, presidents) {
        for (var country in presidents) {
            presidents[country].presidents.sort(function (a, b) {
                if (a.period[0] < b.period[0]) {
                    return -1;
                }
                if (a.period[0] > b.period[0]) {
                    return 1;
                }
                return 0;
            });
        }
        allCountries = presidents;
        init();
        gdps.forEach(function (row) {
            if (row["Country Name"] in allCountries) {
                allCountries[row["Country Name"]]["gdp"] = row;
            }
        });
        ginis.forEach(function (row) {
            if (row["Country Name"] in allCountries) {
                allCountries[row["Country Name"]]["gini"] = row;
            }
        });
        flatdata = prepareData(gdps, ginis, options, allCountries); //it does things to allCountries
        allowOnlyLatinAmerica();
        normalizeData();
        fillCountryList();
        initColors();
        drawCharts();
    });


function drawCharts() {
    $(".country").remove();
    var container = d3.select("#separatecountries");
    var tiling = [6, 4];
    /*    var numCountries = Object.keys(usedCountries).length;
    if (numCountries == 1) {
        tiling = [6, 6]
    }
*/
    for (var country in usedCountries) {
        oneCountryData = flatdata.filter(function (d) {
            return  d.country == country;
        });
        var divName = country.replace(" ", "_");
        container.append("div")
            .attr("class", "country  col-md-" + tiling[1])
            .append("div")
            .attr("class", "thumbnail")
            .append("div")
            .attr("class", "chart")
            .attr("id", divName);
        makeCairoChart(divName, country, oneCountryData, options);
    };

    var onlyCountries = flatdata.filter(function (d) {
        return d.country in usedCountries;
    });
    if (onlyCountries.length > 0) {
        makeCairoChart("generalDiv", "", onlyCountries, options);
    }

    var directionCountries = [];
    if (options.onlyLatinoAmerica) {
        directionCountries = flatdata.filter(function (d) {
            return latinAmerica.indexOf(d.country) >= 0;
        });
    } else {
        directionCountries = flatdata.filter(function (d) {
            return d.country in usedCountries;
        });        
    }
    makeDirectionChart(directionCountries, options);
}

/*
                           <div class="form-group">
                                <select id="countryList" class="form-control btn-primary">
                                    <option selected disabled value="base">Agregar pa&iacute;s</option>
                                </select>
                            </div>
                                    */

/*    .append("option")
      .attr("class","chart")
      .attr("id","addCountry");


     <div class="col-sm-6 col-md-4">
                              <div class="form-group" style="height: 300px">
                                    <select id="countryList" class="form-control">
                                      <option selected disabled value="base">Add a country</option>
                                    </select>
                              </div>
                        </div>
                   */