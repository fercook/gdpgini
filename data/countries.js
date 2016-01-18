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
        color: "#092dc6"
    },
    "Brazil": {
        presidents: [ {
            name: "Figueiredo",
            period: [1979.3, 1985.3]
        }, {
            name: "Sarney",
            period: [1985.3, 1990.2]
        }, {
            name: "de Mello",
            period: [1990.2, 1993]
        }, {
            name: "Franco",
            period: [1993, 1995]
        }, {
            name: "Cardoso",
            period: [1995, 2003]
        }, {
            name: "Lula da Silva",
            period: [2003, 2011]
        }, {
            name: "Roussef",
            period: [2011.0, 2016]
        }],
        scale: colorbrewer.YlGn[8],
        color: "#ffd800"
    },
    "Bolivia": {
        presidents: [{
            name: "Paz Estennssoro",
            period: [1985, 1989]
        }, {
            name: "Paz Zamora",
            period: [1989 ,1993]
        }, {
            name: "Sanchez de Lozada",
            period: [1993, 1997]
        }, {
            name: "Banzer Suarez",
            period: [1997, 2001]
        }, {
            name: "Quiroga Ramirez",
            period: [2001, 2002]
        }, {
            name: "Sanchez de Lozada",
            period: [2002, 2003]
        }, {
            name: "Mesa",
            period: [2003, 2005]
        }, {
            name: "Morales (I)",
            period: [2005, 2009]
        }, {
            name: "Morales (II)",
            period: [2009, 2015]
        }],
        scale: colorbrewer.Greens[8],
        color: "#029d02"
    },
    "Chile": {
        presidents: [{
            name: "Pinochet",
            period: [1973.8, 1990.3]
        }, {
            name: "Aylwin Azocar",
            period: [1990.3, 1994.3]
        }, {
            name: "Frei Ruiz-Tagle",
            period: [1994.3, 2000.3]
        }, {
            name: "Lagos Escobar",
            period: [2000.3, 2006.3]
        }, {
            name: "Bachelet",
            period: [2006.3, 2010.3]
        }, {
            name: "Pinera",
            period: [2010.3, 2014.3]
        }, {
            name: "Bachelet (II)",
            period: [2014.3, 2018.3]
        }],
        scale: colorbrewer.Reds[8],
        color: "#e00000"
    },
    "Uruguay": {
        presidents: [{
            name: "Militar?",
            period: [1980, 1985.2]
        }, {
            name: "Sanguinetti (I)",
            period: [1985.2, 1990.2]
        }, {
            name: "Lacalle",
            period: [1990.2, 1995.2]
        }, {
            name: "Sanguinetti (II)",
            period: [1995.2, 2000.2]
        }, {
            name: "Batlle",
            period: [2000.2, 2005.2]
        }, {
            name: "Vazquez",
            period: [2005.2, 2010.2]
        }, {
            name: "Mujica",
            period: [2010.2, 2015.2]
        }, {
            name: "Vazquez (II)",
            period: [2015.2, 2020.2]
        }],
        scale: colorbrewer.RdPu[8],
        color: "#05b4ed"
    },
    "Paraguay": {
        presidents: [{
            name: "Stroessner",
            period: [1954, 1989.1]
        }, {
            name: "Pedotti",
            period: [1989.1, 1993.7]
        }, {
            name: "Wasmosy",
            period: [1993.7, 1998.7]
        }, {
            name: "Grau",
            period: [1998.7, 1999.3]
        }, {
            name: "Macchi",
            period: [1999.3, 2003.7]
        }, {
            name: "Frutos",
            period: [2003.7, 2008.7]
        }, {
            name: "Lugo",
            period: [2008.7, 2012.5]
        }, {
            name: "Franco",
            period: [2012.5, 2013.7]
        }, {
            name: "Cartes",
            period: [2013.7, 2017.7]
        }],
        scale: colorbrewer.Greys[8],
        color: "#d300a2"
    },
};


usedCountries = {};
usedCountries["Argentina"]=countries["Argentina"];
usedCountries["Brazil"]=countries["Brazil"];
usedCountries["Uruguay"]=countries["Uruguay"];

function countryColor(country, year) {
    var thecolor = "black"; // default
    countries[country].presidents.forEach(function (president, i) {
        var period=president.period;
        if (period[0] <= year && year < period[1]) {
            thecolor = colorbrewer.Set1[9][i];
            /* This is for using a quantitative scale with alternating colors...
            if (i % 2 == 0) {
                thecolor = countries[country].scale[i / 2];
            } else {
                var n = countries[country].scale.length / 2;
                thecolor = countries[country].scale[n + (i - 1) / 2];
            }
            */
            if (i % 3 == 0) {
                thecolor = d3.rgb(countries[country].color).darker().toString(); //countries[country].color;
            } else if (i % 3 == 1) {
                thecolor = d3.rgb(countries[country].color).toString(); //countries[country].color;
            }
            else {
                thecolor = d3.rgb(countries[country].color).brighter().toString();
            }

        }

    });
    var rgb = hexToRgb(thecolor);
    var modifier = hexToRgb(countries[country].color);
    thecolor=rgbToHex( mix(rgb,modifier) );
    return thecolor;
}


function mix(a,b) {
    //return { r: Math.floor(a.r*b.r/255), g: Math.floor(a.g*b.g/255), b: Math.floor(a.b*b.b/255)}; //multiply
    return { r: overlay(a.r, b.r), g: overlay(a.g, b.g), b: overlay(a.b, b.b)}
}

function overlay(blend, target) {
    var Blend=blend/255, Target=target/255;
    var percent = 0.9;
    return (Target > percent) ? Math.floor(255*(1 - (1-(Target-percent)/percent) * (1-Blend))) : Math.floor(255*((Target/percent) * Blend));
}

function rgbToHex(color) {
    return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
