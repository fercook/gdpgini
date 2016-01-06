/*GraphParameters = {
    "graphWidth": 4000,
    "svgHeight": 500,
    "graphHeight": 500,
    "nodeWidth": 0.4,
    "nodePadding": 50,
    "offset": "Top",
    "curvature": 0.5
}*/

GraphParameters = {
    "graphWidth": 1827,
    "svgHeight": 903,
    "graphHeight": 574,
    "nodeWidth": 0.4,
    "nodePadding": 50,
    "offset": "Centered",
    "curvature": 0.5
}


    
//var color = d3.scale.ordinal()
//  .domain(["Limbo", "Dome", "Complex" , "Hall", "Planta", "Village" , "Sonar+D"])
//  .range(["#FF0000", "#009933" , "#0000FF", "#FF0000", "#009933" , "#0000FF", "#0000FF"]);
    
var color = d3.scale.ordinal()
  .domain([0, 1, 2, 3 , 4, 5, 6 , 7,8])
  .range(["#bbbbbb", "#DB57D0" , "#DDB0BF", "#09AE48", "#7ED96D" , "#BF0CB9", "#B9DBA2", "#000","#3366FF"]);

var jsonCirclesMap = [
    { "titleColor" : "#BBBBBB", "name": "Limbo", "id":"0"},
    { "titleColor": "#DB57D0", "name": "Dome", "id":"1"},
    { "titleColor": "#DDB0BF", "name": "Complex", "id":"2"},
    { "titleColor": "#09AE48", "name": "Hall", "id":"3"},
    { "titleColor": "#7ED96D", "name": "Planta", "id":"4"},
    { "titleColor": "#BF0CB9", "name": "Village", "id":"5"},
    { "titleColor": "#B9DBA2", "name": "Sonar+D", "id":"7"}];

queue()
    //TODO Read actual data format
    .defer(d3.json, "data/sankey_analysis.json") //"../DATA/prob_separated.json")
.await(ready);

function ready(error, data) {
    analysis = data; // TODO Process real data format
    draw();
}


/*window.onmousewheel(

document.attachEvent("on"+mousewheelevt, function(e){alert('Mouse wheel movement detected!')})
    
    GraphParameters.graphWidth += algo;
    draw();
);*/



function draw() {


    
    
    d3.selectAll("svg").remove();

    var width = $("#svg").width(),
        m_width = GraphParameters.graphWidth,
        m_height = GraphParameters.graphHeight,
        height = GraphParameters.svgHeight,
        nodePadding = GraphParameters.nodePadding,
        nodeWidth = GraphParameters.nodeWidth,
        curvature = GraphParameters.curvature,
        offset = GraphParameters.offset;

    svg = d3.select("#svg").append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + GraphParameters.graphWidth + " " + height)
        .attr("width", GraphParameters.graphWidth)
        .attr("height", height);
//        .on("mousewheel", function(e,i){console.log(e);console.log(i);});

    svg.append("rect")
        .attr("class", "sea")
        .attr("width", GraphParameters.graphWidth)
        .attr("height", height)
        .style("fill", 0,0,0,0)
        .style("opacity",0);//    .on("click", click);

    maing = svg.append("g").call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom)).append("g");// attr("id","maingroup");

    function zoom() {
        console.log(d3.event.translate);
        var s = Math.min(Math.max(0.33,d3.event.scale),3)        
        var dx = Math.min(Math.max(d3.event.translate[0],-s*GraphParameters.graphWidth),s*GraphParameters.graphWidth);
        maing.attr("transform", "translate(" + dx + ",0)scale(" + s + ",1)");
    }
    
    sankey = sankeyStream()
        .nodeWidth(nodeWidth)
        .curvature(curvature)
        .nodePadding(nodePadding)
        .size([GraphParameters.graphWidth, m_height])
        .offset(offset);

    path = sankey.link();

    colors = color; //d3.scale.ordinal(); //category10
    console.log("cccolors"+d3.scale.ordinal());  //category10

    sankey
        .nodes(analysis.nodes)
        .links(analysis.links)
        .layout();

    mainplot = drawComponents(analysis);
    
    
    leyenda();
    
    //tooltip();
    
    
 

    // create the svg
    //rootSvg = d3.select("#tree-body").append("svg:svg");
    /*
    creating your svg image here


// create the zoom listener
var zoomListener = d3.behavior.zoom()
.scaleExtent([0.33, 1])
.on("zoom", zoomHandler);
    
// function for handling zoom event
function zoomHandler() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
    // apply the zoom behavior to the svg image
    zoomListener(svg);
    
       */
    
}


