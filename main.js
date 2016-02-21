var options = {
    normalize: false,
    percent: false,
    lines: true,
    textdist: {
        a: 17,
        b: 10
    },
    referenceYear: 2010,
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
    onlyLatinoAmerica: false,
    joinedScales: false,
    language: "es"
};


var messages = {
    add: {
        "es": "Agregar pa&iacute;s",
        "en": "Add Country"
    }

}

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
    $('input[name="presidentsMulti"]').on('switchChange.bootstrapSwitch', function (event, state) {
        switchPresidentOptions();
        drawCharts();
    });

    $("[name='escalas']").bootstrapSwitch();
    $('input[name="escalas"]').on('switchChange.bootstrapSwitch', function (event, state) {
        options.joinedScales = !options.joinedScales;
        drawCharts();
    });
    // Separate charts into small multiples
    function switchSmallMultiples() {
        options.separateCountries = !options.separateCountries;
        if (options.separateCountries) {
            $("div[id=separatecountriesPanel]").show();
            $("div[id=multicountryPanel]").hide();
            $(".optionMulti").show();
            $(".optionSingle").hide();
            options.height = function () {
                return 300 - this.margin.left - this.margin.right
            };

        } else {
            $("div[id=separatecountriesPanel]").hide();
            $("div[id=multicountryPanel]").show();
            $(".optionSingle").show();
            $(".optionMulti").hide();
            options.joinedScales = false;
            options.height = function () {
                return 600 - this.margin.left - this.margin.right
            };
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

    // Draw percent change yr to yr and not values
    $("[name='percent']").bootstrapSwitch();
    $('input[name="percent"]').on('switchChange.bootstrapSwitch', function (event, state) {
        options.percent = !options.percent;
        normalizeData(flatdata);
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
        normalizeData(flatdata);
        fillCountryList();
        drawCharts();
    });

    // Draw normalized values (CAREFUL SOME DONT HAVE YEAR 2010)
    $("[name='reference']").bootstrapSwitch();
    $('input[name="reference"]').on('switchChange.bootstrapSwitch', function (event, state) {
        options.normalize = !options.normalize;
        normalizeData(flatdata);
        // I should turn off the percent switch
        drawCharts();
    });

    d3.selectAll(".topSelector").on("change", function () {
        var dropdown = $(this);
        var newCountry = dropdown.val();
        usedCountries[newCountry] = countries[newCountry];
        fillCountryList();
        drawCharts();
    });
    d3.selectAll(".bottomSelector").on("change", function () {
        var dropdown = $(this);
        var newCountry = dropdown.val();
        usedCountries[newCountry] = countries[newCountry];
        fillCountryList();
        drawCharts();
        dropdown[0].scrollIntoView();
    });


    $("div[id=multicountryPanel]").hide();
    $(".optionSingle").hide();

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
    var dropdown = $(".countryList");
    var vals = [];
    Object.keys(countries).forEach(function (country) {
        if (!(country in usedCountries)) {
            vals.push(country);
        }
    });
    vals.sort();
    dropdown.empty();
    if (vals.length > 0) {
        dropdown.show();
        dropdown.append('<option selected disabled value="base">' + messages.add[options.language] + '</option>');
        $.each(vals, function (index, country) {
            dropdown.append("<option value='" + country + "'>" + country + "</option>");
        });
    } else {
        dropdown.hide();
    }
}

function allowOnlyLatinAmerica() {
    usedCountries = {};
    countries = {};
    latinAmerica.forEach(function (country) {
        countries[country] = allCountries[country];
        usedCountries[country] = countries[country];
    });

}

function allowAllCountries() {
    usedCountries = {};
    countries = allCountries;
    latinAmerica.forEach(function (country) {
        usedCountries[country] = countries[country];
    });
}

var flatdata;
// Finally we do something
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
        //console.log(presidents);
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
        //allowOnlyLatinAmerica();
        allowAllCountries();
        normalizeData(flatdata);
        fillCountryList();
        initColors();
        drawCharts();
    });


function drawCharts() {
    $(".country").remove();
    var container = d3.select("#separatecountries");
    var tiling = [6, 4];
    for (var country in usedCountries) {
        oneCountryData = flatdata.filter(function (d) {
            return d.country == country;
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