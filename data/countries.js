countries = {
    "Argentina": {
        presidents: [{
            name: "Alfonsin",
            period: [1983, 1989.5]
        }, {
            name: "Menem (I)",
            period: [1989.5, 1994.9]
        }, {
            name: "Menem (II)",
            period: [1994.9, 1999.9]
        }, {
            name: "De La Rua",
            period: [1999.9, 2001.9]
        }, {
            name: "Duhalde",
            period: [2001.9, 2003.9]
        }, {
            name: "Kirchner",
            period: [2003.9, 2007.9]
        }, {
            name: "Fernandez (I)",
            period: [2007.9, 2011.9]
        }, {
            name: "Fernandez (II)",
            period: [2011.9, 2015.9]
        }],
        scale: colorbrewer.Blues[8],
        color: "steelblue"
    },
    "Brazil": {
        presidents: [{
            name: "Alfonsin",
            period: [1983, 1989.5]
        }, {
            name: "Menem (I)",
            period: [1989.5, 1994.9]
        }, {
            name: "Menem (I)",
            period: [1994.9, 1999.9]
        }, {
            name: "Menem (I)",
            period: [1999.9, 2001.9]
        }, {
            name: "Menem (I)",
            period: [2001.9, 2003.9]
        }, {
            name: "Menem (I)",
            period: [2003.9, 2007.9]
        }, {
            name: "Menem (I)",
            period: [2007.9, 2011.9]
        }, {
            name: "Menem (I)",
            period: [2011.9, 2015.9]
        }],
        scale: colorbrewer.YlGn[8],
        color: "yellow"
    },
    "Bolivia": {
        presidents: [{
            name: "Alfonsin",
            period: [1983, 1989.5]
        }, {
            name: "Menem (I)",
            period: [1989.5, 1994.9]
        }, {
            name: "Menem (I)",
            period: [1994.9, 1999.9]
        }, {
            name: "Menem (I)",
            period: [1999.9, 2001.9]
        }, {
            name: "Menem (I)",
            period: [2001.9, 2003.9]
        }, {
            name: "Menem (I)",
            period: [2003.9, 2007.9]
        }, {
            name: "Menem (I)",
            period: [2007.9, 2011.9]
        }, {
            name: "Menem (I)",
            period: [2011.9, 2015.9]
        }],
        scale: colorbrewer.Greens[8],
        color: "green"
    },
    "Chile": {
        presidents: [{
            name: "Menem (I)",
            period: [1983, 1989.5]
        }, {
            name: "Menem (I)",
            period: [1989.5, 1994.9]
        }, {
            name: "Menem (I)",
            period: [1994.9, 1999.9]
        }, {
            name: "Menem (I)",
            period: [1999.9, 2001.9]
        }, {
            name: "Menem (I)",
            period: [2001.9, 2003.9]
        }, {
            name: "Menem (I)",
            period: [2003.9, 2007.9]
        }, {
            name: "Menem (I)",
            period: [2007.9, 2011.9]
        }, {
            name: "Menem (I)",
            period: [2011.9, 2015.9]
        }],
        scale: colorbrewer.Reds[8],
        color: "red"
    },
    "Uruguay": {
        presidents: [{
            name: "Menem (I)",
            period: [1983, 1989.5]
        }, {
            name: "Menem (I)",
            period: [1989.5, 1994.9]
        }, {
            name: "Menem (I)",
            period: [1994.9, 1999.9]
        }, {
            name: "Menem (I)",
            period: [1999.9, 2001.9]
        }, {
            name: "Menem (I)",
            period: [2001.9, 2003.9]
        }, {
            name: "Menem (I)",
            period: [2003.9, 2007.9]
        }, {
            name: "Menem (I)",
            period: [2007.9, 2011.9]
        }, {
            name: "Menem (I)",
            period: [2011.9, 2015.9]
        }],
        scale: colorbrewer.RdPu[8],
        color: "lightblue"
    },
    "Paraguay": {
        presidents: [{
            name: "Menem (I)",
            period: [1983, 1989.5]
        }, {
            name: "Menem (I)",
            period: [1989.5, 1994.9]
        }, {
            name: "Menem (I)",
            period: [1994.9, 1999.9]
        }, {
            name: "Menem (I)",
            period: [1999.9, 2001.9]
        }, {
            name: "Menem (I)",
            period: [2001.9, 2003.9]
        }, {
            name: "Menem (I)",
            period: [2003.9, 2007.9]
        }, {
            name: "Menem (I)",
            period: [2007.9, 2011.9]
        }, {
            name: "Menem (I)",
            period: [2011.9, 2015.9]
        }],
        scale: colorbrewer.Greys[8],
        color: "orange"
    },
};

function countryColor(country, year) {
    var thecolor = "black"; // default
    countries[country].presidents.forEach(function (president, i) {
        var period=president.period;
        if (period[0] <= year && year < period[1]) {
            if (i % 2 == 0) {
                thecolor = countries[country].scale[i / 2];
            } else {
                var n = countries[country].scale.length / 2;
                thecolor = countries[country].scale[n + (i - 1) / 2];
            }
        }
    });
    return thecolor;
}