var i=0;

function tooltip(artist_name,img,url){
    i=i+1;
    $(document).ready(function() {
			//$('.tooltip').tooltipster();
            $('.tooltip').tooltipster({
                theme: 'tooltipster-light',
                interactive: true
                //content: $('<a href="'+url+'"><img src="'+img+'" style="width:'+"30%" +'" align="left"/></a><strong><p>'+ artist_name +'</strong></p><br/><a href="recommend.html" id="kkk">Similar artists</a> ')
                //content: $('<div class="tooltip"><img src="'+img+'" class="tooltip" style="width:25%" title="kdjlakjdalksjdlakjdlajda asd asdasd" /><a href="#"> <p>kjdalsdjadaldadald </p></a></div>')
              
                
});
        var contenido = $('<a href="'+url+'"><img src="'+img+'" style="width:'+"30%" +'" align="left"/></a><strong><p>'+ artist_name +'</strong></p><br/><a href="recommend.html" id="kkk">Similar artists'+i+'</a>');
        
            $('.tooltip').tooltipster('content',contenido);
		});
    
}


function tooltip_general(){
    
     $(document).ready(function() {
			//$('.tooltip').tooltipster();
            $('.tooltip').tooltipster({
                theme: 'tooltipster-light',
                interactive: true
                //content: $('<a href="'+url+'"><img src="'+img+'" style="width:'+"30%" +'" align="left"/></a><strong><p>'+ artist_name +'</strong></p><br/><a href="recommend.html" id="kkk">Similar artists</a> ')
                //content: $('<div class="tooltip"><img src="'+img+'" class="tooltip" style="width:25%" title="kdjlakjdalksjdlakjdlajda asd asdasd" /><a href="#"> <p>kjdalsdjadaldadald </p></a></div>')
              
                
});
        var contenido = $('<a href="+http://sonar.es/en"><img src="imgs/artist/general.png" style="width:'+"30%" +'" align="left"/></a><strong><p>Out of Sónar 2015</strong></p><br/>');
        
            $('.tooltip').tooltipster('content',contenido);
		});
}




function leyenda(){
    
    var legendWidth=400,
    legendHeight=100;
    var LEGEND_V_MARGIN = 8;
    var LEGEND_H_MARGIN_COLOR = 40;
    var LEGEND_H_MARGIN = 35;

 var jsonCirclesMap = [
    { "titleColor" : "#575958", "name": "Limbo", "id":"0"},
    { "titleColor": "#DB57D0", "name": "Dome", "id":"1"},
    { "titleColor": "#DDB0BF", "name": "Complex", "id":"2"},
    { "titleColor": "#09AE48", "name": "Hall", "id":"3"},
    { "titleColor": "#7ED96D", "name": "Planta", "id":"4"},
    { "titleColor": "#BF0CB9", "name": "Village", "id":"5"},
    { "titleColor": "#B9DBA2", "name": "Sonar+D", "id":"7"}];
    

    
    
printRoomLegend = function(circles) {

        legendSvgContainer.selectAll("text")
            .data(jsonCirclesMap)
            .enter()
            .append("text")
                .attr("x", function(d, i) { 
                    return (i+1)*LEGEND_H_MARGIN;
                })
                .attr("y", LEGEND_V_MARGIN)
                .attr("text-anchor", "end")
                .attr("fill", "#3e78f3")
                .attr("data-room", function(d){return d["id"]})
                .attr("font-family", "Nexa")
                .attr("class", "opacitySensible legend")
                .attr("font-size", ".25em")
                .text(function(d) { return d.name });
        legendSvgContainer.selectAll("rect")
            .data(jsonCirclesMap)
            .enter()
            .append("rect")
                .attr("x", function(d, i) { 
                    return (i+1)*LEGEND_H_MARGIN+4;
                })
                .attr("y", LEGEND_V_MARGIN-4)
                .attr("width", 4)
                .attr("class", "opacitySensible legend")
                .attr("data-room", function(d){return d["id"]})
                .attr("height", 4)
                .style("fill", function(d) { return d.titleColor })
                .style("stroke", function(d) { return d.titleColor });
    }

var legendDiv = d3.select("#legend");

var legendSvgContainer = legendDiv.append("svg")
    .attr("class", "legend-svg")
    .attr("viewBox", "0 0 " + legendWidth + " " + legendHeight)
    .attr("preserveAspectRatio", "xMinYMin meet");

printRoomLegend(jsonCirclesMap);
    
    
    
}

