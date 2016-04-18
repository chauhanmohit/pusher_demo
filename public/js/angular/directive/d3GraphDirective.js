(function(){
    'use strict';
    
    app.directive('systemGraph',directiveMethod);
    
    directiveMethod.$inject = ['$http','_','d3Service'];
        
    function directiveMethod($http,_,d3Service) {
        return {
            restrict: 'E',
            scope: {
                data : '='    
            },
            replace : true ,
            controller: function($http){
                var ApiData = [] ;
                
            },
            link : function(scope, element,attr, ctrl){
                d3Service.d3().then(function(d3) {
                    var serverData = [];
                    $http.get('http://private-9f3c8-angstrom.apiary-mock.com/system')
                    .then(function(result){
                        setTimeout(function(){
                            createGraph(element, result.data);
                        },500);
                    },function(error){
                        console.log("Error Raised", error);
                    });
                    
                    scope.render = function(data){
                        console.log("data arives from pusher", data);
                    }
                    
                    scope.$watch('data', function(n,o){
                        if (n !== o) {
                            scope.render(scope.data);
                        }
                    }, true);
                });
            }
        }
    }
    
    function createGraph(element,apiData) {
        /**
        *  Working on d3Graph section
        **/
        var data = [] , nodes = [], rwidth = 120, rheight= 75, gap = 50, radius = 10;
        data.push(apiData);

        //Make an SVG Container
        var svgContainer = d3.select('#chart').append("svg")
                            .classed("svg-container", true)
                            .attr("preserveAspectRatio", "xMinYMin meet")
                            .attr("viewBox", "-12 1 795 394")
                            .classed("svg-content-responsive", true)
                            .append("g");
        
        data.forEach(function(d,i){
            nodes = _.chain(d.Components)
                .groupBy("Level")
                .pairs()
                .map(function (currentItem) {
                    return _.object(_.zip(["Level", "children"], currentItem));
                })
                .value();
                
            //creating the links between nodes
            _.map(nodes,function(l,i){
                l.Id = l.children[0].ID ;
                _.map(l.children,function(c,i){
                    _.map(d.Connections,function(r,i){
                        if (c.ID === r.From) {
                            c.from = r.From ;
                            c.to = r.To
                        }
                    });
                });
            });
        });
        
        nodes.forEach(function(d,i){
            var rootName = d.children[0].Name ? d.children[0].Name : 'Not defined';
            var k = parseInt(i + 1);

            if (parseInt(d.Level) === parseInt(k)) {

                //appending the parent nodes rectangle
                svgContainer.append("rect")
                    .attr("x", 10 + (3*i*70))
                    .attr("y", 10)
                    .attr("rx",5)
                    .attr("ry",5)
                    .attr("id",d.Id)
                    .attr("width", rwidth)
                    .attr("height", rheight)
                    .style("stroke", "#000")
                    .style("fill", "none")
                    .style("stroke-width", 2);

                //appending circles at the start of rectangle
                svgContainer.append("circle")
                    .attr("cx",parseInt( 10 + (3*i*70) ) )
                    .attr("cy", parseInt( 46 ) )
                    .attr("r",4)
                    .style("fill","#3c753b");

                //appending circles at the end of rectangle
                svgContainer.append("circle")
                    .attr("cx",parseInt( 10 + (3*i*70) + rwidth) )
                    .attr("cy", parseInt( 46 ) )
                    .attr("r",4)
                    .style("fill","#3c753b");

                //appending names in the rectangle
                svgContainer.append('foreignObject')
                            .attr('x', 16 + (3*i*70) )
                            .attr('y', 16)
                            .attr('width', parseInt(rwidth - 10))
                            .attr('height', parseInt(rheight - 10))
                            .append("xhtml:body")
                            .html(rootName);
                
                if(k <= parseInt(nodes.length -1) ){                
                    svgContainer.append("line")
                        .attr("stroke", "black")
                        .attr({
                            x1: parseInt( (rwidth + 70)*k ), y1: parseInt(rheight + 345), //start of the line
                            x2: parseInt(  (rwidth + 70)*k ), y2: 0 //end of the line
                        });
                }
                
                //join end to end point of parent node          
                if ( i !== parseInt(nodes.length - 1) ) {
                    setTimeout(function(){
                        if (document.getElementById(d.children[0].to) !== null && document.getElementById(d.children[0].from) !== null) {
                            var fwidth = document.getElementById(d.children[0].from).getAttribute('width') ;
                            var tWidth = document.getElementById(d.children[0].to).getAttribute('width') ;
                            var fheight = document.getElementById(d.children[0].from).getAttribute('height') ;
                            var theight = document.getElementById(d.children[0].to).getAttribute('height') ;
                            svgContainer.append("line")
                            .attr("class", "link")
                            .attr({
                                x1: parseInt( 10 + (3*i*70) + parseInt(fwidth) ), y1: parseInt(parseInt(fheight)/2 +9), //start of the line
                                x2: parseInt( 10 + (3*i*70) + parseInt(tWidth) + 90), y2: parseInt(parseInt(theight)/2 + 9) //end of the line
                            });
                        }
                    },200);
                }
                
                //appending child nodes      
                _.map(d.children,function(value,index){
                    //appending the rectangles of child nodes
                    
                        svgContainer.append("rect")
                            .attr("x", 10 + (3*i*70))
                            .attr("y", 10 + parseInt( (150*(index ))/1.5 ))
                            .attr("rx",5)
                            .attr("ry",5)
                            .attr("id", value.ID)
                            .attr("width", rwidth)
                            .attr("height", rheight)
                            .style("stroke", "#000")
                            .style("fill", "none")
                            .style("stroke-width", 2);
    
                        //appending circles to the child node at the start of rectangle
                        svgContainer.append("circle")
                            .attr("cx", 10 + (3*i*70))
                            .attr("cy", 10 + parseInt( (150*(index ))/1.5 ) + 37 )
                            .attr("r",4)
                            .style("fill","#3c753b");
    
                        //appending circles to the child node at the end of rectangle
                        svgContainer.append("circle")
                            .attr("cx", 10 + (3*i*70) + rwidth )
                            .attr("cy", 10 + parseInt( (150*(index ))/1.5 ) + 37 )
                            .attr("r",4)
                            .style("fill","#3c753b");
    
                        //appending names in the rectangle of child nodes
                        svgContainer.append('foreignObject')
                                .attr('x', 16 + (3*i*70))
                                .attr('y', 16 + parseInt( (150*(index))/1.5 ) )
                                .attr('width', parseInt(rwidth - 10) )
                                .attr('height', parseInt(rheight - 10) )
                                .append("xhtml:body")
                                .html(value.Name);
                       
                        //creating the links between the parent node and child node
                        setTimeout(function(){
                            if (document.getElementById(value.to) !== null && document.getElementById(value.from) !== null) {
                                
                                var fwidth = parseInt(document.getElementById(value.from).getAttribute('width')) ;
                                var tWidth = parseInt(document.getElementById(value.to).getAttribute('width')) ;
                                var fheight = parseInt(document.getElementById(value.from).getAttribute('height')) ;
                                var theight = parseInt(document.getElementById(value.to).getAttribute('height')) ;
                                
                                switch(d.children.length) {
                                    
                                    case 2:
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth ), y1: parseInt(fheight/2 + 7), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth + 91), y2: parseInt(theight+72) //end of the line
                                            }); 
                                
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth ), y1: parseInt(fheight/2 + 6), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth + 91), y2: parseInt(theight+175) //end of the line
                                            }); 
                                
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth ), y1: parseInt(fheight/2 + 6), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth + 91), y2: parseInt(theight+280) //end of the line
                                            }); 
                                
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth - 46), y1: parseInt(fheight/2 + 48), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth - 76), y2: parseInt(theight + 36) //end of the line
                                            }); 
                                
                                    break;
                                    case 4:
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth + 93), y1: parseInt(fheight/2 + 6), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth), y2: parseInt(theight+72) //end of the line
                                            }); 
                                
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth + 91), y1: parseInt(fheight/2 + 6), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth), y2: parseInt(theight+175) //end of the line
                                            }); 
                                
                                        svgContainer.append("line")
                                            .attr("class", "link")
                                            .attr({
                                                x1: parseInt( 10 + (3*i*70) + fwidth + 91), y1: parseInt(fheight/2 + 6), //start of the line
                                                x2: parseInt( 10 + (3*i*70) + tWidth), y2: parseInt(theight+280) //end of the line
                                            }); 
                                    break;
                                }
                            }
                    },200);
                });  
            }
        });


    }
    
}());