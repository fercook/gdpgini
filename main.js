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
    separateCountries: true
};


$.fn.bootstrapSwitch.defaults.size = 'mini';
$.fn.bootstrapSwitch.defaults.onText = 'on';
$.fn.bootstrapSwitch.defaults.offText = 'off';
$.fn.bootstrapSwitch.defaults.handleWidth = 12;

$("[name='presidents']").bootstrapSwitch();
$('input[name="presidents"]').on('switchChange.bootstrapSwitch', function (event, state) {
    if (options.colorBy == "president") {
        options.colorBy = "country";
    } else {
        options.colorBy = "president";
    }
    drawCharts();
});

$("[name='multicountry']").bootstrapSwitch();
$('input[name="multicountry"]').on('switchChange.bootstrapSwitch', function (event, state) {
    options.separateCountries = !options.separateCountries;
    if (options.separateCountries) {
        $("div[id=separatecountries]").show();
        $("div[id=multicountry]").hide();
        $(".depends").hide();
        options.height = function () {
            return 300 - this.margin.left - this.margin.right
        };

    } else {
        $("div[id=separatecountries]").hide();
        $("div[id=multicountry]").show();
        $(".depends").show();
        options.height = function () {
            return 600 - this.margin.left - this.margin.right
        };
    }
    drawCharts();
});

$("[name='percent']").bootstrapSwitch();
$('input[name="percent"]').on('switchChange.bootstrapSwitch', function (event, state) {
    options.percent = !options.percent;
    normalizeData();
    drawCharts();
});

$("[name='reference']").bootstrapSwitch();
$('input[name="reference"]').on('switchChange.bootstrapSwitch', function (event, state) {
    options.normalize = !options.normalize;
    normalizeData();
    // I should turn off the percent switch
    drawCharts();
});


function fillCountryList() {
    var $dropdown = $("#countryList");
    var vals = [];
    for (var country in countries) {
        if (!(country in usedCountries)) {
            vals.push(country);
        }
    }
    $dropdown.empty();
    if (vals.length>0) {
        $dropdown.show();
        $dropdown.append('<option selected disabled value="base">Agregar pa&iacute;s</option>');
        $.each(vals, function (index, country) {
            $dropdown.append("<option value=" + country + ">" + country + "</option>");
        });
    } else {
        $dropdown.hide();
    }
}


 d3.select("#countryList").on("change", function () {
            var $dropdown = $(this);
            var newCountry = $dropdown.val();
            usedCountries[newCountry] = countries[newCountry];
            fillCountryList();
            drawCharts();
        });

$("div[id=multicountry]").hide();
$("div[id=directionPlot]").hide();
$(".depends").hide();

// Finally we do something

//fillCountryList();

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
        normalizeData();
        fillCountryList();
        drawCharts();
    });


function drawCharts() {
    $("#separatecountries").children().remove();
    var container = d3.select("#separatecountries");
    var tiling = [6, 4];
    var numCountries = Object.keys(usedCountries).length;
    if (numCountries == 1) {
        tiling = [6, 6]
    }
    for (var country in usedCountries) {
        oneCountryData = flatdata.filter(function (d) {
            return d.year >= 1986 && d.country == country;
        });
        container.append("div")
            .attr("class", "col-sm-" + tiling[0] + " col-md-" + tiling[1])
            .append("div")
            .attr("class", "thumbnail")
            .append("div")
            .attr("class", "chart")
            .attr("id", country);
        makeCairoChart(country, country, oneCountryData, options);
    };
       
    var onlyCountries= flatdata.filter(function (d) {
        return d.year >= 1986 && d.country in usedCountries;
    });
    if (onlyCountries.length>0) {
        makeCairoChart("generalDiv", "", onlyCountries, options);
    }

    
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

    makeDirectionChart(flatdata, options);
}