function drawComponents(graph){

    var link = maing.append("g").selectAll(".link")
        .data(graph.links).enter();
//    console.log("Links");
//    console.log(graph.links);
    link.append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function (d) {
            return Math.max(0, d.dy);
        })
        .style("stroke", function (d) {
            if (d.source.room == 4 || d.target.room == 4) {
                //return colors(d.source.room);
                return colors(d.source.room);
                
            } else {
                return "#000"
            }
        })
        .sort(function (a, b) {
            return b.dy - a.dy;
        });
    /*    link.append("title")
        .text(function (d) {
            return d.source.name + " → " + d.target.name + "\n" + format(d.value);
        });
        */

    var node = maing.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    /*        .call(d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));*/

    node.append("rect")
        .attr("height", function (d) {
         if(d.layer>25){
            return 2; 
         }else{
            return d.dy;
         }
        })
        .attr("width", sankey.nodeWidth())
        .attr("class","tooltipster-default-preview tooltip")
        //.attr("title","sss")
        .attr("target","_blank")
        .style("fill", function (d) {
        
        if(d.layer>25){
        
          
             return d.color = colors(8);
           
        }else{
           if(d.room==1 || d.room==8){
               return d.color = colors(0);
           }else{
             return d.color = colors(d.room);
           }
        }
        
            //return d.color = d3.scale.ordinal(d.room);
        })
        .style("opacity", function (d) {
           if(d.room==1 || d.room==8 ){   /* Salas marcadas como limbo*/
               return "0.3";
           }else if(d.layer>25){
               return "1";
           }
            //return d.color = d3.scale.ordinal(d.room);
        })
        .on("mouseover", function (d) {
            highlight = drawHighlight(d);
                view_artist_data(d,this);
        })
        .on("mouseout", function (d) {
            d3.selectAll(".highlightLink").remove();
        });

}


function drawHighlight(highlightNode){
    graph = {}
    graph.links = highlightNode.sourceLinks.concat(highlightNode.targetLinks);
//        .filter(function(d){return d.value > 0 && d.sy>0 && d.ty >0 ;});
//    console.log("highlight:");
//    console.log(graph.links);
    //graph.nodes = [highlightNode];

        //console.log(graph.links.filter(function(d){return d.value > 0;}));
    var link = maing.append("g").selectAll(".highlightLink")
        .data(graph.links).enter();

    link.append("path")
        .attr("class", "highlightLink")
        .attr("d", path)
        .style("stroke-width", function (d) {
            return Math.max(0, d.dy);
        })
        .style("fill", "none")
        .style("stroke", function (d) {
                return colors(d.source.room);
        })
        .sort(function (a, b) {
            return b.dy - a.dy;
        });
/*
    var node = svg.append("g").selectAll(".highlightNode")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "highlightNode")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("rect")
        .attr("height", function (d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = colors(d.room);
        });
*/
    return link;
}


sponsors = { "SonarVillage by ESTRELLA DAMM": "Village",
            "SonarDome by Red BULL Music Academy": "Dome",
            "SonarHall": "Hall",
            "Hall+D": "Sonar+D",
            "SonarComplex": "Complex"
           }


function view_artist_data(userselection, rect, room) {
    d3.csv("data/artists_by_room.csv", function(data) {
        var filteredData = data.filter(function(d,i) {
            if (d["DIA"] == 18 && sponsors[d["SALA"]]=="Village" && d["HORA"] == "16:15")    //userselection["day"] userselection["room"]
            {  return d;}
        });
        console.log(userselection);
        console.log(filteredData[0].ACTIVIDAD);
        console.log(filteredData[0].FOTO1);
        if(userselection["room"]==1 || userselection["room"]==8){
            tooltip_general();
        }else{
            tooltip(filteredData[0].ACTIVIDAD, filteredData[0].FOTO1,  filteredData[0].URL);
        }
    });
}
